// Creates the app and wires everything together. No endpoint logic here.
const express = require('express');
const createStore = require('./store');
const { notFound, errorHandler } = require('./errors');

module.exports = function createApp(db = createStore()) {
  const app = express();
  app.use(express.json());

  // each resource has its own routes file
  app.use('/students', require('./routes/students')(db));
  app.use('/courses', require('./routes/courses')(db));
  app.use('/enrollments', require('./routes/enrollments')(db));

  // unknown URL -> 404, then any thrown error becomes a JSON reply
  app.use((req, res, next) => next(notFound('route not found')));
  app.use(errorHandler);

  return app;
};
