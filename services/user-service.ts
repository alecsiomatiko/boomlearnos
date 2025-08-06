import type { AuthUser, RegisterData } from "@/types/user"
import type { AuthUser, RegisterData } from "@/types/user"

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      return data.user
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function registerUser(userData: RegisterData): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (data.success) {
      return data.user
    }

    return null
  } catch (error) {
    console.error("Error registering user:", error)
    return null
  }
}
