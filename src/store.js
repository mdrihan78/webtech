// The "database": 3 plain lists + small helpers. Lost when the server stops.
module.exports = function createStore() {
  let nextId = 1;
  const db = {
    students: [],     // { id, name }
    courses: [],      // { id, title, seats }
    enrollments: [],  // { id, studentId, courseId }
    nextId: () => nextId++,
    find: (list, id) => list.find((x) => x.id === Number(id)),
    remove: (list, item) => list.splice(list.indexOf(item), 1),
  };
  // how many students joined a course
  db.joined = (courseId) => db.enrollments.filter((e) => e.courseId === courseId).length;
  return db;
};
