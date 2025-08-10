import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { decodeJwt, type JWTPayload } from "jose"

import { BACKEND_URL, AUTH_SECRET } from "./lib/constants"

type LoginResponse = {
    token: string
    // Backend might include more fields, we accept unknowns too
    [key: string]: unknown
}

type DecodedPayload = JWTPayload & {
    id?: number | string
    email: string,
    name: string,
    role?: string
}


export const { handlers, auth, signIn, signOut } = NextAuth(
    {
        trustHost: true,
        session: { strategy: "jwt" },
        secret: AUTH_SECRET,
        providers: [
            Credentials({
                name: "Credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    console.log("[authorize] start credentials authorize")
                    try {
                        if (!credentials?.email || !credentials?.password) {
                            console.log("[authorize] missing credentials")
                            return null
                        }

                        console.log("[authorize] preparing login payload")
                        const payload = {
                            email: credentials.email,
                            password: credentials.password,
                        }

                        console.log("[authorize] POST /api/auth/login to backend", BACKEND_URL)
                        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        })

                        console.log("[authorize] backend response status:", res.status)
                        if (!res.ok) {
                            const text = await res.text()
                            console.log("[authorize] login failed body:", text)
                            return null
                        }

                        const data = (await res.json()) as LoginResponse
                        console.log("[authorize] login success, raw data:", JSON.stringify(data))

                        if (!data?.token) {
                            console.log("[authorize] token missing in response")
                            return null
                        }

                        console.log("[authorize] decoding JWT")
                        const decoded = decodeJwt(data.token) as DecodedPayload
                        console.log("[authorize] decoded JWT:", JSON.stringify(decoded))

                        const user = {
                            id: decoded?.id ? String(decoded.id) : undefined,
                            email: credentials.email,
                            role: decoded?.role,
                            accessToken: data.token,
                        }

                        console.log("[authorize] returning user:", JSON.stringify(user))
                        return user as any
                    } catch (err) {
                        console.log("[authorize] error:", JSON.stringify({ message: (err as Error).message }))
                        return null
                    }
                },
            }),
        ],
        callbacks: {
            async jwt({ token, user }) {
                console.log("[callbacks.jwt] start with token and user")
                if (user) {
                    console.log("[callbacks.jwt] merging user into token")
                    token.sub = (user as any)?.id ?? token.sub
                    ;(token as any).role = (user as any)?.role
                    ;(token as any).accessToken = (user as any)?.accessToken
                }
                console.log("[callbacks.jwt] final token:", JSON.stringify(token))
                return token
            },
            async session({ session, token }) {
                console.log("[callbacks.session] building session from token")
                session.user = {
                    ...session.user,
                    id: token.sub as string | undefined,
                    role: (token as any)?.role as string | undefined,
                } as any
                ;(session as any).accessToken = (token as any)?.accessToken as string | undefined
                console.log("[callbacks.session] final session:", JSON.stringify(session))
                return session
            },
        },
    }
)