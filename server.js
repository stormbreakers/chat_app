var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);
app.use(express.static(__dirname + '/public'));
// app.get('/', function (req, res) {
//     res.sendFile('/index.html');
// });

io.on('connection', function (socket) {
    socket.on('user joined', function(msg){
        socket.username = msg.username;
        socket.broadcast.emit('chat message',msg.msg);
        console.log('message: ' + msg.msg);
    });

    socket.on('chat message', function(msg){
        io.emit('chat message',msg.msg);
        console.log('message: ' + msg.msg);
    });

    socket.on('disconnect', function () {
        console.log(socket.username+' disconnected');
        socket.broadcast.emit('user left', {
            username: socket.username
        });
    });

    socket.on('typing',function () {
        console.log(socket.username+' typing');
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });
    
    socket.on('stop typing',function () {
        console.log(socket.username+' stopped typing');
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });
});