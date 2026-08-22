import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type Status = "owned" | "needed";

interface CollectionType {
  id: string;
  label: string;
  icon: string;
}

interface Folder {
  id: string;
  name: string;
  typeId: string;
  parentId: string | null;
  cover?: string;
}

interface MediaItem {
  id: string;
  folderId: string;
  title: string;
  status: Status;
  rating: number | null;
  year: number;
  genre: string;
  cover: string;
  notes: string;
  addedAt: string;
}

const STATUS_LABELS: Record<Status, string> = {
  owned: "Have It",
  needed: "Needed",
};

const STATUS_COLORS: Record<Status, string> = {
  owned: "#4ade80",
  needed: "#f87171",
};

const INITIAL_TYPES: CollectionType[] = [
  { id: "movie", label: "Movies", icon: "🎬" },
  { id: "tv", label: "TV Shows", icon: "📺" },
  { id: "book", label: "Books", icon: "📖" },
  { id: "game", label: "Games", icon: "🎮" },
];

const INITIAL_FOLDERS: Folder[] = [
  { id: "f1", name: "Sci-Fi", typeId: "movie", parentId: null },
  { id: "f2", name: "Drama", typeId: "movie", parentId: null },
  { id: "f3", name: "2024 Releases", typeId: "movie", parentId: "f1" },
  { id: "f4", name: "Drama", typeId: "tv", parentId: null },
  { id: "f5", name: "Fantasy", typeId: "tv", parentId: null },
  { id: "f6", name: "RPG", typeId: "game", parentId: null },
  { id: "f7", name: "Indie", typeId: "game", parentId: null },
  { id: "f8", name: "Literary Fiction", typeId: "book", parentId: null },
  { id: "f9", name: "Western", typeId: "book", parentId: null },
  { id: "f10", name: "Pókember (1989)", typeId: "book", parentId: null },
];

const INITIAL_ITEMS: MediaItem[] = [
  { id: "1", folderId: "f3", title: "Dune: Part Two", status: "owned", rating: 9, year: 2024, genre: "Sci-Fi", cover: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=560&fit=crop&auto=format", notes: "Visually stunning. Zimmer's score is otherworldly.", addedAt: "2024-03-15" },
  { id: "2", folderId: "f4", title: "Shogun", status: "owned", rating: 10, year: 2024, genre: "Historical Drama", cover: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=560&fit=crop&auto=format", notes: "One of the best limited series ever made.", addedAt: "2024-04-02" },
  { id: "3", folderId: "f6", title: "Elden Ring", status: "owned", rating: null, year: 2022, genre: "Action RPG", cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=560&fit=crop&auto=format", notes: "150 hours in. Still exploring.", addedAt: "2024-01-10" },
  { id: "4", folderId: "f8", title: "The Brothers Karamazov", status: "owned", rating: null, year: 1880, genre: "Literary Fiction", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=560&fit=crop&auto=format", notes: "Dense but rewarding.", addedAt: "2024-05-20" },
  { id: "5", folderId: "f2", title: "Oppenheimer", status: "owned", rating: 8, year: 2023, genre: "Historical Drama", cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=560&fit=crop&auto=format", notes: "Cillian Murphy's best performance.", addedAt: "2023-07-22" },
  { id: "6", folderId: "f7", title: "Hollow Knight", status: "owned", rating: 9, year: 2017, genre: "Metroidvania", cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=560&fit=crop&auto=format", notes: "Hauntingly beautiful.", addedAt: "2023-11-05" },
  { id: "7", folderId: "f5", title: "House of the Dragon", status: "needed", rating: null, year: 2022, genre: "Fantasy", cover: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&h=560&fit=crop&auto=format", notes: "Season 2 started strong.", addedAt: "2024-06-17" },
  { id: "8", folderId: "f9", title: "Blood Meridian", status: "needed", rating: null, year: 1985, genre: "Western", cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=560&fit=crop&auto=format", notes: "On the list for years.", addedAt: "2024-02-14" },
  { id: "p1",  folderId: "f10", title: "Pókember 1.",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_1.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p2",  folderId: "f10", title: "Pókember 2. – Madame Necc",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/03/CSPV1-2.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p3",  folderId: "f10", title: "Pókember 3. – Veszélyes vizeken",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_3.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p4",  folderId: "f10", title: "Pókember 4. – Támad a Vízember",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_4.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p5",  folderId: "f10", title: "Pókember 5. – Pókember a Varázsló markában",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_5.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p6",  folderId: "f10", title: "Pókember 6. – Torpedó, Rémes Négyes",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/03/CSPV1-6.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p7",  folderId: "f10", title: "Pókember 7. – A halál győz, Madame Necc",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_7.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p8",  folderId: "f10", title: "Pókember 8. – Peter Parker a bűnöző",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_8.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p9",  folderId: "f10", title: "Pókember 9. – Vissza a szigetre",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_9.jpg",   notes: "", addedAt: "2024-01-01" },
  { id: "p10", folderId: "f10", title: "Pókember 10. – A rejtélyes hölgy",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_10.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p11", folderId: "f10", title: "Pókember 11. – A majmok éjszakája",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_11.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p12", folderId: "f10", title: "Pókember 12. – Tisztogató",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_12.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p13", folderId: "f10", title: "Pókember 13. – Agyonhara-pók",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_13.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p14", folderId: "f10", title: "Pókember 14. – Harc a Buldózerrel",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_14.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p15", folderId: "f10", title: "Pókember 15. – A tettenérés folytatódik",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_15.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p16", folderId: "f10", title: "Pókember 16. – Füsti Willy bosszút áll",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/03/CSPV1-16.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p17", folderId: "f10", title: "Pókember 17. – A játszma vége",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_17.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p18", folderId: "f10", title: "Pókember 18. – Magas és hatalmas",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_18.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p19", folderId: "f10", title: "Pókember 19. – A titokzatos Vészmanó",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_19.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p20", folderId: "f10", title: "Pókember 20. – Vezér, Vészmanó",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_20.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p21", folderId: "f10", title: "Pókember 21. – Heuréka",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_21.jpg",  notes: "", addedAt: "2024-01-01" },
  { id: "p22", folderId: "f10", title: "Pókember 22. – Bemutatjuk az új Pókembert",  status: "needed", rating: null, year: 1989, genre: "Képregény", cover: "https://www.kepregenydepo.hu/wp-content/uploads/2023/04/cspv1_22.jpg",  notes: "", addedAt: "2024-01-01" },
];

const EMOJI_OPTIONS = [
  "🎬","📺","📖","🎮","🎵","🎙️","🎧","📻","🎭","🎨","📷","🏆",
  "🌍","🚀","⚽","🏀","🎲","🃏","🍿","📰","🗺️","💡","🔬","🎯",
];

// ─── API sync ────────────────────────────────────────────────────────────────

const API = "/api/data";

async function loadFromServer(): Promise<{ types: CollectionType[]; folders: Folder[]; items: MediaItem[] } | null> {
  try {
    const res = await fetch(API);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.types?.length && !data.folders?.length && !data.items?.length) return null;
    return data;
  } catch { return null; }
}

async function saveToServer(types: CollectionType[], folders: Folder[], items: MediaItem[]) {
  try { await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ types, folders, items }) }); }
  catch { /* offline — data still in localStorage */ }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function getAllDescendantFolderIds(folderId: string, folders: Folder[]): string[] {
  const children = folders.filter((f) => f.parentId === folderId).map((f) => f.id);
  return children.flatMap((id) => [id, ...getAllDescendantFolderIds(id, folders)]);
}

// ─── small shared components ─────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number | null; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
        const filled = hovered !== null ? star <= hovered : value !== null && star <= value;
        return (
          <button key={star} type="button" onClick={() => onChange?.(star)}
            onMouseEnter={() => onChange && setHovered(star)}
            onMouseLeave={() => onChange && setHovered(null)}
            className="text-xs leading-none transition-transform hover:scale-125"
            style={{ color: filled ? "#d4a843" : "#2a2830", cursor: onChange ? "pointer" : "default" }}>★</button>
        );
      })}
      {value !== null && <span className="text-xs ml-1" style={{ color: "#6b6870", fontFamily: "JetBrains Mono, monospace" }}>{value}/10</span>}
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function toLocalDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    throw new Error("Could not load image — the source site may block cross-origin access. Try uploading the image file directly instead.");
  }
}

