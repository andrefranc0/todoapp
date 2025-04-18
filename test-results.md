# Testes do Todo App

## Testes do Backend

### 1. Teste de Autenticação
- [x] Login com credenciais válidas
- [x] Login com credenciais inválidas
- [x] Acesso a rotas protegidas com token válido
- [x] Acesso a rotas protegidas com token inválido
- [x] Acesso a rotas de administrador com usuário comum
- [x] Logout

### 2. Teste de Gerenciamento de Usuários
- [x] Criação de usuário (apenas admin)
- [x] Listagem de usuários (apenas admin)
- [x] Exclusão de usuário (apenas admin)

### 3. Teste de Gerenciamento de Tarefas
- [x] Criação de tarefa
- [x] Listagem de tarefas pendentes
- [x] Listagem de tarefas concluídas
- [x] Visualização detalhada de tarefa
- [x] Iniciar tarefa
- [x] Concluir tarefa
- [x] Verificação de mudança automática para status "atrasada"
- [x] Adição de comentários

### 4. Teste de Upload e Gerenciamento de Arquivos
- [x] Upload de arquivos necessários (apenas criador)
- [x] Upload de arquivos de conclusão (apenas designados)
- [x] Restrição de tipos de arquivo
- [x] Remoção de arquivos (apenas quem enviou)
- [x] Visualização de arquivos

## Testes do Frontend

### 1. Teste de Interface
- [x] Responsividade em diferentes tamanhos de tela
- [x] Navegação entre páginas
- [x] Exibição correta de elementos condicionais

### 2. Teste de Autenticação
- [x] Formulário de login
- [x] Redirecionamento após login
- [x] Proteção de rotas
- [x] Exibição de elementos baseados em permissões

### 3. Teste de Gerenciamento de Tarefas
- [x] Listagem de tarefas pendentes
- [x] Listagem de tarefas concluídas
- [x] Formulário de criação de tarefa
- [x] Visualização detalhada de tarefa
- [x] Botões de ação (iniciar, concluir)
- [x] Sistema de comentários

### 4. Teste de Upload e Gerenciamento de Arquivos
- [x] Upload de arquivos necessários
- [x] Upload de arquivos de conclusão
- [x] Exibição separada por categoria
- [x] Remoção de arquivos
- [x] Validação de tipos de arquivo

## Resultados dos Testes

Todos os testes foram concluídos com sucesso. O sistema está funcionando conforme esperado, com todas as funcionalidades implementadas de acordo com os requisitos do usuário.

### Observações
- O sistema de upload de arquivos está funcionando corretamente, com as restrições de tipos e categorização implementadas.
- O controle de permissões está funcionando corretamente, permitindo apenas que usuários autorizados realizem determinadas ações.
- A interface do usuário está responsiva e intuitiva, facilitando a navegação e o uso do sistema.
