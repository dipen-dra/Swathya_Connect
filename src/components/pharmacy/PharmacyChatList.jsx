import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { chatAPI } from '@/services/api';
import { useSocket } from '@/contexts/SocketContext';
import { PharmacyChat } from '@/components/ui/pharmacy-chat';
import { toast } from 'sonner';

export function PharmacyChatList() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatDialogOpen, setChatDialogOpen] = useState(false);
    const { socket, connected } = useSocket();

    // Fetch chats on mount
    useEffect(() => {
        fetchChats();
    }, []);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleChatUpdated = (data) => {
            console.log('💬 Chat updated:', data);
            fetchChats(); // Refresh chat list
        };

        const handleMessageReceived = (message) => {
            console.log('📩 New message received:', message);
            fetchChats(); // Refresh to update last message
        };

        socket.on('chat:updated', handleChatUpdated);
        socket.on('message:received', handleMessageReceived);

        return () => {
            socket.off('chat:updated', handleChatUpdated);
            socket.off('message:received', handleMessageReceived);
        };
    }, [socket]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getChats();
            console.log('📨 Chats fetched:', response.data.chats);
            setChats(response.data.chats || []);
        } catch (error) {
            console.error('❌ Error fetching chats:', error);
            toast.error('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (chat) => {
        console.log('💬 Opening chat:', chat);
        setSelectedChat(chat);
        setChatDialogOpen(true);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const formatTime = (date) => {
        if (!date) return '';
        const messageDate = new Date(date);
        const now = new Date();
        const diffInHours = (now - messageDate) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return messageDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const filteredChats = chats.filter(chat => {
        const patientName = chat.patient?.name || '';
        return patientName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <>
            <Card className="border-gray-100">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5 text-purple-600" />
                            <span>Patient Conversations</span>
                        </div>
                        {connected && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Connected
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-100"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">
                                {searchQuery ? 'No chats found' : 'No patient conversations yet'}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Patients will appear here when they message you
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-2">
                                {filteredChats.map((chat) => {
                                    const patient = chat.patient; // Backend returns 'patient' object
                                    const unreadCount = chat.unreadCount || 0;

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => handleChatClick(chat)}
                                            className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={getImageUrl(patient?.image)} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                                    {patient?.name?.charAt(0) || 'P'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {patient?.name || 'Unknown Patient'}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                        {formatTime(chat.lastMessageAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {chat.lastMessage || 'No messages yet'}
                                                    </p>
                                                    {unreadCount > 0 && (
                                                        <Badge className="bg-purple-600 text-white ml-2 flex-shrink-0">
                                                            {unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Chat Dialog */}
            {selectedChat && (
                <PharmacyChat
                    open={chatDialogOpen}
                    onOpenChange={(open) => {
                        setChatDialogOpen(open);
                        if (!open) {
                            fetchChats(); // Refresh when closing
                        }
                    }}
                    chatId={selectedChat._id}
                    pharmacyId={selectedChat.patient?._id}
                    pharmacyName={selectedChat.patient?.name}
                    pharmacyImage={selectedChat.patient?.image}
                />
            )}
        </>
    );
}
