import { cn } from "@/lib/utils/index";

interface GlowBackgroundProps {
  className?: string;
}

const GlowBackground = ({ className }: GlowBackgroundProps) => (
  <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
    <div
      className="glow-blob absolute -top-32 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary-normal/25 blur-[100px]"
      style={{ animationDelay: "0s" }}
    />
    <div
      className="glow-blob absolute -bottom-32 -right-16 w-64 h-64 sm:w-[26rem] sm:h-[26rem] rounded-full bg-primary-normal/20 blur-[110px]"
      style={{ animationDelay: "-5s" }}
    />
    <div
      className="glow-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-primary-normal/10 blur-[90px]"
      style={{ animationDelay: "-2.5s" }}
    />
  </div>
);

export default GlowBackground;
