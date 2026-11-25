const { badRequest, notFound, conflict } = require('../errors');

module.exports = (enrollments, students, courses) => {
  const get = (id) => {
    const e = enrollments.find(id);
    if (!e) throw notFound('enrollment not found');
    return e;
  };

  // The seat rules. Used for both join (create) and move (update).
  const check = (studentId, courseId, selfId) => {
    if (!Number.isInteger(studentId) || !Number.isInteger(courseId))
      throw badRequest('studentId and courseId must be numbers');
    const course = courses.find(courseId);
    if (!students.find(studentId)) throw notFound('student not found');
    if (!course) throw notFound('course not found');
    if (enrollments.exists(studentId, courseId, selfId)) throw conflict('already enrolled');
    if (enrollments.countForCourse(courseId, selfId) >= course.seats) throw conflict('course is full');
  };

  return {
    list: () => enrollments.all(),
    get,
    create: ({ studentId, courseId }) => {
      check(studentId, courseId);
      return enrollments.create({ studentId, courseId });
    },
    update: (id, { studentId, courseId }) => {
      const e = get(id);
      check(studentId, courseId, e.id);
      return enrollments.update(e, { studentId, courseId });
    },
    remove: (id) => enrollments.remove(get(id)),
  };
};
