"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { signInAction } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { signInSchema, validateForm } from "@/lib/schemas"

export function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Validate form data with Zod
    const validation = validateForm(signInSchema, { email, password })
    if (!validation.success) {
      setFieldErrors(validation.errors || {})
      if (validation.errors?._error) {
        toast.error(validation.errors._error)
      }
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await signInAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Welcome back! Redirecting to dashboard...")
        window.location.href = "/dashboard"
      }
    })
  }

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-xl relative overflow-hidden rounded-2xl">
      <CardHeader className="pt-10 pb-6 text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-2">
          <LogIn className="h-6 w-6" />
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to access your task dashboard
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={`pl-10 h-11 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/25 rounded-xl transition-all ${fieldErrors.email ? "border-red-500 focus-visible:border-red-500" : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" })
                }}
                disabled={isPending}
                required
              />
            </div>
            {fieldErrors.email && (
              <div className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`pl-10 h-11 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/25 rounded-xl transition-all ${fieldErrors.password ? "border-red-500 focus-visible:border-red-500" : ""}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" })
                }}
                disabled={isPending}
                required
              />
            </div>
            {fieldErrors.password && (
              <div className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                {fieldErrors.password}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 mt-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold h-11 rounded-xl shadow-sm hover:shadow active:scale-[0.98]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary font-semibold hover:underline hover:text-primary/90">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
