import { io } from "socket.io-client";

// Use environment variable or default to localhost:3000
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let socket;

const socketService = {
  // Initialize socket connection
  connect: (userId) => {
    if (!socket) {
      socket = io(API_URL);
      
      socket.on("connect", () => {
        console.log("Connected to socket server with ID:", socket.id);
        if (userId) {
            socket.emit("join_user", userId);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });
    }
    return socket;
  },

  // Join a specific negotiation room
  joinNegotiation: (negotiationId) => {
    if (socket && negotiationId) {
      socket.emit("join_negotiation", negotiationId);
    }
  },

  // Leave a specific negotiation room
  leaveNegotiation: (negotiationId) => {
      if (socket && negotiationId) {
          socket.emit("leave_negotiation", negotiationId);
      }
  },

  // Listen for events
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  // Remove listener
  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },

  // Disconnect socket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};

export default socketService;
