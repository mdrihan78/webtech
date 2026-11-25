const { badRequest, notFound, conflict } = require('../errors');

module.exports = (students, enrollments) => {
  const get = (id) => {
    const student = students.find(id);
    if (!student) throw notFound('student not found');
    return student;
  };
  const check = (body) => { if (!body.name) throw badRequest('name is required'); };

  return {
    list: () => students.all(),
    get,
    create: (body) => { check(body); return students.create({ name: body.name }); },
    update: (id, body) => { const s = get(id); check(body); return students.update(s, { name: body.name }); },
    remove: (id) => {
      const s = get(id);
      if (enrollments.existsForStudent(s.id)) throw conflict('student is enrolled, leave courses first');
      students.remove(s);
    },
  };
};
