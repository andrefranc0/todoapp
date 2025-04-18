const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Função auxiliar para verificar tipos de arquivo permitidos
const isAllowedFileType = (fileName) => {
  const allowedExtensions = [
    // Imagens
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
    // Documentos
    '.pdf', '.doc', '.docx',
    // Planilhas
    '.xls', '.xlsx', '.csv'
  ];
  
  const ext = path.extname(fileName).toLowerCase();
  return allowedExtensions.includes(ext);
};

// Middleware para validar tipos de arquivo
const validateFileTypes = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse(`Por favor, faça upload de um arquivo`, 400));
  }

  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];

  for (const file of files) {
    if (!isAllowedFileType(file.name)) {
      return next(
        new ErrorResponse(
          `Tipo de arquivo não permitido. Apenas imagens, PDF, documentos Word e planilhas Excel são aceitos.`,
          400
        )
      );
    }
  }

  next();
};

module.exports = {
  validateFileTypes,
  isAllowedFileType
};
