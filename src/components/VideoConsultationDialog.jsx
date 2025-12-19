import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Clock, Signal, Loader2, SwitchCamera } from 'lucide-react';
import { toast } from 'sonner';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { consultationChatAPI } from '@/services/api';

const VideoConsultationDialog = ({ open, onOpenChange, consultationId, userRole, otherUser }) => {
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
    const [connectionQuality, setConnectionQuality] = useState('good');
    const [loading, setLoading] = useState(false);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);

    const clientRef = useRef(null);
    const localVideoTrackRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteVideoTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);
    const localVideoContainerRef = useRef(null);
    const remoteVideoContainerRef = useRef(null);

    useEffect(() => {
        if (open) {
            initializeAgora();
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

                // Warning at 5 minutes
                if (newTime === 300) {
                    toast.warning('⏰ 5 minutes remaining in consultation', {
                        duration: 5000,
                    });
                }

                // Auto-complete consultation when timer hits 0
                if (newTime <= 0) {
                    handleAutoComplete();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [joined]);

    const initializeAgora = async () => {
        try {
            // Create Agora client
            const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            clientRef.current = client;

            // Listen for remote users
            client.on('user-published', async (user, mediaType) => {
                await client.subscribe(user, mediaType);

                if (mediaType === 'video') {
                    remoteVideoTrackRef.current = user.videoTrack;
                    setRemoteUserJoined(true);

                    // Play remote video after state update (wait for DOM)
                    setTimeout(() => {
                        if (remoteVideoContainerRef.current && user.videoTrack) {
                            user.videoTrack.play(remoteVideoContainerRef.current);
                        }
                    }, 100);

                    toast.success(`${otherUser?.name || 'Other user'} joined the call`);

                    // Always refresh timer when remote user joins/rejoins (ensures sync)
                    try {
                        // Start timer if not started (backend prevents duplicate starts)
                        await consultationChatAPI.startCallTimer(consultationId);
                        // Refresh the timer from backend to stay in sync
                        const response = await consultationChatAPI.generateAgoraToken(consultationId);
                        if (response.data.success) {
                            setTimeRemaining(response.data.data.remainingSeconds);
                        }
                    } catch (error) {
                        console.error('Error syncing call timer:', error);
                    }
                }

                if (mediaType === 'audio') {
                    remoteAudioTrackRef.current = user.audioTrack;
                    user.audioTrack.play();
                }
            });

            client.on('user-unpublished', (user, mediaType) => {
                // When user mutes mic or turns off camera, this event fires
                // We just clear the ref - Agora handles the rest
                if (mediaType === 'video') {
                    remoteVideoTrackRef.current = null;
                }
                if (mediaType === 'audio') {
                    remoteAudioTrackRef.current = null;
                }
            });

            client.on('user-left', (user) => {
                setRemoteUserJoined(false);
                toast.info(`${otherUser?.name || 'User'} left the call`);
            });

            // Monitor connection quality
            client.on('network-quality', (quality) => {
                if (quality.uplinkNetworkQuality > 3 || quality.downlinkNetworkQuality > 3) {
                    setConnectionQuality('poor');
                } else if (quality.uplinkNetworkQuality > 2 || quality.downlinkNetworkQuality > 2) {
                    setConnectionQuality('fair');
                } else {
                    setConnectionQuality('good');
                }
            });
        } catch (error) {
            console.error('Error initializing Agora:', error);
            toast.error('Failed to initialize video call');
        }
    };

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
                const { token, channelName, uid, appId, remainingSeconds } = response.data.data;

                // Set timer from backend (persistent timer)
                setTimeRemaining(remainingSeconds);

                // Join channel
                await clientRef.current.join(appId, channelName, token, uid);

                // Create and publish local tracks
                // NOTE: Agora returns [audioTrack, videoTrack] from createMicrophoneAndCameraTracks!
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

                localVideoTrackRef.current = videoTrack;
                localAudioTrackRef.current = audioTrack;

                // Publish tracks first
                await clientRef.current.publish([videoTrack, audioTrack]);

                setJoined(true);

                // Play local video after state update (wait for DOM)
                setTimeout(() => {
                    if (localVideoContainerRef.current && videoTrack) {
                        videoTrack.play(localVideoContainerRef.current);
                    }
                }, 100);
                setLoading(false);

                toast.success('Joined video consultation');

                // If doctor joins, start the timer immediately (allows patient to join)
                if (userRole === 'doctor') {
                    try {
                        await consultationChatAPI.startCallTimer(consultationId);
                        console.log('✅ Call timer started by doctor');
                    } catch (error) {
                        console.error('Error starting call timer:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error joining call:', error);
            const errorMessage = error.response?.data?.message || 'Failed to join video call';
            toast.error(errorMessage);
            setLoading(false);

            // Close dialog if patient trying to join before doctor starts
            if (error.response?.status === 403) {
                setTimeout(() => onOpenChange(false), 2000);
            }
        }
    };

    const handleToggleMute = async () => {
        if (localAudioTrackRef.current) {
            const isCurrentlyEnabled = localAudioTrackRef.current.enabled;
            await localAudioTrackRef.current.setEnabled(!isCurrentlyEnabled);
            setMuted(isCurrentlyEnabled); // If was enabled (ON), now it's muted (OFF)
        }
    };

    const handleToggleCamera = async () => {
        if (localVideoTrackRef.current) {
            const isCurrentlyEnabled = localVideoTrackRef.current.enabled;
            await localVideoTrackRef.current.setEnabled(!isCurrentlyEnabled);
            setCameraOff(isCurrentlyEnabled); // If was enabled (ON), now it's off
        }
    };

    const handleLeaveCall = async () => {
        try {
            // Stop and close local tracks
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.stop();
                localVideoTrackRef.current.close();
            }
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current.close();
            }

            // Leave channel
            if (clientRef.current) {
                await clientRef.current.leave();
            }

            setJoined(false);
            setRemoteUserJoined(false);
        } catch (error) {
            console.error('Error leaving call:', error);
        }
    };

    const handleEndCall = async () => {
        // Just leave the call without marking as completed
        await handleLeaveCall();
        toast.info('Left video call');
        onOpenChange(false);
    };

    const handleAutoComplete = async () => {
        try {
            // Calculate call duration (full 30 minutes)
            const callDuration = 30;

            // Mark consultation as completed
            await consultationChatAPI.endConsultation(consultationId, {
                callDuration,
                notes: 'Video consultation completed - Full 30 minutes'
            });

            await handleLeaveCall();
            toast.success('Consultation completed - Full 30 minutes');
            onOpenChange(false);
        } catch (error) {
            console.error('Error completing consultation:', error);
            await handleLeaveCall();
            toast.error('Call ended but failed to update consultation status');
            onOpenChange(false);
        }
    };

    const getQualityColor = () => {
        switch (connectionQuality) {
            case 'good': return 'text-green-500';
            case 'fair': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 bg-gray-900 border-none">
                <DialogTitle className="sr-only">Video Consultation</DialogTitle>
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-semibold">
                                {otherUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="font-semibold">{otherUser?.name || 'User'}</h3>
                                <p className="text-sm text-gray-300">{otherUser?.specialty || 'Consultation'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Signal className={`h-4 w-4 ${getQualityColor()}`} />
                                <span className="text-sm capitalize">{connectionQuality}</span>
                            </div>
                            {joined && (
                                <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-mono text-sm">{formatTimer(timeRemaining)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Video Container */}
                <div className="relative w-full h-full bg-black">
                    {/* Remote Video (Full Screen) */}
                    <div
                        ref={remoteVideoContainerRef}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {!remoteUserJoined && (
                            <div className="text-center text-white">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                                <p className="text-lg">Waiting for {otherUser?.name || 'other user'} to join...</p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (Picture-in-Picture) */}
                    {joined && (
                        <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl">
                            <div
                                ref={localVideoContainerRef}
                                className="w-full h-full bg-gray-800"
                            />
                            {cameraOff && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <VideoOff className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center space-x-4">
                        {!joined ? (
                            <Button
                                onClick={handleJoinCall}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <Video className="h-5 w-5 mr-2" />
                                        Join Video Call
                                    </>
                                )}
                            </Button>
                        ) : (
                            <>
                                {/* Camera Toggle */}
                                <Button
                                    onClick={handleToggleCamera}
                                    className={`rounded-full w-14 h-14 ${cameraOff
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                        } text-white shadow-lg`}
                                >
                                    {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                                </Button>

                                {/* Microphone Toggle */}
                                <Button
                                    onClick={handleToggleMute}
                                    className={`rounded-full w-14 h-14 ${muted
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                        } text-white shadow-lg`}
                                >
                                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>

                                {/* End Call */}
                                <Button
                                    onClick={handleEndCall}
                                    className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoConsultationDialog;
