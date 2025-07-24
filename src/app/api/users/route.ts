import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    // In production, hash the password before saving!
    const user = await User.create(data);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
    console.log(err)
  }
}

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
    console.log(err)
  }
} 