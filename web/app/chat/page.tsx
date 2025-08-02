'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../xlib/auth';
import api from '../../xlib/api';
import { MessageCircle, Send, Bot, User, Plus } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  role: string;
  sender_id: number;
  timestamp: string;
}

interface ChatRoom {
  id: number;
  name: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const [roomsRes, messagesRes] = await Promise.allSettled([
          api.get('/chat/rooms'),
          api.get('/chat/messages')
        ]);

        if (roomsRes.status === 'fulfilled') {
          setChatRooms(roomsRes.value.data);
          if (roomsRes.value.data.length > 0) {
            setSelectedRoom(roomsRes.value.data[0].id);
          }
        }
        if (messagesRes.status === 'fulfilled') {
          setMessages(messagesRes.value.data);
        }
      } catch (error) {
        console.error('Failed to fetch chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChatData();
    }
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await api.post('/chat/messages', {
        room_id: selectedRoom,
        content: newMessage,
        role: 'user'
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => 
    selectedRoom ? msg.room_id === selectedRoom : true
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center">
            <MessageCircle className="h-10 w-10 mr-3 text-emerald-600" />
            Healthcare Chat
          </h1>
          <p className="text-gray-600">Secure messaging and AI-powered healthcare assistance</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Chat Rooms</h2>
                <button className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-200 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRoom === room.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">{room.name}</span>
                    </div>
                  </button>
                ))}
                
                {/* AI Assistant Room */}
                <button
                  onClick={() => setSelectedRoom(0)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRoom === 0
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  {selectedRoom === 0 ? (
                    <>
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg mr-3">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">AI Healthcare Assistant</h3>
                        <p className="text-sm text-gray-600">Get instant medical information and guidance</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg mr-3">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {chatRooms.find(room => room.id === selectedRoom)?.name || 'Select a room'}
                        </h3>
                        <p className="text-sm text-gray-600">Secure healthcare communication</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedRoom === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Healthcare Assistant</h3>
                      <p className="text-gray-500 mb-4">Ask me about symptoms, medications, or general health questions</p>
                      <div className="grid gap-2 max-w-md mx-auto">
                        <button className="bg-purple-50 text-purple-700 p-3 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                          "What are the side effects of aspirin?"
                        </button>
                        <button className="bg-purple-50 text-purple-700 p-3 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                          "How to manage high blood pressure?"
                        </button>
                        <button className="bg-purple-50 text-purple-700 p-3 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                          "When should I see a doctor for chest pain?"
                        </button>
                      </div>
                    </div>
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="flex items-center mb-1">
                            {message.sender_id === user?.id ? (
                              <User className="h-4 w-4 mr-1" />
                            ) : (
                              <Bot className="h-4 w-4 mr-1" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.role}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Start a conversation to begin secure healthcare communication</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedRoom === 0 ? "Ask the AI assistant..." : "Type your message..."}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}