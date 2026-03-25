/**
 * Script para buscar issues do board específico
 */

import axios from 'axios';

const CONFIG = {
  jira: {
    domain: process.env.JIRA_DOMAIN || 'your-domain.atlassian.net',
    email: process.env.JIRA_EMAIL || 'your-email@example.com',
    apiToken: process.env.JIRA_API_TOKEN || 'YOUR_API_TOKEN_HERE',
  },
  boardId: 1, // ID do board que você informou
};

async function main() {
  console.log('🔍 Buscando issues do board LOOPIT (ID: 1)...\n');

  const auth = Buffer.from(`${CONFIG.jira.email}:${CONFIG.jira.apiToken}`).toString('base64');

  // Tentar diferentes endpoints
  const endpoints = [
    {
      name: 'Agile API - Board Issues',
      url: `https://${CONFIG.jira.domain}/rest/agile/1.0/board/${CONFIG.boardId}/issue`,
      params: { maxResults: 100 },
    },
    {
      name: 'Agile API - Backlog',
      url: `https://${CONFIG.jira.domain}/rest/agile/1.0/board/${CONFIG.boardId}/backlog`,
      params: { maxResults: 100 },
    },
    {
      name: 'Search API - Simples',
      url: `https://${CONFIG.jira.domain}/rest/api/3/search`,
      params: { jql: 'project = LOOPIT', maxResults: 100 },
    },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Tentando: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      const issues = response.data.issues || response.data.values || [];
      console.log(`✅ Sucesso! Encontradas ${issues.length} issues`);

      if (issues.length > 0) {
        console.log('\n📋 ISSUES ENCONTRADAS:\n');
        console.log('='.repeat(80));

        issues.forEach((issue: any, idx: number) => {
          console.log(`\n${idx + 1}. [${issue.key}] ${issue.fields?.summary || issue.summary}`);
          console.log(`   Status: ${issue.fields?.status?.name || issue.status?.name || 'N/A'}`);

          if (issue.fields?.assignee || issue.assignee) {
            const assignee = issue.fields?.assignee || issue.assignee;
            console.log(`   Assignee: ${assignee.displayName || assignee.name}`);
          }
        });

        console.log('\n' + '='.repeat(80));
        console.log(`\n✨ Total: ${issues.length} issues`);

        // Se encontrou, não precisa testar os outros endpoints
        return;
      }

    } catch (error: any) {
      console.log(`❌ Erro: ${error.response?.data?.errorMessages?.[0] || error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n⚠️ Nenhum endpoint funcionou. Vamos precisar do CSV exportado do Jira.');
}

main();
