import { sql } from "@/lib/mysql"
import type { User, AuthUser, RegisterData } from "@/types/user"
import bcrypt from 'bcryptjs'

// Fallback users for development
const FALLBACK_USERS: AuthUser[] = [
  {
    id: "1",
    email: "admin@kalabasboom.com",
    name: "Administrador",
    role: "admin",
    level: "Empire Master",
    points: 10000,
    badges: [
      {
        id: "first_login",
        name: "Primer Inicio",
        description: "Has iniciado sesión por primera vez",
        icon: "🎉",
        unlocked: true,
      },
    ],
  },
]

export async function ensureUsersTableExists(): Promise<boolean> {
  try {
    await sql`SELECT 1 FROM users LIMIT 1`
    return true
  } catch (error) {
    console.warn("Database table check failed:", error)
    return false
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    // First try database
    const tableExists = await ensureUsersTableExists()

    if (tableExists) {
      const users = await sql`
        SELECT * FROM users WHERE email = ${email}
      `

      if (users.length > 0) {
        const user = users[0]
        // In production, verify password hash
        // const isValidPassword = await bcrypt.compare(password, user.password_hash)
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          points: user.points,
          badges: user.badges || [],
        }
      }
    }

    // Fallback to local authentication
    const user = FALLBACK_USERS.find((u) => u.email === email)
    if (user && (password === "Alecs.com2006" || password === "password123" || password === "test")) {
      return user
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function registerUser(userData: RegisterData & { phone?: string; city?: string; businessType?: string }): Promise<AuthUser | null> {
  try {
    const tableExists = await ensureUsersTableExists()

    if (tableExists) {
      // Hash password in production
      // const passwordHash = await bcrypt.hash(userData.password, 10)
      const passwordHash = "hashed_password" // Placeholder for development

      await sql`
        INSERT INTO users (
          email,
          password_hash,
          name,
          phone,
          city,
          business_type,
          role,
          level,
          points,
          gems,
          badges
        ) VALUES (
          ${userData.email},
          ${passwordHash},
          ${userData.name},
          ${userData.phone || ''},
          ${userData.city || ''},
          ${userData.businessType || ''},
          'user',
          'Novice Explorer',
          0,
          0,
          JSON_ARRAY()
        )
      `

      const inserted = await sql`SELECT * FROM users WHERE id = LAST_INSERT_ID()`

      if (inserted.length > 0) {
        const user = inserted[0]
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          points: user.points,
          badges: user.badges || [],
        }
      }
    }

    // Fallback to local storage
    const newUser: AuthUser = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: "user",
      level: "Novice Explorer",
      points: 0,
      badges: [
        {
          id: "first_login",
          name: "Primer Inicio",
          description: "Has iniciado sesión por primera vez",
          icon: "🎉",
          unlocked: true,
        },
      ],
    }

    return newUser
  } catch (error) {
    console.error("Error registering user:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const tableExists = await ensureUsersTableExists()

    if (tableExists) {
      const users = await sql`
        SELECT * FROM users WHERE id = ${id}
      `

      if (users.length > 0) {
        return users[0] as User
      }
    }

    // Fallback
    const user = FALLBACK_USERS.find((u) => u.id === id)
    return user as User | null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
