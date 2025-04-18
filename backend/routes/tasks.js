const express = require('express');
const {
  getTasks,
  getCompletedTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
  addComment,
  uploadTaskFiles,
  uploadCompletionFiles,
  removeTaskFile,
  removeCompletionFile
} = require('../controllers/tasks');

const { validateFileTypes } = require('../middleware/fileValidation');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Todas as rotas de tarefas requerem autenticação
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(createTask);

router.route('/completed').get(getCompletedTasks);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/start').put(startTask);
router.route('/:id/complete').put(completeTask);
router.route('/:id/comments').post(addComment);
router.route('/:id/upload-task-files').post(validateFileTypes, uploadTaskFiles);
router.route('/:id/upload-completion-files').post(validateFileTypes, uploadCompletionFiles);
router.route('/:id/task-files/:fileId').delete(removeTaskFile);
router.route('/:id/completion-files/:fileId').delete(removeCompletionFile);

module.exports = router;
