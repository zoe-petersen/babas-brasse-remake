import banner from "@/assets/bannerf.png";
import mobileBanner from "@/assets/mobile_banner.png";

export function HeroBanner() {
  return (
    <section
      aria-label="Babas & Brasse"
      className="relative h-[75svh] w-full overflow-hidden border-b-2 border-ink bg-ink sm:h-[calc(100svh-4rem)] sm:min-h-130"
    >
      <picture className="block h-full w-full">
        <source media="(max-width: 639px)" srcSet={mobileBanner} />
        <img
          src={banner}
          alt="Babas and Brasse - South African arts and culture collage"
          className="h-full w-full object-cover"
        />
      </picture>
      <h1 className="sr-only">
        Babas &amp; Brasse - independent South African arts and culture magazine
      </h1>
    </section>
  );
}
