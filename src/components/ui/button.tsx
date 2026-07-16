import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-2 border-black bg-clip-padding px-8 py-3 font-swiss text-sm font-bold tracking-widest uppercase whitespace-nowrap transition-colors duration-150 outline-none select-none hover:bg-black hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-white text-black",
        outline:
          "bg-white text-black aria-expanded:bg-black aria-expanded:text-white",
        secondary:
          "bg-white text-black aria-expanded:bg-black aria-expanded:text-white",
        ghost:
          "border-transparent bg-transparent hover:border-black aria-expanded:bg-black aria-expanded:text-white",
        destructive:
          "bg-white text-black focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        link: "border-transparent bg-transparent px-0 py-0 text-black hover:bg-transparent hover:text-black hover:underline underline-offset-4",
      },
      size: {
        default: "",
        xs: "gap-1 px-4 py-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "gap-1 px-6 py-2 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "gap-1.5 px-10 py-4",
        icon: "size-10 p-0",
        "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
