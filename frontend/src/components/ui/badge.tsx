import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "teal" | "amber"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#0D9488]/15 text-[#0F766E] border-transparent font-medium",
    teal: "bg-[#0D9488] text-white border-transparent",
    secondary: "bg-slate-100 text-slate-800 border-transparent",
    destructive: "bg-red-500/15 text-red-700 border-transparent",
    outline: "text-slate-700 border border-slate-200",
    amber: "bg-amber-100 text-amber-800 border-transparent",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
