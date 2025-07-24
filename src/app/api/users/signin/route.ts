import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    // In production, compare hashed passwords!
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 });
    console.log(err)
  }
} 