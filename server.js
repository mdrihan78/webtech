// Starts the server. Nothing else.
const createApp = require('./src/app');
const { port } = require('./src/config');

createApp().listen(port, () => console.log('Running on http://localhost:' + port));
