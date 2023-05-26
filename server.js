const http = require('http');
const app = require('./app');
const io = require('socket.io');
const { getUserGPS } = require("./api/socket/userSocket");

const server = http.createServer(app, () => {});
const socketServer = io(server);

socketServer.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});
socketServer.on("connection", getUserGPS(io));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
