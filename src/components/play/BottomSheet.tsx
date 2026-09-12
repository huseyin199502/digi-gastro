"use client";

import { useRef, useState, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Höhen als Anteil der Viewport-Höhe, aufsteigend (z. B. [0.14, 0.55, 0.92]). */
  snapPoints?: number[];
  initialSnap?: number;
  header?: ReactNode;
  children: ReactNode;
  /** Zusätzliche Klassen für den Sheet-Container. */
  className?: string;
}

/**
 * Leichtes, bewusst abhängigkeitsfreies Bottom-Sheet.
 * - Non-modal: der Inhalt dahinter bleibt sichtbar/interaktiv.
 * - Nur der Griff oben zieht das Sheet; der Inhalt scrollt normal.
 * - Swipe unter den kleinsten Snap-Punkt schließt das Sheet.
 */
export default function BottomSheet({
  open,
  onClose,
  snapPoints = [0.16, 0.55, 0.92],
  initialSnap = 1,
  header,
  children,
  className = "",
}: BottomSheetProps) {
  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);
  const handleRef = useRef<HTMLDivElement>(null);

  const viewportH = () =>
    typeof window === "undefined" ? 800 : window.innerHeight;

  // Ruhezustand als vh (identisch auf Server & Client → kein Hydration-Fehler).
  // Nur während des Ziehens wird in Pixel gerechnet (rein clientseitig).
  const heightStyle =
    dragHeight != null
      ? `${dragHeight}px`
      : `${snapPoints[snapIndex] * 100}vh`;

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = snapPoints[snapIndex] * viewportH();
    handleRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = startY.current - e.clientY;
    const max = snapPoints[snapPoints.length - 1] * viewportH();
    const min = snapPoints[0] * viewportH() * 0.35;
    setDragHeight(Math.min(max, Math.max(min, startH.current + dy)));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const h = dragHeight ?? startH.current;
    // deutlich unter kleinster Snap-Punkt → schließen
    if (h < snapPoints[0] * viewportH() * 0.6) {
      setDragHeight(null);
      onClose();
      return;
    }
    let best = 0;
    let bestDist = Infinity;
    snapPoints.forEach((p, i) => {
      const d = Math.abs(p * viewportH() - h);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setSnapIndex(best);
    setDragHeight(null);
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[80] flex justify-center px-0 sm:px-4 ${
        open ? "" : "pointer-events-none"
      }`}
      style={{
        transform: open ? "translateY(0%)" : "translateY(110%)",
        transition:
          dragHeight != null
            ? "none"
            : "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      aria-hidden={!open}
    >
      <div
        className={`flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.28)] sm:rounded-3xl sm:mb-2 ${className}`}
        style={{ height: heightStyle, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Ziehgriff (einzige Drag-Fläche) */}
        <div
          ref={handleRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>
        </div>

        {header ? <div className="shrink-0">{header}</div> : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
