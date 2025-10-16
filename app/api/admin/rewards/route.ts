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

    const rewards = await executeQuery(
      `SELECT 
        id, title, description, cost, category, rarity, icon, 
        stock_limit, claimed_count, is_available, 
        created_at, updated_at 
      FROM rewards 
      WHERE organization_id = ? 
      ORDER BY created_at DESC`,
      [organizationId]
    ) as any[];

    return NextResponse.json(Array.isArray(rewards) ? rewards : []);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Error al cargar recompensas' }, { status: 500 });
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
    const { title, description, cost, category, rarity, icon, is_available, stock_limit } = body;

    // Validaciones
    if (!title || !description || cost == null || cost < 0) {
      return NextResponse.json(
        { success: false, error: 'Datos requeridos faltantes o inválidos' },
        { status: 400 }
      );
    }

    const result: any = await executeQuery(
      `INSERT INTO rewards 
        (organization_id, title, description, cost, category, rarity, icon, stock_limit, claimed_count, is_available, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
      [
        organizationId, 
        title, 
        description, 
        cost, 
        category || 'General',
        rarity || 'common',
        icon || 'Gift',
        stock_limit !== null && stock_limit !== undefined ? stock_limit : -1,
        is_available !== false ? 1 : 0
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Recompensa creada exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear recompensa' },
      { status: 500 }
    );
  }
}