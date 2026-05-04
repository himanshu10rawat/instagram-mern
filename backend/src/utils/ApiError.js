class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", erros = []) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.erros = erros;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
