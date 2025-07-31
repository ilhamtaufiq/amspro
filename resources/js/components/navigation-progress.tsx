"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface NavigationProgressProps {
  className?: string
  color?: string
  height?: number
  showSpinner?: boolean
}

export function NavigationProgress({ 
  className, 
  color = "primary",
  height = 2,
  showSpinner = false 
}: NavigationProgressProps) {
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    let progressInterval: number | null = null

    const startProgress = () => {
      setIsNavigating(true)
      setIsVisible(true)
      setProgress(0)
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 100)
    }

    const finishProgress = () => {
      setProgress(100)
      
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      // Hide after completion
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          setIsNavigating(false)
          setProgress(0)
        }, 300)
      }, 200)
    }

    // Listen for Inertia events
    const handleStart = () => startProgress()
    const handleFinish = () => finishProgress()
    const handleError = () => finishProgress()

    // Add event listeners
    window.addEventListener('inertia:start', handleStart)
    window.addEventListener('inertia:finish', handleFinish)
    window.addEventListener('inertia:error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('inertia:start', handleStart)
      window.removeEventListener('inertia:finish', handleFinish)
      window.removeEventListener('inertia:error', handleError)
      
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [])

  if (!isNavigating) return null

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-gradient-to-r from-primary via-primary/80 to-primary/60'
      case 'secondary':
        return 'bg-gradient-to-r from-secondary via-secondary/80 to-secondary/60'
      case 'accent':
        return 'bg-gradient-to-r from-accent via-accent/80 to-accent/60'
      case 'destructive':
        return 'bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60'
      default:
        return 'bg-gradient-to-r from-primary via-primary/80 to-primary/60'
    }
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className={cn(
          "h-full transition-all duration-200 ease-out",
          getColorClasses()
        )}
        style={{
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
        }}
      />
      
      {showSpinner && isNavigating && progress < 100 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
} 