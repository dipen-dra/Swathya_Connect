import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Paperclip,
    Phone,
    Video,
    MoreVertical,
    ArrowLeft,
    Loader2,
    CheckCheck,
    Check,
    Mic,
    Trash2,
    X,
    Play,
    Square
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { consultationChatAPI } from '@/services/api';
import consultationSocket from '@/services/consultationSocket';

export default function ChatConsultation() {
    const { id: consultationId } = useParams();
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

    useEffect(() => {
        initializeChat();
        return () => {
            cleanup();
        };
    }, [consultationId]);

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
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await consultationChatAPI.getMessages(consultationId);
            if (response.data.success) {
                setMessages(response.data.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const setupSocketListeners = () => {
        consultationSocket.onNewMessage((message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();

            // Mark as read if chat is open
            consultationSocket.markAsRead(consultationId);
        });

        consultationSocket.onUserTyping(({ userName }) => {
            setIsTyping(true);
        });

        consultationSocket.onUserStoppedTyping(() => {
            setIsTyping(false);
        });

        consultationSocket.onUserJoined(({ userName }) => {
            toast.success(`${userName} joined the consultation`);
        });

        consultationSocket.onUserLeft(({ userName }) => {
            toast.info(`${userName} left the consultation`);
        });
    };

    const cleanup = () => {
        if (consultationId) {
            consultationSocket.leaveConsultation(consultationId);
        }
        consultationSocket.off('new-message');
        consultationSocket.off('user-typing');
        consultationSocket.off('user-stopped-typing');
        consultationSocket.off('user-joined');
        consultationSocket.off('user-left');
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

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);

    // Audio Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
    };

    const handleSendAudio = async () => {
        if (!audioBlob) return;

        try {
            setSending(true);
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice-message.webm');
            formData.append('type', 'audio');

            const uploadResponse = await consultationChatAPI.uploadFile(formData);

            if (uploadResponse.data.success) {
                const messageData = {
                    consultationId,
                    content: 'Voice Message',
                    messageType: 'audio',
                    fileUrl: uploadResponse.data.file.url,
                    fileType: 'audio/webm'
                };
                consultationSocket.sendMessage(messageData);
                setAudioBlob(null);
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            toast.error('Failed to send voice message');
        } finally {
            setSending(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await consultationChatAPI.clearChatHistory(consultationId);
            setMessages([]);
            toast.success('Chat history cleared');
        } catch (error) {
            toast.error('Failed to clear chat history');
        }
    };

    const handleTyping = () => {
        consultationSocket.startTyping(consultationId);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
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
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            {message.messageType === 'audio' ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <audio controls src={`http://localhost:5000${message.fileUrl}`} className="h-8 w-full" />
                                </div>
                            ) : (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                                <span className="text-xs text-gray-500">
                                    {message.readBy[userRole === 'doctor' ? 'patient' : 'doctor'] ? (
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
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.profilePicture} />
                            <AvatarFallback>{otherUser?.name?.[0]}</AvatarFallback>
                        </Avatar>

                        <div>
                            <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                            <p className="text-sm text-gray-500">
                                {otherUser?.role === 'doctor' ? otherUser?.specialty : 'Patient'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {consultation?.type === 'audio' && (
                            <Button variant="ghost" size="icon">
                                <Phone className="h-5 w-5" />
                            </Button>
                        )}
                        {consultation?.type === 'video' && (
                            <Button variant="ghost" size="icon">
                                <Video className="h-5 w-5" />
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Clear Chat History"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will clear your copy of the chat history. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearChat} className="bg-red-600 hover:bg-red-700 text-white">
                                        Clear History
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map(renderMessage)}

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
            <div className="bg-white border-t px-4 py-3">
                {audioBlob ? (
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                        <Button variant="ghost" size="icon" onClick={() => setAudioBlob(null)} className="text-red-500">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1 h-8" />
                        <Button onClick={handleSendAudio} disabled={sending} className="bg-blue-600">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-gray-500"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        {isRecording ? (
                            <div className="flex-1 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-red-600 font-medium text-sm">
                                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={stopRecording}
                                    className="ml-auto text-red-600 hover:bg-red-100"
                                >
                                    <Square className="h-4 w-4 fill-current" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelRecording}
                                    className="text-gray-500 hover:bg-gray-200"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Input
                                    value={messageInput}
                                    onChange={(e) => {
                                        setMessageInput(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                    disabled={sending}
                                />
                                {messageInput.trim() ? (
                                    <Button
                                        type="submit"
                                        disabled={sending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {sending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={startRecording}
                                        className="bg-gray-100 text-gray-900 hover:bg-gray-200"
                                    >
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                )}
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
