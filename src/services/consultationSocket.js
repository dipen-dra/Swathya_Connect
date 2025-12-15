import { io } from 'socket.io-client';

class ConsultationSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket && this.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io('http://localhost:5000', {
            auth: {
                token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to consultation chat server');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from consultation chat server');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinConsultation(consultationId) {
        if (this.socket) {
            this.socket.emit('join-consultation', consultationId);
        }
    }

    leaveConsultation(consultationId) {
        if (this.socket) {
            this.socket.emit('leave-consultation', consultationId);
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('send-message', data);
        }
    }

    startTyping(consultationId) {
        if (this.socket) {
            this.socket.emit('typing', consultationId);
        }
    }

    stopTyping(consultationId) {
        if (this.socket) {
            this.socket.emit('stop-typing', consultationId);
        }
    }

    markAsRead(consultationId) {
        if (this.socket) {
            this.socket.emit('mark-as-read', { consultationId });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new-message', callback);
        }
    }

    onUserJoined(callback) {
        if (this.socket) {
            this.socket.on('user-joined', callback);
        }
    }

    onUserLeft(callback) {
        if (this.socket) {
            this.socket.on('user-left', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user-typing', callback);
        }
    }

    onUserStoppedTyping(callback) {
        if (this.socket) {
            this.socket.on('user-stopped-typing', callback);
        }
    }

    onMessagesRead(callback) {
        if (this.socket) {
            this.socket.on('messages-read', callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new ConsultationSocketService();
