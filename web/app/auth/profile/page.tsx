import React from 'react';
import { cookies } from 'next/headers';
import { getProfile } from '@/xlib/api';
import { User } from '@/xlib/types';

async function ProfilePage() {
  // Read token from cookie (adjust if you saved token differently)
  const token = (await cookies()).get('access_token')?.value;

  if (!token) return <p>You are not logged in.</p>;

  let user: User | null = null;
  try {
    user = await getProfile(token);
  } catch {
    return <p>Failed to fetch profile. Please login again.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Profile</h1>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}

export default ProfilePage;
