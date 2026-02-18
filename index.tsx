// ============================================================
// AARYELLE — Sacred Luxury
// Awwwards-Level Frontend: GSAP 3 + Lenis + React 19
// Design System: Liquid Glass · Cormorant · Sacred Dark
// ============================================================

import React, {
  useState, useEffect, useRef, useCallback,
  createContext, useContext, type ReactNode
} from "react";
import { createRoot } from "react-dom/client";
import {
  ShoppingBag, X, ArrowRight, Menu,
  Volume2, VolumeX, Minus, Plus, Star, Sparkles,
  ChevronLeft, ChevronRight, Send, Heart, Search,
  Truck, Award, RotateCcw, ShieldCheck
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Respect user's motion preferences — skip heavy GSAP animations if needed
const REDUCED_MOTION = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================================
// TYPES
// ============================================================

type ViewState = "HOME" | "COLLECTION" | "ORACULUM" | "MANIFESTO";
interface Product { id: number; name: string; category: string; price: number; image: string; desc: string; year: string; }
interface CartItem { product: Product; quantity: number; }
interface ToastData { id: number; message: string; }

// ============================================================
// CONFIG + DATA
// ============================================================

const API_KEY = process.env.API_KEY;

const PRODUCTS: Product[] = [
  { id: 1, name: "Shubh Labh", category: "Festive Decor", price: 1499, image: "/assets/product1_shubh_labh.jpg", desc: "Handcrafted resin Shubh Labh wall hanging with intricate gold calligraphy and auspicious motifs. Perfect for Diwali decor and housewarming gifts.", year: "2025" },
  { id: 2, name: "Ganesha Idol", category: "Religious Idols", price: 2999, image: "/assets/product2_ganesha_idol.jpg", desc: "Premium resin Lord Ganesha murti with hand-applied gold leaf detailing. A divine centrepiece for your mandir or living room.", year: "2025" },
  { id: 3, name: "Designer Toran", category: "Torans", price: 899, image: "/assets/product3_designer_toran.jpg", desc: "Traditional Indian door toran adorned with colourful beads, mirrors, and silk tassels. Welcomes prosperity into your home.", year: "2025" },
  { id: 4, name: "Krishna Murti", category: "Religious Idols", price: 3499, image: "/assets/product4_krishna_murti.jpg", desc: "Elegant Lord Krishna playing the divine flute, crafted in premium resin with a marble-finish base. Ideal for pooja rooms and gifting.", year: "2025" },
  { id: 5, name: "Mandala Wall Art", category: "Interior Art", price: 1999, image: "/assets/product5_mandala_art.jpg", desc: "Hand-painted resin mandala wall piece in gold and emerald tones. Brings harmony and elegance to any interior space.", year: "2025" },
  { id: 6, name: "Lakshmi Diya Set", category: "Festive Decor", price: 1299, image: "/assets/product6_lakshmi_diya.jpg", desc: "Resin Goddess Lakshmi figurine with a set of decorative diyas. Illuminate your pooja room with divine grace this festive season.", year: "2025" },
  { id: 7, name: "Diwali Toran", category: "Torans", price: 1099, image: "/assets/product3_designer_toran.jpg", desc: "Festive Diwali toran with golden marigold motifs and vibrant tassel work. A stunning welcome piece for the doorway during the festival of lights.", year: "2025" },
  { id: 8, name: "Lakshmi Idol", category: "Religious Idols", price: 2499, image: "/assets/product6_lakshmi_diya.jpg", desc: "Sacred Goddess Lakshmi murti in premium resin with 24k gold accents. Invite abundance and blessings into your home shrine.", year: "2025" },
  { id: 9, name: "Swastik Wall Plaque", category: "Festive Decor", price: 799, image: "/assets/product1_shubh_labh.jpg", desc: "Auspicious swastik wall plaque with hand-embossed gold detailing. A timeless symbol of prosperity and good fortune for your entrance.", year: "2025" },
  { id: 10, name: "Golden Mandala Frame", category: "Interior Art", price: 2799, image: "/assets/product5_mandala_art.jpg", desc: "Large format mandala art piece with real gold leaf highlights. A statement wall installation that transforms any living space into a sanctuary.", year: "2025" },
  { id: 11, name: "Radha Krishna Set", category: "Religious Idols", price: 4499, image: "/assets/product4_krishna_murti.jpg", desc: "Divine Radha Krishna pair in eternal embrace, hand-sculpted in premium resin. A cherished centrepiece for mandirs and gifting occasions.", year: "2025" },
  { id: 12, name: "Pearl Toran", category: "Torans", price: 1399, image: "/assets/product3_designer_toran.jpg", desc: "Elegant pearl-finish toran with intricate beadwork and silver thread embroidery. Adds a touch of royal grace to your doorway.", year: "2025" },
];

const STATS = [
  { label: "Master Artisans", value: 50, suffix: "+" },
  { label: "Pieces Crafted", value: 10000, suffix: "+" },
  { label: "Happy Homes", value: 5000, suffix: "+" },
  { label: "Cities Served", value: 100, suffix: "+" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", location: "Mumbai", rating: 5, product: "Ganesha Idol", text: "The Ganesha idol is absolutely divine. The gold detailing is exquisite and it has become the centrepiece of our mandir." },
  { name: "Rajesh Patel", location: "Ahmedabad", rating: 5, product: "Shubh Labh", text: "Ordered the Shubh Labh for Diwali and it exceeded all expectations. Beautiful craftsmanship and premium quality." },
  { name: "Ananya Reddy", location: "Bangalore", rating: 5, product: "Mandala Wall Art", text: "The mandala wall art transformed our living room. Every guest asks where we got it from. Truly elegant!" },
  { name: "Deepak Joshi", location: "Delhi", rating: 5, product: "Krishna Murti", text: "The Krishna murti is breathtaking. The marble-finish base adds such sophistication. A perfect gift for my mother." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Design", desc: "Each piece begins as a hand-drawn sketch, inspired by centuries-old Indian art traditions." },
  { step: "02", title: "Sculpt", desc: "Master artisans sculpt every detail with precision using premium resin materials." },
  { step: "03", title: "Finish", desc: "Gold leaf, hand-painting, and meticulous finishing bring each piece to life." },
  { step: "04", title: "Deliver", desc: "Carefully packaged and delivered to your doorstep, ready to grace your home." },
];

// ============================================================
// TOAST CONTEXT
// ============================================================

const ToastContext = createContext<{ addToast: (msg: string) => void }>({ addToast: () => {} });
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(0);
  const addToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[10001] flex flex-col gap-3" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast-enter glass-card px-5 py-3.5 flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
            <span className="font-sans text-[11px] tracking-widest text-ivory uppercase">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ============================================================
// CART CONTEXT
// ============================================================

interface CartContextType {
  items: CartItem[]; addItem: (p: Product) => void; removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void; total: number;
  itemCount: number; isOpen: boolean; setIsOpen: (o: boolean) => void;
}
const CartContext = createContext<CartContextType | null>(null);
const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);
  const removeItem = useCallback((productId: number) => setItems(prev => prev.filter(i => i.product.id !== productId)), []);
  const updateQuantity = useCallback((productId: number, delta: number) =>
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0)), []);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, itemCount, isOpen, setIsOpen }}>{children}</CartContext.Provider>;
};

// ============================================================
// WISHLIST CONTEXT
// ============================================================

const WishlistContext = createContext<{ ids: Set<number>; toggle: (id: number) => void; has: (id: number) => boolean }>({ ids: new Set(), toggle: () => {}, has: () => false });
const useWishlist = () => useContext(WishlistContext);
const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const toggle = useCallback((id: number) => setIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const has = useCallback((id: number) => ids.has(id), [ids]);
  return <WishlistContext.Provider value={{ ids, toggle, has }}>{children}</WishlistContext.Provider>;
};

// ============================================================
// CUSTOM HOOKS
// ============================================================


/** useScramble — character scramble that settles into the real text on hover */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
const useScramble = (target: string, trigger: boolean, speed = 35) => {
  const [display, setDisplay] = useState(target);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!trigger || REDUCED_MOTION) { setDisplay(target); return; }
    let frame = 0;
    const totalFrames = Math.ceil((target.length * speed) / 16);
    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const settled = Math.floor(progress * target.length);
      setDisplay(target.split("").map((ch, i) => {
        if (i < settled) return ch;
        if (ch === " ") return " ";
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join(""));
      if (frame < totalFrames) raf.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, speed]);
  return display;
};

/** ScrambleText — wraps text with hover-triggered scramble reveal */
const ScrambleText = ({ text, className = "", tag: Tag = "span", style }: {
  text: string; className?: string; tag?: React.ElementType; style?: React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  const scrambled = useScramble(text, hovered);
  return (
    <Tag className={className} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ fontVariantNumeric: "tabular-nums", ...style }} aria-label={text}>
      {scrambled}
    </Tag>
  );
};

const useTypewriter = (text: string | null, speed = 20) => {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    if (!text) { setDisplayed(""); setIsDone(false); return; }
    setDisplayed(""); setIsDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setIsDone(true); clearInterval(timer); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return { displayed, isDone };
};

const useAudioEngine = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const initAudio = useCallback(() => {
    if (contextRef.current) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    contextRef.current = new Ctx();
    const analyser = contextRef.current.createAnalyser();
    analyser.fftSize = 32; analyserRef.current = analyser;
    setAudioEnabled(true);
    const osc = contextRef.current.createOscillator();
    const gain = contextRef.current.createGain();
    const filter = contextRef.current.createBiquadFilter();
    osc.type = "sawtooth"; osc.frequency.setValueAtTime(40, contextRef.current.currentTime);
    const lfo = contextRef.current.createOscillator();
    const lfoGain = contextRef.current.createGain(); lfoGain.gain.value = 2;
    lfo.frequency.value = 0.1; lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
    filter.type = "lowpass"; filter.frequency.setValueAtTime(100, contextRef.current.currentTime);
    gain.gain.setValueAtTime(0, contextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.012, contextRef.current.currentTime + 5);
    osc.connect(filter); filter.connect(gain);
    gain.connect(analyser); gain.connect(contextRef.current.destination);
    osc.start();
  }, []);
  const playClick = useCallback(() => {
    if (!contextRef.current || contextRef.current.state === "suspended") return;
    const osc = contextRef.current.createOscillator(); const gain = contextRef.current.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(150, contextRef.current.currentTime);
    gain.gain.setValueAtTime(0.04, contextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, contextRef.current.currentTime + 0.1);
    osc.connect(gain); gain.connect(contextRef.current.destination);
    osc.start(); osc.stop(contextRef.current.currentTime + 0.1);
  }, []);
  const playChord = useCallback(() => {
    if (!contextRef.current || contextRef.current.state === "suspended") return;
    [220, 277, 329].forEach((freq, i) => {
      const osc = contextRef.current!.createOscillator(); const gain = contextRef.current!.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(freq, contextRef.current!.currentTime);
      gain.gain.setValueAtTime(0, contextRef.current!.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, contextRef.current!.currentTime + 0.1 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, contextRef.current!.currentTime + 3);
      osc.connect(gain); gain.connect(contextRef.current!.destination);
      osc.start(); osc.stop(contextRef.current!.currentTime + 3);
    });
  }, []);
  const toggleAudio = useCallback(() => {
    if (!contextRef.current) initAudio();
    else if (contextRef.current.state === "running") { contextRef.current.suspend(); setAudioEnabled(false); }
    else { contextRef.current.resume(); setAudioEnabled(true); }
  }, [initAudio]);
  return { audioEnabled, toggleAudio, playClick, playChord, analyserRef };
};

// ============================================================
// AMBIENT CINEMATIC COMPONENTS
// ============================================================

