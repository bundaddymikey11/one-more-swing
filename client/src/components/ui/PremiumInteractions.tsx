import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface MagneticProps {
    children: ReactNode;
    className?: string;
    strength?: number;
    springConfig?: { stiffness: number; damping: number; mass: number };
}

export function Magnetic({
    children,
    className = "",
    strength = 20,
    springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
}: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();

        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        setPosition({ x: middleX * (strength / 100), y: middleY * (strength / 100) });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{
                type: "spring",
                stiffness: springConfig.stiffness,
                damping: springConfig.damping,
                mass: springConfig.mass
            }}
            className={`inline-block ${className}`}
            style={{
                cursor: "pointer",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
            }}
        >
            {children}
        </motion.div>
    );
}

export function MouseGlowCard({ children, className = "" }: { children: ReactNode; className?: string }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 z-0 group-hover:opacity-100 sm:group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34,197,94,0.06), transparent 40%)`
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 z-0 group-hover:opacity-50 sm:group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.04), transparent 40%)`
                }}
            />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {children}
            </div>
        </div>
    );
}
