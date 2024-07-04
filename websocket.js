import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv'
dotenv.config()
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.static('public'));

let clients = {};

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('subscribe', (email) => {
    clients[socket.id] = email;
    console.log(`Cliente ${socket.id} suscrito con el correo: ${email}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    delete clients[socket.id];
  });

  socket.on('sendEvent', (eventData) => {
    const { email, event } = eventData;

    for (let clientId in clients) {
      if (clients[clientId] === email) {
        io.to(clientId).emit('receiveEvent', event);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default server;
