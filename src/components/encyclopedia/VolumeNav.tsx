"use client";

import { encyclopediaSections } from "@/data/encyclopedia";

export function VolumeNav() {
  return (
    <nav
      className="volume-nav"
      aria-label="Encyclopedia volumes"
    >
      <p className="volume-nav-label">Volumes</p>
      <ol className="volume-nav-list">
        {encyclopediaSections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <span className="volume-nav-mark">{section.volume}</span>
              <span className="volume-nav-title">{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
