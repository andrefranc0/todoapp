const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');

// Configuração de variáveis de ambiente
dotenv.config();

// Inicialização do app Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração do upload de arquivos
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: true,
  responseOnLimit: 'Arquivo muito grande. O tamanho máximo permitido é 50MB.'
}));

// Configuração do MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Conexão com MongoDB estabelecida com sucesso'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Configuração do diretório de uploads
const uploadsDir = path.join(__dirname, 'uploads');
process.env.FILE_UPLOAD_PATH = uploadsDir;

// Importação de rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

// Uso de rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Rota para servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do Todo App está funcionando!');
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
