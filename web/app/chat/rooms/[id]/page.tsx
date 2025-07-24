'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getRoomMessages, postMessage } from '@/xlib/api';
import { ChatMessage, PostMessagePayload, BotResponse } from '@/xlib/types';

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const pathname = usePathname();
  const roomId = pathname.split('/').pop();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      if (!roomId) return;
      try {
        const msgs = await getRoomMessages(Number(roomId), token);
        setMessages(msgs);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) loadMessages();
  }, [roomId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !roomId) return;
    setError(null);
    setIsSending(true);
    try {
      const payload: PostMessagePayload = { content: input.trim(), role };
      const response: BotResponse = await postMessage(Number(roomId), payload, token);
      setMessages(response.conversation);
      setInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-screen">
      <h1 className="text-2xl mb-4">Chat Room #{roomId}</h1>

      <div className="flex-grow overflow-y-auto border rounded p-4 mb-4 flex flex-col gap-4 bg-gray-50">
        {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-[75%] ${msg.role === 'bot' ? 'bg-yellow-100 self-start' : msg.role === role ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}
          >
            <div className="text-sm mb-1 text-gray-600">
              <strong>{msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}</strong> - {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="flex items-center gap-2">
        <select
          className="border p-2 rounded"
          value={role}
          onChange={e => setRole(e.target.value as 'patient' | 'clinician')}
          disabled={isSending}
        >
          <option value="patient">Patient</option>
          <option value="clinician">Clinician</option>
        </select>
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={isSending}
        />
        <button onClick={handleSend} disabled={isSending} className="bg-blue-600 text-white px-4 py-2 rounded">
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
