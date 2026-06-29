"use client";

import React, { useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { signupAction } from "../actions/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileText, CheckCircle2, Lock, User, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [isSubmitPending, startTransition] = useTransition();

  const isLoading = isPending || isSubmitPending;
  const activeError = state?.error;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (activeError) {
      toast.error(activeError, {
        description: "Please check your inputs and try again.",
      });
    }
  }, [activeError]);

  const onSubmit = (data: RegisterInput) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 w-full bg-background">
      {/* Left panel (Visual branding & taglines) */}
      <div className="relative hidden md:flex flex-col justify-between p-10 text-foreground bg-muted/20 border-r border-border overflow-hidden select-none">
        {/* Glow backgrounds */}
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-indigo-500/10">
            <FileText className="h-5 w-5 text-indigo-400" />
          </div>
          <span>Antigravity RAG</span>
        </div>

        <div className="relative z-20 my-auto space-y-6 max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent leading-tight">
            Interact with your documents like never before.
          </h2>
          <p className="text-muted-foreground text-lg">
            Upload PDFs or Word files and query them using natural language. Fast, local embeddings and low-latency cloud inference.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">High-speed local ingestion</p>
                <p className="text-xs text-muted-foreground">Chunked parsing and vector embedding on the fly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Typewriter-style SSE streaming</p>
                <p className="text-xs text-muted-foreground">Immediate, progressive token synthesis responses.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-auto text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Antigravity Systems. All rights reserved.
        </div>
      </div>

      {/* Right panel (Centered Register Card) */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Antigravity RAG
            </h1>
          </div>

          <Card className="border-border bg-card shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Sign up to get started with document-based Q&A
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {activeError && (
                  <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 animate-in fade-in-50 duration-200">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{activeError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose username"
                      disabled={isLoading}
                      {...register("username")}
                      className={`pl-9 border-border bg-muted/50 text-foreground placeholder-muted-foreground focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${
                        errors.username ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      aria-invalid={errors.username ? "true" : "false"}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      disabled={isLoading}
                      {...register("password")}
                      className={`pl-9 border-border bg-muted/50 text-foreground placeholder-muted-foreground focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${
                        errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      disabled={isLoading}
                      {...register("confirmPassword")}
                      className={`pl-9 border-border bg-muted/50 text-foreground placeholder-muted-foreground focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${
                        errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 transition-colors">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4 flex justify-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
