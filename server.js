'use strict';

var Hapi = require('hapi');

var server = new Hapi.Server();
//add the inert plugin to our Hapi application
server.register(require('inert'));

//configurate connection with server
server.connection({
    host: 'localhost',
    port: 7777
});

server.route([
    {
        method: 'GET',
        path: '/{param*}',// * is any file and any nesting;  it's parameter of path
        handler:{
            directory: {
                path: './public',
                index: true//with this value of param "index" we will get only index.html
            }
        }
    }
]);

//start server
server.start(function(){
    console.log('Server started');
});