import { BACKEND_URL } from "./constants"

export type LoginRequest = {
    email: string
    password: string
}

export type RegisterRequest = {
    name: string
    email: string
    password: string
    role: string
}

export type AddUserRequest = {
    name: string
    email: string
    address?: string
    password: string
    role: string
}

export type AddStoreRequest = {
    name: string
    email: string
    address: string
    ownerId?: number
}

export type RatingRequest = {
    storeId: number
    value: number
}

export type LoginResponse = {
    token: string
    user?: {
        id: number
        email: string
        name: string
        role: string
    }
}

export type RegisterResponse = {
    message: string
    user?: {
        id: number
        email: string
        name: string
        role: string
    }
}

export type AddUserResponse = {
    message: string
    user: {
        id: number
        email: string
        name: string
        role: string
        address?: string
    }
}

export type AddStoreResponse = {
    message: string
    store: {
        id: number
        name: string
        email: string
        address: string
        ownerId?: number
    }
}

export type RatingResponse = {
    message: string
    rating: {
        id: number
        storeId: number
        userId: number
        value: number
    }
}

export type UserRating = {
    id: number
    storeId: number
    userId: number
    value: number
    createdAt?: string
    updatedAt?: string
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    console.log("[loginUser] POST /api/auth/login to backend", BACKEND_URL)
    console.log("[loginUser] payload:", JSON.stringify(data))

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    console.log("[loginUser] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[loginUser] error response:", errorText)
        throw new Error("Invalid email or password")
    }

    const result = await response.json()
    console.log("[loginUser] success response:", JSON.stringify(result))
    return result
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    console.log("[registerUser] POST /api/auth/register to backend", BACKEND_URL)
    console.log("[registerUser] payload:", JSON.stringify(data))

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    console.log("[registerUser] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[registerUser] error response:", errorText)
        throw new Error("Registration failed. Please try again.")
    }

    const result = await response.json()
    console.log("[registerUser] success response:", JSON.stringify(result))
    return result
}

export async function addUser(data: AddUserRequest, token: string): Promise<AddUserResponse> {
    console.log("[addUser] POST /api/users to backend", BACKEND_URL)
    console.log("[addUser] payload:", JSON.stringify({ ...data, password: "***" }))

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    console.log("[addUser] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[addUser] error response:", errorText)
        throw new Error("Failed to add user. Please try again.")
    }

    const result = await response.json()
    console.log("[addUser] success response:", JSON.stringify(result))
    return result
}

export async function addStore(data: AddStoreRequest, token: string): Promise<AddStoreResponse> {
    console.log("[addStore] POST /api/stores to backend", BACKEND_URL)
    console.log("[addStore] payload:", JSON.stringify(data))

    const response = await fetch(`${BACKEND_URL}/api/stores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    console.log("[addStore] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[addStore] error response:", errorText)
        throw new Error("Failed to add store. Please try again.")
    }

    const result = await response.json()
    console.log("[addStore] success response:", JSON.stringify(result))
    return result
}

export async function submitRating(data: RatingRequest, token: string): Promise<RatingResponse> {
    console.log("[submitRating] POST /api/ratings to backend", BACKEND_URL)
    console.log("[submitRating] payload:", JSON.stringify(data))

    const response = await fetch(`${BACKEND_URL}/api/ratings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    console.log("[submitRating] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[submitRating] error response:", errorText)
        throw new Error("Failed to submit rating. Please try again.")
    }

    const result = await response.json()
    console.log("[submitRating] success response:", JSON.stringify(result))
    return result
}

