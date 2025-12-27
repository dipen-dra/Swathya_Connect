import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2, Paperclip, X, Image as ImageIcon, FileText, Mic, Trash2, MoreVertical, Play, Square } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { chatAPI } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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


export function PharmacyChat({ open, onOpenChange, pharmacyId, pharmacyName, pharmacyImage, chatId: existingChatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(existingChatId || null);
    const [typing, setTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

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
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
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
        if (!socket || !chatId) {
            toast.error('Chat not initialized');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice-message.webm');
            formData.append('type', 'audio'); // Hint for backend

            toast.loading('Uploading voice message...');
            const uploadResponse = await chatAPI.uploadFile(formData);
            toast.dismiss();

            if (uploadResponse.data.success) {
                const attachment = uploadResponse.data.file;
                socket.emit('message:send', {
                    chatId,
                    content: 'Voice Message',
                    type: 'audio',
                    attachment: attachment
                });
                setAudioBlob(null);
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            toast.error('Failed to send voice message');
        }
    };

    const handleClearChat = async () => {
        if (!chatId) return;
        try {
            await chatAPI.clearChatHistory(chatId);
            setMessages([]);
            toast.success('Chat history cleared');
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Failed to clear chat history');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // File handling functions
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
        if (!selectedFile && !newMessage.trim()) return;
        if (!socket || !chatId) {
            toast.error('Chat not initialized');
            return;
        }

        try {
            let messageType = 'text';
            let attachment = null;

            // Upload file if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                toast.loading('Uploading file...');
                const uploadResponse = await chatAPI.uploadFile(formData);
                toast.dismiss();

                if (uploadResponse.data.success) {
                    attachment = uploadResponse.data.file;
                    messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
                    toast.success('File uploaded successfully');
                } else {
                    throw new Error('File upload failed');
                }
            }

            // Send message via socket
            const messageContent = newMessage.trim() || (attachment ? attachment.filename : '');

            socket.emit('message:send', {
                chatId,
                content: messageContent,
                type: messageType,
                attachment: attachment
            });

            // Clear inputs
            setNewMessage('');
            handleRemoveFile();

            // Stop typing indicator
            socket.emit('typing:stop', { chatId });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

        } catch (error) {
            console.error('Error sending message with file:', error);
            toast.error('Failed to send message');
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
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={getImageUrl(pharmacyImage)} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
                                {pharmacyName?.charAt(0) || 'P'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <DialogTitle className="flex items-center justify-between text-xl">
                                <div className="flex items-center space-x-2">
                                    <MessageCircle className="h-5 w-5 text-purple-600" />
                                    <span>{pharmacyName || 'Pharmacy Chat'}</span>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
                                                        {/* Image Attachment */}
                                                        {message.type === 'image' && message.attachment?.url && (
                                                            <div className="mb-2">
                                                                <img
                                                                    src={`http://localhost:5000${message.attachment.url}`}
                                                                    alt={message.attachment.filename}
                                                                    className="max-w-full max-h-64 rounded cursor-pointer"
                                                                    onClick={() => window.open(`http://localhost:5000${message.attachment.url}`, '_blank')}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* File Attachment */}
                                                        {message.type === 'file' && message.attachment?.url && (
                                                            <a
                                                                href={`http://localhost:5000${message.attachment.url}`}
                                                                download={message.attachment.filename}
                                                                className={`flex items-center space-x-2 mb-2 p-2 rounded ${isOwnMessage ? 'bg-blue-700' : 'bg-gray-200'
                                                                    }`}
                                                            >
                                                                <FileText className="h-5 w-5" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{message.attachment.filename}</p>
                                                                    <p className="text-xs opacity-75">{(message.attachment.size / 1024).toFixed(2)} KB</p>
                                                                </div>
                                                            </a>
                                                        )}

                                                        {/* Audio Attachment */}
                                                        {message.type === 'audio' && message.attachment?.url && (
                                                            <div className="flex items-center gap-2 min-w-[200px] mb-2">
                                                                <audio controls src={`http://localhost:5000${message.attachment.url}`} className="h-8 w-full" />
                                                            </div>
                                                        )}

                                                        {/* Text Content */}
                                                        {message.content && message.type !== 'audio' && (
                                                            <p className="text-sm break-words">{message.content}</p>
                                                        )}
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
                            {audioBlob ? (
                                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg flex-1">
                                    <Button variant="ghost" size="icon" onClick={() => setAudioBlob(null)} className="text-red-500">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                    <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1 h-8" />
                                    <Button onClick={handleSendAudio} className="bg-purple-600 hover:bg-purple-700">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
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
                                        disabled={!connected || isRecording}
                                        className="text-gray-500 hover:text-purple-600"
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
                                                placeholder="Type your message..."
                                                value={newMessage}
                                                onChange={handleTyping}
                                                onKeyPress={handleKeyPress}
                                                disabled={!connected}
                                                className="flex-1 bg-white"
                                            />
                                            {newMessage.trim() || selectedFile ? (
                                                <Button
                                                    onClick={selectedFile ? handleSendWithFile : handleSendMessage}
                                                    disabled={(!newMessage.trim() && !selectedFile) || !connected}
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                    size="icon"
                                                    type="button"
                                                >
                                                    <Send className="h-4 w-4" />
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
                                </>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
