import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_negotiation', (negotiationId) => {
            socket.join(`negotiation_${negotiationId}`);
            console.log(`Socket ${socket.id} joined negotiation_${negotiationId}`);
        });

        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined user_${userId}`);
        });

        socket.on('leave_negotiation', (negotiationId) => {
            socket.leave(`negotiation_${negotiationId}`);
            console.log(`Socket ${socket.id} left negotiation_${negotiationId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
