import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [UPLOAD] Iniciando subida de imagen de perfil...')
    
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ninguna imagen' },
        { status: 400 }
      )
    }

    console.log('📸 [UPLOAD] Imagen recibida:', image.name, image.size, 'bytes')

    // Validar tipo de archivo
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'La imagen debe ser menor a 5MB' },
        { status: 400 }
      )
    }

    // Obtener la extensión del archivo
    const extension = image.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return NextResponse.json(
        { success: false, error: 'Formato de imagen no soportado' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const filename = `profile-${crypto.randomUUID()}.${extension}`
    
    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    await mkdir(uploadDir, { recursive: true })

    // Guardar archivo
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    
    await writeFile(filepath, buffer)

    // Retornar URL pública
    const imageUrl = `/uploads/profiles/${filename}`

    console.log('✅ [UPLOAD] Imagen subida exitosamente:', imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Imagen subida correctamente'
    })

  } catch (error) {
    console.error('❌ [UPLOAD] Error subiendo imagen:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
