# Irmãos Farias - Sistema de Monitoramento

## Visão Geral
Sistema de monitoramento remoto com recursos avançados de diagnóstico AI e controle em tempo real.

## Tecnologias Principais

- React 18 com TypeScript
- Vite para build e desenvolvimento
- Supabase para backend e autenticação
- TanStack Query para gerenciamento de estado
- Tailwind CSS para estilização
- Chart.js para visualizações
- WebRTC para conexões em tempo real
- TensorFlow.js para análise AI
- Electron para versão desktop

## Requisitos do Sistema

- Node.js 20.x ou superior
- NPM 10.x ou superior
- 4GB RAM mínimo
- 2 CPUs mínimo
- 10GB espaço em disco

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/irmaosfarias/marketplace-monitor.git
cd marketplace-monitor
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configurações
```

4. Execute as migrações do banco:
```bash
npm run db:migrate
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  │   ├── auth/      # Componentes de autenticação
  │   ├── devices/   # Componentes de dispositivos
  │   ├── metrics/   # Componentes de métricas
  │   └── quantum/   # Componentes quantum
  ├── hooks/         # Custom hooks
  ├── lib/          # Utilitários e configurações
  ├── providers/    # Provedores de contexto
  ├── services/     # Serviços de API
  └── types/        # Definições de tipos
```

## Funcionalidades Principais

### Monitoramento de Dispositivos
- Métricas em tempo real (CPU, memória, disco)
- Alertas configuráveis
- Histórico de performance
- Diagnóstico AI

### Controle Remoto
- Conexão segura via WebRTC
- Transferência de arquivos
- Chat integrado
- Gravação de sessão

### Segurança
- Autenticação de dois fatores
- Criptografia ponta a ponta
- Políticas de acesso granular
- Auditoria completa

### AI e Machine Learning
- Detecção de anomalias
- Previsão de falhas
- Otimização automática
- Diagnóstico inteligente

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run test` - Executa testes unitários
- `npm run test:e2e` - Executa testes end-to-end
- `npm run electron:dev` - Inicia versão desktop
- `npm run deploy` - Deploy para produção

### Padrões de Código

- ESLint para linting
- Prettier para formatação
- Conventional Commits
- Jest para testes

### Fluxo de Trabalho

1. Crie uma branch: `feature/nova-funcionalidade`
2. Desenvolva e teste localmente
3. Execute todos os testes
4. Faça commit seguindo Conventional Commits
5. Abra um Pull Request

## Segurança

### Políticas de Backup
- Backup automático a cada 6 horas
- Retenção por 30 dias
- Armazenamento redundante

### Monitoramento
- Logs de acesso por 90 dias
- Alertas de segurança
- Métricas de performance
- Auditoria de ações

### Rate Limiting
- 100 requisições/minuto por IP
- 1000 requisições/hora por usuário
- Bloqueio após 5 tentativas falhas

## Deployment

### Pré-requisitos
- Certificado SSL válido
- Firewall configurado
- Banco de dados Postgres 15+

### Ambiente de Produção
- Node.js 20 LTS
- 4GB RAM mínimo
- Load balancer configurado
- CDN para assets

### Procedimento
1. Atualize variáveis de ambiente
2. Execute build de produção
3. Valide todos os testes
4. Deploy via pipeline CI/CD

## Suporte

- Email: suporte@irmaosfarias.com
- Discord: [Link do servidor]
- Horário: 8h às 18h (GMT-3)
- SLA: 4 horas para issues críticas

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.