import { NextResponse } from 'next/server';
import { migrateDiagnosticData } from '@/scripts/migrate-diagnostic-data';

export async function POST() {
  try {
    await migrateDiagnosticData();
    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic data migrated successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}