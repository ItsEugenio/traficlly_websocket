import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.static('public'));

let clients = {};

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('subscribe', (clientId) => {
    clients[socket.id] = clientId;
    console.log(`Cliente ${socket.id} suscrito con el ID: ${clientId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    delete clients[socket.id];
  });

  socket.on('sendEvent', (eventData) => {
    const { clientId, event } = eventData;

    for (let socketId in clients) {
      if (clients[socketId] === clientId) {
        io.to(socketId).emit('receiveEvent', event);
      }
    }
  });

  socket.on('personasDentro', (clientId) => {
    for (let socketId in clients) {
      if (clients[socketId] === clientId) {
        io.to(socketId).emit('notificacion', { tipo: 'personasDentro', mensaje: true });
      }
    }
  });

  socket.on('personasFuera', (clientId) => {
    for (let socketId in clients) {
      if (clients[socketId] === clientId) {
        io.to(socketId).emit('notificacion', { tipo: 'personasFuera', mensaje: true });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default server;
