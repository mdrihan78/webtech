const express = require('express');
const { badRequest, notFound, conflict } = require('../errors');

module.exports = (db) => {
  const router = express.Router(); // mounted at /courses in app.js

  // adds seatsLeft to a course before sending it
  const show = (c) => ({ ...c, seatsLeft: c.seats - db.joined(c.id) });

  const check = (body) => {
    if (!body.title || !Number.isInteger(body.seats) || body.seats < 0)
      throw badRequest('title and seats (number >= 0) are required');
  };

  router.post('/', (req, res) => {
    check(req.body);
    const course = { id: db.nextId(), title: req.body.title, seats: req.body.seats };
    db.courses.push(course);
    res.status(201).json(show(course));
  });

  router.get('/', (req, res) => res.json(db.courses.map(show)));

  router.get('/:id', (req, res) => {
    const course = db.find(db.courses, req.params.id);
    if (!course) throw notFound('course not found');
    res.json(show(course));
  });

  router.put('/:id', (req, res) => {
    const course = db.find(db.courses, req.params.id);
    if (!course) throw notFound('course not found');
    check(req.body);
    course.title = req.body.title;
    course.seats = req.body.seats;
    res.json(show(course));
  });

  router.delete('/:id', (req, res) => {
    const course = db.find(db.courses, req.params.id);
    if (!course) throw notFound('course not found');
    if (db.joined(course.id) > 0) throw conflict('course has students');
    db.remove(db.courses, course);
    res.status(204).end();
  });

  return router;
};
