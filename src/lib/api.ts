const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export interface ApiErrorDetail {
  code: string
  message: string
  path?: (string | number)[]
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: ApiErrorDetail[],
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type")
  const isJson = contentType?.includes("application/json")
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    if (data?.success === false && data?.error) {
      throw new ApiError(
        response.status,
        data.error.code,
        data.error.message,
        data.error.details,
      )
    }
    throw new Error(`API error: ${response.status}`)
  }

  return data
}

export const api = {
  baseUrl: API_URL,

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return handleResponse<T>(response)
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    console.log(`[API] POST ${endpoint} payload:`, data)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<T>(response)
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    console.log(`[API] PUT ${endpoint} payload:`, data)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<T>(response)
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return handleResponse<T>(response)
  },
}
