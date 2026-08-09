import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@/assets/hero1.jpeg";
import slide2 from "@/assets/hero2.webp";
import slide3 from "@/assets/hero3.webp";
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
    src: slide1,
    alt: "Babas and Brasse - South African arts and culture collage",
  },
  {
    src: slide2,
    alt: "Musicians, makers and street artists at work in the city",
    title: "The city makes the culture",
    copy: "Jazz rooms, sewing tables, walls turned into canvases, we cover the people making it happen.",
  },
  {
    src: slide3,
    alt: "A dancer performing on an open-air stage below Table Mountain",
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
      className="relative aspect-9/16 max-h-[70svh] w-full overflow-hidden border-b-2 border-ink bg-ink sm:aspect-auto sm:h-[calc(100svh-4rem)] sm:max-h-none sm:min-h-130"
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
                  <h2 className="mt-6 font-display text-3xl leading-[0.95] text-cream drop-shadow-[3px_3px_0_var(--ink)] sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm text-cream/90 sm:mt-6 sm:text-lg">
                    {slide.copy}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ))}

      <h1 className="sr-only">Babas &amp; Brasse — independent South African arts and culture magazine</h1>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center border-2 border-ink bg-cream text-ink transition-colors hover:bg-magenta sm:left-8 sm:grid sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center border-2 border-ink bg-cream text-ink transition-colors hover:bg-magenta sm:right-8 sm:grid sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>

      <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-3 sm:bottom-6">
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
