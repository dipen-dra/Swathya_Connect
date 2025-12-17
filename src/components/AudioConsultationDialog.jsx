import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Phone, PhoneOff, Clock, Loader2, Signal } from 'lucide-react';
import { toast } from 'sonner';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { consultationChatAPI } from '@/services/api';

export default function AudioConsultationDialog({ open, onOpenChange, consultationId, userRole, otherUser }) {
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
    const [connectionQuality, setConnectionQuality] = useState('good');

    const clientRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const agoraDataRef = useRef(null);

    // Initialize Agora client
    useEffect(() => {
        if (open) {
            clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

            // Listen for remote user events
            clientRef.current.on('user-published', async (user, mediaType) => {
                await clientRef.current.subscribe(user, mediaType);
                if (mediaType === 'audio') {
                    user.audioTrack.play();
                    setRemoteUserJoined(true);
                    toast.success(`${otherUser?.name || 'Other user'} joined the call`);
                }
            });

            clientRef.current.on('user-unpublished', (user) => {
                setRemoteUserJoined(false);
                toast.info(`${otherUser?.name || 'Other user'} left the call`);
            });

            clientRef.current.on('network-quality', (stats) => {
                if (stats.uplinkNetworkQuality >= 4 || stats.downlinkNetworkQuality >= 4) {
                    setConnectionQuality('poor');
                } else if (stats.uplinkNetworkQuality >= 2 || stats.downlinkNetworkQuality >= 2) {
                    setConnectionQuality('moderate');
                } else {
                    setConnectionQuality('good');
                }
            });
        }

        return () => {
            handleLeaveCall();
        };
    }, [open]);

    // 30-minute countdown timer
    useEffect(() => {
        if (!joined) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;

                // Warning at 10 minutes
                if (newTime === 600) {
                    toast.warning('⏰ 10 minutes remaining in consultation', {
                        duration: 5000,
                    });
                }

                // Auto-end at 0
                if (newTime <= 0) {
                    handleEndCall();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [joined]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleJoinCall = async () => {
        try {
            setLoading(true);

            // Get Agora token from backend
            const response = await consultationChatAPI.generateAgoraToken(consultationId);

            if (response.data.success) {
                const { token, channelName, uid, appId } = response.data.data;
                agoraDataRef.current = { token, channelName, uid, appId };

                // Join channel
                await clientRef.current.join(appId, channelName, token, uid);

                // Create and publish local audio track
                localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
                await clientRef.current.publish([localAudioTrackRef.current]);

                setJoined(true);
                toast.success('Joined audio call successfully');
            }
        } catch (error) {
            console.error('Error joining call:', error);
            toast.error(error.response?.data?.message || 'Failed to join call');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMute = async () => {
        if (localAudioTrackRef.current) {
            await localAudioTrackRef.current.setEnabled(muted);
            setMuted(!muted);
            toast.info(muted ? 'Microphone unmuted' : 'Microphone muted');
        }
    };

    const handleLeaveCall = async () => {
        try {
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
            }

            if (clientRef.current) {
                await clientRef.current.leave();
            }

            setJoined(false);
            setRemoteUserJoined(false);
            setMuted(false);
        } catch (error) {
            console.error('Error leaving call:', error);
        }
    };

    const handleEndCall = async () => {
        await handleLeaveCall();
        toast.success('Call ended');
        onOpenChange(false);
    };

    const getQualityColor = () => {
        switch (connectionQuality) {
            case 'good': return 'text-green-600';
            case 'moderate': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Audio Consultation</span>
                        {joined && (
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
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-8">
                    {/* Other User Avatar */}
                    <div className="relative">
                        {otherUser?.image ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${otherUser.image}`}
                                alt={otherUser?.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                {otherUser?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        {remoteUserJoined && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {otherUser?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                            {userRole === 'doctor' ? 'Patient' : 'Doctor'}
                        </p>
                        {joined && (
                            <div className={`flex items-center justify-center space-x-1 mt-2 ${getQualityColor()}`}>
                                <Signal className="h-4 w-4" />
                                <span className="text-xs capitalize">{connectionQuality} connection</span>
                            </div>
                        )}
                    </div>

                    {/* Call Status */}
                    {!joined && (
                        <p className="text-sm text-gray-600">
                            {loading ? 'Connecting...' : 'Ready to start call'}
                        </p>
                    )}
                    {joined && !remoteUserJoined && (
                        <p className="text-sm text-gray-600 animate-pulse">
                            Waiting for {userRole === 'doctor' ? 'patient' : 'doctor'} to join...
                        </p>
                    )}
                    {joined && remoteUserJoined && (
                        <p className="text-sm text-green-600 font-medium">
                            Call in progress
                        </p>
                    )}

                    {/* Call Controls */}
                    <div className="flex items-center space-x-4">
                        {!joined ? (
                            <Button
                                onClick={handleJoinCall}
                                disabled={loading}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 rounded-full shadow-lg"
                            >
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <Phone className="h-6 w-6 mr-2" />
                                        Join Call
                                    </>
                                )}
                            </Button>
                        ) : (
                            <>
                                {/* Mute Button */}
                                <Button
                                    onClick={handleToggleMute}
                                    variant="outline"
                                    className={`rounded-full p-6 ${muted
                                        ? 'bg-red-50 border-red-300 hover:bg-red-100'
                                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {muted ? (
                                        <MicOff className="h-6 w-6 text-red-600" />
                                    ) : (
                                        <Mic className="h-6 w-6 text-gray-700" />
                                    )}
                                </Button>

                                {/* End Call Button */}
                                <Button
                                    onClick={handleEndCall}
                                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-6 rounded-full shadow-lg"
                                >
                                    <PhoneOff className="h-6 w-6 mr-2" />
                                    End Call
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
