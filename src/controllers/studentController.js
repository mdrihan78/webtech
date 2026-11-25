const express = require('express');

// Controller: only deals with HTTP. All the thinking is in the service.
module.exports = (service) => {
  const router = express.Router(); // mounted at /students in app.js

  router.post('/', (req, res) => res.status(201).json(service.create(req.body)));
  router.get('/', (req, res) => res.json(service.list()));
  router.get('/:id', (req, res) => res.json(service.get(req.params.id)));
  router.put('/:id', (req, res) => res.json(service.update(req.params.id, req.body)));
  router.delete('/:id', (req, res) => { service.remove(req.params.id); res.status(204).end(); });

  return router;
};