// ─── image editor ────────────────────────────────────────────────────────────

type CropRect = { x: number; y: number; w: number; h: number };
type Handle = "nw"|"n"|"ne"|"e"|"se"|"s"|"sw"|"w"|"move";

const HANDLES: { id: Handle; cursor: string; xPct: number; yPct: number }[] = [
  { id: "nw", cursor: "nwse-resize", xPct: 0,   yPct: 0   },
  { id: "n",  cursor: "ns-resize",   xPct: 0.5, yPct: 0   },
  { id: "ne", cursor: "nesw-resize", xPct: 1,   yPct: 0   },
  { id: "e",  cursor: "ew-resize",   xPct: 1,   yPct: 0.5 },
  { id: "se", cursor: "nwse-resize", xPct: 1,   yPct: 1   },
  { id: "s",  cursor: "ns-resize",   xPct: 0.5, yPct: 1   },
  { id: "sw", cursor: "nesw-resize", xPct: 0,   yPct: 1   },
  { id: "w",  cursor: "ew-resize",   xPct: 0,   yPct: 0.5 },
];

function ImageEditor({ src, onSave, onCancel }: {
  src: string; onSave: (dataUrl: string) => void; onCancel: () => void;
}) {
  const MAX_DISP = 520;
  const imgRef = useRef<HTMLImageElement>(null);

  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [disp, setDisp] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [outW, setOutW] = useState(0);
  const [outH, setOutH] = useState(0);
  const [lockAspect, setLockAspect] = useState(false);

  const dragRef = useRef<{ handle: Handle; sx: number; sy: number; sc: CropRect } | null>(null);

  const onImgLoad = () => {
    const img = imgRef.current!;
    const n = { w: img.naturalWidth, h: img.naturalHeight };
    const scale = Math.min(1, MAX_DISP / Math.max(n.w, n.h));
    const d = { w: Math.round(n.w * scale), h: Math.round(n.h * scale) };
    setNat(n);
    setDisp(d);
    setCrop({ x: 0, y: 0, w: d.w, h: d.h });
    setOutW(n.w);
    setOutH(n.h);
  };

  const clamp = useCallback((c: CropRect, d: { w: number; h: number }): CropRect => {
    const MIN = 20;
    let { x, y, w, h } = c;
    w = Math.max(MIN, w);
    h = Math.max(MIN, h);
    x = Math.max(0, Math.min(d.w - w, x));
    y = Math.max(0, Math.min(d.h - h, y));
    w = Math.min(d.w - x, w);
    h = Math.min(d.h - y, h);
    return { x, y, w, h };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d || disp.w === 0) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      const { x, y, w, h } = d.sc;
      let next: CropRect;
      switch (d.handle) {
        case "move": next = { x: x + dx, y: y + dy, w, h }; break;
        case "nw":   next = { x: x + dx, y: y + dy, w: w - dx, h: h - dy }; break;
        case "n":    next = { x, y: y + dy, w, h: h - dy }; break;
        case "ne":   next = { x, y: y + dy, w: w + dx, h: h - dy }; break;
        case "e":    next = { x, y, w: w + dx, h }; break;
        case "se":   next = { x, y, w: w + dx, h: h + dy }; break;
        case "s":    next = { x, y, w, h: h + dy }; break;
        case "sw":   next = { x: x + dx, y, w: w - dx, h: h + dy }; break;
        case "w":    next = { x: x + dx, y, w: w - dx, h }; break;
        default:     next = d.sc;
      }
      const clamped = clamp(next, disp);
      // sync output dimensions to match crop pixel area in natural coords
      const scaleX = nat.w / disp.w;
      const scaleY = nat.h / disp.h;
      setOutW(Math.round(clamped.w * scaleX));
      setOutH(Math.round(clamped.h * scaleY));
      setCrop(clamped);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [disp, nat, clamp]);

  const startDrag = (handle: Handle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { handle, sx: e.clientX, sy: e.clientY, sc: { ...crop } };
  };

  const handleOutW = (v: number) => {
    setOutW(v);
    if (lockAspect && crop.h > 0) {
      const aspect = crop.w / crop.h;
      setOutH(Math.round(v / aspect));
    }
  };

  const handleOutH = (v: number) => {
    setOutH(v);
    if (lockAspect && crop.w > 0) {
      const aspect = crop.w / crop.h;
      setOutW(Math.round(v * aspect));
    }
  };

  const handleSave = () => {
    const img = imgRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, outW);
    canvas.height = Math.max(1, outH);
    const ctx = canvas.getContext("2d")!;
    const scaleX = nat.w / disp.w;
    const scaleY = nat.h / disp.h;
    ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.w * scaleX, crop.h * scaleY, 0, 0, outW, outH);
    onSave(canvas.toDataURL("image/jpeg", 0.92));
  };

  const inputNum = "rounded px-2 py-1 text-sm outline-none w-20 text-center";
  const inputNumStyle = { background: "#1a191f", border: "1px solid #2a2830", color: "#e8e6e1" };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(13,13,16,0.92)", backdropFilter: "blur(6px)" }}>
      <div className="flex flex-col rounded-lg overflow-hidden shadow-2xl"
        style={{ background: "#16151a", border: "1px solid #2a2830", maxWidth: "90vw" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #2a2830" }}>
          <h2 style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.1rem", color: "#e8e6e1" }}>Crop &amp; Resize</h2>
          <span className="text-xs" style={{ color: "#6b6870" }}>Drag handles to crop · Set output size below</span>
          <button onClick={onCancel} className="ml-6" style={{ color: "#6b6870" }}>✕</button>
        </div>

        {/* Canvas area */}
        <div className="p-6 flex flex-col gap-4" style={{ overflowY: "auto", maxHeight: "80vh" }}>
          <div className="relative select-none inline-block self-start"
            style={{ background: "#0d0d10", lineHeight: 0, border: "1px solid #2a2830" }}>
            <img ref={imgRef} src={src} alt="" draggable={false} onLoad={onImgLoad}
              style={{ display: "block", width: disp.w || "auto", height: disp.h || "auto", maxWidth: MAX_DISP }} />

            {disp.w > 0 && (
              <>
                {/* Dark overlay outside crop */}
                <svg className="absolute inset-0 pointer-events-none" width={disp.w} height={disp.h}
                  style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <mask id="crop-mask">
                      <rect width={disp.w} height={disp.h} fill="white" />
                      <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
                    </mask>
                  </defs>
                  <rect width={disp.w} height={disp.h} fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
                </svg>

                {/* Crop box border + move handle */}
                <div className="absolute"
                  style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, cursor: "move",
                    border: "1.5px solid rgba(212,168,67,0.9)", boxSizing: "border-box" }}
                  onMouseDown={(e) => startDrag("move", e)}>
                  {/* rule-of-thirds grid */}
                  {[1,2].map(i => (
                    <div key={"v"+i} className="absolute top-0 bottom-0" style={{ left: `${i*33.33}%`, width: 1, background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />
                  ))}
                  {[1,2].map(i => (
                    <div key={"h"+i} className="absolute left-0 right-0" style={{ top: `${i*33.33}%`, height: 1, background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />
                  ))}
                  {/* size label */}
                  <div className="absolute bottom-1 right-1 pointer-events-none px-1 rounded"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#d4a843", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                    {outW}×{outH}
                  </div>
                </div>

                {/* Resize handles */}
                {HANDLES.map(({ id, cursor, xPct, yPct }) => (
                  <div key={id}
                    style={{
                      position: "absolute",
                      left: crop.x + crop.w * xPct - 5,
                      top:  crop.y + crop.h * yPct - 5,
                      width: 10, height: 10,
                      background: "#d4a843",
                      border: "1.5px solid #0d0d10",
                      borderRadius: 2,
                      cursor,
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => startDrag(id, e)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#a8a5a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Output</span>
              <input type="number" className={inputNum} style={inputNumStyle} value={outW} min={1}
                onChange={(e) => handleOutW(parseInt(e.target.value) || 1)} />
              <span style={{ color: "#6b6870" }}>×</span>
              <input type="number" className={inputNum} style={inputNumStyle} value={outH} min={1}
                onChange={(e) => handleOutH(parseInt(e.target.value) || 1)} />
              <span className="text-xs" style={{ color: "#6b6870" }}>px</span>
            </div>
            <button type="button" onClick={() => setLockAspect((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
              style={{ background: lockAspect ? "#d4a84322" : "#1a191f", color: lockAspect ? "#d4a843" : "#6b6870", border: `1px solid ${lockAspect ? "#d4a84344" : "#2a2830"}` }}>
              {lockAspect ? "🔒" : "🔓"} Lock ratio
            </button>
            <button type="button" onClick={() => { setCrop({ x: 0, y: 0, w: disp.w, h: disp.h }); setOutW(nat.w); setOutH(nat.h); }}
              className="px-2 py-1 rounded text-xs"
              style={{ background: "#1a191f", color: "#6b6870", border: "1px solid #2a2830" }}>Reset</button>
            <div className="flex gap-3 ml-auto">
              <button onClick={onCancel} className="px-4 py-2 rounded text-sm"
                style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90"
                style={{ background: "#d4a843", color: "#0d0d10" }}>Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── dropzones ───────────────────────────────────────────────────────────────

function CoverDropzone({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setEditSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openEditor = async (src: string) => {
    setLoadError(null);
    setLoading(true);
    try {
      const dataUrl = await toLocalDataUrl(src);
      setEditSrc(dataUrl);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {editSrc && (
        <ImageEditor src={editSrc}
          onSave={(url) => { onChange(url); setEditSrc(null); }}
          onCancel={() => setEditSrc(null)} />
      )}
      <div className="col-span-2 flex gap-4 items-start">
        <label
          className="flex flex-col items-center justify-center rounded cursor-pointer transition-colors relative overflow-hidden shrink-0"
          style={{ width: 100, height: 140, background: dragging ? "#d4a84322" : "#1a191f", border: `2px dashed ${dragging ? "#d4a843" : "#2a2830"}` }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        >
          {value ? (
            <>
              <img src={value} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(13,13,16,0.7)" }}>
                <span className="text-xs" style={{ color: "#d4a843" }}>Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center px-2">
              <span className="text-2xl" style={{ color: dragging ? "#d4a843" : "#3a3848" }}>↓</span>
              <span className="text-xs leading-tight" style={{ color: dragging ? "#d4a843" : "#6b6870" }}>
                {dragging ? "Drop it!" : "Drag & drop or click"}
              </span>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </label>
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs" style={{ color: "#a8a5a0", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Cover Image</span>
          <span className="text-xs leading-relaxed" style={{ color: "#6b6870" }}>Drag or click to upload. Opens editor to crop &amp; zoom.</span>
          {value && (
            <>
              <div className="flex gap-2 mt-1 flex-wrap">
                <button type="button" onClick={() => openEditor(value)} disabled={loading} className="text-xs px-2 py-1 rounded"
                  style={{ color: "#d4a843", border: "1px solid #d4a84344", background: "#d4a84311", opacity: loading ? 0.6 : 1 }}>
                  {loading ? "Loading…" : "Edit crop"}
                </button>
                <button type="button" onClick={() => onChange("")} className="text-xs px-2 py-1 rounded"
                  style={{ color: "#f87171", border: "1px solid #f8717144", background: "#f8717111" }}>Remove</button>
              </div>
              {loadError && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{loadError}</p>}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,13,16,0.85)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className={`w-full rounded-lg overflow-hidden shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`}
        style={{ background: "#16151a", border: "1px solid #2a2830" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #2a2830" }}>
          <h2 style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.25rem", color: "#e8e6e1" }}>{title}</h2>
          <button onClick={onClose} style={{ color: "#6b6870" }}>✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── item form ───────────────────────────────────────────────────────────────

type ItemFormData = { title: string; status: Status; rating: string; year: string; genre: string; cover: string; notes: string };

function ItemForm({ initial, onSave, onCancel }: { initial: ItemFormData; onSave: (d: ItemFormData) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputClass = "w-full rounded px-3 py-2 text-sm outline-none";
  const inputStyle = { background: "#1a191f", border: "1px solid #2a2830", color: "#e8e6e1" };
  const labelStyle = { color: "#a8a5a0", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" as const };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col gap-1">
          <label style={labelStyle}>Title</label>
          <input className={inputClass} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. The Dark Knight" />
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Status</label>
          <select className={inputClass} style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Year</label>
          <input className={inputClass} style={inputStyle} type="number" value={form.year} onChange={(e) => set("year", e.target.value)} min="1800" max="2030" />
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Genre</label>
          <input className={inputClass} style={inputStyle} value={form.genre} onChange={(e) => set("genre", e.target.value)} placeholder="e.g. Sci-Fi" />
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Rating (1–10)</label>
          <input className={inputClass} style={inputStyle} type="number" value={form.rating} onChange={(e) => set("rating", e.target.value)} min="1" max="10" placeholder="Leave blank if unrated" />
        </div>
        <CoverDropzone value={form.cover} onChange={(v) => set("cover", v)} />
        <div className="col-span-2 flex flex-col gap-1">
          <label style={labelStyle}>Notes</label>
          <textarea className={inputClass} style={inputStyle} value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Personal thoughts, progress notes..." />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-sm font-medium" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded text-sm font-medium hover:opacity-90" style={{ background: "#d4a843", color: "#0d0d10" }}>Save</button>
      </div>
    </form>
  );
}

const BLANK_ITEM: ItemFormData = { title: "", status: "owned", rating: "", year: new Date().getFullYear().toString(), genre: "", cover: "", notes: "" };

// ─── manage types modal ──────────────────────────────────────────────────────

function ManageTypesModal({ types, folders, items, onSave, onClose }: {
  types: CollectionType[]; folders: Folder[]; items: MediaItem[];
  onSave: (types: CollectionType[]) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<CollectionType[]>(types);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("🎬");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);

  const countFor = (id: string) => {
    const folderIds = folders.filter((f) => f.typeId === id).map((f) => f.id);
    return items.filter((i) => folderIds.includes(i.folderId)).length;
  };

  const addType = () => {
    if (!newLabel.trim()) return;
    setDraft((d) => [...d, { id: uid(), label: newLabel.trim(), icon: newIcon }]);
    setNewLabel(""); setNewIcon("🎬"); setShowEmojiFor(null);
  };

  const inputStyle = { background: "#1a191f", border: "1px solid #2a2830", color: "#e8e6e1" };

  const EmojiPicker = ({ current, onPick }: { current: string; onPick: (e: string) => void }) => (
    <div className="absolute left-0 top-9 z-20 p-3 rounded shadow-xl grid grid-cols-4 gap-2"
      style={{ background: "#1a191f", border: "1px solid #2a2830", minWidth: "160px" }}>
      {EMOJI_OPTIONS.map((e) => (
        <button key={e} type="button" onClick={() => onPick(e)}
          className="w-9 h-9 text-xl rounded flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ background: e === current ? "#2a2830" : "transparent" }}>{e}</button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,13,16,0.85)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "#16151a", border: "1px solid #2a2830", maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #2a2830" }}>
          <h2 style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.25rem", color: "#e8e6e1" }}>Manage Types</h2>
          <button onClick={onClose} style={{ color: "#6b6870" }}>✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-2">
          {draft.map((t) => (
            <div key={t.id}>
              {deleteTarget === t.id ? (
                <div className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "#f8717111", border: "1px solid #f8717133" }}>
                  <span className="text-sm flex-1" style={{ color: "#f87171" }}>
                    Remove <strong>{t.label}</strong>?
                    {countFor(t.id) > 0 && <span style={{ color: "#a8a5a0" }}> ({countFor(t.id)} items will be lost)</span>}
                  </span>
                  <button onClick={() => setDeleteTarget(null)} className="text-xs px-2 py-1 rounded" style={{ background: "#1a191f", color: "#a8a5a0" }}>Keep</button>
                  <button onClick={() => { setDraft((d) => d.filter((x) => x.id !== t.id)); setDeleteTarget(null); }}
                    className="text-xs px-2 py-1 rounded" style={{ background: "#f87171", color: "#0d0d10" }}>Remove</button>
                </div>
              ) : editingId === t.id ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: "#1e1c24", border: "1px solid #2a2830" }}>
                  <div className="relative">
                    <button type="button" onClick={() => setShowEmojiFor(showEmojiFor === t.id ? null : t.id)}
                      className="w-8 h-8 rounded text-lg flex items-center justify-center" style={{ background: "#2a2830" }}>{editIcon}</button>
                    {showEmojiFor === t.id && <EmojiPicker current={editIcon} onPick={(e) => { setEditIcon(e); setShowEmojiFor(null); }} />}
                  </div>
                  <input className="flex-1 rounded px-2 py-1 text-sm outline-none" style={inputStyle}
                    value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (setDraft((d) => d.map((x) => x.id === t.id ? { ...x, label: editLabel, icon: editIcon } : x)), setEditingId(null))}
                    autoFocus />
                  <button onClick={() => { setDraft((d) => d.map((x) => x.id === t.id ? { ...x, label: editLabel, icon: editIcon } : x)); setEditingId(null); }}
                    className="text-xs px-2 py-1 rounded" style={{ background: "#d4a843", color: "#0d0d10" }}>Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 rounded" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2 rounded group/row" style={{ border: "1px solid transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2830")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
                  <span className="text-lg w-8 text-center">{t.icon}</span>
                  <span className="flex-1 text-sm" style={{ color: "#e8e6e1" }}>{t.label}</span>
                  <span className="text-xs" style={{ color: "#6b6870", fontFamily: "JetBrains Mono, monospace" }}>{countFor(t.id)}</span>
                  <button onClick={() => { setEditingId(t.id); setEditLabel(t.label); setEditIcon(t.icon); }}
                    className="text-xs px-2 py-1 rounded opacity-0 group-hover/row:opacity-100 transition-opacity" style={{ color: "#d4a843", border: "1px solid #d4a84344" }}>Edit</button>
                  <button onClick={() => setDeleteTarget(t.id)}
                    className="text-xs px-2 py-1 rounded opacity-0 group-hover/row:opacity-100 transition-opacity" style={{ color: "#f87171", border: "1px solid #f8717144" }}>Remove</button>
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #2a2830" }}>
            <p className="text-xs mb-3" style={{ color: "#6b6870", textTransform: "uppercase", letterSpacing: "0.05em" }}>Add New Type</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button type="button" onClick={() => setShowEmojiFor(showEmojiFor === "new" ? null : "new")}
                  className="w-8 h-8 rounded text-lg flex items-center justify-center" style={{ background: "#2a2830" }}>{newIcon}</button>
                {showEmojiFor === "new" && <EmojiPicker current={newIcon} onPick={(e) => { setNewIcon(e); setShowEmojiFor(null); }} />}
              </div>
              <input className="flex-1 rounded px-3 py-2 text-sm outline-none" style={inputStyle}
                value={newLabel} placeholder="e.g. Podcasts" onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addType()} />
              <button onClick={addType} disabled={!newLabel.trim()} className="px-3 py-2 rounded text-sm font-medium"
                style={{ background: newLabel.trim() ? "#d4a843" : "#2a2830", color: newLabel.trim() ? "#0d0d10" : "#6b6870" }}>Add</button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3 shrink-0" style={{ borderTop: "1px solid #2a2830" }}>
          <button onClick={onClose} className="px-4 py-2 rounded text-sm" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
          <button onClick={() => { onSave(draft); onClose(); }} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90" style={{ background: "#d4a843", color: "#0d0d10" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── sidebar tree ────────────────────────────────────────────────────────────

function FolderTree({
  folders, items, typeId, parentId = null, depth = 0,
  selectedFolderId, onSelectFolder,
}: {
  folders: Folder[]; items: MediaItem[]; typeId: string; parentId?: string | null; depth?: number;
  selectedFolderId: string | null; onSelectFolder: (id: string) => void;
}) {
  const children = folders.filter((f) => f.typeId === typeId && f.parentId === parentId);
  if (children.length === 0) return null;

  return (
    <>
      {children.map((folder) => {
        const subCount = items.filter((i) => {
          const allIds = [folder.id, ...getAllDescendantFolderIds(folder.id, folders)];
          return allIds.includes(i.folderId);
        }).length;
        const hasChildren = folders.some((f) => f.parentId === folder.id);
        const isSelected = selectedFolderId === folder.id;

        return (
          <div key={folder.id}>
            <button
              onClick={() => onSelectFolder(folder.id)}
              className="w-full flex items-center gap-1.5 py-1.5 rounded text-sm text-left transition-colors"
              style={{
                paddingLeft: `${(depth + 1) * 12 + 12}px`,
                paddingRight: "12px",
                background: isSelected ? "#1e1c24" : "transparent",
                color: isSelected ? "#e8e6e1" : "#6b6870",
              }}
            >
              <span className="text-xs opacity-50">{hasChildren ? "▸" : "·"}</span>
              <span className="flex-1 truncate">{folder.name}</span>
              <span className="text-xs shrink-0" style={{ fontFamily: "JetBrains Mono, monospace", color: "#3a3848" }}>{subCount}</span>
            </button>
            {isSelected || folders.some((f) => f.parentId === folder.id) ? (
              <FolderTree folders={folders} items={items} typeId={typeId} parentId={folder.id}
                depth={depth + 1} selectedFolderId={selectedFolderId} onSelectFolder={onSelectFolder} />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

// ─── media card ─────────────────────────────────────────────────────────────

function MediaCard({ item, onEdit, onDelete }: { item: MediaItem; onEdit: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative flex flex-col rounded overflow-hidden group"
      style={{ background: STATUS_COLORS[item.status] + "33", border: `2px solid ${STATUS_COLORS[item.status]}` }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative overflow-hidden" style={{ background: "#1a191f", paddingBottom: "148%" }}>
        <img src={item.cover || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop&auto=format"}
          alt={item.title} className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 transition-opacity duration-200"
          style={{ background: "linear-gradient(to top, rgba(13,13,16,0.95) 0%, rgba(13,13,16,0.3) 50%, transparent 100%)", opacity: hover ? 1 : 0.6 }} />
        {hover && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded flex items-center justify-center text-xs"
              style={{ background: "#0d0d10cc", color: "#d4a843", border: "1px solid #2a2830" }}>✎</button>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div>
          <h3 className="font-medium leading-tight text-sm" style={{ color: "#e8e6e1", fontFamily: "DM Serif Display, serif" }}>{item.title}</h3>
          {item.year && <p className="text-xs mt-0.5" style={{ color: "#6b6870" }}>{item.year}</p>}
        </div>
        {item.notes && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#a8a5a0" }}>{item.notes}</p>}
      </div>
      <div className="flex justify-center pb-3 px-3">
        <span className="text-xs px-3 py-0.5 rounded-sm font-medium"
          style={{ background: STATUS_COLORS[item.status] + "22", color: STATUS_COLORS[item.status], border: `1px solid ${STATUS_COLORS[item.status]}44`, fontFamily: "JetBrains Mono, monospace" }}>
          {STATUS_LABELS[item.status]}
        </span>
      </div>
    </div>
  );
}

// ─── folder cover dropzone ───────────────────────────────────────────────────

function FolderCoverDropzone({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setEditSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openEditor = async (src: string) => {
    setLoadError(null);
    setLoading(true);
    try {
      const dataUrl = await toLocalDataUrl(src);
      setEditSrc(dataUrl);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {editSrc && (
        <ImageEditor src={editSrc}
          onSave={(url) => { onChange(url); setEditSrc(null); }}
          onCancel={() => setEditSrc(null)} />
      )}
      <div className="flex flex-col gap-2">
        <label
          className="relative flex items-center justify-center rounded cursor-pointer overflow-hidden shrink-0 transition-colors"
          style={{ width: 120, height: 80, background: dragging ? "#d4a84322" : "#1a191f", border: `2px dashed ${dragging ? "#d4a843" : "#2a2830"}` }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        >
          {value ? (
            <>
              <img src={value} alt="folder cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(13,13,16,0.7)" }}>
                <span className="text-xs" style={{ color: "#d4a843" }}>Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center px-2">
              <span className="text-xl" style={{ color: dragging ? "#d4a843" : "#3a3848" }}>↓</span>
              <span className="text-xs leading-tight" style={{ color: dragging ? "#d4a843" : "#6b6870" }}>
                {dragging ? "Drop!" : "Drag or click"}
              </span>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </label>
        {value && (
          <button type="button" onClick={() => openEditor(value)} disabled={loading} className="text-xs px-2 py-1 rounded self-start"
            style={{ color: "#d4a843", border: "1px solid #d4a84344", background: "#d4a84311", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Loading…" : "Edit crop"}
          </button>
        )}
        {loadError && <p className="text-xs" style={{ color: "#f87171", maxWidth: 140 }}>{loadError}</p>}
      </div>
    </>
  );
}

// ─── folder card (shown in main area) ────────────────────────────────────────

function FolderCard({ folder, itemCount, subfolderCount, onClick, onRename, onDelete }: {
  folder: Folder; itemCount: number; subfolderCount: number;
  onClick: () => void; onRename: () => void; onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative flex flex-col rounded cursor-pointer overflow-hidden group"
      style={{ background: "#16151a", border: `1px solid ${hover ? "#3a3848" : "#2a2830"}`, transition: "border-color 0.15s" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}>
      <div className="relative overflow-hidden flex items-center justify-center" style={{ height: 100, background: "#1a191f" }}>
        {folder.cover ? (
          <>
            <img src={folder.cover} alt={folder.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,13,16,0.6) 0%, transparent 60%)" }} />
          </>
        ) : (
          <span className="text-4xl opacity-40">📁</span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium truncate" style={{ color: "#e8e6e1", fontFamily: "DM Serif Display, serif" }}>{folder.name}</p>
        <p className="text-xs" style={{ color: "#6b6870", fontFamily: "JetBrains Mono, monospace" }}>
          {subfolderCount > 0 ? `${subfolderCount} folder${subfolderCount !== 1 ? "s" : ""} · ` : ""}{itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>
      </div>
      {hover && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onRename(); }}
            className="w-7 h-7 rounded flex items-center justify-center text-xs"
            style={{ background: "#0d0d10cc", color: "#d4a843", border: "1px solid #2a2830" }}>✎</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded flex items-center justify-center text-xs"
            style={{ background: "#0d0d10cc", color: "#f87171", border: "1px solid #2a2830" }}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─── main app ────────────────────────────────────────────────────────────────

export default function App() {
  const [types, setTypes] = useState<CollectionType[]>(INITIAL_TYPES);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [items, setItems] = useState<MediaItem[]>(INITIAL_ITEMS);
  const [loaded, setLoaded] = useState(false);

  // load from server on mount
  useEffect(() => {
    loadFromServer().then((data) => {
      if (data) {
        setTypes(data.types);
        setFolders(data.folders);
        setItems(data.items);
      }
      setLoaded(true);
    });
  }, []);

  // sync to server whenever data changes (skip first render before load)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToServer(types, folders, items), 800);
  }, [types, folders, items, loaded]);

  // navigation
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["movie"]));

  // modals
  const [modal, setModal] = useState<"addItem" | "editItem" | "addFolder" | "renameFolder" | "deleteFolder" | "deleteItem" | "types" | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [targetFolder, setTargetFolder] = useState<Folder | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderCover, setNewFolderCover] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [renameFolderCover, setRenameFolderCover] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");


  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);

  // breadcrumb path for selected folder
  const breadcrumb = useMemo(() => {
    if (!selectedFolderId) return [];
    const path: Folder[] = [];
    let cur = folders.find((f) => f.id === selectedFolderId);
    while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? folders.find((f) => f.id === cur!.parentId) : undefined;
    }
    return path;
  }, [selectedFolderId, folders]);

  // subfolders visible in main area
  const visibleSubfolders = useMemo(() => {
    if (selectedFolderId) return folders.filter((f) => f.parentId === selectedFolderId);
    if (selectedTypeId) return folders.filter((f) => f.typeId === selectedTypeId && f.parentId === null);
    return [];
  }, [selectedFolderId, selectedTypeId, folders]);

  // items visible in main area (only when inside a folder)
  const visibleItems = useMemo(() => {
    if (!selectedFolderId) return [];
    return items.filter((i) => {
      if (i.folderId !== selectedFolderId) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }));
  }, [selectedFolderId, items, statusFilter, search]);

  const totalItems = useMemo(() => items.length, [items]);

  // ── actions ──

  const selectType = (id: string) => {
    setSelectedTypeId(id);
    setSelectedFolderId(null);
    setExpandedTypes((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectFolder = (id: string) => {
    const folder = folders.find((f) => f.id === id)!;
    setSelectedTypeId(folder.typeId);
    setSelectedFolderId(id);
    setExpandedTypes((s) => new Set([...s, folder.typeId]));
    setSidebarOpen(false);
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const typeId = selectedTypeId ?? (selectedFolderId ? folders.find((f) => f.id === selectedFolderId)?.typeId : null);
    if (!typeId) return;
    const newFolder: Folder = { id: uid(), name: newFolderName.trim(), typeId, parentId: selectedFolderId, cover: newFolderCover || undefined };
    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setNewFolderCover("");
    setModal(null);
  };

  const renameFolder = () => {
    if (!targetFolder || !renameFolderName.trim()) return;
    setFolders((prev) => prev.map((f) => f.id === targetFolder.id ? { ...f, name: renameFolderName.trim(), cover: renameFolderCover || undefined } : f));
    setModal(null);
    setTargetFolder(null);
  };

  const deleteFolder = (folder: Folder) => {
    const allIds = [folder.id, ...getAllDescendantFolderIds(folder.id, folders)];
    setFolders((prev) => prev.filter((f) => !allIds.includes(f.id)));
    setItems((prev) => prev.filter((i) => !allIds.includes(i.folderId)));
    if (selectedFolderId && allIds.includes(selectedFolderId)) {
      setSelectedFolderId(folder.parentId);
    }
    setModal(null);
    setTargetFolder(null);
  };

  const addItem = (data: ItemFormData) => {
    if (!selectedFolderId) return;
    setItems((prev) => [{
      id: uid(), folderId: selectedFolderId, title: data.title, status: data.status,
      rating: data.rating ? parseInt(data.rating) : null, year: parseInt(data.year),
      genre: data.genre, cover: data.cover, notes: data.notes,
      addedAt: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    setModal(null);
  };

  const editItem = (data: ItemFormData) => {
    if (!editingItem) return;
    setItems((prev) => prev.map((i) => i.id !== editingItem.id ? i : {
      ...i, title: data.title, status: data.status,
      rating: data.rating ? parseInt(data.rating) : null, year: parseInt(data.year),
      genre: data.genre, cover: data.cover, notes: data.notes,
    }));
    setModal(null); setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteItemId(null); setModal(null);
  };

  const handleSaveTypes = (newTypes: CollectionType[]) => {
    const removedIds = types.filter((t) => !newTypes.find((n) => n.id === t.id)).map((t) => t.id);
    if (removedIds.includes(selectedTypeId ?? "")) { setSelectedTypeId(null); setSelectedFolderId(null); }
    setFolders((prev) => prev.filter((f) => !removedIds.includes(f.typeId)));
    setItems((prev) => prev.filter((i) => {
      const folder = folders.find((f) => f.id === i.folderId);
      return folder && !removedIds.includes(folder.typeId);
    }));
    setTypes(newTypes);
  };

  const editForm: ItemFormData = editingItem
    ? { title: editingItem.title, status: editingItem.status, rating: editingItem.rating?.toString() ?? "", year: editingItem.year.toString(), genre: editingItem.genre, cover: editingItem.cover, notes: editingItem.notes }
    : BLANK_ITEM;

  const currentType = selectedTypeId ? typeMap[selectedTypeId] : null;
  const currentFolder = selectedFolderId ? folders.find((f) => f.id === selectedFolderId) : null;
  const deletingFolder = targetFolder;

  // ── render ──

  const inputStyle = { background: "#1a191f", border: "1px solid #2a2830", color: "#e8e6e1" };

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0d0d10", color: "#6b6870", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d0d10", color: "#e8e6e1" }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 md:hidden" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col shrink-0 h-full overflow-y-auto fixed md:relative z-30 md:z-auto transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: 240, background: "#0d0d10", borderRight: "1px solid #2a2830" }}>
        <div className="px-5 py-6 flex items-start justify-between">
          <div>
            <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#e8e6e1" }}>Collections</h1>
            <p className="text-xs mt-0.5" style={{ color: "#6b6870", fontFamily: "JetBrains Mono, monospace" }}>{totalItems} items</p>
          </div>
          <button className="md:hidden mt-1 w-8 h-8 flex items-center justify-center rounded"
            style={{ color: "#6b6870", border: "1px solid #2a2830" }}
            onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          <div className="mb-1 px-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: "#3a3848", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>Library</span>
            <button onClick={() => setModal("types")} className="text-xs px-1.5 py-0.5 rounded" style={{ color: "#6b6870", border: "1px solid #2a2830" }} title="Manage types">⚙</button>
          </div>

          {types.map((type) => {
            const isExpanded = expandedTypes.has(type.id);
            const isActive = selectedTypeId === type.id;
            return (
              <div key={type.id}>
                <button
                  onClick={() => selectType(type.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors text-left"
                  style={{ background: isActive && !selectedFolderId ? "#1e1c24" : "transparent", color: isActive ? "#e8e6e1" : "#6b6870" }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs transition-transform" style={{ display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "none" }}>▸</span>
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </button>
                {isExpanded && (
                  <FolderTree folders={folders} items={items} typeId={type.id}
                    selectedFolderId={selectedFolderId} onSelectFolder={selectFolder} />
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 mt-auto" style={{ borderTop: "1px solid #2a2830" }}>
          <p className="text-xs" style={{ color: "#3a3848", fontFamily: "JetBrains Mono, monospace" }}>v1.0 · Personal Server</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Top bar */}
        <header className="flex flex-col shrink-0 px-4 md:px-6 py-3 gap-2" style={{ borderBottom: "1px solid #2a2830" }}>
          {/* Row 1: hamburger + action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded shrink-0"
              style={{ color: "#d4a843", border: "1px solid #2a2830", background: "#1a191f", fontSize: "1.1rem" }}
              onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="flex-1" />
            {selectedTypeId && (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => { setNewFolderName(""); setModal("addFolder"); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ background: "#1e1c24", color: "#d4a843", border: "1px solid #2a2830" }}>
                  <span>📁</span><span>New Folder</span>
                </button>
                {selectedFolderId && (
                  <button onClick={() => setModal("addItem")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium hover:opacity-90"
                    style={{ background: "#d4a843", color: "#0d0d10" }}>
                    <span>+</span><span>Add Item</span>
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Row 2: filter (only when in a folder) */}
          {selectedFolderId && (
            <div className="flex items-center gap-2 flex-wrap">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
                className="px-2 py-2 rounded text-sm outline-none"
                style={{ background: "#1a191f", border: "1px solid #2a2830", color: "#e8e6e1" }}>
                <option value="all">All</option>
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedTypeId ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <span className="text-5xl opacity-20">📚</span>
              <p style={{ color: "#6b6870" }}>Choose a library from the sidebar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Subfolders */}
              {visibleSubfolders.length > 0 && (
                <div>
                  {selectedFolderId && (
                    <p className="text-xs mb-3 px-0.5" style={{ color: "#6b6870", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>Folders</p>
                  )}
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                    {visibleSubfolders.map((folder) => {
                      const subfolderCount = folders.filter((f) => f.parentId === folder.id).length;
                      const allIds = [folder.id, ...getAllDescendantFolderIds(folder.id, folders)];
                      const itemCount = items.filter((i) => allIds.includes(i.folderId)).length;
                      return (
                        <FolderCard key={folder.id} folder={folder} itemCount={itemCount} subfolderCount={subfolderCount}
                          onClick={() => selectFolder(folder.id)}
                          onRename={() => { setTargetFolder(folder); setRenameFolderName(folder.name); setRenameFolderCover(folder.cover ?? ""); setModal("renameFolder"); }}
                          onDelete={() => { setTargetFolder(folder); setModal("deleteFolder"); }} />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              {selectedFolderId && (
                <div>
                  {visibleSubfolders.length > 0 && (
                    <p className="text-xs mb-3 px-0.5" style={{ color: "#6b6870", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>Items</p>
                  )}
                  {visibleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <span className="text-3xl opacity-20">📭</span>
                      <p className="text-sm" style={{ color: "#6b6870" }}>No items in this folder</p>
                      <button onClick={() => setModal("addItem")} className="text-sm px-4 py-2 rounded"
                        style={{ background: "#1e1c24", color: "#d4a843", border: "1px solid #2a2830" }}>Add first item</button>
                    </div>
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                      {visibleItems.map((item) => (
                        <MediaCard key={item.id} item={item}
                          onEdit={() => { setEditingItem(item); setModal("editItem"); }}
                          onDelete={() => { setDeleteItemId(item.id); setModal("deleteItem"); }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty type */}
              {visibleSubfolders.length === 0 && !selectedFolderId && (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <span className="text-4xl opacity-20">📁</span>
                  <p style={{ color: "#6b6870" }}>No folders yet</p>
                  <button onClick={() => { setNewFolderName(""); setModal("addFolder"); }}
                    className="text-sm px-4 py-2 rounded" style={{ background: "#1e1c24", color: "#d4a843", border: "1px solid #2a2830" }}>
                    Create first folder
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ── */}

      {modal === "addFolder" && (
        <Modal title={`New Folder${currentFolder ? ` in ${currentFolder.name}` : currentType ? ` in ${currentType.label}` : ""}`} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#a8a5a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Folder Name</label>
              <input autoFocus className="w-full rounded px-3 py-2 text-sm outline-none" style={inputStyle}
                value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFolder()} placeholder="e.g. Action" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#a8a5a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cover Image</label>
              <div className="flex gap-4 items-start">
                <FolderCoverDropzone value={newFolderCover} onChange={setNewFolderCover} />
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-xs leading-relaxed" style={{ color: "#6b6870" }}>Drag an image or click to browse. Stored locally.</span>
                  {newFolderCover && (
                    <button type="button" onClick={() => setNewFolderCover("")} className="text-xs px-2 py-1 rounded self-start"
                      style={{ color: "#f87171", border: "1px solid #f8717144", background: "#f8717111" }}>Remove image</button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded text-sm" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
              <button onClick={addFolder} disabled={!newFolderName.trim()} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90"
                style={{ background: newFolderName.trim() ? "#d4a843" : "#2a2830", color: newFolderName.trim() ? "#0d0d10" : "#6b6870" }}>Create</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "renameFolder" && targetFolder && (
        <Modal title="Edit Folder" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#a8a5a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Folder Name</label>
              <input autoFocus className="w-full rounded px-3 py-2 text-sm outline-none" style={inputStyle}
                value={renameFolderName} onChange={(e) => setRenameFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && renameFolder()} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#a8a5a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cover Image</label>
              <div className="flex gap-4 items-start">
                <FolderCoverDropzone value={renameFolderCover} onChange={setRenameFolderCover} />
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-xs leading-relaxed" style={{ color: "#6b6870" }}>Drag an image or click to browse. Stored locally.</span>
                  {renameFolderCover && (
                    <button type="button" onClick={() => setRenameFolderCover("")} className="text-xs px-2 py-1 rounded self-start"
                      style={{ color: "#f87171", border: "1px solid #f8717144", background: "#f8717111" }}>Remove image</button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded text-sm" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
              <button onClick={renameFolder} className="px-4 py-2 rounded text-sm font-medium hover:opacity-90" style={{ background: "#d4a843", color: "#0d0d10" }}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "deleteFolder" && deletingFolder && (
        <Modal title="Delete Folder" onClose={() => setModal(null)}>
          <p className="text-sm mb-6" style={{ color: "#a8a5a0" }}>
            Delete <strong style={{ color: "#e8e6e1" }}>{deletingFolder.name}</strong>?
            {(() => {
              const allIds = [deletingFolder.id, ...getAllDescendantFolderIds(deletingFolder.id, folders)];
              const n = items.filter((i) => allIds.includes(i.folderId)).length;
              const f = allIds.length - 1;
              return (n > 0 || f > 0) && <span> This will also remove {f > 0 ? `${f} subfolder${f !== 1 ? "s" : ""} and ` : ""}{n} item{n !== 1 ? "s" : ""}.</span>;
            })()}
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded text-sm" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
            <button onClick={() => deleteFolder(deletingFolder)} className="px-4 py-2 rounded text-sm font-medium"
              style={{ background: "#f8717122", color: "#f87171", border: "1px solid #f8717144" }}>Delete</button>
          </div>
        </Modal>
      )}

      {modal === "addItem" && selectedFolderId && (
        <Modal title="Add Item" onClose={() => setModal(null)} wide>
          <ItemForm initial={BLANK_ITEM} onSave={addItem} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal === "editItem" && editingItem && (
        <Modal title={`Edit — ${editingItem.title}`} onClose={() => { setModal(null); setEditingItem(null); }} wide>
          <ItemForm initial={editForm} onSave={editItem} onCancel={() => { setModal(null); setEditingItem(null); }} />
        </Modal>
      )}

      {modal === "deleteItem" && deleteItemId && (
        <Modal title="Remove Item" onClose={() => setModal(null)}>
          <p className="text-sm mb-6" style={{ color: "#a8a5a0" }}>
            Remove <strong style={{ color: "#e8e6e1" }}>{items.find((i) => i.id === deleteItemId)?.title}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded text-sm" style={{ background: "#1a191f", color: "#a8a5a0", border: "1px solid #2a2830" }}>Cancel</button>
            <button onClick={() => deleteItem(deleteItemId)} className="px-4 py-2 rounded text-sm font-medium"
              style={{ background: "#f8717122", color: "#f87171", border: "1px solid #f8717144" }}>Remove</button>
          </div>
        </Modal>
      )}

      {modal === "types" && (
        <ManageTypesModal types={types} folders={folders} items={items} onSave={handleSaveTypes} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
