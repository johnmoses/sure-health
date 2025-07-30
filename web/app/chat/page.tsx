'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Video, Send, Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Users, Plus, Hash, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../auth-store';
import { chatApi } from '../api';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  role: 'patient' | 'clinician' | 'bot' | 'admin';
  timestamp: string;
  is_ai?: boolean;
}

interface TelemedSession {
  id: string;
  room_id: string;
  session_url: string;
  status: 'pending' | 'active' | 'completed';
  start_time: string;
}

interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
  participant_count?: number;
}

type ViewMode = 'rooms' | 'chat';

export default function ChatPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('rooms');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [telemedSession, setTelemedSession] = useState<TelemedSession | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await chatApi.getRooms();
        setRooms(response.data || []);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const loadRoomMessages = async (room: ChatRoom) => {
    try {
      const response = await chatApi.getRoomMessages(room.id);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch room messages:', error);
    }
  };

  const handleJoinRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setViewMode('chat');
    loadRoomMessages(room);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const response = await chatApi.createRoom({ name: newRoomName });
      const newRoom = response.data;
      setRooms([newRoom, ...rooms]);
      setNewRoomName('');
      setShowCreateRoom(false);
      handleJoinRoom(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleBackToRooms = () => {
    setViewMode('rooms');
    setSelectedRoom(null);
    setMessages([]);
    setIsVideoMode(false);
    endVideoCall();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !selectedRoom) return;

    setLoading(true);
    try {
      const response = await chatApi.sendRoomMessage(selectedRoom.id, {
        content: newMessage,
        role: user?.role === 'DOCTOR' ? 'clinician' : 'patient'
      });
      
      setMessages(response.data.conversation || []);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async () => {
    if (!selectedRoom) return;
    
    setLoading(true);
    try {
      const response = await chatApi.startTelemed(selectedRoom.id, {});
      const session = response.data;
      
      setTelemedSession(session);
      setIsVideoMode(true);
      setIsCallActive(true);
      
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }
    } catch (error) {
      console.error('Failed to start video call:', error);
    } finally {
      setLoading(false);
    }
  };

  const endVideoCall = async () => {
    if (telemedSession) {
      try {
        await chatApi.endTelemed(telemedSession.id);
      } catch (error) {
        console.error('Failed to end telemedicine session:', error);
      }
    }
    
    setIsCallActive(false);
    setIsVideoMode(false);
    setTelemedSession(null);
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
    }
  };

  if (!hydrated) {
    return <div className="p-6">Loading chat...</div>;
  }

  // Room listing view
  if (viewMode === 'rooms') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Chat Rooms</h1>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <Hash className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{room.participant_count} participants</span>
                  </div>
                  <span>{new Date(room.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Room</h3>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter room name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToRooms}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{selectedRoom?.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">{selectedRoom?.participant_count} participants</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVideoMode(!isVideoMode)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !isVideoMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-1 inline" />
              Chat
            </button>
            <button
              onClick={() => setIsVideoMode(!isVideoMode)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isVideoMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video className="h-4 w-4 mr-1 inline" />
              Video
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className={`${isVideoMode ? 'w-1/3' : 'w-full'} flex flex-col bg-white border-r border-gray-200`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : message.is_ai
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    <div className={`font-medium mb-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.is_ai ? 'AI Assistant' : 
                       message.role === 'clinician' ? 'Doctor' : 
                       message.role === 'patient' ? 'Patient' : 'User'}
                    </div>
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Video Panel */}
        {isVideoMode && (
          <div className="flex-1 bg-gray-900 flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative">
              {isCallActive ? (
                <div className="h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Remote video placeholder */}
                  <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 border-white">
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Waiting for doctor...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-medium mb-2">Ready for Video Call</h3>
                    <p className="text-gray-400 mb-6">Start a video consultation with your healthcare provider</p>
                    <button
                      onClick={startVideoCall}
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Starting...' : 'Start Video Call'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            {isCallActive && (
              <div className="bg-gray-800 p-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full ${
                      isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full ${
                      isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                  >
                    {isCameraOff ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={endVideoCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}