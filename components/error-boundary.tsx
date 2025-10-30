"use client"

import { useEffect } from "react"

export function ResizeObserverErrorSuppressor() {
  useEffect(() => {
    // Suppress ResizeObserver loop errors - these are harmless and caused by
    // Radix UI Popover/Command components measuring content dynamically
    const errorHandler = (event: ErrorEvent) => {
      if (
        event.message?.includes("ResizeObserver loop") ||
        event.message?.includes("ResizeObserver loop completed with undelivered notifications")
      ) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return true
      }
    }

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("ResizeObserver loop") ||
        event.reason?.toString()?.includes("ResizeObserver loop")
      ) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return true
      }
    }

    window.addEventListener("error", errorHandler, { capture: true })
    window.addEventListener("unhandledrejection", unhandledRejectionHandler, { capture: true })

    // Patch ResizeObserver to debounce callbacks
    if (typeof window !== "undefined" && window.ResizeObserver) {
      const OriginalResizeObserver = window.ResizeObserver
      window.ResizeObserver = class PatchedResizeObserver extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          let rafId: number | null = null
          const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
            if (rafId !== null) {
              cancelAnimationFrame(rafId)
            }
            rafId = requestAnimationFrame(() => {
              try {
                callback(entries, observer)
              } catch (error) {
                // Suppress ResizeObserver errors
                if (error instanceof Error && error.message.includes("ResizeObserver loop")) {
                  return
                }
                throw error
              }
            })
          }
          super(debouncedCallback)
        }
      }
    }

    return () => {
      window.removeEventListener("error", errorHandler, { capture: true })
      window.removeEventListener("unhandledrejection", unhandledRejectionHandler, { capture: true })
    }
  }, [])

  return null
}
