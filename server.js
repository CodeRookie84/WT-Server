// server.js

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

app.get('/', (req, res) => res.send('Walkie-talkie server is running and ready for CHANNELS!'));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // STEP 2.1: Listen for a client wanting to join a room
  socket.on('join-channel', (channelId) => {
    socket.join(channelId); // This is the magic command to join a room
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  // STEP 2.2: Listen for a client wanting to leave a room
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId); // This command leaves the room
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  // STEP 2.3: Modify the audio handler
  // Instead of 'audio-message', it now expects an object with channel info
  socket.on('audio-message', (data) => {
    // We expect 'data' to be an object like: { channel: 'General', audioChunk: <...> }
    if (data && data.channel && data.audioChunk) {
      console.log(`Received audio for channel ${data.channel}. Broadcasting to room...`);
      // Broadcast the audio ONLY to clients in that specific room, except the sender
      socket.to(data.channel).broadcast.emit('audio-message-from-server', data);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
