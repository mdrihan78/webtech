// The raw data: 3 plain lists. Lost when the server stops.
// Only repositories touch this.
module.exports = function createStore() {
  let nextId = 1;
  return {
    students: [],     // { id, name }
    courses: [],      // { id, title, seats }
    enrollments: [],  // { id, studentId, courseId }
    nextId: () => nextId++,
  };
};
