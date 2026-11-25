const base = require('./base');

module.exports = (db) => ({
  ...base(db, 'enrollments'),
  // selfId = an enrollment to ignore (used when updating one)
  countForCourse: (courseId, selfId) =>
    db.enrollments.filter((e) => e.courseId === courseId && e.id !== selfId).length,
  exists: (studentId, courseId, selfId) =>
    db.enrollments.some((e) => e.studentId === studentId && e.courseId === courseId && e.id !== selfId),
  existsForStudent: (studentId) => db.enrollments.some((e) => e.studentId === studentId),
});
