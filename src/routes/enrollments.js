const express = require('express');
const { notFound, conflict } = require('../errors');

module.exports = (db) => {
  const router = express.Router(); // mounted at /enrollments in app.js

  // Shared checks for join (POST) and change (PUT).
  // selfId = the enrollment being changed, so it does not count against itself.
  const check = (studentId, courseId, selfId) => {
    const course = db.find(db.courses, courseId);
    if (!db.find(db.students, studentId)) throw notFound('student not found');
    if (!course) throw notFound('course not found');
    const others = db.enrollments.filter((e) => e.id !== selfId);
    if (others.some((e) => e.studentId === studentId && e.courseId === courseId))
      throw conflict('already enrolled');
    if (others.filter((e) => e.courseId === courseId).length >= course.seats)
      throw conflict('course is full');
  };

  router.post('/', (req, res) => {
    const { studentId, courseId } = req.body;
    check(studentId, courseId);
    const enrollment = { id: db.nextId(), studentId, courseId };
    db.enrollments.push(enrollment);
    res.status(201).json(enrollment);
  });

  router.get('/', (req, res) => res.json(db.enrollments));

  router.get('/:id', (req, res) => {
    const enrollment = db.find(db.enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    res.json(enrollment);
  });

  router.put('/:id', (req, res) => {
    const enrollment = db.find(db.enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    const { studentId, courseId } = req.body;
    check(studentId, courseId, enrollment.id);
    enrollment.studentId = studentId;
    enrollment.courseId = courseId;
    res.json(enrollment);
  });

  router.delete('/:id', (req, res) => {
    const enrollment = db.find(db.enrollments, req.params.id);
    if (!enrollment) throw notFound('enrollment not found');
    db.remove(db.enrollments, enrollment);
    res.status(204).end();
  });

  return router;
};
