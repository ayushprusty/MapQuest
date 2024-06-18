const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let locationData = [];

fs.readFile('vehicle_location.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    locationData = JSON.parse(data);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    let index = 0;
    let intervalId = null;

    const sendLocationData = () => {
        if (index < locationData.length) {
            const location = locationData[index];
            const coordinates = location.loc.coordinates;
            const heading = location.hd;

            socket.emit('location_update', {
                latitude: coordinates[0],
                longitude: coordinates[1],
                heading: heading
            });
            index++;
            console.log(index);
            intervalId = setTimeout(sendLocationData, 70);
        }
    };

    socket.on('resume', () => {
        if (!intervalId) {
            sendLocationData();
        }
    });

    socket.on('pause', () => {
        if (intervalId) {
            clearTimeout(intervalId);
            intervalId = null;
        }
    });
});

server.listen(PORT, () => {
    console.log('Server is running on http://localhost:${PORT}');
});


