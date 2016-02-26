var net = require('net');
var http = require('http');
var WebSocketServer = require('websocket').server;

var winSocketPort = 10000;
var webSocketPort = 20000;

var connections;

var server = http.createServer(function (request, response) {
    console.log('The SERVER received request for ' + request.url + ' ...');
    response.writeHead(404);
    response.end();
});

server.listen(webSocketPort, function () {
    console.log('The SERVER is listening on port ' + webSocketPort + ' ...');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);

    connections = connection;

    console.log('The SERVER accepted the connection of ' + connection.remoteAddress + ':' + connection.remotePort + ' ...');

    /*
    connection.on('message', function (message) {

        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    */

    connection.on('close', function (reasonCode, description) {
        console.log('The SERVER cut off the connection of ' + connection.remoteAddress + ':' + connection.remotePort +' ...');
    });
});

var sendMessage = function (message) {
    if (connections != undefined) {
        connections.sendUTF(message);
    }
};


// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function (sock) {

    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('The SERVER accepted the connection of ' + sock.remoteAddress + ':' + sock.remotePort + ' ...');

    // 为这个socket实例添加一个"data"事件处理函数
    sock.on('data', function (data) {
        console.log('DATA from ' + sock.remoteAddress + ': ' + data);
        sendMessage(data);
    });

    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function (data) {
        console.log('The SERVER cut off the connection of ' + sock.remoteAddress + ':' + sock.remotePort + ' ...');
    });

}).listen(winSocketPort, function () {
    console.log('The SERVER is listening on port ' + winSocketPort + ' ...');
});