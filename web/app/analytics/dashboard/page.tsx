'use client';

import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { fetchAdvancedAnalytics } from "@/xlib/api";
import { AdvancedAnalytics } from "@/xlib/types";

export default function AdvancedDashboard() {
  const [data, setData] = useState<AdvancedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";

  useEffect(() => {
    if (!token) return;

    fetchAdvancedAnalytics(token)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [token]);

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!data) return <p className="p-4">Loading analytics...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Advanced Analytics Dashboard</h1>

      {/* 1. New Users Daily (Area Chart) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">New Users Per Day (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.new_users_daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* 2. Appointments Per Clinician (Bar Chart) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Top 5 Clinicians by Appointments</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.appointments_per_clinician}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="clinician_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 3. Prescriptions by Type (Bar Chart) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Top 5 Prescription Types</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.prescriptions_by_type}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 4. Chat Sessions Daily (Area Chart) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Chat Sessions Per Day (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.chat_sessions_daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#ff7300" fill="#ff7300" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* 5. Avg Video Session Duration */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Average Telemedicine Session Duration</h2>
        <p className="text-3xl font-bold">
          {Math.round(data.video_avg_session_duration_sec)} seconds
        </p>
      </section>

      {/* 6. Weekly Login Trend (Bar Chart) */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Weekly Login Trend (Last 8 Weeks)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.weekly_login_trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
