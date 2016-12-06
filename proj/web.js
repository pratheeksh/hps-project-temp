/**
 * Created by pratheeksha on 12/4/16.
 */
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 10000;
var clients = new Map();
io.on('connection', function (socket) {
    console.log('a client connected');
    socket.on('disconnect', function () {
        console.info('Client gone (id=' + socket.id + ').');
    });
    socket.on('room', function (room) {
        console.log("new invite: " + JSON.stringify(room));
        var roomMembers = io.of('/').adapter.rooms[room];
        if (roomMembers != null) {
            console.log(roomMembers.length)
            if (roomMembers.length == 2) {
                console.log("Both players have already joined, returning");
                return;
            }
        }


        socket.join(room);
        if (clients.get(room) == null) {
            clients.set(room, []);

        }
        var clientsInRoom = clients.get(room)
        clientsInRoom.push(socket)
        clients.set(room, clientsInRoom)
        if (io.of('/').adapter.rooms[room].length == 2) {

            // console.log(clients.get(room))
            clients.get(room)[0].emit('phase', "0");
            clients.get(room)[1].emit('phase', "1");

        }

    });

    socket.on('mines', function (mines, room) {
        console.log(mines)
        clients.get(room)[1].emit('mines', mines, "1");
    });

    socket.on('draw', function (x, y, type, room) {
        clients.get(room)[0].emit('draw', x, y, type);
    });

});


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/Roving_start.html');
});
server.listen(port, function () {
    console.log('Express server listening on %s', port);
});
