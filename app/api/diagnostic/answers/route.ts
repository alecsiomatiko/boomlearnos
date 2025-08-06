import { NextResponse } from 'next/server';
import { saveUserAnswer } from '@/lib/server/mysql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, questionId, answers, score } = body;

    if (!userId || !questionId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await saveUserAnswer(userId, questionId, answers, score);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving diagnostic answer:', error);
    return NextResponse.json(
      { error: 'Error saving diagnostic answer' },
      { status: 500 }
    );
  }
}