import { strict as assert } from 'assert';
import { io } from 'socket.io-client';

const runTests = async () => {
  let socket;

  const connectClient = () => {
    return new Promise((resolve) => {
      socket = io('http://localhost:5000', {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        resolve();
      });
    });
  };

  const disconnectClient = () => {
    return new Promise((resolve) => {
      if (socket.connected) {
        socket.disconnect();
      }
      resolve();
    });
  };

  await connectClient();

  console.log('Cliente conectado para pruebas');

  try {
    await new Promise((resolve, reject) => {
      const email = 'test@example.com';
      const eventMessage = 'Hola, test@example.com';

      socket.emit('subscribe', email);

      socket.emit('sendEvent', { email, event: eventMessage });

      socket.on('receiveEvent', (event) => {
        try {
          assert.equal(event, eventMessage);
          console.log('Prueba 1 pasada: suscripción y recepción de eventos correspondientes');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await new Promise((resolve, reject) => {
      const email = 'test@example.com';
      const wrongEmail = 'wrong@example.com';
      const eventMessage = 'Hola, test@example.com';

      socket.emit('subscribe', email);

      socket.emit('sendEvent', { email: wrongEmail, event: eventMessage });

      socket.on('receiveEvent', (event) => {
        reject(new Error('No debería recibir el evento'));
      });

      setTimeout(() => {
        console.log('Prueba 2 pasada: no recepción de eventos si el correo no coincide');
        resolve();
      }, 500);
    });
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }

  await disconnectClient();
  console.log('Cliente desconectado después de las pruebas');
};

runTests().then(() => {
  console.log('Pruebas completadas');
  process.exit(0);
}).catch((error) => {
  console.error('Error al ejecutar las pruebas:', error);
  process.exit(1);
});
