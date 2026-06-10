const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    if (!players['X']) {
        players['X'] = socket.id;
        socket.emit('player-assignment', 'X');
    } else if (!players['O']) {
        players['O'] = socket.id;
        socket.emit('player-assignment', 'O');
    } else {
        socket.emit('player-assignment', 'Spectator');
    }

    socket.on('make-move', (data) => {
        socket.broadcast.emit('move-made', data);
    });

    // ჩატის მესიჯების მიღება და ყველასთვის გადაგზავნა
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
    });

    socket.on('disconnect', () => {
        if (players['X'] === socket.id) delete players['X'];
        if (players['O'] === socket.id) delete players['O'];
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});