// api/server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Points to your database
const middlewares = jsonServer.defaults();

server.use(middlewares);
// Vercel makes the root folder read-only, so this rewrites the data in temporary memory
server.use(jsonServer.rewriter({
    '/api/*': '/$1'
}));
server.use(router);

// Export it so Vercel can run it as a serverless function
module.exports = server;