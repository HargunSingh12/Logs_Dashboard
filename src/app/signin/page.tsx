"use client"
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Signin() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/signin', form);
      router.push("/dashboard")
      toast.success('Signed in successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Signin failed');
      } else {
        toast.error('Signin failed');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900/90 p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Sign In</h2>
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email" required className="w-full mb-3 p-2 bg-gray-800 text-blue-100 border-b-2 border-blue-700 focus:outline-none" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className="w-full mb-6 p-2 bg-gray-800 text-blue-100 border-b-2 border-blue-700 focus:outline-none" />
        <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-600 transition">Sign In</button>
      </form>
    </div>
  );
}