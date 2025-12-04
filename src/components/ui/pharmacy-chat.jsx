import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, User, Bot } from 'lucide-react';

export function PharmacyChat({ open, onOpenChange }) {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hello! I\'m Dr. Sarah, your pharmacist. How can I help you with your medication needs today?',
            sender: 'pharmacist',
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const userMessage = {
                id: Date.now().toString(),
                text: newMessage,
                sender: 'user',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setNewMessage('');

            // Simulate pharmacist response
            setTimeout(() => {
                const pharmacistResponse = {
                    id: (Date.now() + 1).toString(),
                    text: getPharmacistResponse(newMessage),
                    sender: 'pharmacist',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, pharmacistResponse]);
            }, 1000);
        }
    };

    const getPharmacistResponse = (userMessage) => {
        const message = userMessage.toLowerCase();

        if (message.includes('side effect') || message.includes('reaction')) {
            return 'I understand your concern about side effects. Can you tell me which medication you\'re taking and what symptoms you\'re experiencing? This will help me provide better guidance.';
        }

        if (message.includes('dosage') || message.includes('dose')) {
            return 'For dosage questions, it\'s important to follow your doctor\'s prescription exactly. If you have concerns about your current dosage, I recommend consulting with your prescribing physician.';
        }

        if (message.includes('interaction') || message.includes('together')) {
            return 'Drug interactions are important to consider. Please list all medications, supplements, and vitamins you\'re currently taking so I can check for any potential interactions.';
        }

        if (message.includes('generic') || message.includes('brand')) {
            return 'Generic medications contain the same active ingredients as brand-name drugs and are equally effective. They\'re often more affordable. Would you like me to check if a generic version is available for your medication?';
        }

        return 'Thank you for your question. For specific medical advice, I recommend consulting with your doctor. However, I can help with general medication information, storage instructions, or direct you to appropriate resources.';
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <span>Pharmacy Chat</span>
                    </DialogTitle>
                    <DialogDescription>
                        Chat with our licensed pharmacist for medication guidance and support.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                    }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className={`${message.sender === 'user'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-green-100 text-green-600'
                                        }`}>
                                        {message.sender === 'user' ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex items-center space-x-2 pt-4 border-t">
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                <div className="text-xs text-gray-500 text-center mt-2">
                    This is a simulated chat for demonstration purposes.
                </div>
            </DialogContent>
        </Dialog>
    );
}
