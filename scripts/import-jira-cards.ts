/**
 * Script de importação dos cards do Jira (extraídos das imagens)
 */

import axios from 'axios';

const CONFIG = {
  api: {
    lambdaUrl: 'https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod',
  },
  login: {
    email: 'admin@pontetech.com',
    senha: 'PonteTech2026!',
  },
};

// Cards extraídos das imagens
const CARDS_PARA_INICIAR = [
  { key: 'LOOPIT-3332', title: '[CD] Integração - Minhas Conversas', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3451', title: '[CD] Debugar Pós Migração - Conversas', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3407', title: '[CASA-DIGITAL] Criar tela de chat - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3408', title: '[CASA-DIGITAL] Agendamento de visitas - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3410', title: '[CASA-DIGITAL] Criar tela propostas - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3411', title: '[CASA-DIGITAL] Criar tela Dashboard Financeiro - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-2368', title: 'CD-004: Sistema de Matching Corretor-Cliente (Estilo Uber)', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3468', title: 'APPLE STORE - Lembrete de Assinatura', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3471', title: '[CD] FIX - E-mail (SES)', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3472', title: '[PONTE] Levantamento Site', project: 'PONTE' },
  { key: 'LOOPIT-3502', title: 'INSERCAO DE EXTRATOS USUARIOS', project: 'CASA-DIGITAL' },
];

const CARDS_EM_ANDAMENTO = [
  { key: 'LOOPIT-1897', title: '[SOLUTION] Configurar Deploy', project: 'SOLUTION' },
  { key: 'LOOPIT-2924', title: '[SOLUTION] 000: Levantamento de Custos', project: 'SOLUTION' },
  { key: 'LOOPIT-3018', title: 'CASA DIGITAL - Faturamento', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-2880', title: 'CASA DIGITAL - Pesquisar calculadora', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3339', title: '[PONTE TECH] Portal Ponte Tech', project: 'PONTE' },
  { key: 'LOOPIT-3316', title: '[CASA DIGITAL] - Criar escopo MVP', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3383', title: '[SOLUTION] Reconstrução de robo AMIL', project: 'SOLUTION' },
  { key: 'LOOPIT-3465', title: '[SOLUTION] Criar Modal Reatribuir processos selecionados - Configurações', project: 'SOLUTION' },
  { key: 'LOOPIT-3422', title: 'Sercom - Amil 01/2026', project: 'SOLUTION' },
  { key: 'LOOPIT-3461', title: 'MIGRAÇÃO DE MYSQL → SQLSERVER', project: 'SOLUTION' },
  { key: 'LOOPIT-3414', title: 'Analise interna de sistemas que usam MYSQL para migração do SQLServer', project: 'SOLUTION' },
  { key: 'LOOPIT-3462', title: '[PC22-1651] Calculo de impostos - Ajustar mecanismo principal de calculo', project: 'COMERC' },
  { key: 'LOOPIT-3466', title: 'Front: TELAS DENTRIXA', project: 'DENTRIXA' },
  { key: 'LOOPIT-3467', title: '[SOLUTION] Configuração de Usuários', project: 'SOLUTION' },
  { key: 'LOOPIT-3473', title: '[SOLUTION] Adicionar linhas inline - Configurações', project: 'SOLUTION' },
  { key: 'LOOPIT-3409', title: '[CASA-DIGITAL] Matching corretor - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3474', title: '[CASA-DIGITAL] Criar tela notificação Match - Corretor', project: 'CASA-DIGITAL' },
  { key: 'LOOPIT-3503', title: '[APISUL] [35316] Melhorar performance tela de Mapa de Renovações', project: 'APISUL' },
  { key: 'LOOPIT-3506', title: '[CD] Back - Novas Métricas Corretor', project: 'CASA-DIGITAL' },
];

async function login(): Promise<string> {
  console.log('🔐 Fazendo login...');

  try {
    // Tentar o endpoint que o proxy usa
    const response = await axios.post(
      `${CONFIG.api.lambdaUrl}/api/auth/login`,
      {
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
  console.log('🚀 Importação de Cards do Jira\n');
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
    const boardsResp = await api.get('/api/kanban/boards');
    const boards = boardsResp.data.data?.boards || boardsResp.data.boards || [];

    if (boards.length === 0) {
      throw new Error('Nenhum board encontrado. Crie um board primeiro.');
    }

    const board = boards[0];
    console.log(`✅ Board selecionado: ${board.name}`);
    console.log(`   Board ID: ${board.board_id}\n`);

    // 3. Buscar colunas
    console.log('📋 Buscando colunas...');
    console.log(`   URL: /api/kanban/boards/${encodeURIComponent(board.board_id)}/columns`);
    const colsResp = await api.get(`/api/kanban/boards/${encodeURIComponent(board.board_id)}/columns`);
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
    const clientesResp = await api.get('/api/admin/clientes');
    const clientes = clientesResp.data.data?.clientes || clientesResp.data.clientes || [];

    console.log(`   Encontrados ${clientes.length} clientes`);
    if (clientes.length > 0) {
      console.log(`   Clientes disponíveis:`, clientes.map((c: any) => c.nome || c.razao_social || c.nome_fantasia).join(', '));
    }

    const ponteTech = clientes.find((c: any) => {
      const nome = (c.nome || c.razao_social || c.nome_fantasia || '').toLowerCase();
      return nome.includes('ponte') && (nome.includes('tech') || nome.includes('interno'));
    }) || clientes[0];

    if (!ponteTech) {
      throw new Error('Nenhum cliente encontrado. Cadastre um cliente primeiro.');
    }

    const clienteNome = ponteTech.nome || ponteTech.razao_social || ponteTech.nome_fantasia;
    const clienteId = ponteTech.cliente_id || ponteTech.id;
    console.log(`✅ Cliente: ${clienteNome} (ID: ${clienteId})\n`);

    // 5. Importar cards
    console.log('🔄 Iniciando importação...\n');
    console.log('='.repeat(60));

    let imported = 0;
    const errors: string[] = [];

    // Cards "Para Iniciar"
    console.log(`\n📁 Importando: Para Iniciar (${CARDS_PARA_INICIAR.length} cards)\n`);

    for (const card of CARDS_PARA_INICIAR) {
      try {
        const cardData = {
          title: `[${card.key}] ${card.title}`,
          description: `Importado do Jira\n\nProjeto: ${card.project}\nKey: ${card.key}`,
          column_id: colParaIniciar.column_id,
          board_id: board.board_id,
          client_id: clienteId,
          delivery_date: null,
          assigned_to: [],
        };

        await api.post('/api/kanban/cards', cardData);

        console.log(`✅ [${card.key}] ${card.title.substring(0, 60)}${card.title.length > 60 ? '...' : ''}`);
        imported++;

      } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.error(`❌ [${card.key}] ${msg}`);
        errors.push(`${card.key}: ${msg}`);
      }
    }

    // Cards "Em Andamento"
    console.log(`\n📁 Importando: Em Andamento (${CARDS_EM_ANDAMENTO.length} cards)\n`);

    for (const card of CARDS_EM_ANDAMENTO) {
      try {
        const cardData = {
          title: `[${card.key}] ${card.title}`,
          description: `Importado do Jira\n\nProjeto: ${card.project}\nKey: ${card.key}`,
          column_id: colAndamento.column_id,
          board_id: board.board_id,
          client_id: clienteId,
          delivery_date: null,
          assigned_to: [],
        };

        await api.post('/api/kanban/cards', cardData);

        console.log(`✅ [${card.key}] ${card.title.substring(0, 60)}${card.title.length > 60 ? '...' : ''}`);
        imported++;

      } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.error(`❌ [${card.key}] ${msg}`);
        errors.push(`${card.key}: ${msg}`);
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`   ✅ Importadas: ${imported}`);
    console.log(`   ❌ Erros: ${errors.length}`);
    console.log(`   📝 Total: ${CARDS_PARA_INICIAR.length + CARDS_EM_ANDAMENTO.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Erros detalhados:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n✨ Importação concluída!');

  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
