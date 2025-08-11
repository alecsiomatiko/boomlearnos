import { NextResponse } from 'next/server';
import { getUserProgress } from '@/lib/server/diagnostic-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and Module ID are required' },
        { status: 400 }
      );
    }

    const progress = await getUserProgress(userId, moduleId);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching diagnostic progress:', error);
    return NextResponse.json(
      { error: 'Error fetching diagnostic progress' },
      { status: 500 }
    );
  }
}