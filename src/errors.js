// All error handling lives here.

// An error that carries an HTTP status code (400, 404, 409...)
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Shortcuts, so app.js can write:  throw notFound('student not found')
const badRequest = (message) => new HttpError(400, message); // bad or missing data
const notFound = (message) => new HttpError(404, message);   // id does not exist
const conflict = (message) => new HttpError(409, message);   // clashes with current data

// Express calls this whenever something is thrown. It sends the error as JSON.
// (It must have exactly these 4 parameters for Express to treat it as an error handler.)
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
};

module.exports = { badRequest, notFound, conflict, errorHandler };
