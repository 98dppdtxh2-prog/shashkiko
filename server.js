const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

// ვინახავთ თითოეული ოთახის დაფის მდგომარეობას
const rooms = {};

// საწყისი დაფის ფუნქცია
function createInitialBoard() {
    let board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) board[r][c] = { type: 'b', king: false };
        }
    }
    for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) board[r][c] = { type: 'w', king: false };
        }
    }
    return board;
}

io.on('connection', (socket) => {
    let currentRoom = null;

    // ოთახში შესვლა
    socket.on('joinRoom', (roomId) => {
        currentRoom = roomId;
        socket.join(roomId);

        // თუ ოთახი არ არსებობს, ვქმნით ახალ დაფას
        if (!rooms[roomId]) {
            rooms[roomId] = {
                board: createInitialBoard(),
                turn: 'w'
            };
        }

        // ვუგზავნით ახალ მოთამაშეს მიმდინარე დაფის მდგომარეობას
        socket.emit('initGameState', rooms[roomId]);
    });

    // სვლის გაკეთება
    socket.on('move', (data) => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].board = data.board;
            rooms[currentRoom].turn = data.turn;
            // ვუგზავნით სვლას მხოლოდ ამავე ოთახის წევრებს
            socket.to(currentRoom).emit('move', data);
        }
    });

    // ჩატის მესიჯი
    socket.on('chatMessage', (msg) => {
        if (currentRoom) {
            socket.to(currentRoom).emit('chatMessage', msg);
        }
    });

    socket.on('disconnect', () => {
        // სურვილისამებრ აქ შეიძლება ოთახის გაწმენდის ლოგიკა
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
