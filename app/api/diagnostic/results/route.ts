import { NextResponse } from 'next/server';
import { calculateModuleScore } from '@/lib/server/mysql';

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

    const results = await calculateModuleScore(userId, moduleId);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error calculating module score:', error);
    return NextResponse.json(
      { error: 'Error calculating module score' },
      { status: 500 }
    );
  }
}