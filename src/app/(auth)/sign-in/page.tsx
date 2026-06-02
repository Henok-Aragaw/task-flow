"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { signInAction } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LogIn, Mail, Lock, Loader2 } from "lucide-react"

export default function SignInPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter email and password.")
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground transition-colors duration-300">
      {/* Premium background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />
      
      <Card className="w-full max-w-md border-border bg-card shadow-xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        
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
                  className="pl-10 h-11 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/25 rounded-xl transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
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
                  className="pl-10 h-11 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/25 rounded-xl transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4 pb-8">
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
    </div>
  )
}
