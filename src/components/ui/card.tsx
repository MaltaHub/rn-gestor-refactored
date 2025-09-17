import * as React from "react"

import { cn } from "@/lib/utils"

type CardProps = React.ComponentPropsWithoutRef<"div">

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-border bg-card text-card-foreground shadow-card transition-shadow duration-200",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

type CardHeaderProps = React.ComponentPropsWithoutRef<"div">

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

type CardTitleProps = React.ComponentPropsWithoutRef<"h3">

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

type CardDescriptionProps = React.ComponentPropsWithoutRef<"p">

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

type CardContentProps = React.ComponentPropsWithoutRef<"div">

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

type CardFooterProps = React.ComponentPropsWithoutRef<"div">

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"
