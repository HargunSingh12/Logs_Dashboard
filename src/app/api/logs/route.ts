import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGS_PATH = path.join(process.cwd(), 'src/app/public/parsed_logs.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(LOGS_PATH, 'utf-8');
    const logs = JSON.parse(fileContents);
    return NextResponse.json(logs);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { logs } = await request.json();
    if (!Array.isArray(logs)) {
      return NextResponse.json({ error: 'Payload must be a JSON array of logs.' }, { status: 400 });
    }
    fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    return NextResponse.json({ imported: logs.length });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to import logs.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    fs.writeFileSync(LOGS_PATH, JSON.stringify([], null, 2), 'utf-8');
    return NextResponse.json({ cleared: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear logs.' }, { status: 500 });
  }
} 