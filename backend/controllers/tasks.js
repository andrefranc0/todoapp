const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');
const { isAllowedFileType } = require('../middleware/fileValidation');

// @desc    Obter todas as tarefas
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  let query;

  // Cópia do req.query
  const reqQuery = { ...req.query };

  // Campos para excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Remover campos para não corresponder na filtragem
  removeFields.forEach(param => delete reqQuery[param]);

  // Criar string de consulta
  let queryStr = JSON.stringify(reqQuery);

  // Criar operadores ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Encontrar tarefas
  if (req.user.role === 'admin') {
    // Administradores podem ver todas as tarefas
    query = Task.find(JSON.parse(queryStr));
  } else {
    // Usuários regulares só podem ver tarefas atribuídas a eles ou criadas por eles
    query = Task.find({
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ],
      ...JSON.parse(queryStr)
    });
  }

  // Selecionar campos
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Ordenar
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Paginação
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Task.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executar consulta
  const tasks = await query.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  // Resultado da paginação
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination,
    data: tasks
  });
});

// @desc    Obter tarefas concluídas
// @route   GET /api/tasks/completed
// @access  Private
exports.getCompletedTasks = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'admin') {
    // Administradores podem ver todas as tarefas concluídas
    query = Task.find({ status: 'concluida' });
  } else {
    // Usuários regulares só podem ver tarefas concluídas atribuídas a eles ou criadas por eles
    query = Task.find({
      status: 'concluida',
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    });
  }

  // Ordenar por data de conclusão
  query = query.sort('-completedDate');

  // Paginação
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Task.countDocuments({ status: 'concluida' });

  query = query.skip(startIndex).limit(limit);

  // Executar consulta
  const tasks = await query.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  // Resultado da paginação
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination,
    data: tasks
  });
});

// @desc    Obter uma única tarefa
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para ver a tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user._id.toString() === req.user.id) &&
    task.createdBy._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a acessar esta tarefa`, 403)
    );
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Criar tarefa
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  // Adicionar usuário como criador da tarefa
  req.body.createdBy = req.user.id;

  // Verificar se os usuários atribuídos existem
  if (req.body.assignedTo && req.body.assignedTo.length > 0) {
    for (const userId of req.body.assignedTo) {
      const user = await User.findById(userId);
      if (!user) {
        return next(
          new ErrorResponse(`Usuário não encontrado com id ${userId}`, 404)
        );
      }
    }
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc    Atualizar tarefa
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para atualizar a tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user.toString() === req.user.id) &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a atualizar esta tarefa`, 403)
    );
  }

  // Se estiver alterando o status para concluída, adicionar a data de conclusão
  if (req.body.status === 'concluida' && task.status !== 'concluida') {
    req.body.completedDate = Date.now();
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Iniciar tarefa
// @route   PUT /api/tasks/:id/start
// @access  Private
exports.startTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário está atribuído à tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user.toString() === req.user.id)
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a iniciar esta tarefa`, 403)
    );
  }

  // Verificar se a tarefa já está em andamento ou concluída
  if (task.status !== 'pendente' && task.status !== 'atrasada') {
    return next(
      new ErrorResponse(`Tarefa já está ${task.status}`, 400)
    );
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: 'em_andamento' },
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Concluir tarefa
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário está atribuído à tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user.toString() === req.user.id)
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a concluir esta tarefa`, 403)
    );
  }

  // Verificar se a tarefa já está concluída
  if (task.status === 'concluida') {
    return next(
      new ErrorResponse(`Tarefa já está concluída`, 400)
    );
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      status: 'concluida',
      completedDate: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Excluir tarefa
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para excluir a tarefa
  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a excluir esta tarefa`, 403)
    );
  }

  // Remover diretórios de arquivos da tarefa
  const taskDir = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString());
  if (fs.existsSync(taskDir)) {
    fs.rmdirSync(taskDir, { recursive: true });
  }

  await task.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Adicionar comentário a uma tarefa
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para comentar na tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user.toString() === req.user.id) &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Usuário não autorizado a comentar nesta tarefa`, 403)
    );
  }

  const comment = {
    text: req.body.text,
    user: req.user.id
  };

  task.comments.push(comment);
  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask
  });
});

