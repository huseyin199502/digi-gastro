// Zonen-Farbcodierung für die Sitzplan-/Live- und KDS-Ansicht.
// Draußen = Blau, Innen = Orange — damit neue Mitarbeiter Tische eindeutig
// zuordnen können (gleiche Nummer existiert in beiden Zonen).

function normalize(zone: string | null | undefined): string {
  return (zone ?? "").trim().toLowerCase();
}

/** Textfarbe (Tailwind-Klasse) für eine Zone. */
export function zoneTextClass(zone: string | null | undefined): string {
  const z = normalize(zone);
  if (!z) return "text-zinc-300";
  if (/(drau|außen|aussen|terrass|outdoor|garten|balkon)/.test(z)) {
    return "text-sky-400";
  }
  if (/(innen|drinnen|indoor|raum|saal)/.test(z)) {
    return "text-orange-400";
  }
  return "text-zinc-300";
}

/** Badge-Stil (Hintergrund + Text, Tailwind-Klassen) für eine Zone. */
export function zoneBadgeClass(zone: string | null | undefined): string {
  const z = normalize(zone);
  if (!z) return "bg-zinc-800 text-zinc-300";
  if (/(drau|außen|aussen|terrass|outdoor|garten|balkon)/.test(z)) {
    return "bg-sky-500/15 text-sky-300";
  }
  if (/(innen|drinnen|indoor|raum|saal)/.test(z)) {
    return "bg-orange-500/15 text-orange-300";
  }
  return "bg-zinc-800 text-zinc-300";
}
