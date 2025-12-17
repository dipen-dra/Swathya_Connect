import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Clock, AlertCircle, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { consultationChatAPI, chatAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

export default function ChatConsultationDialog({ consultationId, open, onClose }) {
    const { user } = useAuth();
    const { socket, connected } = useSocket();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [consultation, setConsultation] = useState(null);
    const [consultationChat, setConsultationChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [userRole, setUserRole] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // Timer states
    const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
    const [showWarning, setShowWarning] = useState(false);
    const [showTimer, setShowTimer] = useState(false);

    useEffect(() => {
        if (open) {
            initializeChat();
        }
        return () => {
            cleanup();
        };
    }, [consultationId, open]);

    // 30-minute countdown timer - synchronized across all clients
    useEffect(() => {
        if (!open || !consultationChat || !consultationChat.startedAt) return;

        let warningShown = showWarning; // Use existing state

        const updateTimer = () => {
            const startTime = new Date(consultationChat.startedAt);
            const now = new Date();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const totalSeconds = 30 * 60; // 30 minutes
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

            setTimeRemaining(remainingSeconds);

            // Show warning at 10 minutes (600 seconds) - only once per session
            if (remainingSeconds <= 600 && !warningShown) {
                warningShown = true;
                setShowWarning(true);
                setShowTimer(true);
                toast.warning('⏰ 10 minutes remaining in consultation', {
                    duration: 5000,
                });
            }

            // Auto-end at 0
            if (remainingSeconds <= 0) {
                handleConsultationEnd();
            }
        };

        // Update immediately
        updateTimer();

        // Update every second
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [open, consultationChat]); // Removed showWarning from dependencies

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            setLoading(true);

            // Get consultation chat details
            const response = await consultationChatAPI.getConsultationChat(consultationId);

            if (response.data.success) {
                setConsultation(response.data.data.consultation);
                setConsultationChat(response.data.data.consultationChat);
                setUserRole(response.data.data.userRole);
                setOtherUser(response.data.data.otherUser);

                // Set timer from backend (persists across refreshes)
                if (response.data.data.timeRemaining !== undefined) {
                    const timeInSeconds = response.data.data.timeRemaining * 60;
                    setTimeRemaining(timeInSeconds);
                    // Show timer immediately if less than 10 minutes
                    if (timeInSeconds <= 600) {
                        setShowTimer(true);
                        setShowWarning(true);
                    }
                }

                // Load messages
                await loadMessages();

                // Use existing socket connection from SocketContext
                console.log('🔌 Socket connection status:', connected);
                setIsConnected(connected);

                if (!connected || !socket) {
                    console.warn('⚠️ Socket not connected, messages may not send');
                    toast.warning('Connection issue - messages may not send immediately');
                } else {
                    // Join consultation room
                    console.log('🔌 Socket object:', socket);
                    console.log('🔌 Socket.emit function:', typeof socket.emit);
                    console.log('🆔 Socket ID when emitting:', socket.id);
                    socket.emit('join-consultation', consultationId);
                    console.log('📍 Emitted join-consultation event for:', consultationId);
                }

                // Set up socket listeners
                setupSocketListeners();

                // Mark messages as read
                await consultationChatAPI.markMessagesAsRead(consultationId);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            toast.error(error.response?.data?.message || 'Failed to load consultation');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            console.log('📨 Loading messages for consultation:', consultationId);
            const response = await consultationChatAPI.getMessages(consultationId);
            console.log('📨 Messages response:', response.data);
            if (response.data.success) {
                setMessages(response.data.data);
                console.log('✅ Loaded messages:', response.data.data.length);
                scrollToBottom();
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        }
    };

    const setupSocketListeners = () => {
        if (!socket) return;

        socket.on('new-message', (message) => {
            console.log('📩 New message received:', message);
            // Only add if message doesn't already exist (prevent duplicates)
            setMessages(prev => {
                const exists = prev.some(m => m._id === message._id);
                if (exists) {
                    console.log('Message already exists, skipping');
                    return prev;
                }
                return [...prev, message];
            });
            scrollToBottom();
            if (open && consultationId) {
                socket.emit('mark-as-read', { consultationId });
            }
        });

        socket.on('user-typing', ({ userName }) => {
            setIsTyping(true);
        });

        socket.on('user-stopped-typing', () => {
            setIsTyping(false);
        });
    };

    const cleanup = () => {
        if (consultationId && socket) {
            socket.emit('leave-consultation', consultationId);
            socket.off('new-message');
            socket.off('user-typing');
            socket.off('user-stopped-typing');
        }
    };

    const handleConsultationEnd = async () => {
        try {
            toast.info('Consultation time ended. Marking as completed...');
            await consultationChatAPI.endConsultation(consultationId);
            toast.success('Consultation completed successfully');
            onClose();
        } catch (error) {
            console.error('Error ending consultation:', error);
            toast.error('Failed to end consultation');
        }
    };

    const handleSendMessage = () => {
        console.log('🔵 handleSendMessage called');
        console.log('📝 Message input:', messageInput);
        console.log('📎 Selected file:', selectedFile);

        if (!messageInput.trim() && !selectedFile) {
            console.log('❌ No message or file to send');
            return;
        }

        if (selectedFile) {
            console.log('📎 Sending with file');
            handleSendWithFile();
            return;
        }

        try {
            setSending(true);

            console.log('🔌 Socket connected:', connected);
            console.log('💬 Consultation ID:', consultationId);

            const messageData = {
                consultationId,
                content: messageInput.trim(),
                messageType: 'text'
            };

            console.log('📤 Sending message data:', messageData);
            console.log('🔌 About to emit send-message event');
            console.log('🔌 Socket object exists:', !!socket);
            console.log('🔌 Socket.emit type:', typeof socket?.emit);
            socket.emit('send-message', messageData);
            console.log('✅ socket.emit() called successfully');

            setMessageInput('');
            socket.emit('stop-typing', consultationId);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('File type not supported. Please upload images, PDFs, or Word documents.');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendWithFile = async () => {
        if (!selectedFile && !messageInput.trim()) return;
        if (!socket || !connected || !consultationId) {
            toast.error('Chat not initialized');
            return;
        }

        try {
            setSending(true);
            let messageType = 'text';
            let attachment = null;

            // Upload file if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                toast.loading('Uploading file...');
                const uploadResponse = await consultationChatAPI.uploadFile(formData);
                toast.dismiss();

                if (uploadResponse.data.success) {
                    attachment = uploadResponse.data.file;
                    messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
                    toast.success('File uploaded successfully');
                } else {
                    throw new Error('File upload failed');
                }
            }

            // Send message via socket with backend-expected format
            const messageContent = messageInput.trim() || (attachment ? attachment.filename : '');

            const messageData = {
                consultationId,
                content: messageContent,
                messageType: messageType,
                // Backend expects these separate fields, not an attachment object
                fileUrl: attachment?.url || null,
                fileName: attachment?.filename || null,
                fileType: attachment?.mimetype || null,
                fileSize: attachment?.size || null
            };

            socket.emit('send-message', messageData);

            // Clear inputs
            setMessageInput('');
            handleRemoveFile();

            // Stop typing indicator
            socket.emit('stop-typing', consultationId);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

        } catch (error) {
            console.error('Error sending message with file:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e) => {
        setMessageInput(e.target.value);

        if (!socket || !consultationId) return;

        socket.emit('typing', consultationId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', consultationId);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[700px] flex flex-col bg-white p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={getImageUrl(otherUser?.profilePicture)} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold">
                                    {otherUser?.name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <DialogTitle className="flex items-center space-x-2 text-xl">
                                    <MessageCircle className="h-5 w-5 text-blue-600" />
                                    <span>{otherUser?.name || 'Consultation Chat'}</span>
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    {otherUser?.role === 'doctor' ? otherUser?.specialty : 'Patient'} • {isConnected ? (
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

                        {/* Timer Display - Always visible, changes color when low */}
                        {consultationChat && (
                            <Badge
                                variant="outline"
                                className={`flex items-center space-x-1 px-3 py-1 ${timeRemaining <= 600
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-blue-300 bg-blue-50'
                                    }`}
                            >
                                <Clock className={`h-3 w-3 ${timeRemaining <= 600 ? 'text-red-600' : 'text-blue-600'}`} />
                                <span className={`font-mono font-semibold ${timeRemaining <= 600 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {formatTimer(timeRemaining)}
                                </span>
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                                        const isOwnMessage = message.senderRole === userRole;
                                        const isSystemMessage = message.messageType === 'system';

                                        if (isSystemMessage) {
                                            return (
                                                <div key={message._id} className="flex justify-center my-4">
                                                    <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
                                                        {message.content}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getImageUrl(isOwnMessage ? null : otherUser?.profilePicture)} />
                                                    <AvatarFallback
                                                        className={`${isOwnMessage
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-purple-100 text-purple-600'
                                                            }`}
                                                    >
                                                        {isOwnMessage ? 'You' : otherUser?.name?.[0] || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
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
                                {isTyping && (
                                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-purple-100 text-purple-600">
                                                {otherUser?.name?.[0] || 'U'}
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

                        {/* File Preview */}
                        {selectedFile && (
                            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                                    <div className="flex items-center space-x-3">
                                        {filePreview ? (
                                            <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRemoveFile}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="flex items-center space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Attach File Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isConnected}
                                className="text-gray-500 hover:text-blue-600"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <Input
                                placeholder="Type your message..."
                                value={messageInput}
                                onChange={handleTyping}
                                onKeyPress={handleKeyPress}
                                disabled={!isConnected || sending}
                                className="flex-1 bg-white"
                            />
                            <Button
                                onClick={selectedFile ? handleSendWithFile : handleSendMessage}
                                disabled={(!messageInput.trim() && !selectedFile) || !isConnected || sending}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="icon"
                                type="button"
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
