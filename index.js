import express from 'express';
import https from 'https';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Cargar el certificado SSL/TLS
const sslOptions = {
  key: fs.readFileSync(ssl_certificate_key /etc/letsencrypt/live/traficws.zapto.org/privkey.pem), // Ruta al archivo .key
  cert: fs.readFileSync(/etc/letsencrypt/live/traficws.zapto.org/fullchain.pem), // Ruta al archivo .cert o .pem
 
};

const server = https.createServer(sslOptions, app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.static('public'));

let clients = {};
let hours = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];
let peopleCountsInside = Array(24).fill(0);
let peopleCountsOutside = Array(24).fill(0);
let lastResetDate = new Date().getDate(); // Guarda el día actual

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('subscribe', (clientId) => {
    clients[socket.id] = clientId;
    console.log(`Cliente ${socket.id} suscrito con el ID: ${clientId}`);
    
    io.to(socket.id).emit('notificacion', { tipo: 'actualizacion', horas: hours, personasDentro: peopleCountsInside, personasFuera: peopleCountsOutside });
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
    const currentHour = new Date().getHours();
    peopleCountsInside[currentHour] += 1;

    for (let socketId in clients) {
      if (clients[socketId] === clientId) {
        io.to(socketId).emit('notificacion', { tipo: 'personasDentro', horas: hours, personasDentro: peopleCountsInside, personasFuera: peopleCountsOutside });
      }
    }
  });

  socket.on('personasFuera', (clientId) => {
    const currentHour = new Date().getHours();
    peopleCountsOutside[currentHour] += 1;

    for (let socketId in clients) {
      if (clients[socketId] === clientId) {
        io.to(socketId).emit('notificacion', { tipo: 'personasFuera', horas: hours, personasDentro: peopleCountsInside, personasFuera: peopleCountsOutside });
      }
    }
  });
});

// Función para verificar y reiniciar peopleCounts cada día
function checkAndResetPeopleCounts() {
  const currentDay = new Date().getDate();
  if (currentDay !== lastResetDate) {
    peopleCountsInside = Array(24).fill(0);
    peopleCountsOutside = Array(24).fill(0);
    lastResetDate = currentDay;
    console.log('Se ha reiniciado peopleCounts para un nuevo día.');
  }
}

setInterval(checkAndResetPeopleCounts, 3600000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en el puerto ${PORT}`);
});

export default server;
