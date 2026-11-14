import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    service: 'cstad-devops-frontend',
    timestamp: new Date().toISOString(),
  });
}

