const express = require('express');
const { badRequest, notFound, conflict, errorHandler } = require('./errors');

module.exports = function createApp() {
  const app = express();
  app.use(express.json());

  // ---- our "database": 3 plain lists (they reset when server stops) ----
  let nextId = 1;
  const students = [];     // { id, name }
  const courses = [];      // { id, title, seats }
  const enrollments = [];  // { id, studentId, courseId }

  // ---- small helpers ----
  const find = (list, id) => list.find((x) => x.id === Number(id));
  const remove = (list, item) => list.splice(list.indexOf(item), 1);
  const joined = (courseId) => enrollments.filter((e) => e.courseId === courseId).length;
  const showCourse = (c) => ({ ...c, seatsLeft: c.seats - joined(c.id) });

  // ================= STUDENTS (create, read, update, delete) =================
  app.post('/students', (req, res) => {
    if (!req.body.name) throw badRequest('name is required');
    const student = { id: nextId++, name: req.body.name };
    students.push(student);
    res.status(201).json(student);
  });

  app.get('/students', (req, res) => res.json(students));

  app.get('/students/:id', (req, res) => {
    const student = find(students, req.params.id);
    if (!student) throw notFound('student not found');
    res.json(student);
  });

  app.put('/students/:id', (req, res) => {
    const student = find(students, req.params.id);
    if (!student) throw notFound('student not found');
    if (!req.body.name) throw badRequest('name is required');
    student.name = req.body.name;
    res.json(student);
  });

  app.delete('/students/:id', (req, res) => {
    const student = find(students, req.params.id);
    if (!student) throw notFound('student not found');
    if (enrollments.some((e) => e.studentId === student.id))
      throw conflict('student is enrolled, leave courses first');
    remove(students, student);
    res.status(204).end();
  });

  // ================= COURSES (create, read, update, delete) =================
  app.post('/courses', (req, res) => {
    const { title, seats } = req.body;
    if (!title || !Number.isInteger(seats) || seats < 0)
      throw badRequest('title and seats (number >= 0) are required');
    const course = { id: nextId++, title, seats };
    courses.push(course);
    res.status(201).json(showCourse(course));
  });

  app.get('/courses', (req, res) => res.json(courses.map(showCourse)));

  app.get('/courses/:id', (req, res) => {
    const course = find(courses, req.params.id);
    if (!course) throw notFound('course not found');
    res.json(showCourse(course));
  });

  app.put('/courses/:id', (req, res) => {
    const course = find(courses, req.params.id);
    if (!course) throw notFound('course not found');
    const { title, seats } = req.body;
    if (!title || !Number.isInteger(seats) || seats < 0)
      throw badRequest('title and seats (number >= 0) are required');
    course.title = title;
    course.seats = seats;
    res.json(showCourse(course));
  });

  app.delete('/courses/:id', (req, res) => {
    const course = find(courses, req.params.id);
    if (!course) throw notFound('course not found');
    if (joined(course.id) > 0) throw conflict('course has students');
    remove(courses, course);
    res.status(204).end();
  });

  // ================= ENROLLMENTS (create, read, update, delete) =================
  // Shared checks for join (POST) and change (PUT). "selfId" = the enrollment being changed,
  // so it does not count against itself.
  const checkEnrollment = (studentId, courseId, selfId) => {
    const course = find(courses, courseId);
    if (!find(students, studentId)) throw notFound('student not found');
    if (!course) throw notFound('course not found');
    const others = enrollments.filter((e) => e.id !== selfId);
    if (others.some((e) => e.studentId === studentId && e.courseId === courseId))
      throw conflict('already enrolled');
    if (others.filter((e) => e.courseId === courseId).length >= course.seats)
      throw conflict('course is full');
  };

  app.post('/enrollments', (req, res) => {
    const { studentId, courseId } = req.body;
    checkEnrollment(studentId, courseId);
    const enrollment = { id: nextId++, studentId, courseId };
    enrollments.push(enrollment);
    res.status(201).json(enrollment);
  });

  app.get('/enrollments', (req, res) => res.json(enrollments));

  app.get('/enrollments/:id', (req, res) => {
    const enrollment = find(enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    res.json(enrollment);
  });

  app.put('/enrollments/:id', (req, res) => {
    const enrollment = find(enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    const { studentId, courseId } = req.body;
    checkEnrollment(studentId, courseId, enrollment.id);
    enrollment.studentId = studentId;
    enrollment.courseId = courseId;
    res.json(enrollment);
  });

  app.delete('/enrollments/:id', (req, res) => {
    const enrollment = find(enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    remove(enrollments, enrollment);
    res.status(204).end();
  });

  // ---- unknown URL -> 404, then any thrown error is turned into a JSON reply ----
  app.use((req, res, next) => next(notFound('route not found')));
  app.use(errorHandler);

  return app;
};
