import * as React from "react"
import { cn } from "@/lib/cn"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function Dialog({
  open = false,
  onOpenChange,
  children,
}: DialogProps): JSX.Element {
  const [internalOpen, setInternalOpen] = React.useState(open)

  const isOpen = onOpenChange !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen

  React.useEffect(() => {
    setInternalOpen(open)
  }, [open])

  if (!isOpen) {
    return <></>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-50 w-full max-w-lg p-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClose: () => setIsOpen(false),
            } as Partial<DialogContentProps>)
          }
          return child
        })}
      </div>
    </div>
  )
}

function DialogContent({
  className,
  children,
  onClose,
  ...props
}: DialogContentProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-background p-6 shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  )
}

function DialogHeader({ className, ...props }: DialogHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogTitleProps): JSX.Element {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps): JSX.Element {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: DialogFooterProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
