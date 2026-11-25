// Creates the app and wires the 3 layers together:
//   controller -> service -> repository -> store
const express = require('express');
const createStore = require('./store');
const { notFound, errorHandler } = require('./errors');

module.exports = function createApp(db = createStore()) {
  // repositories (data)
  const studentRepo = require('./repositories/studentRepository')(db);
  const courseRepo = require('./repositories/courseRepository')(db);
  const enrollmentRepo = require('./repositories/enrollmentRepository')(db);

  // services (rules)
  const studentService = require('./services/studentService')(studentRepo, enrollmentRepo);
  const courseService = require('./services/courseService')(courseRepo, enrollmentRepo);
  const enrollmentService = require('./services/enrollmentService')(enrollmentRepo, studentRepo, courseRepo);

  // controllers (HTTP)
  const app = express();
  app.use(express.json());
  app.use('/students', require('./controllers/studentController')(studentService));
  app.use('/courses', require('./controllers/courseController')(courseService));
  app.use('/enrollments', require('./controllers/enrollmentController')(enrollmentService));

  app.use((req, res, next) => next(notFound('route not found')));
  app.use(errorHandler);
  return app;
};
