import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    
    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const departments = await executeQuery(
      `SELECT 
        d.*,
        COUNT(DISTINCT u.id) as user_count
      FROM organization_departments d
      LEFT JOIN users u ON u.department_id = d.id AND u.organization_id = d.organization_id
      WHERE d.organization_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC`,
      [organizationId]
    ) as any[];

    return NextResponse.json(Array.isArray(departments) ? departments : []);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Error al cargar departamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    
    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado: falta organization_id' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, active } = body;

    // Validaciones
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      );
    }

    const result: any = await executeQuery(
      `INSERT INTO organization_departments 
        (organization_id, name, description, color, active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        organizationId, 
        name, 
        description, 
        color || '#3B82F6',
        active !== false ? 1 : 0
      ]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Departamento creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear departamento' },
      { status: 500 }
    );
  }
}