// @desc    Upload de arquivos para uma tarefa (arquivos necessários)
// @route   POST /api/tasks/:id/upload-task-files
// @access  Private
exports.uploadTaskFiles = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário é o criador da tarefa
  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Apenas o criador da tarefa pode adicionar arquivos necessários`, 403)
    );
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse(`Por favor, faça upload de um arquivo`, 400));
  }

  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  const uploadedFiles = [];

  for (const file of files) {
    // Criar nome de arquivo personalizado
    const fileName = `${Date.now()}-${file.name}`;

    // Mover arquivo para o diretório de uploads
    const uploadPath = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'task', fileName);
    
    // Garantir que o diretório exista
    const taskDir = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'task');
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    await file.mv(uploadPath);

    // Adicionar arquivo à tarefa
    const fileData = {
      filename: fileName,
      originalName: file.name,
      path: `/uploads/${task._id}/task/${fileName}`,
      fileType: path.extname(file.name).toLowerCase().substring(1)
    };

    uploadedFiles.push(fileData);
  }

  // Adicionar arquivos à tarefa
  task.taskFiles = [...task.taskFiles, ...uploadedFiles];
  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask
  });
});

// @desc    Upload de arquivos de conclusão para uma tarefa
// @route   POST /api/tasks/:id/upload-completion-files
// @access  Private
exports.uploadCompletionFiles = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário está atribuído à tarefa
  if (
    req.user.role !== 'admin' &&
    !task.assignedTo.some(user => user.toString() === req.user.id)
  ) {
    return next(
      new ErrorResponse(`Apenas usuários atribuídos podem adicionar arquivos de conclusão`, 403)
    );
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse(`Por favor, faça upload de um arquivo`, 400));
  }

  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  const uploadedFiles = [];

  for (const file of files) {
    // Criar nome de arquivo personalizado
    const fileName = `${Date.now()}-${file.name}`;

    // Mover arquivo para o diretório de uploads
    const uploadPath = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'completion', fileName);
    
    // Garantir que o diretório exista
    const completionDir = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'completion');
    if (!fs.existsSync(completionDir)) {
      fs.mkdirSync(completionDir, { recursive: true });
    }

    await file.mv(uploadPath);

    // Adicionar arquivo à tarefa
    const fileData = {
      filename: fileName,
      originalName: file.name,
      path: `/uploads/${task._id}/completion/${fileName}`,
      fileType: path.extname(file.name).toLowerCase().substring(1),
      uploadedBy: req.user.id
    };

    uploadedFiles.push(fileData);
  }

  // Adicionar arquivos à tarefa
  task.completionFiles = [...task.completionFiles, ...uploadedFiles];
  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask
  });
});

// @desc    Remover arquivo necessário de uma tarefa
// @route   DELETE /api/tasks/:id/task-files/:fileId
// @access  Private
exports.removeTaskFile = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário é o criador da tarefa
  if (
    req.user.role !== 'admin' &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Apenas o criador da tarefa pode remover arquivos necessários`, 403)
    );
  }

  // Encontrar o arquivo
  const fileIndex = task.taskFiles.findIndex(file => file._id.toString() === req.params.fileId);

  if (fileIndex === -1) {
    return next(
      new ErrorResponse(`Arquivo não encontrado com id ${req.params.fileId}`, 404)
    );
  }

  // Remover arquivo do sistema de arquivos
  const filePath = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'task', task.taskFiles[fileIndex].filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remover arquivo do banco de dados
  task.taskFiles.splice(fileIndex, 1);
  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask
  });
});

// @desc    Remover arquivo de conclusão de uma tarefa
// @route   DELETE /api/tasks/:id/completion-files/:fileId
// @access  Private
exports.removeCompletionFile = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Tarefa não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Encontrar o arquivo
  const fileIndex = task.completionFiles.findIndex(file => file._id.toString() === req.params.fileId);

  if (fileIndex === -1) {
    return next(
      new ErrorResponse(`Arquivo não encontrado com id ${req.params.fileId}`, 404)
    );
  }

  // Verificar se o usuário é quem enviou o arquivo
  if (
    req.user.role !== 'admin' &&
    task.completionFiles[fileIndex].uploadedBy.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(`Apenas quem enviou o arquivo pode removê-lo`, 403)
    );
  }

  // Remover arquivo do sistema de arquivos
  const filePath = path.join(process.env.FILE_UPLOAD_PATH, task._id.toString(), 'completion', task.completionFiles[fileIndex].filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remover arquivo do banco de dados
  task.completionFiles.splice(fileIndex, 1);
  await task.save();

  const updatedTask = await Task.findById(req.params.id).populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
    { path: 'completionFiles.uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedTask
  });
});
