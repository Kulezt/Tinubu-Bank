// api/server.js
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
// This exact line guarantees Vercel finds db.json in your main root folder
const router = jsonServer.router(path.join(process.cwd(), 'db.json')); 
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.rewriter({
    '/api/server/*': '/$1'
}));
server.use(router);

module.exports = server;