/** AmbientAurora — slow-drifting radial gradient orbs layered in the background */
const AmbientAurora = () => {
  if (REDUCED_MOTION) return null;
  return (
    <div className="ambient-aurora" aria-hidden="true">
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />
      <div className="aurora-orb aurora-orb-4" />
    </div>
  );
};

// Pre-computed firefly positions to avoid recalculation per render
const FIREFLY_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 17 + i * i * 3) % 90}%`,
  top:  `${10 + (i * 23 + i * 7) % 80}%`,
  dur:  `${6 + (i * 3) % 8}s`,
  del:  `-${(i * 1.3) % 7}s`,
}));

/** FireflyField — 18 gold firefly dots floating with offset animations */
const FireflyField = () => {
  if (REDUCED_MOTION) return null;
  return (
    <div className="firefly-field" aria-hidden="true">
      {FIREFLY_DATA.map(f => (
        <div key={f.id} className="firefly"
          style={{ left: f.left, top: f.top, "--dur": f.dur, "--del": f.del } as React.CSSProperties} />
      ))}
    </div>
  );
};

// Pre-computed star positions
const STAR_DATA = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 29 + i * i * 7) % 100}%`,
  top:  `${(i * 37 + i * 11) % 100}%`,
  dur:  `${2 + (i * 0.7) % 4}s`,
  del:  `-${(i * 0.9) % 4}s`,
  size: i % 3 === 0 ? "3px" : "2px",
}));

/** StarField — 30 subtly twinkling gold star dots */
const StarField = () => {
  if (REDUCED_MOTION) return null;
  return (
    <div className="star-field" aria-hidden="true">
      {STAR_DATA.map(s => (
        <div key={s.id} className="star-dot"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, "--dur": s.dur, "--del": s.del } as React.CSSProperties} />
      ))}
    </div>
  );
};

/** ClickRipple — gold circular ink-drop ripple on every mouse click */
type Ripple = { id: number; x: number; y: number };
const ClickRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setRipples(r => [...r.slice(-5), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 950);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  if (REDUCED_MOTION) return null;
  return (
    <>
      {ripples.map(r => (
        <div key={r.id} className="ink-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </>
  );
};

/** ScanLine — slow horizontal gold scan line sweeping down */
const ScanLine = () => {
  if (REDUCED_MOTION) return null;
  return <div className="scan-line" aria-hidden="true" />;
};

// ============================================================
// GSAP-POWERED CINEMATIC COMPONENTS
// ============================================================

/** Reveal — GSAP ScrollTrigger fade-up with cleanup */
const Reveal = ({
  children, className = "", y = 60, delay = 0, duration = 1.1, start = "top 90%",
}: {
  key?: React.Key; children: ReactNode; className?: string;
  y?: number; delay?: number; duration?: number; start?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (REDUCED_MOTION) { el.style.opacity = "1"; return; }
    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y });
      gsap.fromTo(el, { opacity: 0, y }, {
        opacity: 1, y: 0, duration, delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start, toggleActions: "play none none none" }
      });
    });
    return () => ctx.revert();
  }, [y, delay, duration, start]);
  return <div ref={ref} className={className}>{children}</div>;
};

/** ClipReveal — Cinematic clip-path wipe */
const ClipReveal = ({
  children, className = "", direction = "up", delay = 0, duration = 1.4,
}: {
  children: ReactNode; className?: string;
  direction?: "up" | "down" | "left" | "right"; delay?: number; duration?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const from = { up: "inset(100% 0% 0% 0%)", down: "inset(0% 0% 100% 0%)", left: "inset(0% 0% 0% 100%)", right: "inset(0% 100% 0% 0%)" }[direction];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (REDUCED_MOTION) { el.style.clipPath = "inset(0% 0% 0% 0%)"; return; }
    const ctx = gsap.context(() => {
      gsap.set(el, { clipPath: from });
      gsap.fromTo(el, { clipPath: from }, {
        clipPath: "inset(0% 0% 0% 0%)", duration, delay, ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
      });
    });
    return () => ctx.revert();
  }, [direction, delay, duration, from]);
  return <div ref={ref} className={className}>{children}</div>;
};

/** ImageParallax — Scroll-driven depth parallax */
const ImageParallax = ({
  src, alt, className = "", imgClassName = "", intensity = 18, loading = "lazy" as "lazy" | "eager",
  objectPosition = "object-top",
}: {
  src: string; alt: string; className?: string; imgClassName?: string; intensity?: number; loading?: "lazy" | "eager";
  objectPosition?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: intensity, ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    return () => ctx.revert();
  }, [intensity]);
  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <img ref={imgRef} src={src} alt={alt} loading={loading}
        className={`w-full h-full object-cover scale-[1.22] ${objectPosition} ${imgClassName}`} />
    </div>
  );
};

/** StaggerReveal — GSAP stagger entrance for children */
const StaggerReveal = ({
  children, className = "", staggerDelay = 0.1, y = 50, baseDelay = 0,
}: {
  children: ReactNode; className?: string; staggerDelay?: number; y?: number; baseDelay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ctx = gsap.context(() => {
      const items = Array.from(el.children);
      gsap.set(items, { opacity: 0, y });
      gsap.to(items, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        stagger: staggerDelay, delay: baseDelay,
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
      });
    });
    return () => ctx.revert();
  }, [staggerDelay, y, baseDelay]);
  return <div ref={ref} className={className}>{children}</div>;
};

/** SplitWords — Word-by-word reveal (each word clips upward through overflow-hidden parent) */
const SplitWords = ({
  text, className = "", delay = 0, stagger = 0.09, duration = 1.0, start = "top 88%",
}: {
  text: string; className?: string; delay?: number; stagger?: number; duration?: number; start?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const inners = el.querySelectorAll<HTMLElement>(".sw-in");
    if (REDUCED_MOTION) { inners.forEach(n => { n.style.transform = "translateY(0%)"; }); return; }
    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 108 });
      gsap.fromTo(inners, { yPercent: 108 }, {
        yPercent: 0, duration, stagger, delay, ease: "power4.out",
        scrollTrigger: { trigger: el, start, toggleActions: "play none none none" }
      });
    });
    return () => ctx.revert();
  }, [delay, stagger, duration, start]);
  const words = text.split(" ");
  return (
    <span ref={ref} className={`inline ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden" aria-hidden="true" style={{ verticalAlign: "bottom" }}>
          <span className="sw-in inline-block">{word}</span>
          {i < words.length - 1 && <span aria-hidden="true">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

/** SplitWordsHero — Same but fires immediately (no ScrollTrigger) for above-fold text */
const SplitWordsHero = ({
  text, className = "", delay = 0, stagger = 0.07, duration = 0.95,
}: {
  text: string; className?: string; delay?: number; stagger?: number; duration?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const inners = el.querySelectorAll<HTMLElement>(".swh-in");
    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 108 });
      gsap.fromTo(inners, { yPercent: 108 }, {
        yPercent: 0, duration, stagger, delay, ease: "power4.out",
      });
    });
    return () => ctx.revert();
  }, [delay, stagger, duration]);
  const words = text.split(" ");
  return (
    <span ref={ref} className={`inline ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden" aria-hidden="true" style={{ verticalAlign: "bottom" }}>
          <span className="swh-in inline-block">{word}</span>
          {i < words.length - 1 && <span aria-hidden="true">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

/** NumberScramble — Random digit scramble then settle */
const NumberScramble = ({ value, suffix = "", duration = 1800 }: { value: number; suffix?: string; duration?: number }) => {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const formatted = value.toLocaleString("en-IN");
        const digits = formatted.length;
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          if (progress < 0.65) {
            let s = "";
            for (let i = 0; i < digits; i++) { const c = formatted[i]; if (c === "," || c === ".") { s += c; continue; } s += Math.floor(Math.random() * 10); }
            setDisplay(s);
          } else {
            const sp = (progress - 0.65) / 0.35; const rc = Math.ceil(sp * digits); let r = "";
            for (let i = 0; i < digits; i++) { const c = formatted[i]; if (c === "," || c === ".") { r += c; continue; } if (i < rc) r += c; else r += Math.floor(Math.random() * 10); }
            setDisplay(r);
          }
          if (progress < 1) requestAnimationFrame(animate); else setDisplay(formatted);
        };
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);
  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
};

/** TiltCard — 3D mouse-tracking perspective */
const TiltCard = ({ children, className = "", intensity = 8 }: { children: ReactNode; className?: string; intensity?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    ref.current.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * intensity}deg) rotateY(${(x - 0.5) * intensity}deg)`;
    ref.current.style.setProperty("--shine-x", `${x * 100}%`);
    ref.current.style.setProperty("--shine-y", `${y * 100}%`);
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)"; };
  return (
    <div ref={ref} className={`tilt-card transition-transform duration-500 ease-out ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="tilt-card-shine" />{children}
    </div>
  );
};

// ============================================================
// ATMOSPHERE
// ============================================================

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // GSAP quickTo for silky elastic follower — true magnetic feel
    const xTo = gsap.quickTo(followRef.current, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(followRef.current, "y", { duration: 0.55, ease: "power3.out" });
    gsap.set(followRef.current, { xPercent: -50, yPercent: -50 });

    // Dot tracks instantly via direct style
    const dotXTo = gsap.quickTo(dotRef.current, "x", { duration: 0.12, ease: "power2.out" });
    const dotYTo = gsap.quickTo(dotRef.current, "y", { duration: 0.12, ease: "power2.out" });
    gsap.set(dotRef.current, { xPercent: -50, yPercent: -50 });

    let prevLabel = "";
    const move = (e: MouseEvent) => {
      const cx = e.clientX, cy = e.clientY;
      dotXTo(cx); dotYTo(cy);

      // Magnetic attraction: if near a magnetic element, pull follower toward it
      const target = e.target as HTMLElement;
      const magnetic = target.closest("[data-cursor], button, a, .interactive") as HTMLElement | null;
      if (magnetic) {
        const r = magnetic.getBoundingClientRect();
        const mx = r.left + r.width / 2, my = r.top + r.height / 2;
        const dx = cx - mx, dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(r.width, r.height) * 1.2;
        if (dist < maxDist) {
          const pull = 1 - dist / maxDist;
          xTo(cx - dx * pull * 0.38);
          yTo(cy - dy * pull * 0.38);
        } else { xTo(cx); yTo(cy); }
      } else { xTo(cx); yTo(cy); }

      const cursorEl = target.closest("[data-cursor]") as HTMLElement | null;
      const newLabel = cursorEl?.dataset.cursor ?? "";
      const isHovering = !!magnetic;
      followRef.current?.classList.toggle("active", isHovering);
      dotRef.current?.classList.toggle("expanded", isHovering);
      if (newLabel !== prevLabel) {
        prevLabel = newLabel;
        if (labelRef.current) {
          labelRef.current.style.opacity = newLabel ? "1" : "0";
          labelRef.current.textContent = newLabel;
        }
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block" aria-hidden="true" />
      <div ref={followRef} className="cursor-follower hidden md:block" aria-hidden="true">
        <span ref={labelRef} className="cursor-label" style={{ opacity: 0 }} />
      </div>
    </>
  );
};

const GoldDust = ({ analyserRef }: { analyserRef: React.RefObject<AnalyserNode | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handleMouse);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let width = (canvas.width = window.innerWidth), height = (canvas.height = window.innerHeight), rafId: number;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 1.4 + 0.4, baseAlpha: Math.random() * 0.3 + 0.04, pulse: Math.random() * Math.PI,
    }));
    const dataArray = new Uint8Array(32);
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let audioLevel = 0;
      if (analyserRef.current) { analyserRef.current.getByteFrequencyData(dataArray); audioLevel = dataArray[0] / 255; }
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      particles.forEach(p => {
        const dx = mx - p.x, dy = my - p.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { p.x -= dx * 0.007; p.y -= dy * 0.007; }
        p.x += p.vx; p.y += p.vy; p.pulse += 0.014;
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        const opacity = p.baseAlpha + Math.sin(p.pulse) * 0.12 + audioLevel * 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + audioLevel * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${Math.max(0, Math.min(1, opacity))})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(animate);
    };
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", handleResize); window.removeEventListener("mousemove", handleMouse); };
  }, [analyserRef]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true" />;
};

const ScrollProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Use GSAP ScrollTrigger's scroll proxy (Lenis-compatible) for accurate progress
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={barRef} className="scroll-progress" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Page scroll progress" />;
};

// ============================================================
// UI PRIMITIVES
// ============================================================

const Emblem = ({ className = "" }: { className?: string }) => (
  <img src="/assets/aaryelle_logo_clean.png" alt="Aaryelle" className={className} style={{ objectFit: "contain" }} />
);

const MagneticButton = ({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - (r.left + r.width / 2)) * 0.35, y: (e.clientY - (r.top + r.height / 2)) * 0.35 });
  };
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className={`transition-transform duration-300 ease-out interactive cursor-pointer ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      {children}
    </button>
  );
};

const Marquee = ({ text }: { text: string }) => {
  const [paused, setPaused] = useState(false);
  return (
    <div className="w-full overflow-hidden py-5 bg-noir border-y border-gold/8 cursor-default"
      aria-hidden="true" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="marquee-container" style={{ animationPlayState: paused ? "paused" : "running" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="marquee-content font-sans text-[11px] md:text-xs tracking-[0.45em] text-gold/55 uppercase"
            style={{ animationPlayState: paused ? "paused" : "running" }}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

const Divider = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || REDUCED_MOTION) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.6, ease: "power3.inOut", transformOrigin: "center center",
        scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play none none none" }
      });
    });
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className="divider-gold w-full" style={{ transformOrigin: "center", transform: REDUCED_MOTION ? "scaleX(1)" : "scaleX(0)" }} />;
};

// ============================================================
// TRANSITION
// ============================================================

const TransitionCurtain = ({ isActive, onTransitionEnd }: { isActive: boolean; onTransitionEnd: () => void }) => {
  const emblemRef = useRef<HTMLImageElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onTransitionEnd });
      // Shutters close
      tl.to([topRef.current, botRef.current], { yPercent: (_i, el) => el === topRef.current ? 0 : 0, duration: 0.55, ease: "power3.inOut", stagger: 0 })
        .set(topRef.current, { y: "0%" }).set(botRef.current, { y: "0%" });
      // Emblem pulse in at midpoint
      tl.fromTo(emblemRef.current, { opacity: 0, scale: 0.8, filter: "blur(6px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "power3.out" }, 0.3)
        .to(emblemRef.current, { opacity: 0, scale: 1.05, duration: 0.25, ease: "power2.in" }, 0.75);
    });
    return () => ctx.revert();
  }, [isActive, onTransitionEnd]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-[9000] overflow-hidden`} aria-hidden="true">
      <div ref={topRef} className="absolute top-0 left-0 right-0 h-1/2 bg-void transition-none"
        style={{ transform: isActive ? "translateY(0%)" : "translateY(-100%)", transition: "transform 0.55s cubic-bezier(0.85,0,0.15,1)" }} />
      <div ref={botRef} className="absolute bottom-0 left-0 right-0 h-1/2 bg-void"
        style={{ transform: isActive ? "translateY(0%)" : "translateY(100%)", transition: "transform 0.55s cubic-bezier(0.85,0,0.15,1)" }} />
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <img ref={emblemRef} src="/assets/aaryelle_logo_clean.png" alt="" className="h-20 w-auto object-contain opacity-0" />
        </div>
      )}
    </div>
  );
};

// ============================================================
// SEARCH OVERLAY
// ============================================================

