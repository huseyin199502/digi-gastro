"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Toast } from "./admin-client";

interface LpSection {
  type: "about" | "hours" | "news" | "offers" | "custom";
  title: string;
  content: string;
  image: string;
  file: File | null;
}

interface LandingPageData {
  welcome_title?: string;
  welcome_subtitle?: string;
  google_rating_url?: string;
  title_about?: string;
  title_offers?: string;
  title_news?: string;
  title_hours?: string;
  title_happyhour?: string;
  title_gallery?: string;
  title_videos?: string;
  what_we_offer?: string;
  oeffnungszeiten?: string;
  angebote?: string;
  aktuelles?: string;
  slideshow_enabled?: boolean;
  offer_images?: string[];
  offer_videos?: string[];
  slideshow_images?: string[];
  slideshow_videos?: string[];
  gallery_images?: string[];
  gallery_videos?: string[];
  videos?: string[];
  custom_sections?: { title?: string; content?: string; image?: string }[];
}

type SectionType = LpSection["type"];

const TYPE_META: Record<SectionType, { label: string; icon: string; badge: string }> = {
  about: { label: "Über uns", icon: "info", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  hours: { label: "Öffnungszeiten", icon: "schedule", badge: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  news: { label: "Aktuelles", icon: "campaign", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  offers: { label: "Angebote", icon: "local_offer", badge: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  custom: { label: "Eigene Sektion", icon: "widgets", badge: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
};

const TEMPLATES: { key: string; label: string; title: string; content: string; type?: SectionType }[] = [
  {
    key: "about",
    label: "Über uns",
    title: "Über uns",
    type: "about",
    content:
      "Erzähle deinen Gästen etwas über dein Restaurant.\n\n**Besonderheiten:**\n- Frische Zutaten\n- Familienhafter Service\n- Gemütliche Atmosphäre",
  },
  {
    key: "hours",
    label: "Öffnungszeiten",
    title: "Öffnungszeiten",
    type: "hours",
    content: "**Mo - Do:** 17:00 - 23:00\n**Fr - Sa:** 11:00 - 01:00\n**So:** 12:00 - 22:00",
  },
  {
    key: "gallery",
    label: "Galerie-Text",
    title: "Galerie",
    content: "Eindrücke aus unserem Restaurant.",
  },
  {
    key: "event",
    label: "Event/Angebot",
    title: "Aktuelles Event",
    content: "## Dieses Wochenende\n\n{gold}Ladys Night{/gold}\n\nFreitag ab 20 Uhr — Cocktails 2 für 1",
  },
  {
    key: "contact",
    label: "Kontakt",
    title: "Kontakt & Anfahrt",
    content:
      "**Adresse:** Musterstraße 1, 12345 Stadt\n**Telefon:** 030 / 123 456 78\n\nParkplätze direkt vor der Tür vorhanden.",
  },
  { key: "custom", label: "Freie Sektion", title: "", content: "" },
];

const isVideoUrl = (u: string) => /\.(mp4|webm|mov|avi|mkv)(\?|#|$)/i.test(u);

function MediaThumb({ url }: { url: string }) {
  if (isVideoUrl(url)) {
    return (
      <div className="relative">
        <video src={url} muted playsInline preload="metadata" className="h-20 w-28 rounded-lg bg-zinc-900 object-cover" />
        <span className="absolute left-1 top-1 rounded bg-red-600 px-1 text-[10px] font-bold text-white">VIDEO</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-20 w-28 rounded-lg bg-zinc-900 object-cover" />;
}

function MediaGrid({
  urls,
  type,
  emptyHint,
  onDelete,
}: {
  urls: string[];
  type: string;
  emptyHint?: string;
  onDelete: (url: string, t: string) => void;
}) {
  if (!urls.length) {
    return emptyHint ? (
      <div className="mt-2 rounded-lg border border-dashed border-zinc-700/70 bg-zinc-950/40 px-3 py-4 text-center text-xs text-zinc-500">
        {emptyHint}
      </div>
    ) : null;
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((u) => (
        <div key={u} className="group relative">
          <MediaThumb url={u} />
          <button
            type="button"
            onClick={() => onDelete(u, type)}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 sm:hidden sm:group-hover:flex"
            aria-label="Datei löschen"
          >
            ✕
          </button>
          <div className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/60 text-xs font-semibold text-red-300 sm:flex sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            Löschen
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({
  title,
  icon,
  hint,
  children,
  action,
}: {
  title: string;
  icon: string;
  hint?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined mt-0.5 text-lg text-emerald-400">{icon}</span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-100">{title}</h3>
            {hint ? <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{hint}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400";
const btnCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700/70 disabled:cursor-not-allowed disabled:opacity-40";
const fileCls =
  "block w-full cursor-pointer rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:text-zinc-100 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none";

function TextSectionCard({
  section,
  idx,
  total,
  onChange,
  onMove,
  onRemove,
  onDeleteMedia,
}: {
  section: LpSection;
  idx: number;
  total: number;
  onChange: (patch: Partial<LpSection>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDeleteMedia: (url: string, type: string) => void;
}) {
  const meta = TYPE_META[section.type];
  const isFixed = section.type !== "custom";
  const titleTooLong = section.title.length > 80;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 transition-colors hover:border-zinc-700/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/70 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${meta.badge}`}>
            <span className="material-symbols-outlined text-sm">{meta.icon}</span>
            {meta.label}
          </span>
          {!isFixed ? (
            <span className="text-[11px] text-zinc-600">#{idx + 1}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {!isFixed ? (
            <>
              <button
                type="button"
                onClick={() => onMove(-1)}
                className={btnCls}
                disabled={idx === 0}
                title="Nach oben"
              >
                <span className="material-symbols-outlined text-base">arrow_upward</span>
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                className={btnCls}
                disabled={idx === total - 1}
                title="Nach unten"
              >
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1 rounded-lg border border-red-900/80 bg-red-950/50 px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:border-red-700 hover:bg-red-900/40"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Löschen
              </button>
            </>
          ) : (
            <span className="px-1 text-[11px] text-zinc-600">Standard-Sektion</span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <label className={labelCls}>
            Überschrift
            <span className={`ml-2 font-normal normal-case tracking-normal ${titleTooLong ? "text-red-400" : "text-zinc-600"}`}>
              {section.title.length}/80
            </span>
          </label>
          <input
            className={inputCls}
            value={section.title}
            maxLength={120}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={isFixed ? meta.label : "Kurze Überschrift, z. B. „Besuche uns“"}
          />
          {titleTooLong ? (
            <p className="mt-1 text-xs text-amber-400">Zu lang — lieber den Text unten im Inhalt verwenden.</p>
          ) : null}
        </div>
        <div>
          <label className={labelCls}>Inhalt</label>
          <textarea
            className={`${inputCls} min-h-[96px] resize-y font-mono text-[13px] leading-relaxed`}
            value={section.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={
              section.type === "hours"
                ? "**Mo - Fr:** 11:00 - 23:00\n**Sa:** 12:00 - 01:00"
                : "Text, Markdown, Listen …"
            }
          />
          <p className="mt-1.5 text-[11px] text-zinc-600">
            Markdown: <code className="text-zinc-500">**fett**</code> ·{" "}
            <code className="text-zinc-500">*kursiv*</code> ·{" "}
            <code className="text-zinc-500">## Überschrift</code> ·{" "}
            <code className="text-zinc-500">{"{gold}Text{/gold}"}</code> ·{" "}
            <code className="text-zinc-500">- Eintrag</code>
          </p>
        </div>
        {section.type === "custom" ? (
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-[200px] flex-1">
              <label className={labelCls}>Bild oder Video (optional)</label>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                className={fileCls}
                onChange={(e) => onChange({ file: e.target.files?.[0] ?? null })}
              />
              {section.file ? (
                <p className="mt-1 text-xs text-emerald-400">Neu: {section.file.name} — wird beim Speichern hochgeladen</p>
              ) : null}
            </div>
            {section.image ? (
              <div className="group relative">
                <MediaThumb url={section.image} />
                <button
                  type="button"
                  onClick={() => onDeleteMedia(section.image, "custom")}
                  className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/60 text-xs font-semibold text-red-300 group-hover:flex"
                >
                  Entfernen
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MediaCard({
  title,
  icon,
  hint,
  titleLabel,
  titleValue,
  onTitleChange,
  fileLabel,
  files,
  onFiles,
  existingImages,
  existingVideos,
  onDelete,
  showTitle,
}: {
  title: string;
  icon: string;
  hint?: string;
  titleLabel?: string;
  titleValue?: string;
  onTitleChange?: (v: string) => void;
  fileLabel: string;
  files: File[];
  onFiles: (f: File[]) => void;
  existingImages?: string[];
  existingVideos?: string[];
  onDelete: (url: string, type: string) => void;
  showTitle?: boolean;
}) {
  const imageType = title.startsWith("Diashow") ? "slideshow" : title.startsWith("Galerie") ? "gallery" : "offer";
  const videoType = imageType + "_video";
  const count = (existingImages?.length ?? 0) + (existingVideos?.length ?? 0);

  return (
    <Card
      title={title}
      icon={icon}
      hint={hint}
      action={
        count > 0 || files.length > 0 ? (
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
            {count + files.length}
          </span>
        ) : null
      }
    >
      {showTitle && titleLabel && onTitleChange ? (
        <div className="mb-3">
          <label className={labelCls}>{titleLabel}</label>
          <input className={inputCls} value={titleValue ?? ""} onChange={(e) => onTitleChange(e.target.value)} />
        </div>
      ) : null}
      <label className={labelCls}>{fileLabel}</label>
      <input
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
        className={fileCls}
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
      {files.length > 0 ? (
        <p className="mt-1.5 text-xs font-medium text-emerald-400">
          {files.length} neue Datei(en) — werden mit „Speichern“ hochgeladen
        </p>
      ) : null}
      {existingImages ? <MediaGrid urls={existingImages} type={imageType} onDelete={onDelete} emptyHint="Noch keine Medien." /> : null}
      {existingVideos ? <MediaGrid urls={existingVideos} type={videoType} onDelete={onDelete} /> : null}
    </Card>
  );
}

export default function LandingpageTab({ pushToast }: { pushToast: (m: string, k?: Toast["kind"]) => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LandingPageData | null>(null);

  const [welcomeTitle, setWelcomeTitle] = useState("");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("");
  const [googleRatingUrl, setGoogleRatingUrl] = useState("");
  const [titleOffers, setTitleOffers] = useState("Was wir bieten");
  const [titleGallery, setTitleGallery] = useState("Galerie");
  const [titleVideos, setTitleVideos] = useState("Videos");
  const [slideshowEnabled, setSlideshowEnabled] = useState(false);

  const [sections, setSections] = useState<LpSection[]>([]);
  const [offerFiles, setOfferFiles] = useState<File[]>([]);
  const [slideshowFiles, setSlideshowFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const parts = window.location.pathname.split("/").filter(Boolean);
    // /{slug}/admin → /{slug}
    if (parts.length >= 2 && parts[1] === "admin") return `/${parts[0]}`;
    return parts[0] ? `/${parts[0]}` : "/";
  }, []);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/admin/landingpage");
      if (!res.ok) throw new Error("Laden fehlgeschlagen");
      const d = (await res.json()) as LandingPageData;
      setData(d);
      setWelcomeTitle(d.welcome_title ?? "");
      setWelcomeSubtitle(d.welcome_subtitle ?? "");
      setGoogleRatingUrl(d.google_rating_url ?? "");
      setTitleOffers(d.title_offers || "Was wir bieten");
      setTitleGallery(d.title_gallery || "Galerie");
      setTitleVideos(d.title_videos || "Videos");
      setSlideshowEnabled(Boolean(d.slideshow_enabled));

      const str = (v: unknown) => (typeof v === "string" ? v : "");
      const secs: LpSection[] = [
        {
          type: "about",
          title: str(d.title_about) || "Über uns",
          content: str(d.what_we_offer),
          image: "",
          file: null,
        },
        {
          type: "hours",
          title: str(d.title_hours) || "Öffnungszeiten",
          content: str(d.oeffnungszeiten),
          image: "",
          file: null,
        },
      ];
      if (d.aktuelles || d.title_news) {
        secs.push({
          type: "news",
          title: str(d.title_news) || "Aktuelles",
          content: str(d.aktuelles),
          image: "",
          file: null,
        });
      }
      if (d.angebote || d.title_happyhour) {
        secs.push({
          type: "offers",
          title: str(d.title_happyhour) || "Angebote",
          content: str(d.angebote),
          image: "",
          file: null,
        });
      }
      for (const cs of d.custom_sections ?? []) {
        secs.push({
          type: "custom",
          title: str(cs.title),
          content: str(cs.content),
          image: str(cs.image),
          file: null,
        });
      }
      setSections(secs);
      dirtyRef.current = false;
      setDirty(false);
    } catch {
      pushToast("Landingpage konnte nicht geladen werden", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, []);

  const addTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    markDirty();
    const type: SectionType = tpl.type ?? "custom";
    setSections((prev) => [
      ...prev,
      { type, title: tpl.title, content: tpl.content, image: "", file: null },
    ]);
  };

  const updateSection = (idx: number, patch: Partial<LpSection>) => {
    markDirty();
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeSection = (idx: number) => {
    const s = sections[idx];
    if (!s) return;
    if (s.type !== "custom") {
      pushToast("Standard-Sektionen können nicht gelöscht werden — leeren Inhalt speichern, dann blendet sie aus.", "error");
      return;
    }
    if (!confirm("Diese Sektion wirklich löschen?")) return;
    markDirty();
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    markDirty();
    setSections((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      // only reorder among custom sections (fixed about/hours stay first)
      if (next[idx].type !== "custom" || next[target]?.type !== "custom") return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const deleteMedia = async (url: string, type: string) => {
    if (!confirm("Diese Datei wirklich löschen?")) return;
    const fd = new FormData();
    fd.append("image_url", url);
    fd.append("image_type", type);
    const res = await fetch("/admin/landingpage/delete-image", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (!res.ok || !j.success) {
      pushToast(j.error || "Löschen fehlgeschlagen", "error");
      return;
    }
    setData((prev) => {
      if (!prev) return prev;
      const d = { ...prev };
      const removeFrom = (key: string) => {
        const list = (d[key as keyof LandingPageData] as string[] | undefined) ?? [];
        d[key as keyof LandingPageData] = list.filter((x) => x !== url) as never;
      };
      if (type === "video") removeFrom("videos");
      else if (type === "offer_video") removeFrom("offer_videos");
      else if (type === "slideshow_video") removeFrom("slideshow_videos");
      else if (type === "gallery_video") removeFrom("gallery_videos");
      else if (type === "offer") removeFrom("offer_images");
      else if (type === "gallery") removeFrom("gallery_images");
      else if (type === "slideshow") removeFrom("slideshow_images");
      else if (type === "custom") {
        d.custom_sections = (d.custom_sections ?? []).map((s) =>
          s.image === url ? { ...s, image: "" } : s
        );
        setSections((prev) => prev.map((s) => (s.image === url ? { ...s, image: "" } : s)));
      }
      return d;
    });
    markDirty();
    pushToast("Datei gelöscht");
  };

  const save = async () => {
    if (!welcomeTitle.trim()) {
      pushToast("Willkommens-Titel darf nicht leer sein", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("welcome_title", welcomeTitle);
      fd.append("welcome_subtitle", welcomeSubtitle);
      fd.append("google_rating_url", googleRatingUrl);
      fd.append("title_offers", titleOffers);
      fd.append("title_gallery", titleGallery);
      fd.append("title_videos", titleVideos);
      if (slideshowEnabled) fd.append("slideshow_enabled", "true");

      const secPayload = sections.map((s) => ({
        type: s.type,
        title: s.title,
        content: s.content,
        ...(s.type === "custom" ? { image: s.image, _has_new_image: Boolean(s.file) } : {}),
      }));
      fd.append("landing_sections_json", JSON.stringify(secPayload));
      const customPayload = sections
        .filter((s) => s.type === "custom")
        .map((s) => ({ title: s.title, content: s.content, image: s.image }));
      fd.append("custom_sections_json", JSON.stringify(customPayload));

      for (const f of offerFiles) fd.append("offer_images", f);
      for (const f of slideshowFiles) fd.append("slideshow_images", f);
      for (const f of galleryFiles) fd.append("gallery_images", f);
      for (const f of videoFiles) fd.append("landing_videos", f);
      for (const s of sections) if (s.file) fd.append("custom_section_images", s.file);

      const res = await fetch("/admin/landingpage", {
        method: "POST",
        body: fd,
        headers: { "x-requested-with": "fetch" },
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean };
      if (!res.ok || body.success === false) {
        pushToast(body.error || "Speichern fehlgeschlagen", "error");
        return;
      }
      pushToast("Landingpage gespeichert");
      setOfferFiles([]);
      setSlideshowFiles([]);
      setGalleryFiles([]);
      setVideoFiles([]);
      dirtyRef.current = false;
      setDirty(false);
      await load();
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setSaving(false);
    }
  };

  const fixedSections = sections.filter((s) => s.type === "about" || s.type === "hours");
  const optionalFixed = sections.filter((s) => s.type === "news" || s.type === "offers");
  const customSections = sections.filter((s) => s.type === "custom");

  const sectionCard = (s: LpSection, idx: number) => (
    <TextSectionCard
      key={`${s.type}-${idx}`}
      section={s}
      idx={idx}
      total={sections.length}
      onChange={(patch) => updateSection(sections.indexOf(s), patch)}
      onMove={(dir) => moveSection(sections.indexOf(s), dir)}
      onRemove={() => removeSection(sections.indexOf(s))}
      onDeleteMedia={deleteMedia}
    />
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
        <span className="material-symbols-outlined animate-spin text-3xl text-emerald-500">progress_activity</span>
        <p className="text-sm">Lade Landingpage…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/95 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl text-emerald-400">web</span>
          <div>
            <h2 className="text-base font-bold text-zinc-100 sm:text-lg">Landingpage</h2>
            <p className="text-xs text-zinc-500">
              Willkommen, Sektionen &amp; Medien für <span className="text-zinc-400">{publicUrl}</span>
              {dirty ? <span className="ml-2 font-semibold text-amber-400">● ungespeichert</span> : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Live ansehen
          </a>
          <button
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="material-symbols-outlined text-base">{saving ? "progress_activity" : "save"}</span>
            {saving ? "Speichern…" : dirty ? "Speichern" : "Gespeichert"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Left: content */}
        <div className="space-y-5">
          <Card
            title="Willkommen / Hero"
            icon="waving_hand"
            hint="Erster Eindruck über der Diashow — Titel und Claim der Gäste."
          >
            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Willkommens-Titel
                  <span className="ml-2 font-normal normal-case tracking-normal text-zinc-600">
                    {welcomeTitle.length}/70
                  </span>
                </label>
                <input
                  className={inputCls}
                  value={welcomeTitle}
                  maxLength={70}
                  onChange={(e) => {
                    markDirty();
                    setWelcomeTitle(e.target.value);
                  }}
                  placeholder="z.B. Willkommen bei Deer Lounge"
                />
              </div>
              <div>
                <label className={labelCls}>
                  Untertitel
                  <span className="ml-2 font-normal normal-case tracking-normal text-zinc-600">
                    {welcomeSubtitle.length}/160
                  </span>
                </label>
                <input
                  className={inputCls}
                  value={welcomeSubtitle}
                  maxLength={160}
                  onChange={(e) => {
                    markDirty();
                    setWelcomeSubtitle(e.target.value);
                  }}
                  placeholder="Kurzer Claim — z.B. Deine Auszeit beginnt jetzt."
                />
                <p className="mt-1 text-[11px] text-zinc-600">Max. 2 Sätze. Auf hellem Hintergrund gut lesbar halten.</p>
              </div>
              <div>
                <label className={labelCls}>Google Bewertungs-Link</label>
                <input
                  className={inputCls}
                  value={googleRatingUrl}
                  onChange={(e) => {
                    markDirty();
                    setGoogleRatingUrl(e.target.value);
                  }}
                  placeholder="https://g.page/r/… oder search.google.com/local/writereview?…"
                />
                <p className="mt-1 text-[11px] text-zinc-600">Leer lassen, um den Google-Button zu verstecken.</p>
              </div>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={slideshowEnabled}
                  onChange={(e) => {
                    markDirty();
                    setSlideshowEnabled(e.target.checked);
                  }}
                  className="h-4 w-4 accent-emerald-500"
                />
                <span className="material-symbols-outlined text-base text-emerald-400">slideshow</span>
                Diashow als Hintergrund aktivieren
              </label>
            </div>
          </Card>

          <Card
            title="Text-Sektionen"
            icon="article"
            hint="Über uns & Öffnungszeiten sind Standard. Eigene Sektionen lassen sich sortieren und löschen."
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => addTemplate(t)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-emerald-500/60 hover:bg-zinc-700"
                >
                  <span className="material-symbols-outlined text-sm text-emerald-400">add</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {fixedSections.map((s) => sectionCard(s, sections.indexOf(s)))}
              {optionalFixed.map((s) => sectionCard(s, sections.indexOf(s)))}
              {customSections.map((s) => sectionCard(s, sections.indexOf(s)))}
            </div>
          </Card>
        </div>

        {/* Right: media */}
        <div className="space-y-5">
          <MediaCard
            title="Was wir bieten / Highlights"
            icon="star"
            hint="Große Bilder oder kurze Videos (max. 40s) unter dem Hero."
            titleLabel="Abschnitt-Überschrift"
            titleValue={titleOffers}
            onTitleChange={(v) => {
              markDirty();
              setTitleOffers(v);
            }}
            showTitle
            fileLabel="Bilder & Videos hinzufügen"
            files={offerFiles}
            onFiles={(f) => {
              markDirty();
              setOfferFiles(f);
            }}
            existingImages={data?.offer_images ?? []}
            existingVideos={data?.offer_videos ?? []}
            onDelete={deleteMedia}
          />

          <MediaCard
            title="Diashow (Hintergrund)"
            icon="wallpaper"
            hint="Volle Bildschirmfläche hinter dem Willkommenstext. Reihenfolge = Upload-Reihenfolge."
            fileLabel="Bilder & Videos hinzufügen (Videos max. 40s)"
            files={slideshowFiles}
            onFiles={(f) => {
              markDirty();
              setSlideshowFiles(f);
            }}
            existingImages={data?.slideshow_images ?? []}
            existingVideos={data?.slideshow_videos ?? []}
            onDelete={deleteMedia}
          />

          <MediaCard
            title="Galerie"
            icon="photo_library"
            hint="Quadratische Kacheln im Grid — Klick öffnet Lightbox."
            titleLabel="Galerie-Überschrift"
            titleValue={titleGallery}
            onTitleChange={(v) => {
              markDirty();
              setTitleGallery(v);
            }}
            showTitle
            fileLabel="Galerie-Bilder"
            files={galleryFiles}
            onFiles={(f) => {
              markDirty();
              setGalleryFiles(f);
            }}
            existingImages={data?.gallery_images ?? []}
            existingVideos={data?.gallery_videos ?? []}
            onDelete={deleteMedia}
          />

          <MediaCard
            title="Videos"
            icon="videocam"
            hint="Eigener Videoblock unter der Galerie (max. 40s pro Clip)."
            titleLabel="Video-Überschrift"
            titleValue={titleVideos}
            onTitleChange={(v) => {
              markDirty();
              setTitleVideos(v);
            }}
            showTitle
            fileLabel="Videos hochladen (max. 40s)"
            files={videoFiles}
            onFiles={(f) => {
              markDirty();
              setVideoFiles(f);
            }}
            existingImages={[]}
            existingVideos={data?.videos ?? []}
            onDelete={deleteMedia}
          />
        </div>
      </div>

      {/* Bottom save (mobile-friendly) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="text-xs text-zinc-500">
          {dirty ? "Änderungen noch nicht gespeichert." : "Alles gespeichert."} Markdown-Syntax in Text-Sektionen
          verfügbar.
        </p>
        <div className="flex gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={() => void load()}
              className={btnCls}
              disabled={saving}
            >
              Verwerfen
            </button>
          ) : null}
          <button
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
