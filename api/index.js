/**
 * JollyRx – Vercel Serverless Function Entry Point
 * Routes all serverless invocations into the Express application.
 */

const app = require('../server/server');

module.exports = app;
