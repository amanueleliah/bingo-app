const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Database errors
  if (err.code === "23505") {
    // Unique violation
    statusCode = 409;
    message = "Resource already exists";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
