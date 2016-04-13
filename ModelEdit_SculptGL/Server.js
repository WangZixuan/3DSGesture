var http = require('http');
var WebSocketServer = require('websocket').server;
var readline = require('readline');
var server = http.createServer(function(request, response) {});

var port = 20000;

console.log('Start input!');
//启动输入流
process.stdin.resume();
//为输入流设定字符集
process.stdin.setEncoding("UTF-8");

server.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
});

var wsServer = new WebSocketServer({
    httpServer: server
});

var connection;

wsServer.on('request', function (req) {
    connection = req.accept('echo-protocol', req.origin);
    
    //console.log('Link start');
    //var msgString = 'hello';
    //connection.sendUTF(msgString);
    connection.on('message', function (message) {
        //var msgString = {"operation": "finger"};
        //connection.sendUTF(JSON.stringify(msgString));
        
        //var secondCmd = {"operation": "emboss"};
        //connection.sendUTF(JSON.stringify(secondCmd));
    });
    
    //var timer = setInterval(sendMsg, 1000);
    var operation;
    var handX;
    var handY;
    var count = 0;
//为输入流监听输入数据事件，回调函数参数为数据
process.stdin.on('data', function(chunk){
    count++;
    if (count === 1) {
        console.log('operation: ' + chunk);
        operation = chunk.slice(0, chunk.length - 2);
    }
    else if (count === 2) {
        console.log('handX: ' + chunk);
        handX = Number(chunk);
    }
    else {
        console.log('handY: ' + chunk);
        count = 0;
        handY = Number(chunk);
        sendMsg(operation, handX, handY);
    }
});
        //sendMsg(operation, handX, handY);
        
    
    
    connection.on('close', function(reasonCode, description) {
        console.log(connection.remoteAddress + ' disconnected.');
    });

});

var sendMsg = function(op, handX, handY) {
    var msgString = {"operation": op, "embossingPointX": handX, "embossingPointY": handY};
    connection.sendUTF(JSON.stringify(msgString));
}