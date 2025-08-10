import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "STORE_OWNER", "CUSTOMER"], {
        required_error: "Please select a role",
    }),
})

export const addUserSchema = z.object({
    name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().max(400, "Address must be at most 400 characters").optional(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be at most 16 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    role: z.enum(["ADMIN", "STORE_OWNER", "CUSTOMER"], {
        required_error: "Please select a role",
    }),
})

export const addStoreSchema = z.object({
    name: z
        .string()
        .min(20, "Store name must be at least 20 characters")
        .max(60, "Store name must be at most 60 characters"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(1, "Address is required").max(400, "Address must be at most 400 characters"),
    ownerId: z.number().optional(), // Optional for admins to assign to specific owners
})

export const ratingSchema = z.object({
    storeId: z.number().min(1, "Store ID is required"),
    value: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type AddUserFormData = z.infer<typeof addUserSchema>
export type AddStoreFormData = z.infer<typeof addStoreSchema>
export type RatingFormData = z.infer<typeof ratingSchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(16, "Password must be at most 16 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>