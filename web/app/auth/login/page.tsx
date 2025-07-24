'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../layout'; // Adjust path as necessary

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
    const url = `${API_BASE}/auth/login`;

    console.log('Sending login request to:', url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save tokens and user info as per your flow
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_id', data.user.id.toString());
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('user_role', data.user.role);

      setUser({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        required
        className="mb-2 w-full p-2 border rounded"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        required
        className="mb-4 w-full p-2 border rounded"
      />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Login
      </button>
    </form>
  );
}
