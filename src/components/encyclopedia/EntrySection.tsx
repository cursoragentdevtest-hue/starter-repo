import Image from "next/image";
import type { EncyclopediaSection } from "@/data/encyclopedia";
import { Reveal } from "./Reveal";

export function EntrySection({
  section,
  index,
}: {
  section: EncyclopediaSection;
  index: number;
}) {
  const flipped = Boolean(section.image) && index % 2 === 1;

  return (
    <section
      id={section.id}
      className={`entry ${section.image ? "entry-with-media" : ""} ${flipped ? "entry-flipped" : ""}`}
    >
      <Reveal>
        <div className="entry-copy">
          <p className="entry-volume">{section.volume}</p>
          <h2 className="entry-title">{section.title}</h2>
          <p className="entry-lede">{section.lede}</p>
          <div className="entry-body">
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Reveal>

      {section.image ? (
        <Reveal className="entry-media-wrap">
          <div className="entry-media">
            <Image
              src={section.image.src}
              alt={section.image.alt}
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              className="entry-image"
            />
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
