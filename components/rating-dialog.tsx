"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ratingSchema, type RatingFormData } from "@/lib/schemas"
import { submitRating, getUserRatingForStore, type UserRating } from "@/lib/api"

interface RatingDialogProps {
    storeId: number
    storeName: string
}

export function RatingDialog({ storeId, storeName }: RatingDialogProps) {
    console.log("[RatingDialog] rendering rating dialog for store", storeId)
    const { data: session } = useSession()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [currentRating, setCurrentRating] = useState<UserRating | null>(null)
    const [loadingCurrentRating, setLoadingCurrentRating] = useState(false)
    const router = useRouter()

    const token = (session as any)?.accessToken as string | undefined

    const form = useForm<RatingFormData>({
        resolver: zodResolver(ratingSchema),
        defaultValues: {
            storeId: storeId,
            value: 1,
        },
    })

    // Load current user rating when dialog opens
    useEffect(() => {
        if (open && token) {
            console.log("[RatingDialog] loading current user rating")
            setLoadingCurrentRating(true)
            getUserRatingForStore(storeId.toString(), token)
                .then((rating) => {
                    console.log("[RatingDialog] current rating:", JSON.stringify(rating))
                    setCurrentRating(rating)
                    if (rating) {
                        form.setValue("value", rating.value)
                    }
                })
                .catch((error) => {
                    console.log("[RatingDialog] error loading current rating:", JSON.stringify({ message: error.message }))
                    // Don't show error toast for 404 (no rating found)
                })
                .finally(() => {
                    setLoadingCurrentRating(false)
                })
        }
    }, [open, token, storeId, form])

    async function onSubmit(data: RatingFormData) {
        console.log("[onSubmit] rating form submitted with data:", JSON.stringify(data))

        if (!session) {
            console.log("[onSubmit] no session found")
            toast.error("Please log in to rate stores")
            return
        }

        if (!token) {
            console.log("[onSubmit] no access token found")
            toast.error("Authentication error. Please log in again.")
            return
        }

        startTransition(async () => {
            try {
                console.log("[onSubmit] calling submitRating API")
                await submitRating(data, token)

                console.log("[onSubmit] rating submitted successfully")
                toast.success(
                    currentRating
                        ? `Your rating for "${storeName}" has been updated to ${data.value} stars!`
                        : `You rated "${storeName}" ${data.value} stars!`,
                )

                // Close dialog
                setOpen(false)

                // Force a hard refresh to ensure we get the latest data
                console.log("[onSubmit] forcing page reload to get updated data")
                window.location.reload()
            } catch (error) {
                console.log("[onSubmit] rating submission error:", JSON.stringify({ message: (error as Error).message }))
                const errorMessage = error instanceof Error ? error.message : "Failed to submit rating"
                toast.error(errorMessage)
            }
        })
    }

    const StarRating = ({
                            value,
                            onChange,
                            disabled,
                        }: { value: number; onChange: (value: number) => void; disabled?: boolean }) => {
        const [hoverValue, setHoverValue] = useState(0)

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`p-1 rounded transition-colors ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted"}`}
                        onMouseEnter={() => !disabled && setHoverValue(star)}
                        onMouseLeave={() => !disabled && setHoverValue(0)}
                        onClick={() => !disabled && onChange(star)}
                        disabled={disabled}
                    >
                        <Star
                            className={`h-6 w-6 transition-colors ${
                                star <= (hoverValue || value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={currentRating ? "outline" : "default"}>
                    <Star className="h-4 w-4 mr-2" />
                    {currentRating ? `Update Rating (${currentRating.value}★)` : "Rate Store"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{currentRating ? "Update Your Rating" : "Rate This Store"}</DialogTitle>
                    <DialogDescription>
                        {currentRating
                            ? `Update your rating for "${storeName}". Your current rating is ${currentRating.value} stars.`
                            : `How would you rate your experience at "${storeName}"?`}
                    </DialogDescription>
                </DialogHeader>

                {loadingCurrentRating ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">Loading your current rating...</div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Rating</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col items-center space-y-4">
                                                <StarRating value={field.value} onChange={field.onChange} disabled={isPending} />
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{field.value} / 5</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {field.value === 1 && "Poor"}
                                                        {field.value === 2 && "Fair"}
                                                        {field.value === 3 && "Good"}
                                                        {field.value === 4 && "Very Good"}
                                                        {field.value === 5 && "Excellent"}
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={isPending} className="flex-1">
                                    {isPending ? "Submitting..." : currentRating ? "Update Rating" : "Submit Rating"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}