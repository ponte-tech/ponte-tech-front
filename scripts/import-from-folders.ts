/**
 * Script para importar cards das pastas jira-import/
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG = {
  api: {
    lambdaUrl: 'https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod',
  },
  login: {
    email: 'admin@pontetech.com',
    senha: 'PonteTech2026!',
  },
  folders: {
    parainiciar: './jira-import/parainiciar',
    emandamento: './jira-import/emandamento',
  },
};

interface CardData {
  title: string;
  description?: string;
  responsible?: string;
  delivery_date?: string;
}

function parseCardFile(filePath: string): CardData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const cardData: CardData = {
      title: '',
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.match(/^título:/i)) {
        cardData.title = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.match(/^responsável:/i)) {
        cardData.responsible = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.match(/^descrição:/i)) {
        cardData.description = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.match(/^data de entrega:/i)) {
        cardData.delivery_date = trimmed.split(':').slice(1).join(':').trim();
      } else if (!cardData.description && cardData.title) {
        // Linha sem label vira parte da descrição
        cardData.description = (cardData.description || '') + '\n' + trimmed;
      }
    }

    if (!cardData.title) {
      console.warn(`⚠️ Arquivo ${path.basename(filePath)} não tem título, usando nome do arquivo`);
      cardData.title = path.basename(filePath, '.txt');
    }

    return cardData;
  } catch (error: any) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message);
    return null;
  }
}

async function login(): Promise<string> {
  console.log('🔐 Fazendo login...');

  try {
    const response = await axios.post(
      `${CONFIG.api.lambdaUrl}/auth`,
      {
        action: 'login',
        email: CONFIG.login.email,
        senha: CONFIG.login.senha,
      }
    );

    const token = response.data.data?.token || response.data.token;

    if (!token) {
      throw new Error('Token não retornado pelo login');
    }

    console.log('✅ Login realizado com sucesso\n');
    return token;

  } catch (error: any) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Importação de Cards das Pastas\n');
  console.log('='.repeat(60));

  try {
    // 1. Fazer login
    const token = await login();

    const api = axios.create({
      baseURL: CONFIG.api.lambdaUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 2. Buscar boards
    console.log('📊 Buscando boards...');
    const boardsResp = await api.get('/kanban/board');
    const boards = boardsResp.data.data?.boards || boardsResp.data.boards || [];

    if (boards.length === 0) {
      throw new Error('Nenhum board encontrado. Crie um board primeiro.');
    }

    const board = boards[0];
    console.log(`✅ Board selecionado: ${board.name}\n`);

    // 3. Buscar colunas
    console.log('📋 Buscando colunas...');
    const colsResp = await api.get(`/kanban/board/${board.board_id}/column`);
    const columns = colsResp.data.data?.columns || colsResp.data.columns || [];

    console.log(`✅ Colunas disponíveis:`);
    columns.forEach((col: any) => console.log(`   - ${col.name}`));

    // Mapear colunas
    const colParaIniciar = columns.find((c: any) =>
      c.name.toLowerCase().includes('iniciar') || c.name.toLowerCase().includes('to do')
    );
    const colAndamento = columns.find((c: any) =>
      c.name.toLowerCase().includes('andamento') || c.name.toLowerCase().includes('progress')
    );

    if (!colParaIniciar) {
      throw new Error('Coluna "Para Iniciar" não encontrada');
    }
    if (!colAndamento) {
      throw new Error('Coluna "Em Andamento" não encontrada');
    }

    console.log(`✓ Mapeado: "Para Iniciar" → ${colParaIniciar.name}`);
    console.log(`✓ Mapeado: "Em Andamento" → ${colAndamento.name}\n`);

    // 4. Buscar cliente
    console.log('👥 Buscando clientes...');
    const clientesResp = await api.get('/admin/cliente');
    const clientes = clientesResp.data.data?.clientes || clientesResp.data.clientes || [];

    const ponteTech = clientes.find((c: any) =>
      c.nome?.toLowerCase().includes('ponte') &&
      (c.nome?.toLowerCase().includes('tech') || c.nome?.toLowerCase().includes('interno'))
    ) || clientes[0];

    console.log(`✅ Cliente: ${ponteTech.nome}\n`);

    // 5. Buscar colaboradores
    console.log('👤 Buscando colaboradores...');
    const colabsResp = await api.get('/admin/colaborador');
    const colaboradores = colabsResp.data.data?.colaboradores || colabsResp.data.colaboradores || [];
    console.log(`✅ Encontrados ${colaboradores.length} colaboradores\n`);

    // 6. Processar pastas
    const foldersToProcess = [
      { path: CONFIG.folders.parainiciar, columnId: colParaIniciar.column_id, name: 'Para Iniciar' },
      { path: CONFIG.folders.emandamento, columnId: colAndamento.column_id, name: 'Em Andamento' },
    ];

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    console.log('🔄 Iniciando importação...\n');
    console.log('='.repeat(60));

    for (const folder of foldersToProcess) {
      console.log(`\n📁 Processando pasta: ${folder.name}`);

      if (!fs.existsSync(folder.path)) {
        console.log(`⚠️ Pasta não existe: ${folder.path}`);
        continue;
      }

      const files = fs.readdirSync(folder.path).filter(f => f.endsWith('.txt'));
      console.log(`   Encontrados ${files.length} arquivos\n`);

      for (const file of files) {
        const filePath = path.join(folder.path, file);
        const cardData = parseCardFile(filePath);

        if (!cardData) {
          skipped++;
          continue;
        }

        try {
          // Mapear responsável
          const assigned_to: string[] = [];
          if (cardData.responsible) {
            const colab = colaboradores.find((c: any) =>
              c.nome?.toLowerCase().includes(cardData.responsible!.toLowerCase()) ||
              c.nome_completo?.toLowerCase().includes(cardData.responsible!.toLowerCase())
            );

            if (colab) {
              assigned_to.push(colab.colaborador_id || colab.id);
            } else {
              console.log(`⚠️  Responsável "${cardData.responsible}" não encontrado`);
            }
          }

          const payload = {
            title: cardData.title,
            description: cardData.description || `Importado do Jira`,
            column_id: folder.columnId,
            board_id: board.board_id,
            client_id: ponteTech.cliente_id,
            delivery_date: cardData.delivery_date || null,
            assigned_to: assigned_to.filter(Boolean),
          };

          await api.post('/kanban/card', payload);

          console.log(`✅ ${cardData.title}`);
          console.log(`   → ${folder.name}`);
          if (assigned_to.length > 0) {
            console.log(`   → Responsável: ${cardData.responsible}`);
          }

          imported++;

        } catch (error: any) {
          const msg = error.response?.data?.message || error.message;
          console.error(`❌ ${file}: ${msg}`);
          errors.push(`${file}: ${msg}`);
        }
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`   ✅ Importadas: ${imported}`);
    console.log(`   ⏭️  Puladas: ${skipped}`);
    console.log(`   ❌ Erros: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Erros detalhados:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n✨ Importação concluída!');
    console.log('\n💡 Agora você pode deletar a pasta jira-import/');

  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
