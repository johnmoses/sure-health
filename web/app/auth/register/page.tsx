'use client';

import { useState } from 'react';
import { registerUser } from '@/xlib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'clinician' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await registerUser(form);
      setSuccess(true);
      setForm({ username: '', email: '', password: '', role: 'clinician' });
    } catch(err: any) {
      setError(err.message);
    }
  }

  if (success) return <p>User registered successfully! You can now login.</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Register</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required className="mb-2 w-full p-2 border" />
      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" className="mb-2 w-full p-2 border" />
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required className="mb-2 w-full p-2 border" />
      <select name="role" value={form.role} onChange={handleChange} className="mb-4 w-full p-2 border">
        <option value="clinician">Clinician</option>
        <option value="patient">Patient</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
    </form>
  );
}
