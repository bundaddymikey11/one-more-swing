import { useRef, useState } from "react";
import { Camera, Image, FileText, Upload, X, Loader2, Eye } from "lucide-react";
import { adminApiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
    url: string;
    name: string;
    type: "image" | "pdf";
}

interface FileUploadProps {
    onUploaded: (file: UploadedFile) => void;
    label?: string;
    compact?: boolean;
}

export default function FileUpload({ onUploaded, label = "Attach File", compact = false }: FileUploadProps) {
    const cameraRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const pdfRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const { toast } = useToast();

    const handleFile = async (file: File) => {
        setShowMenu(false);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await adminApiRequest("POST", "/api/admin/upload", formData, true);
            const data = await res.json();
            onUploaded({
                url: data.url,
                name: file.name,
                type: file.type.includes("pdf") ? "pdf" : "image",
            });
            toast({ title: "File uploaded successfully" });
        } catch {
            toast({ variant: "destructive", title: "Upload failed", description: "Please try again" });
        } finally {
            setUploading(false);
        }
    };

    const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    };

    if (compact) {
        return (
            <div className="relative inline-block">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={uploading}
                    className="flex items-center gap-1.5 text-xs text-[#FDB927] hover:text-[#FDB927] transition-colors disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading..." : label}
                </button>
                {showMenu && <UploadMenu onClose={() => setShowMenu(false)} cameraRef={cameraRef} galleryRef={galleryRef} pdfRef={pdfRef} compact />}
                <HiddenInputs cameraRef={cameraRef} galleryRef={galleryRef} pdfRef={pdfRef} onInput={onInput} />
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-[#552583]/30 hover:border-yellow-500/30 hover:bg-yellow-500/5 text-zinc-500 hover:text-[#FDB927] transition-all disabled:opacity-50"
            >
                {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                    <><Upload className="w-4 h-4" /> {label}</>
                )}
            </button>
            {showMenu && <UploadMenu onClose={() => setShowMenu(false)} cameraRef={cameraRef} galleryRef={galleryRef} pdfRef={pdfRef} />}
            <HiddenInputs cameraRef={cameraRef} galleryRef={galleryRef} pdfRef={pdfRef} onInput={onInput} />
        </div>
    );
}

function UploadMenu({ onClose, cameraRef, galleryRef, pdfRef, compact }: {
    onClose: () => void;
    cameraRef: React.RefObject<HTMLInputElement>;
    galleryRef: React.RefObject<HTMLInputElement>;
    pdfRef: React.RefObject<HTMLInputElement>;
    compact?: boolean;
}) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className={`absolute z-50 ${compact ? "bottom-6 left-0" : "bottom-14 left-0 right-0"} bg-zinc-900 border border-[#552583]/30 rounded-xl shadow-xl shadow-black/50 overflow-hidden`}>
                <p className="text-xs text-zinc-500 uppercase tracking-wider px-4 py-2 border-b border-zinc-800">Attach</p>
                {[
                    { ref: cameraRef, icon: Camera, label: "Take Photo", desc: "Use camera", color: "text-[#FDB927]" },
                    { ref: galleryRef, icon: Image, label: "Photo Library", desc: "Choose from gallery", color: "text-[#FDB927]" },
                    { ref: pdfRef, icon: FileText, label: "Upload PDF", desc: "Document or contract", color: "text-[#FDB927]/80" },
                ].map(({ ref, icon: Icon, label, desc, color }) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => { ref.current?.click(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#552583]/5 transition-colors text-left"
                    >
                        <div className={`w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{label}</p>
                            <p className="text-zinc-500 text-xs">{desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );
}

function HiddenInputs({ cameraRef, galleryRef, pdfRef, onInput }: {
    cameraRef: React.RefObject<HTMLInputElement>;
    galleryRef: React.RefObject<HTMLInputElement>;
    pdfRef: React.RefObject<HTMLInputElement>;
    onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onInput} className="hidden" />
            <input ref={galleryRef} type="file" accept="image/*,video/*" onChange={onInput} className="hidden" />
            <input ref={pdfRef} type="file" accept=".pdf,application/pdf,image/*" onChange={onInput} className="hidden" />
        </>
    );
}

// Attachment display component
export function AttachmentPreview({ url, name, type, onRemove }: { url: string; name: string; type: "image" | "pdf"; onRemove?: () => void }) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-[#552583]/20 group">
            {type === "image" ? (
                <img src={url} alt={name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
            ) : (
                <div className="w-10 h-10 rounded-md bg-[#552583]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#FDB927]" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{name}</p>
                <p className="text-zinc-500 text-xs">{type === "pdf" ? "PDF Document" : "Image"}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white">
                    <Eye className="w-3.5 h-3.5" />
                </a>
                {onRemove && (
                    <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
