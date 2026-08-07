import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@/assets/hero-1.jpeg.asset.json";
import slide2 from "@/assets/hero-2.webp.asset.json";
import slide3 from "@/assets/hero-3.webp.asset.json";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  copy?: string;
};

const SLIDES: Slide[] = [
  {
    src: slide1.url,
    alt: "Babas and Brasse — South African arts and culture collage",
  },
  {
    src: slide2.url,
    alt: "Musicians, makers and street artists at work in the city",
    eyebrow: "Arts · Culture · Criticism",
    title: "The city makes the culture",
    copy: "Jazz rooms, sewing tables, walls turned into canvases — we cover the people making it happen.",
  },
  {
    src: slide3.url,
    alt: "A dancer performing on an open-air stage below Table Mountain",
    eyebrow: "Theatre · Books · Performance",
    title: "Stories told out loud",
    copy: "Theatre reviews, readings and performance writing from stages across South Africa.",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;

  const go = useCallback((step: number) => {
    setIndex((current) => (current + step + count) % count);
  }, [count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Babas & Brasse highlights"
      className="relative h-[calc(100svh-4rem)] min-h-[520px] w-full overflow-hidden border-b-2 border-ink bg-ink"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            {...(i === 0 ? {} : { loading: "lazy" as const })}
            className="h-full w-full object-cover"
          />
          {slide.title ? (
            <>
              <div className="absolute inset-0 bg-ink/55" />
              <div className="absolute inset-0 grid place-items-center px-6">
                <div className="max-w-3xl text-center">
                  <p className="label-xs inline-block bg-magenta px-4 py-2 text-ink">
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-6 font-display text-4xl leading-[0.95] text-cream drop-shadow-[3px_3px_0_var(--ink)] sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h2>
                  <p className="mx-auto mt-6 max-w-xl text-base text-cream/90 sm:text-lg">
                    {slide.copy}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-x-0 bottom-24 grid place-items-center px-6 text-center">
              <p className="label-xs bg-ink/70 px-4 py-2 text-cream">
                Arts &middot; Culture &middot; Criticism
              </p>
            </div>
          )}
        </div>
      ))}

      <h1 className="sr-only">Babas &amp; Brasse — independent South African arts and culture magazine</h1>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center border-2 border-ink bg-cream text-ink transition-colors hover:bg-magenta sm:left-8 sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center border-2 border-ink bg-cream text-ink transition-colors hover:bg-magenta sm:right-8 sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-3 border-2 border-ink transition-all",
              i === index ? "w-10 bg-magenta" : "w-3 bg-cream/80 hover:bg-cream",
            )}
          />
        ))}
      </div>
    </section>
  );
}
