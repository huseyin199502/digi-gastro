"use client";

import { useCallback, useEffect, useState } from "react";
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

const TEMPLATES: { key: string; label: string; title: string; content: string }[] = [
  {
    key: "about",
    label: "Über uns",
    title: "Über uns",
    content:
      "Erzähle deinen Gästen etwas über dein Restaurant.\n\n**Besonderheiten:**\n- Frische Zutaten\n- Familärer Service\n- Gemütliche Atmosphäre",
  },
  {
    key: "hours",
    label: "Öffnungszeiten",
    title: "Öffnungszeiten",
    content: "**Mo - Do:** 17:00 - 23:00\n**Fr - Sa:** 11:00 - 01:00\n**So:** 12:00 - 22:00",
  },
  { key: "gallery", label: "Galerie", title: "Galerie", content: "Eindrücke aus unserem Restaurant." },
  {
    key: "event",
    label: "Event/Angebot",
    title: "Aktuelles Event",
    content: "## Dieses Wochenende\n\n{gold}Ladys Night{/gold}\n\nFreitag ab 20 Uhr — Cocktails 2für1",
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
        <video src={url} muted playsInline preload="metadata" className="h-20 w-28 rounded-lg bg-zinc-800 object-cover" />
        <span className="absolute left-1 top-1 rounded bg-red-600 px-1 text-[10px] font-bold text-white">VIDEO</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-20 w-28 rounded-lg bg-zinc-800 object-cover" />;
}

function MediaGrid({
  urls,
  type,
  onDelete,
}: {
  urls: string[];
  type: string;
  onDelete: (url: string, t: string) => void;
}) {
  if (!urls.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((u) => (
        <div key={u} className="group relative">
          <MediaThumb url={u} />
          <button
            type="button"
            onClick={() => onDelete(u, type)}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 sm:hidden sm:group-hover:flex"
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

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400";
const btnCls =
  "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:border-zinc-500 disabled:opacity-50";
const fileCls =
  "block w-full cursor-pointer rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-sm file:text-zinc-100 hover:border-emerald-500";

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

  const load = useCallback(async () => {
    try {
      const res = await fetch("/admin/landingpage");
      if (!res.ok) throw new Error("Laden fehlgeschlagen");
      const d = (await res.json()) as LandingPageData;
      setData(d);
      setWelcomeTitle(d.welcome_title ?? "");
      setWelcomeSubtitle(d.welcome_subtitle ?? "");
      setGoogleRatingUrl(d.google_rating_url ?? "");
      if (d.title_offers) setTitleOffers(d.title_offers);
      if (d.title_gallery) setTitleGallery(d.title_gallery);
      if (d.title_videos) setTitleVideos(d.title_videos);
      setSlideshowEnabled(Boolean(d.slideshow_enabled));

      const secs: LpSection[] = [];
      secs.push({ type: "about", title: d.title_about ?? "Über uns", content: d.what_we_offer ?? "", image: "", file: null });
      secs.push({ type: "hours", title: d.title_hours ?? "Öffnungszeiten", content: d.oeffnungszeiten ?? "", image: "", file: null });
      if (d.aktuelles || d.title_news) secs.push({ type: "news", title: d.title_news ?? "Aktuelles", content: d.aktuelles ?? "", image: "", file: null });
      if (d.angebote || d.title_happyhour) secs.push({ type: "offers", title: d.title_happyhour ?? "Angebote", content: d.angebote ?? "", image: "", file: null });
      for (const cs of d.custom_sections ?? []) {
        secs.push({ type: "custom", title: cs.title ?? "", content: cs.content ?? "", image: cs.image ?? "", file: null });
      }
      setSections(secs);
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

  const addTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    setSections((prev) => [
      ...prev,
      { type: "custom", title: tpl.title, content: tpl.content, image: "", file: null },
    ]);
  };

  const updateSection = (idx: number, patch: Partial<LpSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeSection = (idx: number) => {
    if (!confirm("Diese Sektion wirklich löschen?")) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
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
        const custom = (d.custom_sections ?? []).map((s) =>
          s.image === url ? { ...s, image: "" } : s
        );
        d.custom_sections = custom;
        setSections((prev) =>
          prev.map((s) => (s.image === url ? { ...s, image: "" } : s))
        );
      }
      return d;
    });
    pushToast("Datei gelöscht");
  };

  const save = async () => {
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
      await load();
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-zinc-400">Lade Landingpage…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-zinc-100">Landingpage</h2>
        <button
          onClick={() => void save()}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Speichern…" : "Speichern"}
        </button>
      </div>

      {/* Willkommens-Bereich */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-400">Willkommens-Bereich</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Willkommens-Titel</label>
            <input
              className={inputCls}
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              placeholder="z.B. Willkommen bei unserem Restaurant"
            />
          </div>
          <div>
            <label className={labelCls}>Willkommens-Untertitel</label>
            <input
              className={inputCls}
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              placeholder="z.B. Genieße deinen Aufenthalt"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Google Bewertung Link</label>
            <input
              className={inputCls}
              value={googleRatingUrl}
              onChange={(e) => setGoogleRatingUrl(e.target.value)}
              placeholder="https://g.page/r/…"
            />
          </div>
        </div>
      </section>

      {/* Eigene Sektionen */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-400">Eigene Sektionen</h3>
        <p className="mb-3 text-xs text-zinc-500">
          Markdown wird unterstützt: <code>**fett**</code> · <code>*kursiv*</code> · <code>## Überschrift</code> ·{" "}
          <code>{`{gold}Text{/gold}`}</code> · <code>---</code> · <code>- Eintrag</code>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.key} type="button" onClick={() => addTemplate(t)} className={btnCls}>
              + {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {sections.map((s, idx) => (
            <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  {s.type}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveSection(idx, -1)} className={btnCls} disabled={idx === 0}>↑</button>
                  <button type="button" onClick={() => moveSection(idx, 1)} className={btnCls} disabled={idx === sections.length - 1}>↓</button>
                  <button type="button" onClick={() => removeSection(idx)} className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-300 hover:border-red-700">
                    Löschen
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  className={inputCls}
                  value={s.title}
                  onChange={(e) => updateSection(idx, { title: e.target.value })}
                  placeholder="Titel der Sektion"
                />
                <textarea
                  className={`${inputCls} min-h-[70px]`}
                  value={s.content}
                  onChange={(e) => updateSection(idx, { content: e.target.value })}
                  placeholder="Inhalt der Sektion (optional)…"
                />
                {s.type === "custom" ? (
                  <div className="flex flex-wrap items-start gap-3">
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                      className={fileCls}
                      onChange={(e) => updateSection(idx, { file: e.target.files?.[0] ?? null })}
                    />
                    {s.image ? (
                      <div className="group relative">
                        <MediaThumb url={s.image} />
                        <button
                          type="button"
                          onClick={() => void deleteMedia(s.image, "custom")}
                          className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/60 text-xs font-semibold text-red-300 group-hover:flex"
                        >
                          Bild löschen
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Was wir bieten / Highlights */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-400">Was wir bieten / Highlights</h3>
        <div className="mb-2">
          <label className={labelCls}>Titel</label>
          <input className={inputCls} value={titleOffers} onChange={(e) => setTitleOffers(e.target.value)} />
        </div>
        <label className={labelCls}>Bilder &amp; Videos hinzufügen (Videos max. 40s)</label>
        <input
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
          className={fileCls}
          onChange={(e) => setOfferFiles(Array.from(e.target.files ?? []))}
        />
        {offerFiles.length > 0 ? (
          <p className="mt-1 text-xs text-zinc-400">{offerFiles.length} neue Datei(en) bereit zum Speichern</p>
        ) : null}
        <MediaGrid urls={data?.offer_images ?? []} type="offer" onDelete={deleteMedia} />
        <MediaGrid urls={data?.offer_videos ?? []} type="offer_video" onDelete={deleteMedia} />
      </section>

      {/* Diashow */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-400">Diashow (Hintergrund)</h3>
        <label className="mb-3 flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={slideshowEnabled}
            onChange={(e) => setSlideshowEnabled(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Diashow aktivieren
        </label>
        <label className={labelCls}>Bilder &amp; Videos hinzufügen (Videos max. 40s)</label>
        <input
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
          className={fileCls}
          onChange={(e) => setSlideshowFiles(Array.from(e.target.files ?? []))}
        />
        {slideshowFiles.length > 0 ? (
          <p className="mt-1 text-xs text-zinc-400">{slideshowFiles.length} neue Datei(en) bereit zum Speichern</p>
        ) : null}
        <MediaGrid urls={data?.slideshow_images ?? []} type="slideshow" onDelete={deleteMedia} />
        <MediaGrid urls={data?.slideshow_videos ?? []} type="slideshow_video" onDelete={deleteMedia} />
      </section>

      {/* Galerie & Videos */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-400">Galerie &amp; Videos</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Titel: Galerie</label>
            <input className={inputCls} value={titleGallery} onChange={(e) => setTitleGallery(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Titel: Videos</label>
            <input className={inputCls} value={titleVideos} onChange={(e) => setTitleVideos(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelCls}>Galerie-Bilder (werden im Grid angezeigt)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
            className={fileCls}
            onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
          />
          {galleryFiles.length > 0 ? (
            <p className="mt-1 text-xs text-zinc-400">{galleryFiles.length} neue Datei(en) bereit zum Speichern</p>
          ) : null}
          <MediaGrid urls={data?.gallery_images ?? []} type="gallery" onDelete={deleteMedia} />
          <MediaGrid urls={data?.gallery_videos ?? []} type="gallery_video" onDelete={deleteMedia} />
        </div>
        <div className="mt-3">
          <label className={labelCls}>Videos (max. 40s)</label>
          <input
            type="file"
            multiple
            accept="video/mp4,video/webm,video/quicktime,video/*"
            className={fileCls}
            onChange={(e) => setVideoFiles(Array.from(e.target.files ?? []))}
          />
          {videoFiles.length > 0 ? (
            <p className="mt-1 text-xs text-zinc-400">{videoFiles.length} neue Datei(en) bereit zum Speichern</p>
          ) : null}
          <MediaGrid urls={data?.videos ?? []} type="video" onDelete={deleteMedia} />
        </div>
      </section>
    </div>
  );
}