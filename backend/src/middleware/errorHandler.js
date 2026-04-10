export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle Supabase errors
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(400).json({
      error: 'Auth Error',
      message: err.message,
      statusCode: 400,
    });
  }

  res.status(statusCode).json({
    error: err.name || 'Error',
    message: message,
    statusCode: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
