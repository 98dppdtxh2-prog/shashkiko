const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        if (!rooms[roomId]) rooms[roomId] = { players: [], board: null, turn: 'w' };
        
        if (rooms[roomId].players.length < 2) {
            const color = rooms[roomId].players.length === 0 ? 'w' : 'b';
            rooms[roomId].players.push({ id: socket.id, color });
            socket.join(roomId);
            socket.emit('assignedColor', color);
            if (rooms[roomId].players.length === 2) io.to(roomId).emit('startGame');
        }
    });

    socket.on('move', (data) => {
        socket.to(data.roomId).emit('move', data);
    });
});

server.listen(3000);
