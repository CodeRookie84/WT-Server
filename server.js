// server.js - FINAL CORRECTED VERSION

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://wt-cakewala.netlify.app", // This is correct
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => res.send('Walkie-talkie server is running!'));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  socket.on('audio-message', (data) => {
    if (data && data.channel && data.audioChunk) {
      console.log(`Received audio from ${socket.id} for channel ${data.channel}. Broadcasting...`);
      
      // *** THE FIX IS HERE ***
      // Instead of socket.to().broadcast.emit(), we use io.to().emit()
      // We also add the sender's ID to the payload so the client can ignore it.
      io.to(data.channel).emit('audio-message-from-server', {
        channel: data.channel,
        audioChunk: data.audioChunk,
        senderId: socket.id // Add the sender's unique ID
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
