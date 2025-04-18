const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Criar usuário
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email e senha
  if (!email || !password) {
    return next(new ErrorResponse('Por favor, informe email e senha', 400));
  }

  // Verificar usuário
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  // Verificar se a senha corresponde
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Logout / limpar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Função auxiliar para enviar token de resposta
const sendTokenResponse = (user, statusCode, res) => {
  // Criar token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
