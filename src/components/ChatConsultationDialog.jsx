import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Paperclip,
    X,
    Loader2,
    CheckCheck,
    Check,
    Clock,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { consultationChatAPI } from '@/services/api';
import consultationSocket from '@/services/consultationSocket';

export default function ChatConsultationDialog({ consultationId, open, onClose }) {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
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
    const typingTimeoutRef = useRef(null);

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

    // 30-minute countdown timer
    useEffect(() => {
        if (!open || !consultationChat) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                // Show warning at 10 minutes (600 seconds)
                if (prev <= 600 && !showWarning) {
                    setShowWarning(true);
                    setShowTimer(true);
                    toast.warning('⏰ 10 minutes remaining in consultation', {
                        duration: 5000,
                    });
                }

                // Auto-end at 0
                if (prev <= 0) {
                    handleConsultationEnd();
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, consultationChat, showWarning]);

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

                // Calculate time remaining based on start time
                if (response.data.data.timeRemaining !== undefined) {
                    setTimeRemaining(response.data.data.timeRemaining * 60); // Convert minutes to seconds
                }

                // Load messages
                await loadMessages();

                // Connect to socket
                const token = localStorage.getItem('token');
                consultationSocket.connect(token);
                consultationSocket.joinConsultation(consultationId);
                setIsConnected(true);

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
        consultationSocket.onNewMessage((message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
            consultationSocket.markAsRead(consultationId);
        });

        consultationSocket.onUserTyping(({ userName }) => {
            setIsTyping(true);
        });

        consultationSocket.onUserStoppedTyping(() => {
            setIsTyping(false);
        });
    };

    const cleanup = () => {
        if (consultationId) {
            consultationSocket.leaveConsultation(consultationId);
        }
        consultationSocket.off('new-message');
        consultationSocket.off('user-typing');
        consultationSocket.off('user-stopped-typing');
    };

    const handleConsultationEnd = async () => {
        try {
            toast.info('Consultation time ended. Marking as completed...');

            // Call backend to end consultation
            await consultationChatAPI.endConsultation(consultationId);

            toast.success('Consultation completed successfully');
            onClose();
        } catch (error) {
            console.error('Error ending consultation:', error);
            toast.error('Failed to end consultation');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!messageInput.trim()) return;

        try {
            setSending(true);

            const messageData = {
                consultationId,
                content: messageInput.trim(),
                messageType: 'text'
            };

            consultationSocket.sendMessage(messageData);
            setMessageInput('');
            consultationSocket.stopTyping(consultationId);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleTyping = () => {
        consultationSocket.startTyping(consultationId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            consultationSocket.stopTyping(consultationId);
        }, 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const renderMessage = (message) => {
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
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                    {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUser?.profilePicture} />
                            <AvatarFallback>{otherUser?.name?.[0]}</AvatarFallback>
                        </Avatar>
                    )}

                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-gray-200'
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                                <span className="text-xs text-gray-500">
                                    {message.readBy?.[userRole === 'doctor' ? 'patient' : 'doctor'] ? (
                                        <CheckCheck className="h-3 w-3 text-blue-600" />
                                    ) : (
                                        <Check className="h-3 w-3" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[80vh]">
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={otherUser?.profilePicture} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {otherUser?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <DialogTitle className="text-lg">{otherUser?.name}</DialogTitle>
                                <p className="text-sm text-gray-500">
                                    {otherUser?.role === 'doctor' ? otherUser?.specialty : 'Patient'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Timer Display */}
                            {showTimer && (
                                <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1 border-orange-300 bg-orange-50">
                                    <Clock className="h-3 w-3 text-orange-600" />
                                    <span className="text-orange-600 font-mono font-semibold">
                                        {formatTimer(timeRemaining)}
                                    </span>
                                </Badge>
                            )}

                            <Badge className="bg-green-100 text-green-700 border-green-300">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Live
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageCircle className="h-12 w-12 mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm">Start the conversation by sending a message below</p>
                        </div>
                    ) : (
                        messages.map(renderMessage)
                    )}

                    {isTyping && (
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>{otherUser?.name} is typing...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-gray-500"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        <Input
                            value={messageInput}
                            onChange={(e) => {
                                setMessageInput(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 border-gray-200"
                            disabled={sending}
                        />

                        <Button
                            type="submit"
                            disabled={!messageInput.trim() || sending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {sending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
