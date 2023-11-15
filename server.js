// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

// Хранилище для участников чата
const participants = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    // Слушаем событие отправки сообщения от клиента
    socket.on('chatMessage', (data) => {
        // Посылаем сообщение всем подключенным клиентам
        io.emit('chatMessage', data);
    });

    // Слушаем событие запроса всех сообщений от клиента
    socket.on('getMessages', () => {
        // Отправляем все сообщения текущему клиенту
        socket.emit('allMessages', messages);
    });

    // Слушаем событие добавления участника
    socket.on('addParticipant', (name) => {
        participants.push(name);
        // Оповещаем всех участников о обновлении списка участников
        io.emit('updateParticipants', participants);
    });

    // Слушаем событие отключения участника
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // Удаляем участника из списка при отключении
        const index = participants.indexOf(socket.username);
        if (index !== -1) {
            participants.splice(index, 1);
            // Оповещаем всех участников о обновлении списка участников
            io.emit('updateParticipants', participants);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
