const express = require('express');
const { badRequest, notFound, conflict } = require('../errors');

module.exports = (db) => {
  const router = express.Router(); // mounted at /students in app.js

  router.post('/', (req, res) => {
    if (!req.body.name) throw badRequest('name is required');
    const student = { id: db.nextId(), name: req.body.name };
    db.students.push(student);
    res.status(201).json(student);
  });

  router.get('/', (req, res) => res.json(db.students));

  router.get('/:id', (req, res) => {
    const student = db.find(db.students, req.params.id);
    if (!student) throw notFound('student not found');
    res.json(student);
  });

  router.put('/:id', (req, res) => {
    const student = db.find(db.students, req.params.id);
    if (!student) throw notFound('student not found');
    if (!req.body.name) throw badRequest('name is required');
    student.name = req.body.name;
    res.json(student);
  });

  router.delete('/:id', (req, res) => {
    const student = db.find(db.students, req.params.id);
    if (!student) throw notFound('student not found');
    if (db.enrollments.some((e) => e.studentId === student.id))
      throw conflict('student is enrolled, leave courses first');
    db.remove(db.students, student);
    res.status(204).end();
  });

  return router;
};
