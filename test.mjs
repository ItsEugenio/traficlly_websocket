import io from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

const socket = io(SERVER_URL);

socket.on("connect", () => {
  console.log("Conectado al servidor WebSocket");

  // Suscripción con el ID 12345
  socket.emit("subscribe", 12345);

  // Manejo de notificaciones de personas dentro y fuera
  socket.on("notificacion", (data) => {
    if (data.tipo === 'personasDentro') {
      console.log("Notificación de personas dentro:", data.mensaje);
    } else if (data.tipo === 'personasFuera') {
      console.log("Notificación de personas fuera:", data.mensaje);
    }
  });
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor WebSocket");
});

socket.on("error", (error) => {
  console.error("Error en la conexión WebSocket:", error.message);
});
