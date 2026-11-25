// Starts the app. Nothing else.
const createApp = require('./app');
const { port } = require('./config');

createApp().listen(port, () => console.log('Running on http://localhost:' + port));
