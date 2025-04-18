# Todo App - Documentação

## Visão Geral

Este é um aplicativo completo de gerenciamento de tarefas desenvolvido com React (frontend) e Node.js/Express (backend). O sistema permite o gerenciamento de tarefas com diferentes estados, upload de arquivos categorizados, sistema de comentários e controle de acesso baseado em funções.

## Funcionalidades Principais

### Sistema de Autenticação
- Login com níveis de acesso (usuário e administrador)
- Apenas administradores podem criar novos usuários
- Proteção de rotas baseada em permissões

### Gerenciamento de Tarefas
- Visualização de tarefas pendentes e concluídas
- Criação de novas tarefas com atribuição a múltiplos usuários
- Estados de tarefa: Pendente, Em Andamento, Concluída, Atrasada
- Mudança automática para "Atrasada" quando o prazo é ultrapassado
- Sistema de comentários para discussão das tarefas

### Sistema de Arquivos
- Categorização em "Arquivos necessários para a tarefa" e "Arquivos de conclusão"
- Restrição de tipos de arquivo (apenas imagens, PDF, documentos Word e planilhas Excel)
- Controle de permissões (apenas o criador pode adicionar/remover arquivos necessários)
- Apenas usuários designados podem adicionar arquivos de conclusão
- Cada usuário só pode remover os arquivos que ele mesmo enviou

## Estrutura do Projeto

### Backend (Node.js/Express)

```
backend/
├── controllers/       # Controladores da aplicação
│   ├── auth.js        # Autenticação
│   ├── tasks.js       # Gerenciamento de tarefas
│   └── users.js       # Gerenciamento de usuários
├── middleware/        # Middlewares
│   ├── async.js       # Tratamento assíncrono
│   ├── auth.js        # Autenticação
│   ├── error.js       # Tratamento de erros
│   └── fileValidation.js # Validação de arquivos
├── models/            # Modelos de dados
│   ├── Task.js        # Modelo de tarefa
│   └── User.js        # Modelo de usuário
├── routes/            # Rotas da API
│   ├── auth.js        # Rotas de autenticação
│   ├── tasks.js       # Rotas de tarefas
│   └── users.js       # Rotas de usuários
├── uploads/           # Diretório para arquivos enviados
├── utils/             # Utilitários
│   └── errorResponse.js # Resposta de erro padronizada
├── .env               # Variáveis de ambiente
├── package.json       # Dependências
└── server.js          # Ponto de entrada da aplicação
```

### Frontend (React)

```
frontend/
├── public/            # Arquivos públicos
├── src/               # Código fonte
│   ├── components/    # Componentes React
│   │   ├── layout/    # Componentes de layout
│   │   │   ├── Footer.js
│   │   │   └── Header.js
│   │   └── routing/   # Componentes de roteamento
│   │       ├── AdminRoute.js
│   │       └── PrivateRoute.js
│   ├── context/       # Contextos React
│   │   └── AuthContext.js
│   ├── pages/         # Páginas da aplicação
│   │   ├── CompletedTasks.js
│   │   ├── CreateTask.js
│   │   ├── CreateUser.js
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── TaskDetails.js
│   │   └── UserManagement.js
│   ├── utils/         # Utilitários
│   │   └── api.js     # Cliente API
│   ├── App.js         # Componente principal
│   └── index.js       # Ponto de entrada
└── package.json       # Dependências
```

## Tecnologias Utilizadas

### Backend
- Node.js e Express
- MongoDB com Mongoose
- JWT para autenticação
- Express-fileupload para upload de arquivos
- Bcrypt para criptografia de senhas

### Frontend
- React
- React Router para navegação
- Context API para gerenciamento de estado
- Axios para requisições HTTP
- React Bootstrap para UI

## Como Executar o Projeto

### Pré-requisitos
- Node.js (v14+)
- MongoDB

### Backend
1. Navegue até o diretório do backend:
   ```
   cd todo-app/backend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/todo-app
   JWT_SECRET=seu_segredo_jwt
   JWT_EXPIRE=30d
   ```

4. Inicie o servidor:
   ```
   npm start
   ```

### Frontend
1. Navegue até o diretório do frontend:
   ```
   cd todo-app/frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie a aplicação:
   ```
   npm start
   ```

4. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Obter usuário atual

### Usuários
- `GET /api/users` - Listar todos os usuários (admin)
- `POST /api/users` - Criar novo usuário (admin)
- `DELETE /api/users/:id` - Excluir usuário (admin)

### Tarefas
- `GET /api/tasks` - Listar tarefas pendentes
- `GET /api/tasks/completed` - Listar tarefas concluídas
- `GET /api/tasks/:id` - Obter detalhes de uma tarefa
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Excluir tarefa
- `PUT /api/tasks/:id/start` - Iniciar tarefa
- `PUT /api/tasks/:id/complete` - Concluir tarefa
- `POST /api/tasks/:id/comments` - Adicionar comentário
- `POST /api/tasks/:id/upload-task-files` - Upload de arquivos necessários
- `POST /api/tasks/:id/upload-completion-files` - Upload de arquivos de conclusão
- `DELETE /api/tasks/:id/task-files/:fileId` - Remover arquivo necessário
- `DELETE /api/tasks/:id/completion-files/:fileId` - Remover arquivo de conclusão

## Considerações de Segurança

- Autenticação baseada em JWT
- Senhas criptografadas com bcrypt
- Validação de tipos de arquivo para upload
- Controle de acesso baseado em funções
- Proteção contra ataques CSRF e XSS

## Possíveis Melhorias Futuras

- Implementação de notificações por email
- Sistema de busca e filtros avançados
- Relatórios e estatísticas
- Integração com calendário
- Implementação de testes automatizados
- Containerização com Docker
