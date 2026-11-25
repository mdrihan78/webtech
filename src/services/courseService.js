const { badRequest, notFound, conflict } = require('../errors');

module.exports = (courses, enrollments) => {
  // adds seatsLeft = seats - students joined
  const show = (c) => ({ ...c, seatsLeft: c.seats - enrollments.countForCourse(c.id) });
  const find = (id) => {
    const course = courses.find(id);
    if (!course) throw notFound('course not found');
    return course;
  };
  const check = (body) => {
    if (!body.title || !Number.isInteger(body.seats) || body.seats < 0)
      throw badRequest('title and seats (number >= 0) are required');
  };

  return {
    list: () => courses.all().map(show),
    get: (id) => show(find(id)),
    create: (body) => { check(body); return show(courses.create({ title: body.title, seats: body.seats })); },
    update: (id, body) => { const c = find(id); check(body); return show(courses.update(c, { title: body.title, seats: body.seats })); },
    remove: (id) => {
      const c = find(id);
      if (enrollments.countForCourse(c.id) > 0) throw conflict('course has students');
      courses.remove(c);
    },
  };
};
