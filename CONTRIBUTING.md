# Guia de Contribuição

## Processo de Desenvolvimento

1. Escolha uma issue para trabalhar
2. Crie uma branch a partir da `main`
3. Desenvolva a funcionalidade
4. Adicione testes
5. Atualize a documentação
6. Abra um Pull Request

## Padrões de Código

### Commits

Seguimos o padrão Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### TypeScript

- Use tipos explícitos
- Evite `any`
- Documente interfaces complexas

### React

- Use componentes funcionais
- Prefira hooks customizados
- Mantenha componentes pequenos
- Documente props

### Testes

- Testes unitários para hooks
- Testes de integração para fluxos
- Testes E2E para features críticas
- Mínimo 80% de cobertura

## Review Process

1. Verificação automatizada
   - Lint
   - Tipos
   - Testes
   - Cobertura

2. Review manual
   - Lógica de negócio
   - Padrões de código
   - Performance
   - Segurança

## Ambiente Local

1. Fork o repositório
2. Clone localmente
3. Instale dependências
4. Configure variáveis de ambiente
5. Execute migrações
6. Inicie servidor de desenvolvimento

## Dúvidas

- Abra uma issue
- Pergunte no Discord
- Email: dev@irmaosfarias.com