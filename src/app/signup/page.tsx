"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', form);
      toast.success('Account created successfully!');
      setForm({ name: '', email: '', password: '' });
      router.push('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Signup failed');
      } else {
        toast.error('Signup failed');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900/90 p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">SignUp</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="w-full mb-3 p-2 bg-gray-800 text-blue-100 border-b-2 border-blue-700 focus:outline-none" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email" required className="w-full mb-3 p-2 bg-gray-800 text-blue-100 border-b-2 border-blue-700 focus:outline-none" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className="w-full mb-6 p-2 bg-gray-800 text-blue-100 border-b-2 border-blue-700 focus:outline-none" />
        <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-600 transition">Create Account</button>
        <div className="mt-6 text-center">
          <span className="text-blue-200">Already have an account? </span>
          <button type="button" className="text-blue-400 underline hover:text-blue-300" onClick={() => router.push('/signin')}>Sign in</button>
        </div>
      </form>
    </div>
  );
}