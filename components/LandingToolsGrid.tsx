"use client";

import { TOOLS } from "@/data/tools";

interface LandingToolsGridProps {
  onToolClick: () => void;
}

export default function LandingToolsGrid({ onToolClick }: LandingToolsGridProps) {
  return (
    <div className="tools-grid-2" id="landingToolsGrid">
      {TOOLS.map((t) => (
        <div className="tool-card-landing" key={t.id} onClick={onToolClick}>
          {t.badge && <div className="tcl-badge">{t.badge}</div>}
          <div className="tcl-icon">{t.icon}</div>
          <div className="tcl-name">{t.name}</div>
          <div className="tcl-desc">{t.desc}</div>
        </div>
      ))}
    </div>
  );
}
