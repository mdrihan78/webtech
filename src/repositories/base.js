// Basic data operations, reused by every repository.
module.exports = (db, table) => ({
  all: () => db[table],
  find: (id) => db[table].find((x) => x.id === Number(id)),
  create: (data) => { const item = { id: db.nextId(), ...data }; db[table].push(item); return item; },
  update: (item, data) => Object.assign(item, data),
  remove: (item) => db[table].splice(db[table].indexOf(item), 1),
});
