export const invalidExceptionHandler = message => {
  const err = new Error(message);
  err.status = 400;
  throw err;
};

export const notFoundExceptionHandler = message => {
  const err = new Error(message);
  err.status = 404;
  throw err;
};

export const exceptionHandler = err => {
  if (err instanceof Error) {
    throw err;
  }
  throw new Error(err);
};
