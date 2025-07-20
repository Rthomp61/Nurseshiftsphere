import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