export async function getUserRatingForStore(storeId: string, token: string): Promise<UserRating | null> {
    console.log("[getUserRatingForStore] GET /api/ratings/store/" + storeId + "/me to backend", BACKEND_URL)

    const response = await fetch(`${BACKEND_URL}/api/ratings/store/${storeId}/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    console.log("[getUserRatingForStore] response status:", response.status)

    if (response.status === 404) {
        console.log("[getUserRatingForStore] no rating found for user")
        return null
    }

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getUserRatingForStore] error response:", errorText)
        throw new Error("Failed to fetch user rating")
    }

    const result = await response.json()
    console.log("[getUserRatingForStore] success response:", JSON.stringify(result))
    return result
}

export type ChangePasswordRequest = {
    currentPassword: string
    newPassword: string
}

export type ChangePasswordResponse = {
    message: string
}

export async function changePassword(data: ChangePasswordRequest, token: string): Promise<ChangePasswordResponse> {
    console.log("[changePassword] PUT /api/users/me/password to backend", BACKEND_URL)
    console.log("[changePassword] payload:", JSON.stringify({ newPassword: "***" }))

    const response = await fetch(`${BACKEND_URL}/api/users/me/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }),
    })

    console.log("[changePassword] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[changePassword] error response:", errorText)
        throw new Error("Failed to change password. Please check your current password.")
    }

    const result = await response.json()
    console.log("[changePassword] success response:", JSON.stringify(result))
    return result
}

export type User = {
    id: number
    name: string
    email: string
    address?: string
    role: string
    createdAt?: string
    rating?: number // For store owners
}

export type Store = {
    id: number
    name: string
    email: string
    address: string
    overallRating?: number // Updated to match API response
    ratingsCount?: number // Added to match API response
    rating?: number // Keep for backward compatibility
    ownerId?: number
    createdAt?: string
}

export type StoreType = Store

export async function getAllUsers(token: string): Promise<User[]> {
    console.log("[getAllUsers] GET /api/users to backend", BACKEND_URL)

    const response = await fetch(`${BACKEND_URL}/api/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    console.log("[getAllUsers] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getAllUsers] error response:", errorText)
        throw new Error("Failed to fetch users")
    }

    const result = await response.json()
    console.log("[getAllUsers] success response:", JSON.stringify(result))
    return result
}

export async function getAllStores(token?: string): Promise<Store[]> {
    console.log("[getAllStores] GET /api/stores to backend", BACKEND_URL)

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${BACKEND_URL}/api/stores`, {
        method: "GET",
        headers,
        cache: "no-store",
    })

    console.log("[getAllStores] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getAllStores] error response:", errorText)
        throw new Error("Failed to fetch stores")
    }

    const result = await response.json()
    console.log("[getAllStores] success response:", JSON.stringify(result))
    return result
}

export async function getUserById(userId: string, token: string): Promise<User> {
    console.log("[getUserById] GET /api/users/" + userId + " to backend", BACKEND_URL)

    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    console.log("[getUserById] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getUserById] error response:", errorText)
        throw new Error("Failed to fetch user details")
    }

    const result = await response.json()
    console.log("[getUserById] success response:", JSON.stringify(result))
    return result
}

export async function getStoreById(storeId: string, token?: string): Promise<Store> {
    console.log("[getStoreById] GET /api/stores/" + storeId + " to backend", BACKEND_URL)

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    // Add timestamp to prevent caching
    const timestamp = Date.now()
    const url = `${BACKEND_URL}/api/stores/${storeId}?t=${timestamp}`

    const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    })

    console.log("[getStoreById] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getStoreById] error response:", errorText)
        throw new Error("Failed to fetch store details")
    }

    const result = await response.json()
    console.log("[getStoreById] success response:", JSON.stringify(result))
    return result
}

export async function getStoreOwners(token: string): Promise<User[]> {
    console.log("[getStoreOwners] GET /api/users to backend for store owners", BACKEND_URL)

    const response = await fetch(`${BACKEND_URL}/api/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    console.log("[getStoreOwners] response status:", response.status)

    if (!response.ok) {
        const errorText = await response.text()
        console.log("[getStoreOwners] error response:", errorText)
        throw new Error("Failed to fetch store owners")
    }

    const result = await response.json()
    console.log("[getStoreOwners] success response:", JSON.stringify(result))

    // Filter for store owners and admins
    const storeOwners = result.filter(
        (user: User) => user.role === "STORE_OWNER" || user.role === "OWNER" || user.role === "ADMIN",
    )

    console.log("[getStoreOwners] filtered store owners:", storeOwners.length)
    return storeOwners
}