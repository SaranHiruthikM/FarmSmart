// Central error handler. Always returns { error: "..." }
export function errorHandler(err, req, res, next) {
  console.error(err);

  // Zod validation error
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: req.t('validation.bad_request') });
  }

  const status = err?.status || 500;
  const message = err?.message || 'Internal server error';
  return res.status(status).json({ error: message });
}
