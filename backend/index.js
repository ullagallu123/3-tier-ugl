// This file is the entry point for the application
// It imports the server and starts it

// Import the server
const app = require('./server');

// The server.js file handles the listening logic when not in test mode
console.log(`Application started. NODE_ENV=${process.env.NODE_ENV}`);