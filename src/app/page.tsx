import { EncyclopediaHero } from "@/components/encyclopedia/Hero";
import { EntrySection } from "@/components/encyclopedia/EntrySection";
import { VolumeNav } from "@/components/encyclopedia/VolumeNav";
import {
  encyclopediaBrand,
  encyclopediaSections,
} from "@/data/encyclopedia";

export default function Home() {
  return (
    <div className="continua">
      <EncyclopediaHero />

      <div className="continua-shell">
        <aside id="volumes" className="continua-aside">
          <VolumeNav />
        </aside>

        <main className="continua-main">
          <p className="continua-kicker">{encyclopediaBrand.tagline}</p>
          {encyclopediaSections.map((section, index) => (
            <EntrySection
              key={section.id}
              section={section}
              index={index}
            />
          ))}

          <footer className="continua-footer">
            <p className="continua-footer-brand">{encyclopediaBrand.name}</p>
            <p className="continua-footer-note">
              Section after section. The aisle continues.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
