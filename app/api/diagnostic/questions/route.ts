import { NextResponse } from 'next/server';
import { getModuleQuestions } from '@/lib/server/mysql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    const questions = await getModuleQuestions(moduleId);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching module questions:', error);
    return NextResponse.json(
      { error: 'Error fetching module questions' },
      { status: 500 }
    );
  }
}