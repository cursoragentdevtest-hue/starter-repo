import Image from "next/image";
import { encyclopediaBrand } from "@/data/encyclopedia";

export function EncyclopediaHero() {
  return (
    <header className="hero">
      <div className="hero-media" aria-hidden="true">
        <Image
          src="/images/hero-library.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
      </div>

      <div className="hero-content">
        <p className="hero-brand">{encyclopediaBrand.name}</p>
        <h1 className="hero-headline">{encyclopediaBrand.heroHeadline}</h1>
        <p className="hero-support">{encyclopediaBrand.heroSupport}</p>
        <div className="hero-actions">
          <a className="hero-cta" href="#reading-room">
            Begin reading
          </a>
          <a className="hero-cta-secondary" href="#volumes">
            Browse volumes
          </a>
        </div>
      </div>
    </header>
  );
}
