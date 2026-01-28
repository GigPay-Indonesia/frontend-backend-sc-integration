import React, { useMemo, useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export interface ChromaItem {
    image: string;
    title: string;
    subtitle: string;
    handle?: string;
    location?: string;
    borderColor?: string;
    gradient?: string;
    url?: string;
}

export interface ChromaGridProps {
    items?: ChromaItem[];
    className?: string;
    radius?: number;
    damping?: number;
    fadeOut?: number;
    ease?: string;
    marqueeSeconds?: number;
    gapPx?: number;
    pauseOnHover?: boolean;
}

type SetterFn = (v: number | string) => void;

const ChromaGrid: React.FC<ChromaGridProps> = ({
    items,
    className = '',
    radius = 300,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'power3.out',
    marqueeSeconds = 42,
    gapPx = 24,
    pauseOnHover = true
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const fadeRef = useRef<HTMLDivElement>(null);
    const setX = useRef<SetterFn | null>(null);
    const setY = useRef<SetterFn | null>(null);
    const pos = useRef({ x: 0, y: 0 });
    const [paused, setPaused] = useState(false);

    const demo: ChromaItem[] = [
        {
            image: 'https://i.pravatar.cc/300?img=8',
            title: 'Alex Rivera',
            subtitle: 'Full Stack Developer',
            handle: '@alexrivera',
            borderColor: '#4F46E5',
            gradient: 'linear-gradient(145deg,#4F46E5,#000)',
            url: 'https://github.com/'
        },
        {
            image: 'https://i.pravatar.cc/300?img=11',
            title: 'Jordan Chen',
            subtitle: 'DevOps Engineer',
            handle: '@jordanchen',
            borderColor: '#10B981',
            gradient: 'linear-gradient(210deg,#10B981,#000)',
            url: 'https://linkedin.com/in/'
        }
    ];

    const data = items?.length ? items : demo;

    const trackStyle = useMemo(
        () =>
            ({
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                ['--marquee-duration' as any]: `${marqueeSeconds}s`,
                ['--marquee-gap' as any]: `${gapPx}px`
            }) as React.CSSProperties,
        [gapPx, marqueeSeconds]
    );

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
        setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
        const { width, height } = el.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };
        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x: number, y: number) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true
        });
    };

    const handleMove = (e: React.PointerEvent) => {
        const r = rootRef.current!.getBoundingClientRect();
        moveTo(e.clientX - r.left, e.clientY - r.top);
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true
        });
    };

    const handleCardClick = (url?: string) => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCardMove: React.MouseEventHandler<HTMLElement> = e => {
        const c = e.currentTarget as HTMLElement;
        const rect = c.getBoundingClientRect();
        c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <div
            ref={rootRef}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className={`relative w-full h-full flex flex-col justify-center items-center overflow-hidden ${className}`}
            style={
                {
                    '--r': `${radius}px`,
                    '--x': '50%',
                    '--y': '50%'
                } as React.CSSProperties
            }
        >
            <style>{`
          @keyframes chroma-marquee {
            0%   { transform: translate3d(0, 0, 0); }
            /* Move exactly one group width + one gap for seamless loop */
            100% { transform: translate3d(calc(-50% - (var(--marquee-gap) / 2)), 0, 0); }
          }
          .chroma-marquee-track {
            display: flex;
            width: max-content;
            will-change: transform;
            animation: chroma-marquee var(--marquee-duration) linear infinite;
          }
          .chroma-marquee-group {
            display: flex;
            gap: var(--marquee-gap);
            padding-right: var(--marquee-gap);
            flex-shrink: 0;
          }
          .chroma-marquee-paused {
            animation-play-state: paused;
          }
          .chroma-edge-fade {
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          }
        `}</style>

            {/* Marquee Container */}
            <div
                className="w-full chroma-edge-fade"
                style={trackStyle}
                onMouseEnter={() => pauseOnHover && setPaused(true)}
                onMouseLeave={() => pauseOnHover && setPaused(false)}
                onPointerDown={() => setPaused(true)}
                onPointerUp={() => setPaused(false)}
                onPointerCancel={() => setPaused(false)}
            >
                <div className={`chroma-marquee-track ${paused ? 'chroma-marquee-paused' : ''}`}>
                    <div className="chroma-marquee-group">
                        {data.map((c, i) => (
                            <Card key={`set1-${i}`} c={c} handleCardMove={handleCardMove} handleCardClick={handleCardClick} />
                        ))}
                    </div>
                    <div className="chroma-marquee-group" aria-hidden="true">
                        {data.map((c, i) => (
                            <Card key={`set2-${i}`} c={c} handleCardMove={handleCardMove} handleCardClick={handleCardClick} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Card = ({ c, handleCardMove, handleCardClick }: { c: any, handleCardMove: any, handleCardClick: any }) => (
    <article
        onMouseMove={handleCardMove}
        onClick={() => handleCardClick(c.url)}
        className="group relative flex flex-col w-[300px] rounded-[20px] overflow-hidden border-2 border-transparent transition-colors duration-300 cursor-pointer flex-shrink-0"
        style={
            {
                '--card-border': c.borderColor || 'transparent',
                background: c.gradient,
                '--spotlight-color': 'rgba(255,255,255,0.3)'
            } as React.CSSProperties
        }
    >
        <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
            style={{
                background:
                    'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
            }}
        />
        <div className="relative z-10 flex-1 p-[10px] box-border">
            <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover rounded-[10px] aspect-square" />
        </div>
        <footer className="relative z-10 p-3 text-white font-sans grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 bg-black/40 backdrop-blur-sm">
            <h3 className="m-0 text-[1.05rem] font-semibold truncate">{c.title}</h3>
            {c.handle && <span className="text-[0.95rem] opacity-80 text-right">{c.handle}</span>}
            <p className="m-0 text-[0.85rem] opacity-85">{c.subtitle}</p>
            {c.location && <span className="text-[0.85rem] opacity-85 text-right">{c.location}</span>}
        </footer>
    </article>
);

export default ChromaGrid;
