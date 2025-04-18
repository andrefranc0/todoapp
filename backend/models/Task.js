const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor, informe um título para a tarefa'],
    trim: true,
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor, informe uma descrição para a tarefa'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pendente', 'em_andamento', 'concluida', 'atrasada'],
    default: 'pendente'
  },
  startDate: {
    type: Date,
    required: [true, 'Por favor, informe uma data de início']
  },
  dueDate: {
    type: Date,
    required: [true, 'Por favor, informe um prazo para conclusão']
  },
  completedDate: {
    type: Date
  },
  assignedTo: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  taskFiles: [{
    filename: String,
    originalName: String,
    path: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completionFiles: [{
    filename: String,
    originalName: String,
    path: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para verificar se a tarefa está atrasada
TaskSchema.pre('save', function(next) {
  // Se a tarefa não estiver concluída e a data de prazo já passou
  if (this.status !== 'concluida' && this.dueDate < new Date()) {
    this.status = 'atrasada';
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
