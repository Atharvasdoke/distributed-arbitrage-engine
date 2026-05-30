"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Registration failed. Email might already exist.");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-navy">
      <div className="w-full max-w-md rounded-4xl bg-slate p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-navy">
          Create ID
        </h2>
        {error && (
          <div className="mb-4 rounded-md bg-alert/20 p-3 text-sm text-alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-emerald/20 p-3 text-sm text-emerald">
            Registration successful! Redirecting to login...
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/70">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-gray-300 p-2 focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy/70">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-md border border-gray-300 p-2 focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald py-2 font-semibold text-white transition hover:bg-emerald/90"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-emerald hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
