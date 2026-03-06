import { useEffect } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getLenis } from "@/App";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import logoImage from "@assets/Logo_1771044908308.png";

export default function Book() {

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-8 pb-16 px-4 w-full relative">
            <Link href="/">
                <button
                    className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50 group hover-elevate"
                    aria-label="Back to Home"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase hidden sm:inline">Back</span>
                </button>
            </Link>

            <div className="w-full max-w-[700px] flex flex-col items-center mt-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex flex-col items-center"
                >
                    <img
                        src={logoImage}
                        alt="One More Swing"
                        className="w-20 h-20 rounded-full object-cover bg-black/40 backdrop-blur-sm mb-6 shadow-2xl"
                    />
                    <span className="text-primary font-semibold text-[10px] sm:text-xs tracking-[0.3em] uppercase block mb-3 text-center">
                        Reserve Your Date
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight text-center">
                        Bring the course to <span className="text-gradient">your doorstep.</span>
                    </h1>
                </motion.div>

                <div className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-5 sm:p-8 shadow-2xl">
                    <BookingWizard onClose={() => { }} />
                </div>
            </div>
        </div>
    );
}
