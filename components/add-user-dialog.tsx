"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addUserSchema, type AddUserFormData } from "@/lib/schemas"
import { addUser } from "@/lib/api"

interface AddUserDialogProps {
    onUserAdded?: () => void
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
    console.log("[AddUserDialog] rendering add user dialog")
    const router = useRouter()
    const { data: session } = useSession()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<AddUserFormData>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            name: "",
            email: "",
            address: "",
            password: "",
            role: "CUSTOMER",
        },
    })

    async function onSubmit(data: AddUserFormData) {
        console.log("[onSubmit] add user form submitted with data:", JSON.stringify({ ...data, password: "***" }))

        if (!session) {
            console.log("[onSubmit] no session found")
            toast.error("Please log in to add users")
            return
        }

        const token = (session as any)?.accessToken as string | undefined
        if (!token) {
            console.log("[onSubmit] no access token found")
            toast.error("Authentication error. Please log in again.")
            return
        }

        startTransition(async () => {
            try {
                console.log("[onSubmit] calling addUser API")
                const result = await addUser(data, token)

                console.log("[onSubmit] user added successfully:", JSON.stringify(result))
                toast.success(`User "${data.name}" added successfully!`)

                // Reset form and close dialog
                form.reset()
                setOpen(false)

                // Call callback to refresh users list
                if (onUserAdded) {
                    onUserAdded()
                }

                // Redirect to new user's profile
                if (result.user?.id) {
                    console.log("[onSubmit] redirecting to user profile:", result.user.id)
                    router.push(`/user/${result.user.id}`)
                }
            } catch (error) {
                console.log("[onSubmit] add user error:", JSON.stringify({ message: (error as Error).message }))
                const errorMessage = error instanceof Error ? error.message : "Failed to add user"
                toast.error(errorMessage)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with the specified role and details.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter full name (20-60 characters)" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="user@example.com" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter address (max 400 characters)"
                                            className="resize-none"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter secure password"
                                                {...field}
                                                disabled={isPending}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isPending}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                                            <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                                            <SelectItem value="ADMIN">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• 8-16 characters long</li>
                                <li>• At least one uppercase letter</li>
                                <li>• At least one special character</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={isPending} className="flex-1">
                                {isPending ? "Adding User..." : "Add User"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset()
                                    setOpen(false)
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}