import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { chatAPI } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function PharmacyChat({ open, onOpenChange, pharmacyId, pharmacyName, pharmacyImage, chatId: existingChatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(existingChatId || null);
    const [typing, setTyping] = useState(false);
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    // Initialize or get existing chat
    useEffect(() => {
        if (open && (pharmacyId || existingChatId)) {
            console.log('🔵 Initializing chat:', { pharmacyId, existingChatId });
            initializeChat();
        }
    }, [open, pharmacyId, existingChatId]);

    const initializeChat = async () => {
        try {
            setLoading(true);
            let currentChatId = existingChatId;

            // If chatId is provided (pharmacy view), use it directly
            // Otherwise create/get chat (patient view)
            if (!existingChatId && pharmacyId) {
                console.log('📞 Creating/getting chat for pharmacy:', pharmacyId);
                const response = await chatAPI.createChat(pharmacyId);
                console.log('✅ Chat response:', response.data);
                currentChatId = response.data.chat._id;
                setChatId(currentChatId);
                console.log('💬 Chat ID set:', currentChatId);
            } else {
                console.log('💬 Using existing chat ID:', existingChatId);
                setChatId(existingChatId);
            }

            // Load messages
            const messagesResponse = await chatAPI.getChatMessages(currentChatId);
            console.log('📨 Messages loaded:', messagesResponse.data.messages.length);
            setMessages(messagesResponse.data.messages);

            // Join chat room via socket
            if (socket && connected) {
                console.log('🔌 Joining chat room via socket');
                socket.emit('chat:join', currentChatId);
            } else {
                console.warn('⚠️ Socket not connected, cannot join room');
            }

            // Mark messages as read
            await chatAPI.markAsRead(currentChatId);

        } catch (error) {
            console.error('❌ Error initializing chat:', error);
            toast.error('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket || !chatId) return;

        // Listen for new messages
        const handleMessageReceived = (message) => {
            console.log('📩 Message received:', message);
            setMessages(prev => [...prev, message]);
            scrollToBottom();

            // Mark as read if chat is open
            if (open) {
                chatAPI.markAsRead(chatId);
            }
        };

        // Listen for typing indicators
        const handleUserTyping = () => {
            setTyping(true);
        };

        const handleUserStoppedTyping = () => {
            setTyping(false);
        };

        socket.on('message:received', handleMessageReceived);
        socket.on('user:typing', handleUserTyping);
        socket.on('user:stoppedTyping', handleUserStoppedTyping);

        return () => {
            socket.off('message:received', handleMessageReceived);
            socket.off('user:typing', handleUserTyping);
            socket.off('user:stoppedTyping', handleUserStoppedTyping);
        };
    }, [socket, chatId, open]);

    // Leave chat room when dialog closes
    useEffect(() => {
        if (!open && socket && chatId) {
            socket.emit('chat:leave', chatId);
        }
    }, [open, socket, chatId]);

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSendMessage = () => {
        console.log('🔵 Send button clicked!');
        console.log('📝 Message:', newMessage);
        console.log('🔌 Socket:', socket ? 'exists' : 'null');
        console.log('🔗 Connected:', connected);
        console.log('💬 ChatId:', chatId);

        if (!newMessage.trim()) {
            console.log('❌ Message is empty');
            return;
        }

        if (!socket) {
            console.log('❌ Socket is null');
            toast.error('Not connected to chat server');
            return;
        }

        if (!chatId) {
            console.log('❌ ChatId is null');
            toast.error('Chat not initialized');
            return;
        }

        console.log('✅ Sending message via socket...');
        // Emit message via socket
        socket.emit('message:send', {
            chatId,
            content: newMessage.trim()
        });

        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing:stop', { chatId });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket || !chatId) return;

        // Emit typing start
        socket.emit('typing:start', { chatId });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to emit typing stop
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { chatId });
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[700px] flex flex-col bg-white p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={getImageUrl(pharmacyImage)} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
                                {pharmacyName?.charAt(0) || 'P'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <DialogTitle className="flex items-center space-x-2 text-xl">
                                <MessageCircle className="h-5 w-5 text-purple-600" />
                                <span>{pharmacyName || 'Pharmacy Chat'}</span>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {connected ? (
                                    <span className="flex items-center space-x-2 text-green-600">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span>Connected</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center space-x-2 text-gray-500">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                        <span>Connecting...</span>
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-4 pb-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-8">
                                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isOwnMessage = message.sender._id === user?.id;
                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                                                    }`}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback
                                                        className={`${isOwnMessage
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-purple-100 text-purple-600'
                                                            }`}
                                                    >
                                                        {isOwnMessage ? 'You' : pharmacyName?.charAt(0) || 'P'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'
                                                        }`}
                                                >
                                                    <div
                                                        className={`inline-block px-4 py-2 rounded-lg ${isOwnMessage
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <p className="text-sm break-words">{message.content}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 px-1">
                                                        {formatTime(message.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {typing && (
                                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-purple-100 text-purple-600">
                                                {pharmacyName?.charAt(0) || 'P'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex space-x-1 bg-gray-100 px-4 py-2 rounded-lg">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="flex items-center space-x-2 px-6 py-4 border-t bg-gray-50">
                            <Input
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyPress={handleKeyPress}
                                disabled={!connected}
                                className="flex-1 bg-white"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || !connected}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="icon"
                                type="button"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
