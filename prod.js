'use strict';
process.on('unhandledRejection', (reason: Error | any, p: Promise<any>) => {
    console.error('Unhandled Promise Rejection:', reason, p);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
});
module.exports = require('./dist/pdf-exportr/index.js');