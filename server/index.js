'use strict';

import Express from 'express';
import BodyParser from 'body-parser';
import Cors from 'cors';
import FS from 'fs-extra';
import Http from 'http';
import Path from 'path';

const app = Express();
global.__rootDir = __dirname.replace('/server', '');

app
    .use(Cors())
    .use(BodyParser.json())
    .use(BodyParser.urlencoded({extended: true}))
    .use(Express.static(Path.resolve(__dirname, '..', 'public'), {maxAge: 31557600000}))
	.set('views', Path.join(__dirname, '..', 'public', 'views'))
	.set('view engine', 'ejs');

const routePath = `${__dirname}/routes/`;
FS.readdirSync(routePath).forEach((file) => {
    require(`${routePath}${file}`)(app);
});

const server = Http.createServer(app).listen(3030, () => {
    console.log(`App listening on 3030!`);
});
//
// const io = require('socket.io')(server);
// let i = 1;
// io.on('connection', function (socket) {
//     console.log(i++ + 'client ID: ' + socket.id);
//
//     // socket.emit('news', { hello: 'world' });
//
//     socket.on('message/create', function (data, callback) {
//         console.log(data);
//         socket.broadcast.emit('message/receive', data);
//         return callback({
//             success: true,
//             data
//         })
//     });
// });