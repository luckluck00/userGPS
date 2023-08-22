const http = require('http');
const app = require('./app');
const io = require('socket.io');
const { getUserGPS } = require("./api/socket/GPS/GPSsocket");
const {Message} = require('./api/socket/Chat/chatSocket');

const server = http.createServer(app, () => {});
const socketServer = io(server);

socketServer.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  getUserGPS(io)(socket); // 呼叫 getUserGPS 函式並將 socket 和 io 作為參數傳遞
  Message(io)(socket);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
