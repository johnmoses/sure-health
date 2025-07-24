'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createRoom, listRooms } from '@/xlib/api';
import { ChatRoom } from '@/xlib/types';

export default function ChatRoomsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await listRooms(token);
        setRooms(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) fetchRooms();
  }, [token]);

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    try {
      const newRoom = await createRoom(roomName, token);
      setRooms([...rooms, newRoom]);
      setRoomName('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl mb-4">Chat Rooms</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleCreateRoom} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border p-2 flex-grow rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>
      <ul>
        {rooms.map((r) => (
          <li key={r.id} className="mb-2">
            <Link href={`/chat/rooms/${r.id}`} className="text-blue-600 hover:underline">{r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
