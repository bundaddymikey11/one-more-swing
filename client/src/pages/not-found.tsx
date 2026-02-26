import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#050505] px-5">
      <div className="text-center space-y-6 max-w-md">
        <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block" data-testid="text-404-label">
          Page Not Found
        </span>
        <h1
          className="font-serif font-bold text-white"
          style={{ fontSize: "clamp(3rem, 10vw, 6rem)", letterSpacing: "-0.05em", lineHeight: 0.9 }}
          data-testid="text-404-heading"
        >
          404
        </h1>
        <p className="text-white/40 text-sm sm:text-base" data-testid="text-404-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground border border-primary-border btn-glow min-h-[48px] text-base px-8"
          data-testid="button-404-home"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
