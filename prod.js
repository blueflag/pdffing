'use strict';
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Promise Rejection:', reason, p);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
module.exports = require('./dist/pdf-exportr/index.js');