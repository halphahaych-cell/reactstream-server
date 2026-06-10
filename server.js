const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('ReactStream server is live!');
});

let viewers = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('startStream', (data) => {
    viewers[socket.id] = 0;
    socket.broadcast.emit('streamerLive', { id: socket.id });
    console.log('Stream started:', socket.id);
  });

  socket.on('stopStream', () => {
    delete viewers[socket.id];
    socket.broadcast.emit('streamerOffline', { id: socket.id });
  });

  socket.on('viewerJoined', (data) => {
    if (viewers[data.streamerId] !== undefined) {
      viewers[data.streamerId]++;
      io.to(data.streamerId).emit('viewerCount', viewers[data.streamerId]);
    }
  });

  socket.on('disconnect', () => {
    delete viewers[socket.id];
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('ReactStream server running on port ' + PORT);
});