const SearchOverlay = ({ onClose, onSelectProduct }: { onClose: () => void; onSelectProduct: (p: Product) => void }) => {
  const [query, setQuery] = useState("");
  const results = query.trim().length > 0
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    : PRODUCTS;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex flex-col" role="dialog" aria-label="Search">
      <div className="absolute inset-0 bg-void/95 backdrop-blur-lg" onClick={onClose} />
      <div className="relative z-10 max-w-2xl mx-auto w-full mt-20 md:mt-32 px-6">
        <div className="flex items-center gap-4 border-b border-gold/30 pb-4 mb-8">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent font-display text-2xl md:text-3xl text-ivory italic outline-none placeholder:text-ivory/20" />
          <button onClick={onClose} className="text-ivory/60 hover:text-gold interactive cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
          {results.map(p => (
            <button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }}
              className="text-left group interactive cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-2 bento-card">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="font-display text-sm text-ivory italic">{p.name}</p>
              <p className="font-body text-xs text-gold">₹{p.price.toLocaleString("en-IN")}</p>
            </button>
          ))}
          {results.length === 0 && <p className="col-span-3 font-display text-2xl text-ivory/50 italic text-center py-8">No results found</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// NAV ITEM — isolated so hooks run at component top level
// ============================================================

const NavItem = ({ item, isActive, onNavigate }: {
  item: { label: string; view: ViewState }; isActive: boolean; onNavigate: (v: ViewState) => void;
}) => {
  const [hov, setHov] = useState(false);
  const sc = useScramble(item.label.toUpperCase(), hov, 30);
  return (
    <button onClick={() => onNavigate(item.view)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`magnetic-link font-sans text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 interactive cursor-pointer group relative ${isActive ? "text-gold" : "text-ivory/55 hover:text-ivory"}`}
      aria-label={item.label} aria-current={isActive ? "page" : undefined}>
      {sc}
      {item.view === "ORACULUM" && (
        <span className="ml-2 font-sans text-[8px] text-ivory/20 tracking-[0.1em] border border-ivory/10 px-1 py-0.5 rounded-sm group-hover:border-gold/30 group-hover:text-gold/40 transition-colors duration-300" aria-hidden="true">K</span>
      )}
    </button>
  );
};

// ============================================================
// NAVIGATION
// ============================================================

const Navigation = ({ view, navigate, audioEnabled, toggleAudio, onSearchOpen }: {
  view: ViewState; navigate: (v: ViewState) => void; audioEnabled: boolean; toggleAudio: () => void; onSearchOpen: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const menuItems: { label: string; view: ViewState }[] = [
    { label: "Home", view: "HOME" }, { label: "Collection", view: "COLLECTION" },
    { label: "Ask Aaryelle", view: "ORACULUM" }, { label: "Our Story", view: "MANIFESTO" },
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // One-time nav entrance animation
  useEffect(() => {
    if (!navRef.current || REDUCED_MOTION) return;
    const ctx = gsap.context(() => {
      gsap.set(navRef.current, { y: -20, opacity: 0 });
      gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 });
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen]);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10002] focus:bg-gold focus:text-noir focus:px-4 focus:py-2 focus:font-sans focus:text-xs focus:tracking-widest">
        Skip to main content
      </a>
      <nav ref={navRef} className={`fixed top-0 w-full px-6 md:px-12 py-5 z-50 flex justify-between items-center transition-all duration-700 ${scrolled ? "glass-nav py-3.5" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-3 cursor-pointer group interactive" onClick={() => navigate("HOME")} role="button" tabIndex={0} aria-label="Home" onKeyDown={e => e.key === "Enter" && navigate("HOME")}>
          <Emblem className="h-10 md:h-14 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="hidden lg:flex items-center gap-9">
          {menuItems.map(item => (
            <NavItem key={item.label} item={item} isActive={view === item.view} onNavigate={navigate} />
          ))}
        </div>
        <div className="flex items-center gap-5">
          <button onClick={toggleAudio} className="hidden md:flex text-ivory/60 hover:text-gold transition-colors duration-300 interactive cursor-pointer" aria-label={audioEnabled ? "Mute" : "Enable audio"}>
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={onSearchOpen} className="hidden md:flex text-ivory/60 hover:text-gold transition-colors duration-300 interactive cursor-pointer" aria-label="Search">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => setCartOpen(true)} className="relative text-ivory/60 hover:text-gold transition-colors duration-300 interactive cursor-pointer" aria-label={`Cart (${itemCount})`}>
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-noir rounded-full flex items-center justify-center text-[8px] font-bold">{itemCount}</span>}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-ivory/60 hover:text-gold transition-colors duration-300 interactive cursor-pointer" aria-expanded={isOpen}>
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </nav>
      <div className={`fixed inset-0 bg-void z-40 transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} aria-hidden={!isOpen} role="dialog">
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-6 text-ivory/70 hover:text-gold transition-colors interactive cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
        <div className="h-full flex flex-col justify-center items-center gap-1">
          {menuItems.map((item, i) => (
            <button key={item.label} onClick={() => { setIsOpen(false); setTimeout(() => navigate(item.view), 300); }}
              className={`font-display text-5xl md:text-7xl transition-all duration-500 italic py-4 interactive cursor-pointer leading-tight ${view === item.view ? "text-gold" : "text-ivory/60 hover:text-gold"}`}
              tabIndex={isOpen ? 0 : -1} style={{ transitionDelay: `${i * 0.05}s` }}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] tracking-widest text-ivory/50 hover:text-gold uppercase interactive cursor-pointer">Instagram</a>
          <a href="https://wa.me/919819998988" target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] tracking-widest text-ivory/50 hover:text-gold uppercase interactive cursor-pointer">WhatsApp</a>
        </div>
      </div>
    </>
  );
};

// ============================================================
// CART DRAWER
// ============================================================

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, total, itemCount, isOpen, setIsOpen } = useCart();
  useEffect(() => {
    // Signal Lenis to stop/start via custom event (decoupled from App's lenisRef)
    document.dispatchEvent(new CustomEvent("lenis:toggle", { detail: { paused: isOpen } }));
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", h);
    return () => { document.removeEventListener("keydown", h); };
  }, [isOpen, setIsOpen]);
  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity duration-400 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsOpen(false)} aria-hidden="true" />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-noir border-l border-gold/10 z-[56] transition-transform duration-600 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-label="Shopping cart" aria-modal="true" aria-hidden={!isOpen}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-gold/8">
            <div>
              <h2 className="font-sans text-[11px] tracking-[0.25em] text-gold uppercase">Your Cart</h2>
              <p className="font-body text-ivory/70 text-sm mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          {/* Free shipping progress */}
          {(() => {
            const threshold = 1999;
            const remaining = Math.max(0, threshold - total);
            const progress = Math.min(100, (total / threshold) * 100);
            return (
              <div className="px-6 md:px-8 py-3 bg-warm/40 border-b border-gold/8">
                {remaining > 0 ? (
                  <p className="font-sans text-[10px] tracking-wider text-ivory/70 mb-2 uppercase">
                    Add ₹{remaining.toLocaleString("en-IN")} more for <span className="text-gold">free shipping</span>
                  </p>
                ) : (
                  <p className="font-sans text-[10px] tracking-wider text-gold mb-2 uppercase">You&apos;ve unlocked free shipping!</p>
                )}
                <div className="w-full h-1 bg-ivory/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })()}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-10 h-10 text-gold/15 mb-4" />
                <p className="font-display text-xl text-ivory/50 italic">Your cart is empty</p>
                <p className="font-sans text-[10px] text-ivory/20 tracking-widest mt-2 uppercase">Discover our collection</p>
              </div>
            ) : items.map(item => (
              <div key={item.product.id} className="flex gap-4 p-3 -m-3 hover:bg-white/[0.02] transition-colors rounded-sm">
                <img src={item.product.image} className="w-20 h-24 object-cover object-top opacity-85 shrink-0" alt={item.product.name} loading="lazy" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-ivory italic truncate">{item.product.name}</h3>
                  <p className="font-sans text-[10px] text-gold/60 tracking-widest mt-0.5 uppercase">{item.product.category}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 border border-ivory/10 flex items-center justify-center text-ivory/60 hover:border-gold hover:text-gold transition-colors interactive cursor-pointer"><Minus className="w-3 h-3" /></button>
                    <span className="font-body text-sm text-ivory w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 border border-ivory/10 flex items-center justify-center text-ivory/60 hover:border-gold hover:text-gold transition-colors interactive cursor-pointer"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="font-body text-sm text-gold mt-2">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="self-start text-ivory/15 hover:text-red-400 transition-colors interactive cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gold/8 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-[11px] tracking-widest text-ivory/60 uppercase">Total</span>
                <span className="font-display text-3xl text-gold italic">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <button className="w-full py-4 bg-gold text-noir font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold-light transition-colors interactive cursor-pointer">Checkout</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// ============================================================
// PRODUCT MODAL
// ============================================================

const ProductRitual = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { addToast } = useToast();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.4s_ease-out]" role="dialog" aria-modal="true" aria-label={`${product.name} details`}>
      <div className="absolute inset-0 bg-void/92 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[92vh] grid grid-cols-1 md:grid-cols-2 bg-noir border border-gold/10 overflow-hidden animate-[scaleReveal_0.5s_cubic-bezier(0.19,1,0.22,1)]">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer"><X className="w-5 h-5" /></button>
        <div ref={imgRef} className="relative w-full h-[50vh] md:h-auto md:min-h-[440px] overflow-hidden bg-noir flex items-center justify-center"
          onMouseMove={e => { if (imgRef.current) { const r = imgRef.current.getBoundingClientRect(); setMouse({ x: e.clientX - r.left, y: e.clientY - r.top }); } }}>
          <img src={product.image} alt={product.name}
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-700 ${imgLoaded ? "opacity-95" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)} />
          <div className="ritual-light" style={{ "--x": `${mouse.x}px`, "--y": `${mouse.y}px` } as React.CSSProperties} />
          <div className="absolute bottom-5 left-5 font-sans text-[10px] text-gold tracking-widest uppercase glass-card px-3 py-1.5">{product.category}</div>
        </div>
        <div className="p-6 md:p-12 lg:p-14 flex flex-col justify-center relative overflow-y-auto">
          <div className="font-sans text-gold/60 tracking-[0.3em] text-[10px] mb-3 uppercase">{product.year} / {product.category}</div>
          <h2 className="font-display text-4xl md:text-5xl text-ivory mb-5 leading-[0.95] italic">{product.name}</h2>
          <div className="w-12 h-px bg-gold/40 mb-5" />
          <p className="font-body text-ivory/70 text-base leading-[1.75] mb-8 max-w-md">{product.desc}</p>
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {["Handcrafted", "Premium Resin", "Gold Detailing", "Gift Ready"].map(f => (
              <div key={f} className="flex items-center gap-2 text-ivory/70">
                <div className="w-1 h-1 bg-gold/60 rounded-full shrink-0" />
                <span className="font-sans text-[10px] tracking-wider uppercase">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-gold/10 space-y-3">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="font-display text-3xl text-gold italic">₹{product.price.toLocaleString("en-IN")}</span>
              <div className="flex items-center border border-gold/20 rounded-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer" aria-label="Decrease quantity"><Minus className="w-3 h-3" /></button>
                <span className="w-8 text-center font-sans text-sm text-ivory tabular-nums">{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))} className="w-9 h-9 flex items-center justify-center text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer" aria-label="Increase quantity"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="flex-1 bg-gold text-noir px-7 py-3 font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-gold-light transition-colors text-center"
                onClick={() => { for (let i = 0; i < qty; i++) addItem(product); addToast(`${qty > 1 ? `${qty}× ` : ""}${product.name} added to cart`); onClose(); }}>
                Add to Cart
              </MagneticButton>
            </div>
            <a href={`https://wa.me/919819998988?text=Hi! I'm interested in ${encodeURIComponent(product.name)} (₹${product.price.toLocaleString("en-IN")})`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-gold/30 px-6 py-3 font-sans text-[10px] tracking-[0.2em] uppercase text-ivory/70 hover:text-gold hover:border-gold/60 transition-all interactive cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SECTIONS
// ============================================================
// HORIZONTAL GALLERY — GSAP Pinned Scroll Strip
// ============================================================

const HorizontalGallery = ({ products, onSelect }: { products: Product[]; onSelect: (p: Product) => void }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();

  useEffect(() => {
    // On touch devices, skip GSAP pin — native CSS scroll handles it
    if (isTouch || REDUCED_MOTION) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const ctx = gsap.context(() => {
      const getEnd = () => track.scrollWidth - window.innerWidth + 160;
      gsap.to(track, {
        x: () => -getEnd(),
        ease: "none",
        scrollTrigger: {
          trigger: section, pin: true, scrub: 1.2,
          end: () => `+=${getEnd()}`,
          invalidateOnRefresh: true,
        },
      });
      // Progress line fill
      const line = section.querySelector<HTMLElement>(".hgallery-progress-fill");
      if (line) {
        gsap.to(line, {
          scaleX: 1, ease: "none",
          scrollTrigger: {
            trigger: section, scrub: true,
            end: () => `+=${getEnd()}`,
            invalidateOnRefresh: true,
          },
        });
      }
    });
    return () => ctx.revert();
  }, [isTouch]);

  // Cards are shared between desktop (GSAP) and mobile (CSS scroll) layouts
  const GalleryCard = ({ p, i }: { p: Product; i: number }) => (
    <article
      className="group cursor-pointer interactive shrink-0 relative flex flex-col"
      style={{
        width: isTouch ? "clamp(240px, 75vw, 360px)" : "clamp(260px, 32vw, 480px)",
        height: isTouch ? "clamp(300px, 55vw, 480px)" : "clamp(340px, 55vh, 620px)",
      }}
      onClick={() => onSelect(p)}
      data-cursor="VIEW"
    >
      <div className="flex-1 relative overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy"
          className="w-full h-full object-cover object-top scale-[1.08] group-hover:scale-[1.14] transition-transform duration-[1400ms] ease-[cubic-bezier(0.19,1,0.22,1)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/10 to-transparent" />
        <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 interactive cursor-pointer"
          aria-label={inWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart className={`w-3.5 h-3.5 transition-colors ${inWishlist(p.id) ? "fill-gold text-gold" : "text-ivory/60"}`} />
        </button>
        <span className="absolute top-4 left-4 font-sans text-[10px] text-ivory/25 tracking-widest tabular-nums">
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="bg-noir px-5 py-5 border-t border-gold/8 group-hover:border-gold/20 transition-colors duration-500">
        <p className="font-sans text-[9px] tracking-[0.4em] text-gold uppercase mb-1.5">{p.category}</p>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl text-ivory italic truncate">{p.name}</h3>
          <span className="font-body text-sm text-gold shrink-0">₹{p.price.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </article>
  );

  return (
    <section ref={sectionRef} className="bg-void overflow-hidden" aria-label="Collection gallery">
      {/* ── Mobile: native CSS horizontal scroll ── */}
      {isTouch ? (
        <div className="py-16 px-6">
          <div className="mb-8">
            <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase mb-3">The Collection</p>
            <p className="font-display text-4xl text-ivory italic leading-none">Every Piece</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}>
            {products.map((p, i) => (
              <div key={p.id} className="snap-start shrink-0"><GalleryCard p={p} i={i} /></div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Desktop: GSAP pinned horizontal scroll ── */
        <div className="h-screen flex flex-col justify-center py-14 overflow-hidden">
          <div className="flex justify-between items-end px-8 md:px-14 mb-10 shrink-0">
            <div>
              <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase mb-3">The Collection</p>
              <p className="font-display text-4xl md:text-6xl text-ivory italic leading-none">
                <SplitWords text="Every Piece" start="top 95%" />
              </p>
            </div>
            <p className="font-sans text-[10px] tracking-[0.35em] text-ivory/25 uppercase">
              scroll to explore →
            </p>
          </div>

          <div ref={trackRef} className="flex items-stretch gap-5 pl-8 md:pl-14 pr-14" style={{ width: "max-content" }}>
            {products.map((p, i) => <GalleryCard key={p.id} p={p} i={i} />)}
            <div className="shrink-0 flex items-center justify-center px-16" style={{ height: "clamp(340px, 55vh, 620px)" }}>
              <div className="text-center">
                <div className="w-16 h-px bg-gold/30 mx-auto mb-6" />
                <p className="font-display text-2xl text-ivory/60 italic mb-2">That&apos;s all</p>
                <p className="font-sans text-[10px] text-ivory/20 tracking-widest uppercase">for now</p>
              </div>
            </div>
          </div>

          <div className="px-8 md:px-14 mt-8 shrink-0">
            <div className="w-full h-px bg-gold/8 relative overflow-hidden">
              <div className="hgallery-progress-fill absolute inset-y-0 left-0 w-full bg-gold/40 origin-left" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = TESTIMONIALS[active];

  // Auto-advance every 5s, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setActive(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="py-32 md:py-48 px-6 md:px-12 bg-noir relative" aria-label="Customer testimonials"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] mb-5 uppercase">Testimonials</p>
          <p className="font-display text-4xl md:text-5xl text-ivory italic">Loved by Thousands</p>
        </Reveal>
        <div key={active} className="text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="flex justify-center gap-1.5 mb-10">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-gold fill-gold" />)}</div>
          <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl text-ivory italic leading-[1.35] mb-10 max-w-3xl mx-auto">&ldquo;{t.text}&rdquo;</blockquote>
          <cite className="not-italic block">
            <div className="font-sans text-[11px] tracking-[0.25em] text-gold uppercase">{t.name}</div>
            <div className="font-body text-sm text-ivory/60 mt-1.5">{t.location} — {t.product}</div>
          </cite>
        </div>
        <div className="flex justify-center items-center gap-6 mt-14">
          <button onClick={() => setActive(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="w-11 h-11 border border-gold/20 rounded-full flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/50 transition-all interactive cursor-pointer" aria-label="Previous"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} role="tab" aria-selected={i === active} aria-label={`Testimonial ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-500 interactive cursor-pointer ${i === active ? "bg-gold w-8" : "bg-ivory/15 w-2 hover:bg-ivory/30"}`} />
            ))}
          </div>
          <button onClick={() => setActive(p => (p + 1) % TESTIMONIALS.length)}
            className="w-11 h-11 border border-gold/20 rounded-full flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/50 transition-all interactive cursor-pointer" aria-label="Next"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// INDIAN DECORATIVE COMPONENTS
// ============================================================

/** Floating marigold / lotus petals — deterministic (no Math.random in render) */
const PETAL_DATA = [
  { left: 8,  size: 7, dur: 14, del: 0,   px:  30, px2:  55, hue: "rgba(245,216,100,0.75)" },
  { left: 18, size: 5, dur: 11, del: 2.5, px: -20, px2: -45, hue: "rgba(201,169,110,0.70)" },
  { left: 30, size: 8, dur: 16, del: 1,   px:  45, px2:  80, hue: "rgba(230,190,80,0.65)"  },
  { left: 42, size: 6, dur: 13, del: 4,   px: -30, px2: -60, hue: "rgba(220,195,130,0.70)" },
  { left: 55, size: 9, dur: 18, del: 0.5, px:  25, px2:  50, hue: "rgba(245,210,90,0.60)"  },
  { left: 65, size: 5, dur: 12, del: 3,   px: -40, px2: -70, hue: "rgba(201,169,110,0.75)" },
  { left: 75, size: 7, dur: 15, del: 1.5, px:  35, px2:  60, hue: "rgba(240,200,100,0.65)" },
  { left: 85, size: 6, dur: 17, del: 5,   px: -25, px2: -50, hue: "rgba(210,175,95,0.70)"  },
  { left: 22, size: 5, dur: 10, del: 6,   px:  20, px2:  40, hue: "rgba(245,216,100,0.60)" },
  { left: 50, size: 8, dur: 19, del: 2,   px: -35, px2: -65, hue: "rgba(201,169,110,0.65)" },
  { left: 90, size: 6, dur: 13, del: 3.5, px:  28, px2:  52, hue: "rgba(230,185,75,0.70)"  },
  { left: 5,  size: 7, dur: 16, del: 7,   px: -18, px2: -38, hue: "rgba(245,210,110,0.60)" },
];

const FloatingPetals = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {PETAL_DATA.map((p, i) => (
      <div
        key={i}
        className="petal-float absolute"
        style={{
          left: `${p.left}%`,
          bottom: "-16px",
          width:  p.size,
          height: p.size * 0.55,
          background: `radial-gradient(ellipse at 35% 35%, ${p.hue}, rgba(201,169,110,0.25))`,
          borderRadius: "50% 0 50% 0",
          "--dur":  `${p.dur}s`,
          "--del":  `${p.del}s`,
          "--px":   `${p.px}px`,
          "--px2":  `${p.px2}px`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

/** Decorative rangoli dot cluster for section corners */
const RangoliDots = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none ${className}`} aria-hidden="true">
    {[0,1,2,3,4,5,6,7].map(i => {
      const angle = (i / 8) * Math.PI * 2;
      const r = 22;
      return (
        <div key={i} className="absolute rounded-full bg-gold/30"
          style={{
            width: 3, height: 3,
            left: `calc(50% + ${Math.cos(angle) * r}px - 1.5px)`,
            top:  `calc(50% + ${Math.sin(angle) * r}px - 1.5px)`,
            animation: `rangDot ${2 + i * 0.25}s ${i * 0.15}s ease-in-out infinite`,
          }} />
      );
    })}
    <div className="absolute rounded-full bg-gold/40"
      style={{ width: 4, height: 4, left: "calc(50% - 2px)", top: "calc(50% - 2px)", animation: "rangDot 2s ease-in-out infinite" }} />
  </div>
);

/** Mandala SVG — slow-rotating sacred geometry decoration */
const MandalaSVG = ({ size = 320, opacity = 0.055, className = "" }: { size?: number; opacity?: number; className?: string }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} className={`pointer-events-none ${className}`}
    style={{ opacity }} aria-hidden="true">
    {/* Outer ring */}
    <g className="mandala-ring" style={{ "--speed": "90s" } as React.CSSProperties}>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * 360;
        return <ellipse key={i} cx="100" cy="15" rx="3.5" ry="6" fill="#c9a96e"
          transform={`rotate(${a} 100 100)`} />;
      })}
      <circle cx="100" cy="100" r="83" fill="none" stroke="#c9a96e" strokeWidth="0.4" />
    </g>
    {/* Middle ring */}
    <g className="mandala-ring-rev" style={{ "--speed": "70s" } as React.CSSProperties}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * 360;
        return <path key={i} d="M100,38 L104,52 L100,48 L96,52 Z" fill="#c9a96e"
          transform={`rotate(${a} 100 100)`} />;
      })}
      <circle cx="100" cy="100" r="58" fill="none" stroke="#c9a96e" strokeWidth="0.3" />
    </g>
    {/* Inner lotus */}
    <g className="mandala-ring" style={{ "--speed": "50s" } as React.CSSProperties}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * 360;
        return <ellipse key={i} cx="100" cy="68" rx="4" ry="10" fill="none"
          stroke="#c9a96e" strokeWidth="0.5" transform={`rotate(${a} 100 100)`} />;
      })}
    </g>
    {/* Centre */}
    <circle cx="100" cy="100" r="7" fill="none" stroke="#c9a96e" strokeWidth="0.6" />
    <circle cx="100" cy="100" r="2.5" fill="#c9a96e" />
  </svg>
);

/** Paisley border divider — traditional Indian motif */
const PaisleyDivider = () => (
  <div className="w-full flex items-center justify-center gap-4 py-3 paisley-border" aria-hidden="true">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    <svg viewBox="0 0 60 20" width="60" height="20" className="text-gold/50 shrink-0">
      <path d="M30,10 C30,10 22,2 18,5 C14,8 16,14 20,13 C24,12 26,8 30,10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M30,10 C30,10 38,2 42,5 C46,8 44,14 40,13 C36,12 34,8 30,10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="30" cy="10" r="1.5" fill="currentColor" />
      <circle cx="8"  cy="10" r="1"   fill="currentColor" opacity="0.5" />
      <circle cx="52" cy="10" r="1"   fill="currentColor" opacity="0.5" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
  </div>
);

// ============================================================
// HOME VIEW — World-Class Editorial with GSAP
// ============================================================

const HomeView = ({ navigate, onSelectProduct }: { navigate: (v: ViewState) => void; onSelectProduct: (p: Product) => void }) => {
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const heroLabelRef = useRef<HTMLParagraphElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  // GSAP hero entrance + scroll-driven fade
  useEffect(() => {
    // Entrance timeline
    const entranceCtx = gsap.context(() => {
      gsap.set(heroLabelRef.current, { opacity: 0, y: 16 });
      gsap.set(line1Ref.current, { clipPath: "inset(0 0 100% 0)", y: 20 });
      gsap.set(line2Ref.current, { clipPath: "inset(0 0 100% 0)", y: 20 });
      gsap.set(heroSubRef.current, { opacity: 0, y: 22 });
      gsap.set(heroCTARef.current, { opacity: 0, y: 18 });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(heroLabelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" })
        .fromTo(line1Ref.current, { clipPath: "inset(0 0 100% 0)", y: 20 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.0, ease: "power4.out" }, "-=0.2")
        .fromTo(line2Ref.current, { clipPath: "inset(0 0 100% 0)", y: 20 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.0, ease: "power4.out" }, "-=0.72")
        .fromTo(heroSubRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .fromTo(heroCTARef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4");
    });

    // Scroll-driven hero parallax — text fades + video scale as you scroll past
    const scrollCtx = gsap.context(() => {
      const heroVideo = heroRef.current?.querySelector("video");
      // Hero text fades out gently
      gsap.to(heroTextRef.current, {
        opacity: 0, y: -50, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "30% top", end: "80% top", scrub: 1.2 }
      });
      // Background video slowly zooms in (parallax depth effect)
      if (heroVideo && !REDUCED_MOTION) {
        gsap.to(heroVideo, {
          scale: 1.12, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }
    });

    // Imperative mouse parallax — no React state, no re-renders
    const line1El = line1Ref.current?.querySelector("h1");
    const line2El = line2Ref.current?.querySelector("h1");
    const orbs = heroRef.current?.querySelectorAll<HTMLElement>(".hero-orb");
    const onMouse = (e: MouseEvent) => {
      const nX = (e.clientX / window.innerWidth) * 2 - 1;
      const nY = (e.clientY / window.innerHeight) * 2 - 1;
      if (line1El) line1El.style.transform = `translate3d(${nX * -4}px,${nY * -2}px,0)`;
      if (line2El) line2El.style.transform = `translate3d(${nX * 4}px,${nY * 2}px,0)`;
      // Orbs drift slowly on mouse
      orbs?.forEach((orb, i) => {
        const factor = (i + 1) * (i % 2 === 0 ? 1 : -1) * 6;
        orb.style.transform = `translate3d(${nX * factor}px, ${nY * factor * 0.6}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    return () => { entranceCtx.revert(); scrollCtx.revert(); window.removeEventListener("mousemove", onMouse); };
  }, []);

  return (
    <div className="relative">

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-noir overflow-hidden">
        {/* Full-screen background video */}
        {/* Hero fallback image (visible until video plays) */}
        <img src="/assets/product2_ganesha_idol.jpg" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: videoPlaying ? 0 : 0.65, transition: "opacity 1.8s ease" }} />
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoPlaying ? 0.72 : 0, transition: "opacity 1.8s ease", willChange: "transform" }}
          autoPlay muted loop playsInline preload="auto"
          poster="/assets/product2_ganesha_idol.jpg"
          aria-hidden="true"
          onPlaying={() => setVideoPlaying(true)}
          onCanPlay={(e) => { (e.target as HTMLVideoElement).play().catch(() => {}); }}
        >
          <source src="/assets/hero_video.mp4" type="video/mp4" />
        </video>
        {/* Cinematic overlays over video */}
        <div className="absolute inset-0 bg-gradient-to-r from-noir/75 via-noir/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-noir/25 pointer-events-none" />
        {/* Floating marigold petals */}
        <FloatingPetals />
        {/* Mandala decoration — top right */}
        <div className="absolute top-10 right-10 hidden lg:block" aria-hidden="true">
          <MandalaSVG size={260} opacity={0.07} />
        </div>
        {/* Mandala decoration — bottom left */}
        <div className="absolute bottom-16 left-6 hidden lg:block" aria-hidden="true">
          <MandalaSVG size={180} opacity={0.05} />
        </div>
        {/* Floating ambient orbs — mouse parallax via imperative DOM */}
        <div className="hero-orb absolute top-1/4 right-[15%] w-72 h-72 rounded-full pointer-events-none hidden lg:block"
          style={{ background: "radial-gradient(circle, rgba(26,74,46,0.18) 0%, rgba(201,169,110,0.06) 50%, transparent 70%)", filter: "blur(50px)", animation: "meshPulse1 18s ease-in-out infinite", willChange: "transform" }} aria-hidden="true" />
        <div className="hero-orb absolute bottom-1/3 left-[8%] w-56 h-56 rounded-full pointer-events-none hidden lg:block"
          style={{ background: "radial-gradient(circle, rgba(26,74,46,0.14) 0%, rgba(201,169,110,0.04) 50%, transparent 70%)", filter: "blur(40px)", animation: "meshPulse2 22s ease-in-out infinite", willChange: "transform" }} aria-hidden="true" />
        {/* Subtle horizontal line accent */}
        <div className="absolute top-[22%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/8 to-transparent pointer-events-none hidden lg:block" aria-hidden="true" />
        {/* Temple arch border — decorative top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" aria-hidden="true" />

        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-14 relative z-10
          flex items-center min-h-screen py-20 md:py-28">

          {/* Typography — full width, left-aligned */}
          <div ref={heroTextRef} className="max-w-3xl">
            <p ref={heroLabelRef}
              className="gold-shimmer-label font-sans text-[11px] tracking-[0.55em] uppercase mb-9">
              Handcrafted with Devotion
            </p>

            <div ref={line1Ref} style={{ clipPath: "inset(0 0 100% 0)", overflow: "hidden" }}>
              <ScrambleText text="Sacred" tag="h1"
                className="font-display leading-[0.85] tracking-[-0.02em] text-ivory block"
                style={{ fontSize: "clamp(56px, 10.5vw, 148px)", transition: "transform 0.12s linear" } as React.CSSProperties} />
            </div>

            <div ref={line2Ref} style={{ clipPath: "inset(0 0 100% 0)", overflow: "hidden" }}>
              <ScrambleText text="Craft" tag="h1"
                className="font-display leading-[0.85] tracking-[-0.02em] italic text-gradient-gold block"
                style={{ fontSize: "clamp(56px, 10.5vw, 148px)", transition: "transform 0.12s linear" } as React.CSSProperties} />
            </div>

            <div ref={heroSubRef} className="mt-6 md:mt-9 max-w-[480px]">
              <div className="w-10 h-px bg-gold/50 mb-5 md:mb-7" />
              <p className="font-body font-light text-ivory/85 text-[17px] md:text-[18px] leading-[1.75]">
                Where tradition meets artistry — handcrafted Indian art for your sacred spaces. Each piece tells a story of devotion.
              </p>
            </div>

            <div ref={heroCTARef} className="mt-7 md:mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton onClick={() => navigate("COLLECTION")}
                className="inline-flex items-center gap-3 bg-gold text-noir px-10 py-4 font-sans text-[11px] tracking-[0.22em] uppercase hover:bg-gold-light transition-colors">
                Explore Collection <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
              <MagneticButton onClick={() => navigate("MANIFESTO")}
                className="inline-flex items-center gap-3 border border-gold/30 text-ivory/85 px-8 py-4 font-sans text-[11px] tracking-[0.22em] uppercase hover:border-gold/55 hover:text-gold transition-all">
                Our Story
              </MagneticButton>
              {/* Social proof strip */}
              <div className="w-full mt-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-warm border border-gold/20 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-gold fill-gold" aria-hidden="true" />)}
                </div>
                <span className="font-sans text-[10px] text-ivory/55 tracking-[0.15em] uppercase">Loved by 5,000+ homes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="w-px h-14 bg-gradient-to-b from-gold/45 to-transparent animate-[breathe_2.5s_ease-in-out_infinite]" />
          <span className="font-sans text-[9px] tracking-[0.35em] text-gold/40 uppercase">Scroll</span>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <Marquee text="Shubh Labh  &bull;  Torans  &bull;  Resin Idols  &bull;  Wall Art  &bull;  Handcrafted in India  &bull;  " />

      {/* ===== TRUST BADGES ===== */}
      <section className="py-10 md:py-12 px-6 md:px-14 border-y border-gold/8" aria-label="Trust indicators">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {[
            { Icon: Truck, label: "Free Shipping", sub: "Orders above ₹1999" },
            { Icon: Award, label: "Handmade in India", sub: "By master artisans" },
            { Icon: RotateCcw, label: "Easy Returns", sub: "7-day hassle-free" },
            { Icon: ShieldCheck, label: "Secure Payment", sub: "100% safe checkout" },
          ].map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="font-sans text-[11px] tracking-[0.15em] text-ivory/90 uppercase font-medium">{label}</p>
                <p className="font-body text-xs text-ivory/55 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PHILOSOPHY — Full-bleed quote ===== */}
      <section className="relative bg-void overflow-hidden">
        {/* Large decorative quotation mark */}
        <div className="absolute top-0 left-8 md:left-14 font-display text-[20vw] text-gold/[0.04] italic leading-none select-none pointer-events-none" aria-hidden="true">&ldquo;</div>
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 pt-20 md:pt-44 pb-14 md:pb-32">
          <Reveal y={0} duration={0.7} className="mb-14">
            <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase">Sacred Philosophy</p>
          </Reveal>
          {/* Word-by-word quote reveal */}
          <p className="font-display leading-[1.12] text-ivory italic max-w-6xl"
            style={{ fontSize: "clamp(28px, 4.5vw, 72px)" }}>
            <SplitWords text="Every piece is a prayer in form —" start="top 85%" stagger={0.07} />
            {" "}
            <SplitWords text="devotion made visible," start="top 85%" stagger={0.07} delay={0.45} />
            {" "}
            <SplitWords text="tradition made tangible." start="top 85%" stagger={0.07} delay={0.9} />
          </p>
          <Reveal y={15} delay={0.5} className="mt-12 flex items-center gap-6">
            <div className="w-10 h-px bg-gold/35" />
            <p className="font-sans text-[11px] tracking-[0.35em] text-ivory/55 uppercase">Aaryelle Atelier — Est. 2025</p>
          </Reveal>
        </div>
        {/* Full-bleed bottom image strip */}
        <ClipReveal direction="up" duration={1.8} className="h-[35vh] md:h-[45vh] w-full relative overflow-hidden">
          <ImageParallax
            src={PRODUCTS[4].image}
            alt="Mandala Art"
            className="w-full h-full"
            intensity={15}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/20 to-void/70" />
        </ClipReveal>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-28 md:py-44 px-6 md:px-14 bg-noir" aria-label="Featured products">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16 md:mb-20">
            <div>
              <Reveal y={20} className="mb-4">
                <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase">Featured</p>
              </Reveal>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-ivory leading-tight" style={{ overflow: "hidden" }}>
                <SplitWords text="Curated" start="top 88%" />
                {" "}
                <SplitWords text="Treasures" className="italic text-gradient-gold" start="top 88%" delay={0.15} />
              </h2>
            </div>
            <Reveal y={20} delay={0.2}>
              <MagneticButton onClick={() => navigate("COLLECTION")}
                className="self-start md:self-auto flex items-center gap-2 font-sans text-[11px] tracking-[0.2em] text-ivory/65 hover:text-gold transition-colors uppercase">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </Reveal>
          </div>

          {/* Large + 2 stacked */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-8">
            <ClipReveal direction="right" className="md:col-span-7" duration={1.5}>
              <TiltCard intensity={3}>
                <article onClick={() => onSelectProduct(PRODUCTS[0])} className="group cursor-pointer interactive relative" data-cursor="VIEW">
                  <div className="relative aspect-[4/5] md:h-[700px] overflow-hidden bento-card">
                    <ImageParallax src={PRODUCTS[0].image} alt={PRODUCTS[0].name} className="w-full h-full" intensity={10} />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/15 to-transparent" />
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(PRODUCTS[0].id); }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 interactive cursor-pointer"
                      aria-label={inWishlist(PRODUCTS[0].id) ? "Remove from wishlist" : "Add to wishlist"}>
                      <Heart className={`w-3.5 h-3.5 transition-colors ${inWishlist(PRODUCTS[0].id) ? "fill-gold text-gold" : "text-ivory/60"}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                      <p className="font-sans text-[10px] tracking-widest text-gold uppercase mb-2.5">{PRODUCTS[0].category}</p>
                      <h3 className="font-display text-3xl md:text-4xl text-ivory italic mb-3 leading-tight">{PRODUCTS[0].name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-body text-lg text-gold">₹{PRODUCTS[0].price.toLocaleString("en-IN")}</span>
                        <span className="font-sans text-[10px] tracking-widest text-ivory/65 uppercase group-hover:text-gold transition-colors flex items-center gap-2">
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </ClipReveal>

            <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
              {PRODUCTS.slice(2, 4).map((p, i) => (
                <ClipReveal key={p.id} direction="left" delay={0.12 + i * 0.18} className="flex-1">
                  <TiltCard intensity={4}>
                    <article onClick={() => onSelectProduct(p)} className="group cursor-pointer interactive h-full relative" data-cursor="VIEW">
                      <div className="relative aspect-[4/5] md:h-[334px] overflow-hidden bento-card">
                        <ImageParallax src={p.image} alt={p.name} className="w-full h-full" intensity={8} />
                        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
                        <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
                          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 interactive cursor-pointer"
                          aria-label={inWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}>
                          <Heart className={`w-3.5 h-3.5 transition-colors ${inWishlist(p.id) ? "fill-gold text-gold" : "text-ivory/60"}`} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                          <p className="font-sans text-[10px] tracking-widest text-gold uppercase mb-1.5">{p.category}</p>
                          <h3 className="font-display text-xl md:text-2xl text-ivory italic">{p.name}</h3>
                          <span className="font-body text-sm text-gold mt-1.5 block">₹{p.price.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                </ClipReveal>
              ))}
            </div>
          </div>

          {/* Row of 3 */}
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8" staggerDelay={0.1}>
            {PRODUCTS.slice(3, 6).map((p) => (
              <article key={p.id} onClick={() => onSelectProduct(p)} className="group cursor-pointer interactive relative" data-cursor="VIEW">
                <div className="relative aspect-[3/4] overflow-hidden bento-card mb-4">
                  <img src={p.image} alt={p.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/65 to-transparent" />
                  <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 interactive cursor-pointer"
                    aria-label={inWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}>
                    <Heart className={`w-3.5 h-3.5 transition-colors ${inWishlist(p.id) ? "fill-gold text-gold" : "text-ivory/60"}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="font-sans text-[9px] tracking-widest text-gold uppercase block mb-1">{p.category}</span>
                    <h3 className="font-display text-xl text-ivory italic">{p.name}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-body text-sm text-gold">₹{p.price.toLocaleString("en-IN")}</span>
                      <button onClick={e => { e.stopPropagation(); addItem(p); addToast(`${p.name} added to cart`); }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gold text-noir px-3 py-1.5 font-sans text-[9px] tracking-widest uppercase hover:bg-gold-light interactive cursor-pointer flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ===== HORIZONTAL GALLERY ===== */}
      <HorizontalGallery products={PRODUCTS} onSelect={onSelectProduct} />

      {/* ===== PROCESS ===== */}
      <section className="py-28 md:py-44 px-6 md:px-14 bg-noir" aria-label="Our process">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16 md:mb-20">
            <Reveal y={20} className="mb-4">
              <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase">Our Process</p>
            </Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-ivory" style={{ overflow: "hidden" }}>
              <SplitWords text="The Art of Making" className="italic" start="top 88%" />
            </h2>
          </div>
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/8" staggerDelay={0.1}>
            {PROCESS_STEPS.map((item) => (
              <div key={item.step} className="bg-noir p-8 md:p-10 group hover:bg-warm/25 transition-colors duration-500">
                <span className="font-display text-6xl text-gold/20 italic block mb-6 group-hover:text-gold/40 transition-colors duration-500">{item.step}</span>
                <h4 className="font-display text-xl text-ivory/90 italic mb-3">{item.title}</h4>
                <p className="font-body text-sm text-ivory/70 leading-[1.75]">{item.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <Divider />

      {/* ===== STATS — redesigned with SplitWords ===== */}
      <section className="py-20 md:py-48 px-6 md:px-12 bg-void overflow-hidden" aria-label="Our Impact">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20 md:mb-28">
            <Reveal y={20} className="mb-5">
              <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase">Our Impact</p>
            </Reveal>
            <h2 className="font-display text-4xl md:text-6xl text-ivory" style={{ overflow: "hidden" }}>
              <SplitWords text="Numbers That Speak" className="italic" start="top 88%" />
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border border-gold/10">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} y={40} delay={i * 0.1} className="text-center p-6 md:p-16 border-r border-b border-gold/10 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0 [&:nth-child(n+3)]:border-b-0 md:[&:nth-child(n+3)]:border-b md:[&:nth-child(n+5)]:border-b-0">
                <div className="font-display text-5xl md:text-7xl text-gradient-gold italic mb-3 leading-none">
                  <NumberScramble value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-sans text-[10px] tracking-[0.25em] text-ivory/80 uppercase mt-2">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />
      <TestimonialsSection />

      {/* ===== CTA ===== */}
      <section className="relative bg-void overflow-hidden" aria-label="Call to action">
        {/* Full-bleed parallax background */}
        <div className="absolute inset-0 opacity-15">
          <ImageParallax src={PRODUCTS[3].image} alt="" className="w-full h-full" intensity={10} />
        </div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 py-24 md:py-64 px-6 md:px-14 text-center max-w-[1440px] mx-auto">
          {/* Eyebrow */}
          <Reveal y={20} className="mb-10">
            <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.55em] uppercase">Ready to Transform Your Space</p>
          </Reveal>

          {/* Giant split headline */}
          <div className="overflow-hidden mb-6">
            <p className="font-display text-[clamp(38px,9vw,136px)] text-ivory italic leading-[0.88] tracking-[-0.02em]">
              <SplitWords text="Bring" start="top 90%" stagger={0.1} duration={1.2} />
              {" "}
              <SplitWords text="divinity" className="text-gradient-gold" start="top 90%" stagger={0.1} delay={0.2} duration={1.2} />
            </p>
          </div>
          <div className="overflow-hidden mb-14">
            <p className="font-display text-[clamp(38px,9vw,136px)] text-ivory italic leading-[0.88] tracking-[-0.02em]">
              <SplitWords text="into your home" start="top 90%" stagger={0.06} delay={0.45} duration={1.2} />
            </p>
          </div>

          {/* CTA buttons */}
          <Reveal y={20} delay={0.6} className="flex flex-wrap justify-center gap-4">
            <MagneticButton onClick={() => navigate("COLLECTION")}
              className="inline-flex items-center gap-3 bg-gold text-noir px-14 py-5 font-sans text-[11px] tracking-[0.25em] uppercase hover:bg-gold-light transition-colors">
              Explore Collection <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton onClick={() => navigate("ORACULUM")}
              className="inline-flex items-center gap-3 border border-gold/30 text-ivory/85 px-10 py-5 font-sans text-[11px] tracking-[0.22em] uppercase hover:border-gold/55 hover:text-gold transition-all">
              Ask Aaryelle
            </MagneticButton>
          </Reveal>

          <Reveal y={15} delay={0.8} className="mt-10">
            <p className="font-sans text-[10px] text-ivory/20 tracking-[0.45em] uppercase">Est. 2025 · Handcrafted in India · Sacred Spaces</p>
          </Reveal>
        </div>

        {/* Bottom border line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </section>
    </div>
  );
};

// ============================================================
// COLLECTION VIEW
// ============================================================

const CollectionView = ({ onSelectProduct }: { onSelectProduct: (p: Product) => void }) => {
  const [filter, setFilter] = useState("All");
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const categories = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  return (
    <div className="min-h-screen bg-noir pt-28 md:pt-32 pb-28">
      <div className="px-6 md:px-14 max-w-[1440px] mx-auto">
        <Reveal y={40} className="mb-14 md:mb-18">
          <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] mb-4 uppercase">Collection</p>
          <h2 className="font-display text-4xl md:text-7xl lg:text-8xl text-ivory italic leading-tight">Our Pieces</h2>
        </Reveal>
        <Reveal y={20} delay={0.12}>
          <div className="flex flex-wrap gap-2.5 mb-14">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 font-sans text-[11px] tracking-[0.15em] uppercase border transition-all duration-300 interactive cursor-pointer ${filter === cat ? "bg-gold text-noir border-gold" : "border-ivory/10 text-ivory/65 hover:border-gold/40 hover:text-gold"}`}>
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {filtered.map((p, i) => (
            <Reveal key={`${filter}-${p.id}`} y={50} delay={i * 0.06} duration={0.9}>
              <article className="group cursor-pointer interactive">
                <TiltCard intensity={4}>
                  <div className="relative aspect-[3/4] overflow-hidden bento-card mb-5" onClick={() => onSelectProduct(p)}>
                    <img src={p.image} alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center glass-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 interactive cursor-pointer"
                      aria-label={inWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}>
                      <Heart className={`w-3.5 h-3.5 transition-colors ${inWishlist(p.id) ? "fill-gold text-gold" : "text-ivory/60"}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
                      <button onClick={e => { e.stopPropagation(); onSelectProduct(p); }}
                        className="flex-1 py-2.5 glass-card text-center font-sans text-[10px] tracking-widest text-ivory uppercase hover:text-gold transition-colors cursor-pointer">
                        View Details
                      </button>
                      <button onClick={e => { e.stopPropagation(); addItem(p); addToast(`${p.name} added`); }}
                        className="py-2.5 px-4 bg-gold text-noir font-sans text-[10px] tracking-widest uppercase hover:bg-gold-light transition-colors cursor-pointer">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-display text-xl text-ivory group-hover:text-gold transition-colors italic">{p.name}</h3>
                    <p className="font-sans text-[10px] text-ivory/55 tracking-widest mt-0.5 uppercase">{p.category}</p>
                  </div>
                  <span className="font-body text-sm text-gold shrink-0 mt-1">₹{p.price.toLocaleString("en-IN")}</span>
                </div>
              </article>
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-24">
              <p className="font-display text-2xl text-ivory/50 italic">No products in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MANIFESTO VIEW
// ============================================================

const ManifestoView = () => (
  <div className="min-h-screen bg-noir text-ivory">
    {/* Full-bleed editorial hero image */}
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <ImageParallax src={PRODUCTS[4].image} alt="Aaryelle craft" className="w-full h-full" intensity={20} loading="eager" objectPosition="object-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-transparent to-noir" />
      <div className="absolute inset-0 bg-gradient-to-r from-noir/40 to-transparent" />
      {/* Hero text over image */}
      <div className="absolute bottom-0 left-0 px-6 md:px-14 pb-14 md:pb-20">
        <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.55em] uppercase mb-5 animate-[fadeIn_1s_0.3s_both]">Our Story</p>
        <h1 className="font-display text-5xl md:text-8xl lg:text-9xl text-ivory italic leading-[0.88] tracking-[-0.02em] animate-[fadeInUp_1s_0.5s_both]">
          Where<br />Devotion<br /><span className="text-gradient-gold">Meets Design</span>
        </h1>
      </div>
      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 md:right-14 font-sans text-[9px] text-ivory/50 tracking-[0.4em] uppercase animate-[fadeIn_1s_1s_both]">
        Scroll to explore ↓
      </div>
    </div>

    <section className="max-w-[1440px] mx-auto pt-24 pb-12 px-6 md:px-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-14 md:gap-20 mb-28 md:mb-40">
        <ClipReveal direction="right" className="md:col-span-5">
          <div className="aspect-[3/4] overflow-hidden">
            <ImageParallax src="/assets/product5_mandala_art.jpg" alt="Mandala Art" className="w-full h-full" intensity={12} objectPosition="object-center" />
          </div>
        </ClipReveal>
        <Reveal y={40} delay={0.2} className="md:col-span-7 flex flex-col justify-center">
          <p className="font-display text-2xl md:text-3xl lg:text-4xl text-ivory italic leading-[1.35] mb-8">
            Every home deserves a touch of the divine, handcrafted with love and devotion.
          </p>
          <div className="w-14 h-px bg-gold/40 mb-8" />
          <p className="font-body text-ivory/85 text-[17px] leading-[1.75] mb-6">
            We honour ancient Indian traditions through modern artistry and timeless design. Each piece carries the blessings of skilled artisan hands from across India.
          </p>
          <p className="font-body text-ivory/85 text-[17px] leading-[1.75]">
            From our workshop to your mandir, your walls, your doorstep — with love.
          </p>
        </Reveal>
      </div>
      <Reveal y={30} className="mb-14">
        <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase">Our Process</p>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-gold/8 mb-28">
        {PROCESS_STEPS.map((item, i) => (
          <Reveal key={item.step} y={40} delay={i * 0.1}>
            <div className="bg-noir p-8 md:p-10 hover:bg-warm/20 transition-colors duration-500">
              <span className="font-display text-6xl text-gold/20 italic block mb-4">{item.step}</span>
              <h4 className="font-display text-xl text-ivory/90 italic mb-3">{item.title}</h4>
              <p className="font-body text-sm text-ivory/70 leading-[1.75]">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal><Divider />
        <div className="mt-8 flex flex-col md:flex-row justify-between gap-2 font-sans text-[11px] text-gold/45 tracking-widest uppercase">
          <span>Est. 2025</span><span>Made with Love in India</span>
        </div>
      </Reveal>
    </section>
  </div>
);

// ============================================================
// ORACULUM — AI Assistant
// ============================================================

const OraculumView = ({ onClose }: { onClose: () => void }) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const { displayed, isDone } = useTypewriter(response, 25);
  const suggestedQuestions = ["Best gift for Diwali?", "Which idol for mandir?", "Toran suggestions?"];
  const askOracle = async () => {
    if (!input.trim()) return;
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `User asks: "${input}". You are Aaryelle's craft assistant. Help customers choose Indian art & craft products — Shubh Labh, Torans, Resin Idols, Mandala Wall Art, and festive decor. Be warm, knowledgeable, and helpful. Keep answer under 3 sentences.`,
      });
      setResponse(result.text ?? "Please try again.");
    } catch { setResponse("Please try again in a moment."); }
    finally { setIsThinking(false); }
  };
  return (
    <div className="fixed inset-0 z-40 bg-void flex flex-col items-center justify-center p-6 md:p-12 animate-[fadeIn_0.6s_ease-out]" role="dialog" aria-label="Ask Aaryelle">
      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(201,169,110,0.055) 0%, transparent 70%)" }} />
      {/* Decorative corner marks */}
      <div className="absolute top-10 left-10 w-6 h-6 border-t border-l border-gold/20 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-10 right-10 w-6 h-6 border-t border-r border-gold/20 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-6 h-6 border-b border-l border-gold/20 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 right-10 w-6 h-6 border-b border-r border-gold/20 pointer-events-none" aria-hidden="true" />
      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        <Emblem className="h-20 w-auto mb-10 opacity-90" />
        {!response && !isThinking && (
          <div className="text-center w-full animate-[fadeInUp_0.6s_ease-out]">
            <h2 className="font-display text-xl md:text-2xl text-ivory/60 italic mb-8">How can we help you today?</h2>
            <div className="relative">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && askOracle()}
                placeholder="Ask Aaryelle..."
                className="w-full bg-transparent text-center font-display text-2xl md:text-4xl text-ivory placeholder-ivory/15 focus:outline-none border-b border-gold/15 pb-4 focus:border-gold/40 transition-colors interactive"
                autoFocus />
              {input.trim() && <button onClick={askOracle} className="absolute right-0 bottom-5 text-gold/50 hover:text-gold transition-colors interactive cursor-pointer"><Send className="w-5 h-5" /></button>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
              {suggestedQuestions.map(q => <button key={q} onClick={() => setInput(q)}
                className="px-4 py-2 glass-card font-sans text-[10px] tracking-widest text-gold/40 hover:text-gold transition-colors interactive cursor-pointer uppercase">{q}</button>)}
            </div>
          </div>
        )}
        {isThinking && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-10 h-10 border border-gold/20 rounded-full animate-[spinSlow_3s_linear_infinite]"><div className="w-full h-full border-t border-gold rounded-full" /></div>
            <div className="font-sans text-gold/60 tracking-[0.4em] text-[11px] uppercase">Thinking...</div>
          </div>
        )}
        {response && (
          <div className="text-center animate-[fadeIn_0.4s_ease-out]">
            <blockquote className="font-display text-xl md:text-2xl lg:text-3xl text-ivory leading-relaxed italic mb-8">
              &ldquo;{displayed}&rdquo;
              {!isDone && <span className="inline-block w-[2px] h-[0.9em] bg-gold ml-1 align-middle animate-[cursorBlink_1s_ease-in-out_infinite]" />}
            </blockquote>
            <button onClick={() => { setResponse(null); setInput(""); }} className="font-sans text-gold/60 text-[11px] tracking-[0.2em] hover:text-gold transition-colors interactive cursor-pointer uppercase">Ask Again</button>
          </div>
        )}
      </div>
      <button onClick={onClose} className="absolute top-5 right-6 text-ivory/50 hover:text-gold transition-colors interactive cursor-pointer"><X className="w-5 h-5" /></button>
    </div>
  );
};

// ============================================================
// NEWSLETTER SECTION
// ============================================================

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { addToast("Please enter a valid email"); return; }
    setSubmitted(true);
    addToast("Welcome to Aaryelle! Check your inbox.");
  };
  return (
    <section className="py-24 md:py-32 px-6 md:px-14 bg-warm relative overflow-hidden" aria-label="Newsletter signup">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <MandalaSVG size={500} opacity={0.08} className="absolute -right-20 top-1/2 -translate-y-1/2" />
      </div>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <p className="gold-shimmer-label font-sans text-[11px] tracking-[0.5em] uppercase mb-5">Stay Connected</p>
        <h2 className="font-display text-4xl md:text-5xl text-ivory italic mb-4">Sacred Stories, Delivered</h2>
        <p className="font-body text-ivory/85 text-base leading-relaxed mb-10">
          Get early access to new arrivals, festive collections, artisan stories, and exclusive offers.
        </p>
        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-gold">
            <Sparkles className="w-5 h-5" />
            <span className="font-display text-xl italic">Thank you for joining us!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-noir/60 border border-gold/20 px-5 py-3.5 font-body text-sm text-ivory placeholder:text-ivory/50 outline-none focus:border-gold/50 transition-colors"
              required />
            <button type="submit" className="bg-gold text-noir px-7 py-3.5 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold-light transition-colors shrink-0 interactive cursor-pointer">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

// ============================================================
// FOOTER
// ============================================================

const Footer = ({ navigate }: { navigate: (v: ViewState) => void }) => (
  <footer className="bg-void border-t border-gold/10 px-6 md:px-14 pt-16 pb-8" aria-label="Footer">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14 mb-14">
        {/* Brand */}
        <div className="md:col-span-1">
          <Emblem className="h-14 w-auto mb-4 opacity-85" />
          <p className="font-body text-ivory/55 text-sm leading-relaxed mb-5">
            Sacred luxury handcrafted in India. Where devotion meets artistry.
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 border border-gold/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/50 transition-all interactive cursor-pointer" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 border border-gold/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/50 transition-all interactive cursor-pointer" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://wa.me/919819998988" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 border border-gold/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/50 transition-all interactive cursor-pointer" aria-label="WhatsApp">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
        {/* Navigation */}
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-5">Navigate</p>
          <ul className="space-y-3">
            {(["HOME","COLLECTION","ORACULUM","MANIFESTO"] as ViewState[]).map((v, i) => (
              <li key={v}><button onClick={() => navigate(v)}
                className="font-body text-sm text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer">
                {["Home","Collection","Ask Aaryelle","Our Story"][i]}
              </button></li>
            ))}
          </ul>
        </div>
        {/* Categories */}
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-5">Categories</p>
          <ul className="space-y-3">
            {["Religious Idols","Festive Decor","Torans","Interior Art","Resin Art","Gift Sets"].map(c => (
              <li key={c}><span className="font-body text-sm text-ivory/60 cursor-default">{c}</span></li>
            ))}
          </ul>
        </div>
        {/* Contact */}
        <div>
          <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-5">Contact</p>
          <div className="space-y-3">
            <a href="https://wa.me/919819998988" className="flex items-center gap-2 text-ivory/60 hover:text-gold transition-colors interactive cursor-pointer">
              <span className="font-body text-sm">+91 98199 98988</span>
            </a>
            <p className="font-body text-sm text-ivory/55">Mumbai, Maharashtra, India</p>
            <p className="font-body text-sm text-ivory/55">Mon–Sat: 10am – 7pm IST</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gold/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-xs text-ivory/50">© 2025 Aaryelle. All rights reserved. Handcrafted with devotion in India.</p>
        <div className="flex gap-6">
          {["Privacy Policy","Terms of Service","Shipping Policy"].map(l => (
            <span key={l} className="font-sans text-[10px] text-ivory/50 tracking-wider cursor-default hover:text-ivory/70 transition-colors">{l}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ============================================================
// LOADING SCREEN
// ============================================================

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [done, setDone] = useState(false);
  const [counter, setCounter] = useState(0);
  const lettersRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // 1) Letters cascade in
      tl.fromTo(".load-letter",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power4.out" }
      )
      // 2) Tagline fades in
      .fromTo(taglineRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2")
      // 3) Loading bar + counter sweeps
      .fromTo(barFillRef.current, { scaleX: 0 }, {
        scaleX: 1, duration: 0.9, ease: "power3.inOut",
        onUpdate() { setCounter(Math.round((this.progress() ?? 0) * 100)); },
      }, "-=0.1")
      // 4) Everything fades out
      .to(lettersRef.current, { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, "+=0.15")
      .to([taglineRef.current, counterRef.current, barFillRef.current?.parentElement], { opacity: 0, duration: 0.35 }, "<")
      .call(() => { setDone(true); setTimeout(onComplete, 200); });
    });
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className={`loading-screen ${done ? "done" : ""}`} role="status" aria-label="Loading Aaryelle">
      {/* Corner frame marks */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-gold/20" aria-hidden="true" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-gold/20" aria-hidden="true" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-gold/20" aria-hidden="true" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-gold/20" aria-hidden="true" />
      {/* Percentage counter — top right */}
      <div ref={counterRef} className="absolute top-8 right-16 font-sans text-[11px] tracking-[0.3em] text-gold/40 tabular-nums" aria-hidden="true">
        {String(counter).padStart(3, "0")}
      </div>
      {/* Logo reveal */}
      <div ref={lettersRef} className="flex flex-col items-center gap-5" aria-label="Aaryelle">
        <img
          src="/assets/aaryelle_logo_clean.png"
          alt="Aaryelle"
          className="load-letter w-auto object-contain loader-logo-shimmer"
          style={{ height: "clamp(100px, 18vw, 160px)", transform: "translateY(40px)", opacity: 0 }}
        />
      </div>
      {/* Tagline */}
      <div ref={taglineRef} className="gold-shimmer-label font-sans text-[10px] tracking-[0.55em] mt-6 uppercase" style={{ opacity: 0 }}>
        Sacred Luxury · Est. 2025
      </div>
      {/* Loading bar */}
      <div className="loading-bar mt-8">
        <div ref={barFillRef} className="loading-bar-fill" style={{ transform: "scaleX(0)", transition: "none" }} />
      </div>
      {/* Bottom line */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-gold/30 to-transparent" />
    </div>
  );
};

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-noir flex flex-col items-center justify-center p-8 text-center">
        <Emblem className="h-16 w-auto mb-8 opacity-60" />
        <h1 className="font-display text-3xl text-ivory italic mb-4">Something went wrong</h1>
        <p className="font-body text-ivory/60 mb-8 max-w-md text-sm">Please refresh the page to try again.</p>
        <button onClick={() => window.location.reload()} className="bg-gold text-noir px-8 py-3 font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-gold-light transition-colors cursor-pointer">Refresh Page</button>
      </div>
    );
    return this.props.children;
  }
}

// ============================================================
// APP — Lenis Smooth Scroll + GSAP ScrollTrigger
// ============================================================

/** WhatsApp Float — sticky contact button for Indian e-commerce */
const WhatsAppFloat = () => (
  <a
    href="https://wa.me/919819998988?text=Hello%20Aaryelle!%20I%20saw%20your%20handcrafted%20art%20and%20I%20am%20interested."
    target="_blank" rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    title="Chat on WhatsApp"
    className="fixed bottom-8 right-8 z-[10000] interactive cursor-pointer group"
  >
    {/* Pulse ring */}
    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-ping" aria-hidden="true" style={{ animationDuration: "2.5s" }} />
    <span className="relative w-12 h-12 flex items-center justify-center bg-[#25D366] group-hover:bg-[#1ebe5d] text-white rounded-full shadow-lg shadow-[#25D366]/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#25D366]/35">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.484A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.659-.523-5.17-1.432L2.8 21.6l1.06-4.054A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </span>
    {/* Tooltip */}
    <span className="absolute right-14 bottom-1/2 translate-y-1/2 whitespace-nowrap bg-noir text-ivory/80 border border-gold/15 px-3 py-1.5 font-sans text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" aria-hidden="true">
      Chat with us
    </span>
  </a>
);

/** BackToTop — Floating button that appears after scrolling 30% */
const BackToTop = ({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(total > 0 && window.scrollY / total > 0.3);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => lenisRef.current?.scrollTo(0, { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className={`fixed bottom-8 left-8 z-[10000] w-11 h-11 border border-gold/25 flex items-center justify-center
        text-gold/40 hover:text-gold hover:border-gold/50 transition-all duration-500 interactive cursor-pointer
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      style={{ transitionProperty: "opacity, transform, color, border-color" }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M8 13V3M3 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

const App = () => {
  const [view, setView] = useState<ViewState>("HOME");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingView, setPendingView] = useState<ViewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const audio = useAudioEngine();
  const lenisRef = useRef<Lenis | null>(null);

  // ── Lenis + GSAP ScrollTrigger sync ──────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    // Keep GSAP ScrollTrigger in sync with Lenis scroll
    lenis.on("scroll", () => ScrollTrigger.update());

    // Drive Lenis via GSAP ticker for perfect frame sync
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis when product modal is open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (selectedProduct) lenisRef.current.stop();
    else lenisRef.current.start();
  }, [selectedProduct]);

  // Listen for cart drawer toggle events (decoupled from CartProvider)
  useEffect(() => {
    const handler = (e: Event) => {
      const { paused } = (e as CustomEvent<{ paused: boolean }>).detail;
      if (paused) lenisRef.current?.stop();
      else lenisRef.current?.start();
    };
    document.addEventListener("lenis:toggle", handler);
    return () => document.removeEventListener("lenis:toggle", handler);
  }, []);

  // 'k' global keyboard shortcut → open Oraculum AI
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "k" && view !== "ORACULUM") {
        e.preventDefault();
        handleNavigate("ORACULUM");
      }
      if (e.key === "Escape" && view === "ORACULUM") handleNavigate("HOME");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleNavigate = useCallback((newView: ViewState) => {
    if (newView === view || isTransitioning) return;
    setIsTransitioning(true);
    setPendingView(newView);
    audio.playClick();
    lenisRef.current?.scrollTo(0, { duration: 0.9, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  }, [view, isTransitioning, audio]);

  const finishTransition = useCallback(() => {
    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
      setTimeout(() => ScrollTrigger.refresh(), 300);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [pendingView]);

  const handleProductSelect = useCallback((p: Product) => {
    setSelectedProduct(p); audio.playChord();
  }, [audio]);

  if (isLoading) return <LoadingScreen onComplete={() => setIsLoading(false)} />;

  return (
    <>
      <AmbientAurora />
      <StarField />
      <FireflyField />
      <ScanLine />
      <ClickRipple />
      <CustomCursor />
      <ScrollProgress />
      <TransitionCurtain isActive={isTransitioning} onTransitionEnd={finishTransition} />
      <CartDrawer />
      <BackToTop lenisRef={lenisRef} />
      <WhatsAppFloat />
      <div className="animate-[fadeIn_0.8s_ease-out]">
        <div className="fixed inset-0 bg-noir -z-20" aria-hidden="true" />
        <div className="emerald-mesh" aria-hidden="true" />
        <GoldDust analyserRef={audio.analyserRef} />
        <Navigation view={view} navigate={handleNavigate} audioEnabled={audio.audioEnabled} toggleAudio={audio.toggleAudio} onSearchOpen={() => setSearchOpen(true)} />
        <main id="main-content" tabIndex={-1}>
          {view === "HOME" && <HomeView navigate={handleNavigate} onSelectProduct={handleProductSelect} />}
          {view === "COLLECTION" && <CollectionView onSelectProduct={handleProductSelect} />}
          {view === "ORACULUM" && <OraculumView onClose={() => handleNavigate("HOME")} />}
          {view === "MANIFESTO" && <ManifestoView />}
        </main>
        {view !== "ORACULUM" && <NewsletterSection />}
        {view !== "ORACULUM" && <Footer navigate={handleNavigate} />}
        {selectedProduct && <ProductRitual product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onSelectProduct={(p) => { handleProductSelect(p); setSearchOpen(false); }} />}
      </div>
    </>
  );
};

// ============================================================
// MOUNT
// ============================================================

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </ErrorBoundary>
);
