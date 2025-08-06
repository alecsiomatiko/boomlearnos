import { NextResponse } from 'next/server';
import { getDiagnosticModules } from '@/lib/server/mysql';

export async function GET() {
  try {
    const modules = await getDiagnosticModules();
    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching diagnostic modules:', error);
    return NextResponse.json(
      { error: 'Error fetching diagnostic modules' },
      { status: 500 }
    );
  }
}