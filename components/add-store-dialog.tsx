"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

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
import { addStoreSchema, type AddStoreFormData } from "@/lib/schemas"
import { addStore, getStoreOwners, type User } from "@/lib/api"

interface AddStoreDialogProps {
    onStoreAdded?: () => void
}

export function AddStoreDialog({ onStoreAdded }: AddStoreDialogProps) {
    console.log("[AddStoreDialog] rendering add store dialog")
    const router = useRouter()
    const { data: session } = useSession()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [storeOwners, setStoreOwners] = useState<User[]>([])
    const [loadingOwners, setLoadingOwners] = useState(false)

    const userRole = (session?.user as any)?.role || "USER"
    const currentUserId = (session?.user as any)?.id
    const token = (session as any)?.accessToken as string | undefined

    const form = useForm<AddStoreFormData>({
        resolver: zodResolver(addStoreSchema),
        defaultValues: {
            name: "",
            email: "",
            address: "",
            ownerId: undefined,
        },
    })

    // Load store owners when dialog opens (for admins)
    useEffect(() => {
        if (open && userRole === "ADMIN" && token) {
            console.log("[AddStoreDialog] loading store owners for admin")
            setLoadingOwners(true)
            getStoreOwners(token)
                .then((owners) => {
                    console.log("[AddStoreDialog] loaded store owners:", owners.length)
                    setStoreOwners(owners)
                })
                .catch((error) => {
                    console.log("[AddStoreDialog] error loading store owners:", JSON.stringify({ message: error.message }))
                    toast.error("Failed to load store owners")
                })
                .finally(() => {
                    setLoadingOwners(false)
                })
        }
    }, [open, userRole, token])

    async function onSubmit(data: AddStoreFormData) {
        console.log("[onSubmit] add store form submitted with data:", JSON.stringify(data))

        if (!session) {
            console.log("[onSubmit] no session found")
            toast.error("Please log in to add stores")
            return
        }

        if (!token) {
            console.log("[onSubmit] no access token found")
            toast.error("Authentication error. Please log in again.")
            return
        }

        // For store owners, set ownerId to current user
        const storeData = {
            ...data,
            ownerId: userRole === "ADMIN" ? data.ownerId : Number(currentUserId),
        }

        startTransition(async () => {
            try {
                console.log("[onSubmit] calling addStore API")
                const result = await addStore(storeData, token)

                console.log("[onSubmit] store added successfully:", JSON.stringify(result))
                toast.success(`Store "${data.name}" added successfully!`)

                // Reset form and close dialog
                form.reset()
                setOpen(false)

                // Call callback to refresh stores list
                if (onStoreAdded) {
                    onStoreAdded()
                }

                // Redirect to new store's profile
                if (result.store?.id) {
                    console.log("[onSubmit] redirecting to store profile:", result.store.id)
                    router.push(`/store/${result.store.id}`)
                }
            } catch (error) {
                console.log("[onSubmit] add store error:", JSON.stringify({ message: (error as Error).message }))
                const errorMessage = error instanceof Error ? error.message : "Failed to add store"
                toast.error(errorMessage)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Store
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>
                        Create a new store {userRole === "ADMIN" ? "and assign it to a store owner" : "for your account"}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter store name (20-60 characters)" {...field} disabled={isPending} />
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
                                    <FormLabel>Store Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="store@example.com" {...field} disabled={isPending} />
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
                                    <FormLabel>Store Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter store address (max 400 characters)"
                                            className="resize-none"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Owner selection - only for admins */}
                        {userRole === "ADMIN" && (
                            <FormField
                                control={form.control}
                                name="ownerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Owner</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                            disabled={isPending || loadingOwners}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingOwners ? "Loading owners..." : "Select store owner"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {storeOwners.map((owner) => (
                                                    <SelectItem key={owner.id} value={owner.id.toString()}>
                                                        {owner.name} ({owner.email}) - {owner.role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Store Requirements:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Store name: 20-60 characters</li>
                                <li>• Valid email address required</li>
                                <li>• Address: Maximum 400 characters</li>
                                {userRole === "STORE_OWNER" && <li>• Store will be assigned to your account</li>}
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={isPending || loadingOwners} className="flex-1">
                                {isPending ? "Adding Store..." : "Add Store"}
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