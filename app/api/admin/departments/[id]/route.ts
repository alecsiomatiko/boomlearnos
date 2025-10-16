import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { requireAdmin } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    const body = await request.json()
    const { name, description, color, active } = body
    const { id } = params

    const orgId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!orgId) return NextResponse.json({ error: 'No autorizado: falta organization_id' }, { status: 401 });

    await executeQuery(
      `UPDATE organization_departments SET name = ?, description = ?, color = ?, active = ?, updated_at = NOW() WHERE id = ? AND organization_id = ?`,
      [name, description, color, active ? 1 : 0, id, orgId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Error updating department' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    const orgId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!orgId) return NextResponse.json({ error: 'No autorizado: falta organization_id' }, { status: 401 });

    // Delete invitations for this department first (scoped)
    await executeQuery('DELETE FROM organization_invitations WHERE department_id = ? AND organization_id = ?', [id, orgId])

    // Update users to remove department assignment (scoped to org)
    await executeQuery('UPDATE users SET department_id = NULL WHERE department_id = ? AND organization_id = ?', [id, orgId])

    // Delete department
    await executeQuery('DELETE FROM organization_departments WHERE id = ? AND organization_id = ?', [id, orgId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Error deleting department' },
      { status: 500 }
    )
  }
}