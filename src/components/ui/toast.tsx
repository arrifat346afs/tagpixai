"use client"

import type * as React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Toast component styling
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-md transition-all",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        destructive: "destructive border-destructive bg-destructive text-destructive-foreground",
        success:
          "border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300",
        warning:
          "border-yellow-500 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300",
        info: "border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

// Types
type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  action?: React.ReactNode
}

type ToastContextType = {
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
  clear: () => void
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast component
function ToastItem({ toast, onDismiss }: { toast: ToastProps; onDismiss: () => void }) {
  // Handle auto-dismiss
  useEffect(() => {
    // Only set timeout if duration is not 0
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss()
      }, toast.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  // Get icon based on variant
  const getToastIcon = (variant: ToastProps["variant"]) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
      case "destructive":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className={cn(toastVariants({ variant: toast.variant }))}>
      <div className="flex items-center gap-2">
        {getToastIcon(toast.variant)}
        <div className="flex-1">
          {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
          {toast.description && <div className="text-xs opacity-90">{toast.description}</div>}
          {toast.action && <div className="mt-1">{toast.action}</div>}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="ml-1 rounded-md p-1 text-foreground/50 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Provider component
export function ToastProvider({
  children,
  position = "bottom-right",
}: {
  children: React.ReactNode
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}) {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Add a toast
  const toast = useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, ...props }])
    return id
  }, [])

  // Dismiss a toast
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Clear all toasts
  const clear = useCallback(() => {
    setToasts([])
  }, [])

  // Position classes
  const positionClasses = {
    "top-right": "fixed top-4 right-4 flex flex-col gap-1.5 z-50 items-end",
    "top-left": "fixed top-4 left-4 flex flex-col gap-1.5 z-50 items-start",
    "bottom-right": "fixed bottom-4 right-4 flex flex-col gap-1.5 z-50 items-end",
    "bottom-left": "fixed bottom-4 left-4 flex flex-col gap-1.5 z-50 items-start",
    "top-center": "fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 z-50 items-center",
    "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 z-50 items-center",
  }

  return (
    <ToastContext.Provider value={{ toast, dismiss, clear }}>
      {children}
      {isMounted && (
        <div className={positionClasses[position]}>
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
                className="w-full max-w-xs"
              >
                <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ToastContext.Provider>
  )
}

// Hook for using toast
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Simplified toast function (can be used outside of React components)
let toastFn: ((props: Omit<ToastProps, "id">) => void) | null = null

export const toast = Object.assign(
  (props: Omit<ToastProps, "id">) => {
    if (toastFn) {
      return toastFn(props)
    }
    console.warn("Toast function called before ToastProvider was initialized")
  },
  {
    success: (props: Omit<ToastProps, "id" | "variant">) => toast({ ...props, variant: "success" }),
    warning: (props: Omit<ToastProps, "id" | "variant">) => toast({ ...props, variant: "warning" }),
    info: (props: Omit<ToastProps, "id" | "variant">) => toast({ ...props, variant: "info" }),
    error: (props: Omit<ToastProps, "id" | "variant">) => toast({ ...props, variant: "destructive" }),
  },
)

// Internal component to initialize the toast function
export function ToastInit() {
  const { toast: toastFromContext } = useToast()

  useEffect(() => {
    toastFn = toastFromContext
    return () => {
      toastFn = null
    }
  }, [toastFromContext])

  return null
}
