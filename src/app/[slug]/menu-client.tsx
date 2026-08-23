"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createLiveClient, type LiveEvent } from "@/lib/live";
import type {
  ActiveEventInfo,
  CategoryExtras,
  ComboInfo,
  MenuData,
  MenuProduct,
} from "@/lib/menu";

// ──────────────────────────────────────────────────────────────────
// 1:1 React port of templates/menu.html + menu-script-1/2 (guest app).
// The only intentional deviation: WebSockets → SSE (createLiveClient).
// ──────────────────────────────────────────────────────────────────

const T = {
  de: {
    tab_menu: "Speisekarte",
    tab_welcome: "Willkommen",
    view_menu: "Speisekarte ansehen",
    rate_us: "Bewerten Sie uns auf Google",
    scan_required_header: "QR-Code Scan erforderlich",
    scan_required_desc:
      "Um unsere Speisekarte anzusehen und Bestellungen direkt aufzugeben, scannen Sie bitte den QR-Code an Ihrem Tisch.",
    your_cart: "Ihr Warenkorb",
    cart_btn: "Warenkorb",
    basket_total: "Gesamtsumme:",
    order_pay: "Jetzt bestellen",
    order_sending: "Wird gesendet…",
    order_locked: "Bestellung gesperrt (Tisch scannen)",
    thank_you: "Bestellung erhalten!",
    thank_you_desc:
      "Ihre Bestellung wird frisch zubereitet. Die Abrechnung erfolgt am Ende über unsere Servicekräfte.",
    more_orders: "Weitere Bestellungen aufnehmen",
    empty_cart: "Ihr Warenkorb ist leer.",
    cart_item_note: "Hinweis (z.B. ohne Zwiebeln, medium, extra scharf…)",
    impressum: "Impressum",
    datenschutz: "Datenschutz",
    service_header_modal: "Was benötigst du?",
    service_desc_modal:
      "Wähle eine Option und unser Service-Team kommt zu dir.",
    btn_kellner: "🛎️ Kellner rufen",
    btn_kohle: "💨 Kohle bestellen",
    btn_send_request: "Anfrage senden",
    payment_header_modal: "Rechnung anfordern",
    payment_desc_modal: "Wie möchtest du deine Rechnung begleichen?",
    payment_outstanding: "Offener Betrag",
    pay_bar: "Bar zahlen",
    pay_card: "Mit Karte zahlen",
    btn_pay_confirm: "Abschließen & Bezahlen",
    cookie_header: "Datenschutz & Cookies",
    cookie_desc:
      "Wir nutzen ausschließlich technisch essenzielle Session-Cookies, um die Tisch-Zuweisung, Bestellungen und Logins zu ermöglichen. Ohne diese Cookies kann der Dienst nicht angeboten werden.",
    cookie_privacy: "Datenschutzerklärung",
    cookie_btn: "Einverstanden",
    nav_service: "Service",
    nav_bill: "Rechnung",
    dashboard: "Dashboard",
    in_cart: "In den Warenkorb",
    add: "Hinzufügen",
    now_offer: "Jetzt im Angebot",
    combo_deals: "Kombi-Angebote",
    back: "Zurück",
    note_pin: "Bitte scannen Sie den QR-Code an Ihrem Tisch.",
    service_sent: "Anfrage gesendet!",
    payment_sent: "Rechnung angefordert!",
    order_error: "Bestellung fehlgeschlagen",
    order_ok: "Bestellung #%s aufgegeben",
    sold_out: "Ausverkauft",
    order_lock: "Bestellungen sind derzeit nicht möglich — gerne direkt vor Ort bestellen.",
  },
  en: {
    tab_menu: "Menu",
    tab_welcome: "Welcome",
    view_menu: "View Menu",
    rate_us: "Rate us on Google",
    scan_required_header: "QR-Code Scan Required",
    scan_required_desc:
      "To view our menu and place orders directly, please scan the QR code at your table.",
    your_cart: "Your Cart",
    cart_btn: "Cart",
    basket_total: "Total:",
    order_pay: "Place order",
    order_sending: "Sending…",
    order_locked: "Order locked (scan table code)",
    thank_you: "Order received!",
    thank_you_desc:
      "Your order is being freshly prepared. Payment is collected by our staff at the end.",
    more_orders: "Take more orders",
    empty_cart: "Your cart is empty.",
    cart_item_note: "Note (e.g. no onions, medium, extra spicy…)",
    impressum: "Legal notice",
    datenschutz: "Privacy",
    service_header_modal: "How can we help you?",
    service_desc_modal:
      "Choose an option and our service team will come to you.",
    btn_kellner: "🛎️ Call waiter",
    btn_kohle: "💨 Order coal",
    btn_send_request: "Send request",
    payment_header_modal: "Request bill",
    payment_desc_modal: "How would you like to pay?",
    payment_outstanding: "Outstanding amount",
    pay_bar: "Pay cash",
    pay_card: "Pay by card",
    btn_pay_confirm: "Confirm & pay",
    cookie_header: "Privacy & Cookies",
    cookie_desc:
      "We only use technically essential session cookies to enable table assignment, orders and logins. Without these cookies the service cannot be offered.",
    cookie_privacy: "Privacy policy",
    cookie_btn: "I agree",
    nav_service: "Service",
    nav_bill: "Bill",
    dashboard: "Dashboard",
    in_cart: "Add to cart",
    add: "Add",
    now_offer: "Now on offer",
    combo_deals: "Combo deals",
    back: "Back",
    note_pin: "Please scan the QR code at your table.",
    service_sent: "Request sent!",
    payment_sent: "Bill requested!",
    order_error: "Order failed",
    order_ok: "Order #%s placed",
    sold_out: "Sold out",
    order_lock: "Orders are currently not possible — please order in person.",
  },
} as const;

type Lang = keyof typeof T;

function formatEur(value: number): string {
  return value.toFixed(2).replace(".", ",") + " €";
}

function parseActiveTableNum(raw: string): { num: string; zone: string } {
  let clean = String(raw).trim();
  if (clean.startsWith("Tisch ")) clean = clean.slice("Tisch ".length).trim();
  let zone = "";
  if (clean.includes("(") && clean.endsWith(")")) {
    const idx = clean.indexOf("(");
    zone = clean.slice(idx + 1, -1).trim();
    clean = clean.slice(0, idx).trim();
  }
  return { num: clean, zone };
}

function MenuImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={props.alt ?? ""} {...props} />;
}

function MaterialIcon({
  children,
  className = "",
  style,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

interface TableItem {
  order_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  note: string;
  extras?: string | null;
  status: string;
  key: string;
  unit_index: number;
}

// Parst die Extras-JSON einer Bestellposition und trennt die Variante
// (wird als "Variante: X"-Extra mitgeschickt) von echten Extras.
function parseItemOptions(
  raw?: string | null
): { variant: string | null; extras: string[] } {
  if (!raw) return { variant: null, extras: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { variant: null, extras: [] };
    let variant: string | null = null;
    const extras: string[] = [];
    for (const e of parsed) {
      const name = String((e as { name?: unknown })?.name ?? "").trim();
      if (!name) continue;
      if (name.startsWith("Variante:")) {
        variant = name.replace(/^Variante:\s*/, "");
      } else {
        extras.push(name);
      }
    }
    return { variant, extras };
  } catch {
    return { variant: null, extras: [] };
 }
}

// Entfernt die automatisch erzeugten Segmente ("Variante: …", "Extras: …")
// aus der Notiz — sie werden strukturiert als Chips angezeigt.
function cleanAutoNote(note?: string | null): string {
  if (!note) return "";
  return note
    .split(" | ")
    .filter(
      (seg) =>
        seg.trim() !== "" &&
        !seg.startsWith("Variante:") &&
        !seg.startsWith("Extras:")
    )
    .join(" | ");
}

interface CartItem {
  cart_id: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  note: string;
  category_type: string;
  extras: { name: string; price: number }[];
  variant?: { name: string; price: number } | null;
}

function WeatherWidget({ address }: { address?: string }) {
  const [weather, setWeather] = useState<{ temp: number; icon: string; desc: string } | null>(null);
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Koordinaten aus Adresse ermitteln
        let lat = 50.05;
        let lon = 7.45;
        if (address) {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=de`);
          if (geoRes.ok) {
            const geoData = (await geoRes.json()) as { results?: { latitude: number; longitude: number }[] };
            if (geoData.results && geoData.results.length > 0) {
              lat = geoData.results[0].latitude;
              lon = geoData.results[0].longitude;
            }
          }
        }
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          current_weather?: { temperature: number; weathercode: number };
        };
        const cw = data.current_weather;
        if (!cw) return;
        const code = cw.weathercode;
        let icon = "☀️";
        let desc = "Klar";
        if (code <= 1) { icon = "☀️"; desc = "Klar"; }
        else if (code <= 3) { icon = "⛅"; desc = "Bewölkt"; }
        else if (code <= 49) { icon = "🌫️"; desc = "Nebel"; }
        else if (code <= 69) { icon = "🌧️"; desc = "Regen"; }
        else if (code <= 79) { icon = "❄️"; desc = "Schnee"; }
        else if (code <= 84) { icon = "🌧️"; desc = "Regen"; }
        else if (code <= 99) { icon = "⛈️"; desc = "Gewitter"; }
        setWeather({ temp: Math.round(cw.temperature), icon, desc });
      } catch { /* ignore */ }
    };
    void fetchWeather();
  }, [address]);
  if (!weather) return null;
  return (
    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
      <span className="text-base">{weather.icon}</span>
      <span>{weather.temp}°C</span>
    </span>
  );
}

export function MenuClient({
  slug,
  menu,
  table,
  token,
  isReadonly,
  role,
  tischName,
  ordersEnabled,
}: {
  slug: string;
  menu: MenuData;
  table: string | null;
  token: string | null;
  isReadonly: boolean;
  role: string;
  tischName: string;
  ordersEnabled: boolean;
}) {
  const t = menu.tenant;
  const lang = useLang();
  const tr = T[lang];
  const ordersAllowed = ordersEnabled;

  const [currentView, setCurrentView] = useState<"landing" | "speisekarte">(
    "landing"
  );
  const [slideshowIdx, setSlideshowIdx] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [comboModalData, setComboModalData] = useState<ComboInfo | null>(null);
  const [comboStep, setComboStep] = useState(0);
  const [comboSelections, setComboSelections] = useState<Record<string, number>>({});
  const [offerSheetOpen, setOfferSheetOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [sheetProduct, setSheetProduct] = useState<MenuProduct | null>(null);
  const [sheetQty, setSheetQty] = useState(1);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<"impressum" | "datenschutz" | null>(
    null
  );
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("kellner");
  const [selectedPaymentType, setSelectedPaymentType] =
    useState("zahlen_bar");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowTs, setNowTs] = useState<number>(0);
  const [unpaidSum, setUnpaidSum] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [cookieBanner, setCookieBanner] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tableOrders, setTableOrders] = useState<{
    pending: TableItem[];
    delivered: TableItem[];
    total: number;
  }>({ pending: [], delivered: [], total: 0 });
  const [selectedSplitKeys, setSelectedSplitKeys] = useState<string[]>([]);
  const [splitQty, setSplitQty] = useState<Record<string, number>>({});
  const [actionInProgress, setActionInProgress] = useState(false);
  const toastIdRef = useRef(0);

  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart]
  );

  const hhProducts = useMemo(
    () =>
      menu.products
        .filter((p) => p.happy_hour_active && p.is_available),
    [menu.products]
  );

  const { num: tableNum } = table ? parseActiveTableNum(table) : { num: "" };

  // ── Toast helper ──
  const pushToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 3000);
    },
    []
  );

  // Idempotenz-Key der laufenden Bestellung — bleibt über Retries
  // (schlechtes Internet) stabil, damit der Server keine Doppelbestellung anlegt.
  const orderIdemKeyRef = useRef<string | null>(null);
  const newOrderIdemKey = () => {
    if (!orderIdemKeyRef.current) {
      orderIdemKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    }
    return orderIdemKeyRef.current;
  };

  // ── Cookie banner ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem("dg-cookie-accepted")) {
      const tId = setTimeout(() => setCookieBanner(true), 1200);
      return () => clearTimeout(tId);
    }
  }, []);

  function acceptCookies() {
    window.localStorage.setItem("dg-cookie-accepted", "1");
    setCookieBanner(false);
  }

  // ── Service cooldown (label + disabled state derived from a ticking `nowTs`) ──
  useEffect(() => {
    if (cooldownUntil <= 0) return;
    const iv = setInterval(() => {
      if (cooldownUntil - Date.now() <= 0) {
        clearInterval(iv);
        setNowTs(0);
      } else {
        setNowTs(Date.now());
      }
    }, 250);
    return () => clearInterval(iv);
  }, [cooldownUntil]);
  const inCooldown = cooldownUntil > 0 && nowTs > 0;
  const cooldownLabel = inCooldown
    ? `${Math.ceil((cooldownUntil - nowTs) / 1000)}s`
    : null;

  // ── Background slideshow crossfade (legacy menu-script-2.html ~457-513) ──
  useEffect(() => {
    const lp = menu.tenant.landing_page;
    const images = (lp.slideshow_images as string[]) || [];
    const videos = (lp.slideshow_videos as string[]) || [];
    if (!lp.slideshow_enabled || (images.length <= 1 && videos.length <= 1)) return;
    const slide = () => {
      if (currentView !== "landing") return;
      setSlideshowIdx((prev) => {
        const total = Math.max(images.length, videos.length);
        return (prev + 1) % total;
      });
    };
    const iv = setInterval(slide, 6000);
    const onHide = () => clearInterval(iv);
    const onVis = () => {
      if (document.hidden) clearInterval(iv);
    };
    document.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [menu.tenant.landing_page, currentView]);

  // ── Admin drawer: table orders ──
  const refreshTableOrders = useCallback(async () => {
    if (!tableNum) return;
    try {
      const res = await fetch(
        `/api/${slug}/table-status/${encodeURIComponent(tableNum)}`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          pending: TableItem[];
          delivered: TableItem[];
          total: number;
        };
        setTableOrders(data);
      }
    } catch {
      // ignore
    }
  }, [slug, tableNum]);

  // ── Live updates ──
  useEffect(() => {
    if (isReadonly) return;
    const live = createLiveClient(slug, {
      channels: ["update", "refresh_tables", "new_order", "service_call"],
      onEvent: (event: LiveEvent) => {
        void event;
        refreshTableOrders();
      },
    });
    return () => live.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isReadonly]);

  useEffect(() => {
    if (!isReadonly && tableNum && role === "admin") {
      const t = setTimeout(refreshTableOrders, 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadonly, tableNum, role]);

  // ── Payment modal: outstanding amount ──
  const openPaymentModal = useCallback(async () => {
    setPaymentModalOpen(true);
    if (tableNum) {
      try {
        const res = await fetch(
          `/api/${slug}/table-unpaid-sum/${encodeURIComponent(tableNum)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { unpaid_sum: number };
          setUnpaidSum(data.unpaid_sum ?? 0);
        }
      } catch {
        // ignore
      }
    }
  }, [slug, tableNum]);

  // ── Cart ──
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  function addToCart(
    product: MenuProduct,
    quantity = 1,
    note = "",
    selectedExtras: { name: string; price: number }[] = [],
    variant: { name: string; price: number } | null = null
  ) {
    const effective =
      product.happy_hour_active && product.happy_hour_display_price !== null
        ? product.happy_hour_display_price
        : product.display_price;
    const extraTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
    const finalPrice = effective + extraTotal + (variant?.price ?? 0);
    const extrasKey = JSON.stringify(selectedExtras.map((e) => e.name).sort());
    const variantKey = variant ? variant.name : "";
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.product_id === product.id &&
          i.note === note &&
          i.price === finalPrice &&
          (i.variant?.name ?? "") === variantKey &&
          JSON.stringify(i.extras.map((e) => e.name).sort()) === extrasKey
      );
      if (existing) {
        return prev.map((i) =>
          i.cart_id === existing.cart_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          cart_id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          product_id: product.id,
          name: lang === "en" && product.name_en ? product.name_en : product.name,
          price: finalPrice,
          quantity,
          note,
          category_type: product.category_type ?? "küche",
          extras: selectedExtras,
          variant,
        },
      ];
    });

    // Haptisches Feedback
    try { navigator.vibrate?.(10); } catch { /* ignore */ }

    // Visuelles Feedback - Animation auf Button
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 800);

    // Toast
    const name = lang === "en" && product.name_en ? product.name_en : product.name;
    pushToast(`${name} hinzugefügt`, "success");
  }

  function changeQty(cartId: string, delta: number) {
    setCart((prev) => {
      const item = prev.find((i) => i.cart_id === cartId);
      if (!item) return prev;
      const qty = item.quantity + delta;
      if (qty <= 0) return prev.filter((i) => i.cart_id !== cartId);
      return prev.map((i) =>
        i.cart_id === cartId ? { ...i, quantity: qty } : i
      );
    });
  }

  // ── Product sheet ──
  function openProductSheet(product: MenuProduct) {
    setSheetProduct(product);
    setSheetQty(1);
    setSheetVisible(true);
  }

  // Quick-Add: Produkte mit Extras oder Varianten öffnen erst das
  // Auswahl-Sheet — der Artikel landet erst nach Bestätigung im Warenkorb.
  // Produkte ohne Extras/Varianten werden direkt hinzugefügt.
  function quickAddToCart(product: MenuProduct) {
    const hasOptions =
      (product.extras && product.extras.length > 0) ||
      (product.variants && product.variants.length > 0);
    if (hasOptions) {
      openProductSheet(product);
      return;
    }
    addToCart(product);
  }
  function closeProductSheet() {
    setSheetVisible(false);
    setTimeout(() => setSheetProduct(null), 250);
  }
  function mpSheetAdd(
    extras: { name: string; price: number }[],
    variant: { name: string; price: number } | null
  ) {
    if (!sheetProduct) return;
    addToCart(sheetProduct, sheetQty, "", extras, variant);
    closeProductSheet();
    pushToast(tr.in_cart);
  }

  // ── Order submission ──
  async function submitOrder() {
    if (cart.length === 0 || isSubmitting) return;
    if (!table) {
      pushToast(tr.order_locked, "error");
      return;
    }
    setIsSubmitting(true);
    // Key wird erst nach erfolgreicher Antwort zurückgesetzt — bei
    // Netzfehlern verwendet der Retry denselben Key und der Server
    // liefert die bereits angelegte Bestellung statt einer Doppelbestellung.
    const idemKey = newOrderIdemKey();
    try {
      const res = await fetch(`/${slug}/bestellen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          items: cart.map((i) => {
            const extraText = (i.extras ?? []).map((e) => e.name).join(", ");
            const variantText = i.variant ? `Variante: ${i.variant.name}` : "";
            const fullNote = [variantText, i.note, extraText ? `Extras: ${extraText}` : ""]
              .filter(Boolean)
              .join(" | ");
            // Variante fließt als Aufpreis-Position in die Extras-Pipeline,
            // damit der Server den Endpreis korrekt berechnet.
            const extrasPayload = [
              ...(i.variant ? [{ name: `Variante: ${i.variant.name}`, price: i.variant.price }] : []),
              ...(i.extras ?? []).map((e) => ({ name: e.name, price: e.price })),
            ];
            return {
              product_id: i.product_id,
              quantity: i.quantity,
              note: fullNote || null,
              extras: extrasPayload,
            };
          }),
          tip_amount: 0,
          idempotency_key: idemKey,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        order_id?: number;
      };
      if (!res.ok || !data.success) {
        pushToast(data.error || tr.order_error, "error");
        return;
      }
      orderIdemKeyRef.current = null; // neue Bestellung → neuer Key
      setCart([]);
      setCartModalOpen(false);
      setThankYouOpen(true);
      pushToast(tr.order_ok.replace("%s", String(data.order_id ?? "")));
    } catch {
      pushToast(tr.order_error, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Service & payment requests ──
  async function confirmServiceRequest() {
    if (cooldownUntil > Date.now() || !table || !token) return;
    try {
      const res = await fetch(`/api/${slug}/call-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedServiceType,
          table,
          token,
        }),
      });
      if (res.ok) {
        setCooldownUntil(Date.now() + 30000);
        setServiceModalOpen(false);
        pushToast(tr.service_sent);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        pushToast(data.error || tr.order_error, "error");
      }
    } catch {
      pushToast(tr.order_error, "error");
    }
  }

  async function confirmPaymentRequest() {
    if (cooldownUntil > Date.now() || !table || !token) return;
    try {
      const res = await fetch(`/api/${slug}/call-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedPaymentType,
          table,
          token,
        }),
      });
      if (res.ok) {
        setCooldownUntil(Date.now() + 30000);
        setPaymentModalOpen(false);
        pushToast(tr.payment_sent);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        pushToast(data.error || tr.order_error, "error");
      }
    } catch {
      pushToast(tr.order_error, "error");
    }
  }

  // ── Admin drawer actions ──
  const pendingByOrder = useMemo(() => {
    const map = new Map<number, TableItem[]>();
    for (const item of tableOrders.pending) {
      const list = map.get(item.order_id) ?? [];
      list.push(item);
      map.set(item.order_id, list);
    }
    return map;
  }, [tableOrders.pending]);

  async function serveSingleItem(item: TableItem) {
    setActionInProgress(true);
    try {
      const res = await fetch(`/admin/orders/serve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: item.order_id, item_key: item.key }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        pushToast(data.error || tr.order_error, "error");
      } else {
        refreshTableOrders();
      }
    } catch {
      pushToast(tr.order_error, "error");
    } finally {
      setActionInProgress(false);
    }
  }

  async function serveAllPending() {
    setActionInProgress(true);
    try {
      const orderIds = [
        ...new Set(tableOrders.pending.map((i) => i.order_id)),
      ];
      await Promise.all(
        orderIds.map((orderId) =>
          fetch(`/admin/orders/serve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId }),
          })
        )
      );
      await refreshTableOrders();
    } finally {
      setActionInProgress(false);
    }
  }

  async function cancelItem(item: TableItem) {
    setActionInProgress(true);
    try {
      await fetch(`/${slug}/tablet/cancel-item/${item.order_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_key: item.key, quantity: 1 }),
      });
      await refreshTableOrders();
    } finally {
      setActionInProgress(false);
    }
  }

  function toggleSplitCheckbox(item: TableItem) {
    setSelectedSplitKeys((prev) =>
      prev.includes(item.key)
        ? prev.filter((k) => k !== item.key)
        : [...prev, item.key]
    );
  }

  function getSplitQty(item: TableItem): number {
    return splitQty[item.key] ?? 1;
  }

  function adjustSplitQty(item: TableItem, delta: number) {
    setSplitQty((prev) => {
      const cur = prev[item.key] ?? 1;
      const next = Math.max(1, Math.min(item.quantity, cur + delta));
      return { ...prev, [item.key]: next };
    });
  }

  const splitTotal = useMemo(() => {
    let total = 0;
    for (const item of tableOrders.delivered) {
      if (selectedSplitKeys.includes(item.key)) {
        total += item.price * getSplitQty(item);
      }
    }
    return total;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSplitKeys, tableOrders.delivered, splitQty]);

  async function submitDrawerPayment(partial: boolean) {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      const orders = new Map<number, TableItem[]>();
      const pool = partial
        ? tableOrders.delivered.filter((i) => selectedSplitKeys.includes(i.key))
        : tableOrders.delivered;
      for (const item of pool) {
        const list = orders.get(item.order_id) ?? [];
        list.push(item);
        orders.set(item.order_id, list);
      }
      for (const [orderId, items] of orders.entries()) {
        if (partial) {
          // Group units into quantity per product+note
          const grouped = new Map<string, { product_id: number; quantity: number; note: string }>();
          for (const it of items) {
            const qty = getSplitQty(it);
            const gKey = `${it.product_id}|${it.note}`;
            const g = grouped.get(gKey) ?? {
              product_id: it.product_id,
              quantity: 0,
              note: it.note,
            };
            g.quantity += qty;
            grouped.set(gKey, g);
          }
          await fetch(`/${slug}/tablet/teilzahlung/${orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: Array.from(grouped.values()) }),
          });
        } else {
          await fetch(`/${slug}/tablet/bezahlen/${orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        }
      }
      setSelectedSplitKeys([]);
      setSplitQty({});
      await refreshTableOrders();
    } catch {
      pushToast(tr.order_error, "error");
    } finally {
      setActionInProgress(false);
    }
  }

  // ── Category helpers ──
  const parentProducts = useMemo(() => {
    if (!currentCategory) return menu.products;
    return menu.products.filter(
      (p) =>
        p.category === currentCategory ||
        p.category.startsWith(`${currentCategory} > `)
    );
  }, [currentCategory, menu.products]);

  const categoryExtras = useMemo(() => {
    if (!currentCategory) return [] as CategoryExtras[];
    const extras: CategoryExtras[] = [];
    const seen = new Set<string>();
    for (const c of menu.categories) {
      if (c.name === currentCategory || c.name.startsWith(`${currentCategory} > `)) {
        for (const ex of c.extras) {
          if (!seen.has(ex.name)) {
            seen.add(ex.name);
            extras.push(ex);
          }
        }
      }
    }
    return extras;
  }, [currentCategory, menu.categories]);

  // ── Cart upsell candidates ──
  const upsellItems = useMemo(() => {
    if (cart.length === 0) return [] as MenuProduct[];
    const cartCats = new Set(cart.map((i) => i.category_type));
    const cartIds = new Set(cart.map((i) => i.product_id));
    return menu.products
      .filter((p) => p.is_available && !cartIds.has(p.id))
      .filter(
        (p) =>
          p.category_type !== null &&
          cartCats.has(p.category_type) &&
          !p.happy_hour_active
      )
      .slice(0, 2);
  }, [cart, menu.products]);

  // ── Read-only scan overlay ──
  if (isReadonly) {
    return (
      <main className="flex flex-1 items-center justify-center p-4" style={{ minHeight: "100dvh" }}>
        <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center sm:p-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl text-primary">
            <MaterialIcon className="text-4xl">qr_code_scanner</MaterialIcon>
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-on-surface">
            {tr.scan_required_header}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            {tr.scan_required_desc}
          </p>
        </div>
      </main>
    );
  }

  const isGuest = role !== "waiter";
  const showBottomNav = false;
  const showCartBar = false;
  const showGuestFab = !isReadonly && !!table && isGuest;

  return (
    <div className="flex flex-col bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Landing slideshow - runs on all views (welcome + menu) */}
      {menu.tenant.landing_page.slideshow_enabled &&
      (menu.tenant.landing_page.slideshow_images?.length ||
        menu.tenant.landing_page.slideshow_videos?.length) ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          {(() => {
            const sImages = (menu.tenant.landing_page.slideshow_images as string[]) || [];
            const sVideos = (menu.tenant.landing_page.slideshow_videos as string[]) || [];
            const hasVideos = sVideos.length > 0;
            const videoIdx = hasVideos ? slideshowIdx % sVideos.length : 0;
            const imageIdx = sImages.length > 0 ? slideshowIdx % sImages.length : 0;
            return (
              <>
                {hasVideos ? (
                  <div className="absolute inset-0">
                    {sVideos.map((vid, i) => (
                      <video
                        key={i}
                        src={vid}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                          i === videoIdx ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
                {sImages.length > 0 ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{
                      backgroundImage: `url('${sImages[imageIdx]}')`,
                      opacity: hasVideos ? 0 : 1,
                    }}
                  />
                ) : null}
              </>
            );
          })()}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
        </div>
      ) : null}

      {/* Header - Glassmorphism */}
      <header
        className="sticky top-0 z-50 w-screen bg-white/60 backdrop-blur-2xl"
        style={{
          width: "100vw",
          height: "calc(4rem + env(safe-area-inset-top, 0px))",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="grid h-full grid-cols-3 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {(role === "admin" || role === "waiter") && (
              <a
                href={`/${slug}/admin`}
                className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-white hover:shadow-md"
              >
                <MaterialIcon style={{ fontSize: 14 }}>arrow_back</MaterialIcon>
                <span>{tr.dashboard}</span>
              </a>
            )}
            {role !== "admin" && role !== "waiter" && t.logo_url ? (
              <MenuImg
                alt={`${t.name} Logo`}
                className="header-logo h-10 w-auto max-w-[120px] object-contain sm:h-12 sm:max-w-[160px]"
                src={t.logo_url}
                decoding="async"
                fetchPriority="high"
              />
            ) : null}
            {role !== "admin" && role !== "waiter" && !t.logo_url ? (
              <span className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {t.name}
              </span>
            ) : null}
          </div>

          <div className="flex justify-center">
            <WeatherWidget address={t.address ? `${t.address} ${t.ort || ""}` : undefined} />
          </div>

          <div className="flex justify-end">
            <span className="hidden rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 shadow-sm sm:inline-flex">
              Play World <span className="text-gray-400">(Soon)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Event / announcement banners */}
      {menu.activeEvents.map((ev) => (
        <EventBanner key={ev.id} ev={ev} />
      ))}

      {/* Main canvas */}
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4">
        {/* ── LANDING VIEW ── */}
        <div className={currentView === "landing" ? "animate-fade-in" : "hidden"}>
          <LandingView
            menu={menu}
            tr={tr}
            onOpenMenu={() => setCurrentView("speisekarte")}
            onOpenWallet={() => setWalletModalOpen(true)}
            onOpenLightbox={setLightbox}
          />
        </div>

        {/* ── SPEISEKARTE VIEW ── */}
        <div className={currentView === "speisekarte" ? "animate-fade-in" : "hidden"}>
          <div id="tab-speisekarte">
              {/* Back to Welcome Button */}
              <div className="relative z-10 px-2 pt-4 pb-2">
                <button
                  onClick={() => setCurrentView("landing")}
                  className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 shadow-md backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>{tr.tab_welcome}</span>
                </button>
              </div>

              {/* Title */}
              {currentCategory === "" ? (
                <div className="relative z-10 px-2 pt-2 pb-4 text-center">
                  <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-xl sm:text-3xl" style={{ textShadow: "0 2px 15px rgba(0,0,0,0.25)" }}>
                    {t.name} {tr.tab_menu}
                  </h1>
                </div>
              ) : null}

              {/* Event/Combo + Category - responsive */}
              {currentCategory === "" ? (
                <div className="relative z-10 px-2">
                  {/* Combo & Offer widgets - horizontal scrollable */}
                  {(menu.todayComboEvents.length > 0 || hhProducts.length > 0) ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
                      {/* Combo Widgets */}
                      {menu.todayComboEvents.flatMap((ev) =>
                        ev.combos.map((combo) => (
                          <button
                            key={`combo-${combo.id}`}
                            onClick={() => { setComboModalData(combo); setComboStep(0); setComboSelections({}); setComboModalOpen(true); }}
                            className="group flex-shrink-0 w-32 sm:w-40 aspect-square overflow-hidden rounded-2xl bg-emerald-50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                              <span className="material-symbols-outlined text-3xl text-emerald-500 mb-2">loyalty</span>
                              <h2 className="text-sm font-extrabold text-gray-900 leading-tight">{combo.name}</h2>
                              <span className="mt-1 text-lg font-black text-emerald-600">{formatEur(combo.combo_price)}</span>
                            </div>
                          </button>
                        ))
                      )}

                      {/* Single Angebot Widget */}
                      {hhProducts.length > 0 ? (
                        <button
                          onClick={() => setOfferSheetOpen(true)}
                          className="group flex-shrink-0 w-32 sm:w-40 aspect-square overflow-hidden rounded-2xl bg-amber-50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                            <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">local_offer</span>
                            <h2 className="text-sm font-extrabold text-gray-900 leading-tight">Angebote</h2>
                            <span className="mt-1 text-xs font-medium text-amber-600">{hhProducts.length} Artikel</span>
                          </div>
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Category Tiles - Bild füllt die Kachel komplett ohne Zoom/Beschnitt */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" id="category-list-view">
                    {menu.parentCategories.map((cat, idx) => (
                      <button
                        key={cat.name}
                        id={`cat-btn-${idx + 1}`}
                        data-cat-name={cat.name}
                        onClick={() => { setCurrentCategory(cat.name); setCategorySheetOpen(true); }}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-transparent shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {cat.image ? (
                          <MenuImg
                            alt={cat.name}
                            className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            src={cat.image}
                            loading="eager"
                            decoding="sync"
                          />
                        ) : (
                          <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-gray-300">restaurant</span>
                          </div>
                        )}
                        {/* Label direkt auf dem Bild (eine Einheit, kein separater Widget-BG) */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
                          <h2 className="text-sm font-extrabold tracking-tight text-white drop-shadow-md sm:text-base">
                            {cat.name}
                          </h2>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Back to categories button when in category */}
              {currentCategory !== "" ? (
                <div className="relative z-10 px-2 pt-4">
                  <button
                    onClick={() => setCurrentCategory("")}
                    className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 shadow-md backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span>{currentCategory}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/30 py-4 text-center text-xs text-gray-500 backdrop-blur-xl">
        <div className="flex justify-center gap-3">
          <button onClick={() => setLegalDoc("impressum")} className="underline hover:text-gray-700">{tr.impressum}</button>
          <span className="text-gray-300">•</span>
          <button onClick={() => setLegalDoc("datenschutz")} className="underline hover:text-gray-700">{tr.datenschutz}</button>
        </div>
        <p className="mt-2 text-[10px] text-gray-400">© 2026 {t.name} — Powered by digi-gastro</p>
      </footer>

      {/* ── Guest floating action buttons ── */}
      {showGuestFab ? (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3" style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
          {/* Service Button */}
          <button
            onClick={() => setServiceModalOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white hover:scale-110 active:scale-90"
            title="Service rufen"
          >
            <span className="material-symbols-outlined text-2xl">notifications_active</span>
          </button>
          {/* Cart Button */}
          <button
            onClick={() => setCartModalOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white hover:scale-110 active:scale-90"
            title="Warenkorb"
          >
            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-black text-white shadow-md">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      ) : null}

      {/* ── Category Bottom Sheet ── */}
      {categorySheetOpen && currentCategory ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl bg-white shadow-2xl"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{currentCategory}</h2>
                {categoryExtras.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {categoryExtras.map((ex) => (
                      <span key={ex.name} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        {ex.name} <span className="font-bold text-gray-900">+{formatEur(ex.price)}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => { setCategorySheetOpen(false); setCurrentCategory(""); }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 100px)" }}>
              {parentProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">Keine Produkte in dieser Kategorie.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {parentProducts.map((product, idx) => {
                    const isAvail = product.is_available !== false;
                    return (
                      <article
                        key={product.id}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                          !isAvail ? "pointer-events-none opacity-40 grayscale" : ""
                        }`}
                        onClick={() => openProductSheet(product)}
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                          {product.image ? (
                            <MenuImg
                              alt={product.name}
                              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                              src={product.image}
                              loading={idx < 6 ? "eager" : "lazy"}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-gray-300">restaurant</span>
                            </div>
                          )}
                          <div className="absolute left-2 top-2 flex flex-col gap-1">
                            {product.happy_hour_active && (
                              <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">Angebot</span>
                            )}
                            {product.is_vegan && (
                              <span className="rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">Vegan</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-3">
                          <div>
                            <h3 className="mb-0.5 text-sm font-bold leading-tight text-gray-900">
                              {lang === "en" && product.name_en ? product.name_en : product.name}
                            </h3>
                            {product.description && (
                              <p className="text-[11px] leading-relaxed text-gray-500">
                                {lang === "en" && product.description_en ? product.description_en : product.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-end justify-between">
                            <div className="flex flex-col">
                              {product.happy_hour_active && product.happy_hour_display_price !== null ? (
                                <>
                                  <span className="text-[10px] text-gray-400 line-through">{formatEur(product.display_price)}</span>
                                  <span className="text-sm font-black text-gray-900">{formatEur(product.happy_hour_display_price)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-black text-gray-900">{formatEur(product.display_price)}</span>
                              )}
                            </div>
                            {isAvail && ordersAllowed && (
                              <button
                                onClick={(e) => { e.stopPropagation(); quickAddToCart(product); }}
                                className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all active:scale-90 ${
                                  addedProductId === product.id
                                    ? "bg-emerald-500 text-white scale-110"
                                    : "bg-gray-900 text-white hover:bg-gray-700 hover:scale-110"
                                }`}
                                aria-label="In den Warenkorb"
                              >
                                <span className="material-symbols-outlined text-base font-bold">
                                  {addedProductId === product.id ? "check" : "add"}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Combo Selection Modal - Step by Step ── */}
      {comboModalOpen && comboModalData ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl"
            style={{ maxHeight: "85vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{comboModalData.name}</h2>
                <p className="text-lg font-black text-emerald-600">{formatEur(comboModalData.combo_price)}</p>
              </div>
              <button
                onClick={() => { setComboModalOpen(false); setComboStep(0); setComboSelections({}); }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 px-6 py-3">
              {comboModalData.items.map((_, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${idx <= comboStep ? "text-emerald-600" : "text-gray-300"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    idx < comboStep ? "bg-emerald-600 text-white" : idx === comboStep ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {idx < comboStep ? "✓" : idx + 1}
                  </div>
                  {idx < comboModalData.items.length - 1 ? (
                    <div className={`h-0.5 w-8 ${idx < comboStep ? "bg-emerald-600" : "bg-gray-200"}`} />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(85vh - 220px)" }}>
              {(() => {
                const currentItem = comboModalData.items[comboStep];
                if (!currentItem) return null;

                // Specific product - show as pre-selected
                if (currentItem.product_id) {
                  const product = menu.products.find((p) => p.id === currentItem.product_id);
                  if (product) {
                    return (
                      <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-contain bg-white p-1" />
                          ) : null}
                          <div>
                            <p className="text-sm font-bold text-gray-900">{product.name}</p>
                            <p className="text-xs text-emerald-600 font-medium">Im Kombi enthalten</p>
                          </div>
                          <span className="material-symbols-outlined text-emerald-500 ml-auto">check_circle</span>
                        </div>
                      </div>
                    );
                  }
                }

                // Category selection - show only products from this category that are in the combo
                if (currentItem.category_name) {
                  // Get all product_ids from this combo for this category
                  const comboProductIds = comboModalData.items
                    .filter((ci) => ci.product_id && menu.products.find((p) => p.id === ci.product_id && p.category === currentItem.category_name))
                    .map((ci) => ci.product_id!);
                  
                  // Also get products from the category if category_name is set
                  const catProducts = menu.products.filter(
                    (p) => p.category === currentItem.category_name && p.is_available !== false
                  );
                  
                  // Use combo products if available, otherwise all category products
                  const availableProducts = comboProductIds.length > 0 
                    ? menu.products.filter((p) => comboProductIds.includes(p.id) && p.is_available !== false)
                    : catProducts;

                  const selectedId = comboSelections[`step_${comboStep}`];

                  return (
                    <div>
                      <p className="mb-4 text-base font-bold text-gray-900">
                        Wähle 1× <span className="text-emerald-600">{currentItem.category_name}</span>
                      </p>
                      <div className="space-y-2">
                        {availableProducts.map((p) => (
                          <label
                            key={p.id}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors cursor-pointer ${
                              selectedId === p.id ? "bg-emerald-500/20 ring-2 ring-emerald-500/50" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`combo-step-${comboStep}`}
                              checked={selectedId === p.id}
                              onChange={() => setComboSelections((prev) => ({ ...prev, [`step_${comboStep}`]: p.id }))}
                              className="h-5 w-5 accent-emerald-500"
                            />
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-contain bg-white p-1" />
                            ) : null}
                            <div className="flex-1">
                              <span className="text-sm font-bold text-gray-900">{p.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            {/* Navigation Buttons */}
            <div className="border-t border-gray-100 p-4 flex gap-3">
              {comboStep > 0 ? (
                <button
                  onClick={() => setComboStep(comboStep - 1)}
                  className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-base font-bold text-gray-700 transition-all hover:bg-gray-200 active:scale-[0.98]"
                >
                  Zurück
                </button>
              ) : null}
              <button
                onClick={() => {
                  const currentItem = comboModalData.items[comboStep];
                  const selectedId = comboSelections[`step_${comboStep}`];
                  
                  // Check if selection is needed
                  if (currentItem.category_name && !selectedId) {
                    pushToast("Bitte wähle ein Produkt aus.", "error");
                    return;
                  }

                  // Last step - add combo as individual products
                  if (comboStep === comboModalData.items.length - 1) {
                    // Check if combo already in cart
                    const comboNote = `Kombi: ${comboModalData.name}`;
                    const alreadyInCart = cart.some((i) => i.note === comboNote);
                    if (alreadyInCart) {
                      pushToast("Diese Kombi ist bereits im Warenkorb.", "error");
                      return;
                    }

                    // Collect all selected products
                    const comboProducts: MenuProduct[] = [];
                    for (let i = 0; i < comboModalData.items.length; i++) {
                      const item = comboModalData.items[i];
                      let product: MenuProduct | undefined;
                      if (item.product_id) {
                        product = menu.products.find((p) => p.id === item.product_id);
                      } else if (item.category_name) {
                        const selectedId = comboSelections[`step_${i}`];
                        if (selectedId) product = menu.products.find((p) => p.id === selectedId);
                      }
                      if (product) comboProducts.push(product);
                    }

                    if (comboProducts.length === 0) {
                      pushToast("Bitte wähle Produkte aus.", "error");
                      return;
                    }

                    // Add each product with combo price distributed and combo note
                    for (const p of comboProducts) {
                      const comboProduct: MenuProduct = {
                        ...p,
                        display_price: comboModalData.combo_price / comboProducts.length,
                        happy_hour_active: false,
                        happy_hour_display_price: null,
                      };
                      addToCart(comboProduct, 1, comboNote);
                    }

                    setComboModalOpen(false);
                    setComboStep(0);
                    setComboSelections({});
                    pushToast(`${comboModalData.name} hinzugefügt`, "success");
                    return;
                  }

                  // Next step
                  setComboStep(comboStep + 1);
                }}
                className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                {comboStep === comboModalData.items.length - 1 ? `Hinzufügen — ${formatEur(comboModalData.combo_price)}` : "Weiter"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Angebot Bottom Sheet ── */}
      {offerSheetOpen ? (
        <div className="fixed inset-0 z-[65] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOfferSheetOpen(false)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl" style={{ maxHeight: "80vh" }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-amber-500">local_offer</span>
                <h2 className="text-xl font-extrabold text-gray-900">Angebote</h2>
              </div>
              <button onClick={() => setOfferSheetOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(80vh - 100px)" }}>
              <div className="space-y-3">
                {hhProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3" onClick={() => { openProductSheet(p); setOfferSheetOpen(false); }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-contain bg-white p-1" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                        <span className="material-symbols-outlined text-2xl text-gray-300">restaurant</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{p.name}</h3>
                      {p.description && <p className="text-xs text-gray-500 truncate">{p.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 line-through">{formatEur(p.display_price)}</span>
                        <span className="text-sm font-black text-amber-600">{formatEur(p.happy_hour_display_price ?? p.display_price)}</span>
                      </div>
                    </div>
                    {ordersAllowed && (
                      <button onClick={(e) => { e.stopPropagation(); quickAddToCart(p); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm hover:bg-gray-700 active:scale-90">
                        <span className="material-symbols-outlined text-lg font-bold">add</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Cart floating bar - Glassmorphism ── */}
      {showCartBar && cartCount > 0 ? (
        <div
          className="fixed left-1/2 z-40 w-[90%] max-w-lg -translate-x-1/2 rounded-2xl bg-white/80 shadow-2xl transition-all duration-300"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => setCartModalOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-white/90 px-5 py-4 font-bold text-gray-900 shadow-lg transition-all hover:bg-white hover:shadow-xl active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <MaterialIcon className="text-2xl">shopping_basket</MaterialIcon>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-black text-white shadow-md">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">Warenkorb ansehen</div>
                <div className="text-xs text-gray-500">{cartCount} {cartCount === 1 ? 'Artikel' : 'Artikel'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-gray-900">{formatEur(cartTotal)}</div>
              <div className="text-xs text-gray-500">Bestellen</div>
            </div>
          </button>
        </div>
      ) : null}

      {/* ── Bottom navigation - Glassmorphism White tab bar ── */}
      {showBottomNav ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 bg-white/60 backdrop-blur-2xl shadow-lg"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex h-16 items-center justify-around">
            <button
              onClick={() => setCurrentView("landing")}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                currentView === "landing"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <MaterialIcon className="text-2xl">home</MaterialIcon>
              <span className="text-[11px] font-bold">
                {tr.tab_welcome}
              </span>
            </button>
            <button
              onClick={() => setCurrentView("speisekarte")}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                currentView === "speisekarte"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <MaterialIcon className="text-2xl">menu_book</MaterialIcon>
              <span className="text-[11px] font-bold">
                {tr.tab_menu}
              </span>
            </button>
            <button
              onClick={() => setServiceModalOpen(true)}
              disabled={inCooldown}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                inCooldown ? "cursor-not-allowed opacity-50" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <MaterialIcon className="text-2xl">notifications_active</MaterialIcon>
              <span className="text-[11px] font-bold">
                {cooldownLabel || tr.nav_service}
              </span>
            </button>
            <button
              onClick={openPaymentModal}
              disabled={inCooldown}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                inCooldown ? "cursor-not-allowed opacity-50" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <MaterialIcon className="text-2xl">receipt_long</MaterialIcon>
              <span className="text-[11px] font-bold">
                {cooldownLabel || tr.nav_bill}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Admin drawer - nur für Kellner ── */}
      {role === "waiter" && table ? (
        <AdminDrawer
          table={table}
          tableOrders={tableOrders}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          pendingByOrder={pendingByOrder}
          serveSingleItem={serveSingleItem}
          serveAllPending={serveAllPending}
          cancelItem={cancelItem}
          selectedSplitKeys={selectedSplitKeys}
          toggleSplitCheckbox={toggleSplitCheckbox}
          getSplitQty={getSplitQty}
          adjustSplitQty={adjustSplitQty}
          splitTotal={splitTotal}
          submitDrawerPayment={submitDrawerPayment}
          actionInProgress={actionInProgress}
        />
      ) : null}

      {/* ── Product sheet ── */}
      <ProductSheet
        product={sheetProduct}
        qty={sheetQty}
        setQty={setSheetQty}
        visible={sheetVisible}
        lang={lang}
        ordersAllowed={ordersAllowed}
        onClose={closeProductSheet}
        onAdd={mpSheetAdd}
      />

      {/* ── Cart modal ── */}
      <CartModal
        tr={tr}
        open={cartModalOpen}
        cart={cart}
        cartTotal={cartTotal}
        isSubmitting={isSubmitting}
        ordersAllowed={ordersAllowed && !!table}
        lang={lang}
        onClose={() => setCartModalOpen(false)}
        onQty={changeQty}
        onNote={(cartId, note) =>
          setCart((prev) =>
            prev.map((i) => (i.cart_id === cartId ? { ...i, note } : i))
          )
        }
        onSubmit={submitOrder}
        upsell={upsellItems}
        onUpsell={(p) => quickAddToCart(p)}
      />

      {/* ── Service modal ── */}
      <ServiceModal
        tr={tr}
        open={serviceModalOpen}
        isShisha={t.is_shishabar}
        selected={selectedServiceType}
        setSelected={setSelectedServiceType}
        onClose={() => setServiceModalOpen(false)}
        onConfirm={confirmServiceRequest}
      />

      {/* ── Payment modal ── */}
      <PaymentModal
        tr={tr}
        open={paymentModalOpen}
        acceptsCard={t.accepts_card_payment}
        selected={selectedPaymentType}
        setSelected={setSelectedPaymentType}
        unpaidSum={unpaidSum}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={confirmPaymentRequest}
      />

      {/* ── Wallet modal ── */}
      <WalletModal
        slug={slug}
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* ── Legal modal ── */}
      <LegalModal
        tr={tr}
        doc={legalDoc}
        impressum={t.impressum_content}
        datenschutz={t.datenschutz_content}
        onClose={() => setLegalDoc(null)}
      />

      {/* ── Thank you overlay ── */}
      <ThankYouModal
        tr={tr}
        open={thankYouOpen}
        onClose={() => setThankYouOpen(false)}
      />

      {/* ── Cookie banner ── */}
      <CookieBanner
        tr={tr}
        open={cookieBanner}
        onAccept={acceptCookies}
        onPrivacy={() => {
          setCookieBanner(false);
          setLegalDoc("datenschutz");
        }}
      />

      {/* ── Lightbox ── */}
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />

      {/* ── Toasts ── */}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`glass-panel rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl ${
              toast.type === "error" ? "text-rose-300" : "text-emerald-300"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────

function useLang(): Lang {
  const [lang, _setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "de";
    return (window.localStorage.getItem("dg-lang") as Lang) || "de";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("dg-lang", lang);
    } catch {
      // ignore
    }
  }, [lang]);
  return lang;
}

function setLang(lang: Lang) {
  window.localStorage.setItem("dg-lang", lang);
  window.location.reload();
}

function EventBanner({ ev }: { ev: ActiveEventInfo }) {
  if (ev.mode === "announcement") {
    return (
      <div
        className="relative z-40 flex items-center justify-center gap-2 px-4 py-3 text-center text-xs font-bold text-white shadow-lg"
        style={{ background: ev.bannerColor || "#dc2626" }}
      >
        <span className="material-symbols-outlined shrink-0 text-base">campaign</span>
        <span className="leading-snug">
          {ev.displayName ? (
            <strong className="uppercase tracking-wider">{ev.displayName}</strong>
          ) : null}
          {ev.description ? (
            <span className="ml-1 font-medium opacity-95">{ev.description}</span>
          ) : null}
        </span>
      </div>
    );
  }
  return (
    <div className="relative z-40 flex items-center justify-center gap-3 px-4 py-3 text-center shadow-lg" style={{ background: ev.bannerColor || "#059669" }}>
      <span className="material-symbols-outlined text-base text-white/90">local_offer</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          {ev.displayName}
        </span>
        <span className="text-xs font-medium text-white/80">
          {ev.mode === "discount" && ev.discount > 0
            ? `${ev.discount}% auf alles`
            : ev.mode === "combos"
              ? "Kombi-Angebote"
              : "Sonderpreise"}
        </span>
      </div>
    </div>
  );
}

function renderMarkdown(content: string): string {
  let html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^### (.+)$/gm, '<div class="lp-md-h3">$1</div>');
  html = html.replace(/^#### (.+)$/gm, '<div class="lp-md-h4">$1</div>');
  html = html.replace(/^---+$/gm, '<hr class="lp-md-hr">');
  html = html.replace(
    /^- (.+)$/gm,
    '<div class="lp-md-list"><li>$1</li></div>'
  );
  html = html.replace(/\n/g, "<br>");
  return html;
}

function LandingView({
  menu,
  tr,
  onOpenMenu,
  onOpenWallet,
  onOpenLightbox,
}: {
  menu: MenuData;
  tr: (typeof T)[Lang];
  onOpenMenu: () => void;
  onOpenWallet: () => void;
  onOpenLightbox: (url: string) => void;
}) {
  const t = menu.tenant;
  const lp = t.landing_page;
  const lpTitle = (key: string) => String(lp[key] ?? "");
  const title = lpTitle("welcome_title") || `Willkommen bei ${t.name}`;
  const subtitle =
    lpTitle("welcome_subtitle") ||
    "Wir freuen uns, Sie als Gast begrüßen zu dürfen. Genießen Sie Ihren Aufenthalt!";
  const googleRatingUrl = lpTitle("google_rating_url");
  const offerImages = (lp.offer_images as string[]) || [];
  const offerVideos = (lp.offer_videos as string[]) || [];
  const galleryImages = (lp.gallery_images as string[]) || [];
  const galleryVideos = (lp.gallery_videos as string[]) || [];
  const videos = (lp.videos as string[]) || [];
  const customSections = (lp.custom_sections as
    | { title?: string; content?: string; image?: string }[]
    | undefined) || [];

  const firstActiveEvent =
    menu.activeEvents.find((e) => e.mode !== "announcement") ?? null;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-16 pb-8 text-center sm:pt-24 sm:pb-12">
        {/* Logo */}
        {t.logo_url ? (
          <div className="mb-6">
            <MenuImg
              alt={`${t.name} Logo`}
              className="h-40 w-auto max-w-[300px] object-contain drop-shadow-2xl sm:h-52 sm:max-w-[400px]"
              src={t.logo_url}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        ) : null}

        {/* Title */}
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)" }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mb-8 max-w-sm text-sm font-normal leading-relaxed text-white/90 sm:text-base" style={{ textShadow: "0 2px 15px rgba(0,0,0,0.4)" }}>
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">
          <button
            onClick={onOpenMenu}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-white/90 px-8 py-4 text-base font-bold text-gray-900 shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">menu_book</span>
            <span>{tr.view_menu}</span>
          </button>

          {googleRatingUrl ? (
            <a
              href={googleRatingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <GoogleG />
              <span>{tr.rate_us}</span>
            </a>
          ) : null}

          <button
            type="button"
            onClick={onOpenWallet}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 shadow-md backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">loyalty</span>
            <span>Stempelkarte</span>
          </button>
        </div>

        {/* Social Links - unter Stempelkarte, größer */}
        {t.instagram || t.facebook || t.tiktok ? (
          <div className="mt-6 flex items-center justify-center gap-5">
            {t.instagram ? (
              <a href={t.instagram} target="_blank" rel="noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95" title="Instagram">
                <svg viewBox="0 0 448 512" className="h-7 w-7 fill-current"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
              </a>
            ) : null}
            {t.facebook ? (
              <a href={t.facebook} target="_blank" rel="noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95" title="Facebook">
                <svg viewBox="0 0 512 512" className="h-7 w-7 fill-current"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.7 226.4 209.3 245V327.7h-63V256h63v-54.6c0-62.2 37-96.5 93.7-96.5 27.1 0 55.5 4.8 55.5 4.8v61h-31.3c-30.8 0-40.4 19.1-40.4 38.7V256h68.8l-11 71.7h-57.8V501C413.3 482.4 504 379.8 504 256z"/></svg>
              </a>
            ) : null}
            {t.tiktok ? (
              <a href={t.tiktok} target="_blank" rel="noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95" title="TikTok">
                <svg viewBox="0 0 448 512" className="h-7 w-7 fill-current"><path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A138.6 138.6 0 1 1 186.6 211v49.3a90.2 90.2 0 1 0 61.9 85.2V64h47.6a116.5 116.5 0 0 0 12.8 46.5A117.9 117.9 0 0 0 384 136.6h-52.6v73.2a211 211 0 0 1 116.6 0z"/></svg>
              </a>
            ) : null}
          </div>
        ) : null}

        {/* Second Logo - gleiche visuelle Größe wie erstes */}
        {t.logo_url_2 ? (
          <div className="mt-8">
            <MenuImg
              alt={`${t.name} Logo 2`}
              className="h-52 w-auto max-w-[300px] object-contain drop-shadow-2xl sm:h-64 sm:max-w-[400px]"
              src={t.logo_url_2}
              decoding="async"
            />
          </div>
        ) : null}
      </section>

      {/* Active Event */}
      {firstActiveEvent ? (
        <div className="relative z-10 mx-4 mb-8 sm:mx-6">
          <div className="overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-5 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20">
                <span className="material-symbols-outlined text-xl text-amber-300">star</span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-200">{firstActiveEvent.displayName} ist aktiv!</p>
                <p className="text-xs text-white/70">
                  {firstActiveEvent.mode === "discount" && firstActiveEvent.discount > 0
                    ? `${firstActiveEvent.discount}% Rabatt auf fast alle Artikel!`
                    : "Exklusive Aktionspreise auf ausgewählte Artikel!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Offers */}
      {offerImages.length > 0 || offerVideos.length > 0 ? (
        <section className="relative z-10 pb-8">
          {lpTitle("title_offers") ? (
            <h2 className="mb-4 px-6 text-lg font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{lpTitle("title_offers")}</h2>
          ) : null}
          <div className="space-y-4">
            {offerVideos.map((vid, i) => (
              <div key={i} className="overflow-hidden">
                <video src={vid} autoPlay loop muted playsInline className="w-full" />
              </div>
            ))}
            {offerImages.map((img, i) => (
              <div key={i} className="cursor-pointer overflow-hidden px-4 transition-transform hover:scale-[1.01]" onClick={() => onOpenLightbox(img)}>
                <MenuImg src={img} alt="Angebot" className="h-auto w-full rounded-2xl object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {galleryImages.length > 0 || galleryVideos.length > 0 ? (
        <section className="relative z-10 pb-8">
          {lpTitle("title_gallery") ? (
            <h2 className="mb-4 px-6 text-lg font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{lpTitle("title_gallery")}</h2>
          ) : null}
          {galleryVideos.length > 0 ? (
            <div className="mb-4 space-y-4">
              {galleryVideos.map((vid, i) => (
                <div key={i} className="overflow-hidden">
                  <video src={vid} autoPlay loop muted playsInline className="w-full" />
                </div>
              ))}
            </div>
          ) : null}
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="aspect-square cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-transform hover:scale-[1.02]" onClick={() => onOpenLightbox(img)}>
                  <MenuImg src={img} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Videos */}
      {videos.length > 0 ? (
        <section className="relative z-10 pb-8">
          {lpTitle("title_videos") ? (
            <h2 className="mb-4 px-6 text-lg font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{lpTitle("title_videos")}</h2>
          ) : null}
          <div className="space-y-4">
            {videos.map((vid, i) => (
              <div key={i} className="overflow-hidden">
                <video src={vid} autoPlay loop muted playsInline className="w-full" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Info Sections */}
      {customSections.length > 0 ? (
        <section className="relative z-10 space-y-6 px-4 pb-8 sm:px-6">
          {customSections.map((sec, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-xl">
              {sec.title ? <h3 className="mb-3 text-base font-bold text-white drop-shadow-md">{sec.title}</h3> : null}
              {sec.content ? (
                <div className="prose prose-invert prose-sm max-w-none text-white/80" dangerouslySetInnerHTML={{ __html: renderMarkdown(sec.content) }} />
              ) : null}
              {sec.image ? (
                <div className="mt-3 overflow-hidden rounded-xl">
                  <MenuImg src={sec.image} className="h-auto w-full object-contain" loading="lazy" />
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {/* Hours & Info */}
      {lpTitle("oeffnungszeiten") || lpTitle("angebote") ? (
        <section className="relative z-10 grid grid-cols-1 gap-4 px-4 pb-8 sm:px-6 md:grid-cols-2">
          {lpTitle("oeffnungszeiten") ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-xl">
              {lpTitle("title_hours") ? <h3 className="mb-3 text-base font-bold text-white">{lpTitle("title_hours")}</h3> : null}
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{lpTitle("oeffnungszeiten")}</p>
            </div>
          ) : null}
          {lpTitle("angebote") ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-xl">
              {lpTitle("title_happyhour") ? <h3 className="mb-3 text-base font-bold text-white">{lpTitle("title_happyhour")}</h3> : null}
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{lpTitle("angebote")}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function GoogleG() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

function ProductSheet({
  product,
  qty,
  setQty,
  visible,
  lang,
  ordersAllowed,
  onClose,
  onAdd,
}: {
  product: MenuProduct | null;
  qty: number;
  setQty: (n: number) => void;
  visible: boolean;
  lang: Lang;
  ordersAllowed: boolean;
  onClose: () => void;
  onAdd: (
    extras: { name: string; price: number }[],
    variant: { name: string; price: number } | null
  ) => void;
}) {
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<{ name: string; price: number } | null>(null);
  const toggleExtra = (ex: { name: string; price: number }) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.name === ex.name);
      if (exists) return prev.filter((e) => e.name !== ex.name);
      return [...prev, ex];
    });
  };
  if (!product) return null;
  const name = lang === "en" && product.name_en ? product.name_en : product.name;
  const desc =
    lang === "en" && product.description_en
      ? product.description_en
      : product.description;
  const effPrice =
    product.happy_hour_active && product.happy_hour_display_price !== null
      ? product.happy_hour_display_price
      : product.display_price;
  const soldOut = product.is_available === false;
  const extraTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
  const variants = product.variants ?? [];

  return (
    <div
      id="product-sheet"
      className={`fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-md ${
        visible ? "sheet-open" : ""
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="product-sheet-inner"
        className="relative mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-2xl lg:max-w-lg"
        style={{ maxHeight: "92vh" }}
      >
        {/* Bild — object-contain, kein Zoom & kein Beschnitt */}
        <div className="relative flex h-52 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-gray-100 to-white sm:h-60 lg:h-64">
          {product.image ? (
            <MenuImg
              id="mp-sheet-img"
              alt={name}
              className="h-full w-full object-contain p-3"
              src={product.image}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="text-gray-300">
              <MaterialIcon className="text-6xl">restaurant</MaterialIcon>
            </div>
          )}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {product.is_vegan ? (
              <span className="flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                <MaterialIcon className="text-xs font-bold">grass</MaterialIcon>
                <span>Vegan</span>
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white/70 text-gray-700 shadow-md backdrop-blur-xl transition-colors hover:bg-white"
            aria-label="Schließen"
          >
            <MaterialIcon className="text-2xl">close</MaterialIcon>
          </button>
        </div>

        <div className="mp-sheet-body space-y-3 overflow-y-auto p-5 sm:p-6">
          <h3 className="font-display text-2xl font-black leading-tight tracking-tight text-gray-900">
            {name}
          </h3>
          {desc ? <p className="text-sm leading-relaxed text-gray-500">{desc}</p> : null}
          {product.allergens.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product.allergens.map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-baseline gap-2.5">
            {product.happy_hour_active &&
            product.happy_hour_display_price !== null ? (
              <span className="text-sm font-bold text-gray-400 line-through">
                {formatEur(product.display_price)}
              </span>
            ) : null}
            <span className="text-2xl font-black text-primary">{formatEur(effPrice)}</span>
          </div>

          {/* Varianten — Einfachauswahl (Radio) */}
          {variants.length > 0 ? (
            <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Variante wählen
              </p>
              <div className="space-y-2">
                {variants.map((v, vIdx) => {
                  const on = selectedVariant?.name === v.name;
                  return (
                    <label
                      key={`variant-${vIdx}-${v?.name ?? "var"}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        on
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/40"
                          : "bg-white/70 shadow-sm hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mp-variant"
                        checked={on}
                        onChange={() => setSelectedVariant(on ? null : v)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className="flex-1 text-sm font-semibold text-gray-900">{v.name}</span>
                      {v.price > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">+{formatEur(v.price)}</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Extras — Mehrfachauswahl */}
          {product.extras && product.extras.length > 0 ? (
            <div className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Optionen wählen
              </p>
              <div className="space-y-2">
                {product.extras.map((ex, exIdx) => {
                  const on = selectedExtras.some((e) => e.name === ex.name);
                  return (
                    <label
                      key={`extra-${exIdx}-${ex?.name ?? "opt"}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        on
                          ? "bg-emerald-500/10 ring-1 ring-emerald-500/40"
                          : "bg-white/70 shadow-sm hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleExtra(ex)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className="flex-1 text-sm font-semibold text-gray-900">{ex.name}</span>
                      {ex.price > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">+{formatEur(ex.price)}</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="flex shrink-0 items-center gap-3 border-t border-black/5 bg-white/85 p-4 backdrop-blur-xl"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-black/5 transition-all hover:bg-gray-50 active:scale-90"
              aria-label="Weniger"
            >
              <MaterialIcon>remove</MaterialIcon>
            </button>
            <span className="font-display w-8 text-center text-base font-black text-gray-900">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-black/5 transition-all hover:bg-gray-50 active:scale-90"
              aria-label="Mehr"
            >
              <MaterialIcon>add</MaterialIcon>
            </button>
          </div>
          {ordersAllowed && !soldOut ? (
            <button
              onClick={() => onAdd(selectedExtras, selectedVariant)}
              className="flex h-12 flex-grow items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/80 px-4 font-extrabold text-white shadow-lg shadow-emerald-500/20 backdrop-blur-xl transition-all hover:bg-emerald-500 active:scale-95"
            >
              <MaterialIcon className="text-lg font-black">shopping_basket</MaterialIcon>
              <span>In den Warenkorb</span>
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-sm">
                {formatEur((effPrice + extraTotal + (selectedVariant?.price ?? 0)) * qty)}
              </span>
            </button>
          ) : (
            <div className="flex h-12 flex-grow cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 font-black uppercase tracking-wider text-gray-400">
              <MaterialIcon className="text-lg">block</MaterialIcon>
              <span>Ausverkauft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartModal({
  tr,
  open,
  cart,
  cartTotal,
  isSubmitting,
  ordersAllowed,
  lang,
  onClose,
  onQty,
  onNote,
  onSubmit,
  upsell,
  onUpsell,
}: {
  tr: (typeof T)[Lang];
  open: boolean;
  cart: CartItem[];
  cartTotal: number;
  isSubmitting: boolean;
  ordersAllowed: boolean;
  lang: Lang;
  onClose: () => void;
  onQty: (cartId: string, delta: number) => void;
  onNote: (cartId: string, note: string) => void;
  onSubmit: () => void;
  upsell: MenuProduct[];
  onUpsell: (p: MenuProduct) => void;
}) {
  const [upsellCollapsed, setUpsellCollapsed] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-gray-700">shopping_cart</span>
            <h2 className="text-xl font-extrabold text-gray-900">{tr.your_cart}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 200px)" }}>
          {cart.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              {tr.empty_cart}
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const isCombo = item.note?.startsWith("Kombi:");
                return (
                <div key={item.cart_id} className={`rounded-2xl p-4 ${isCombo ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-gray-900 truncate">{item.name}</span>
                      {item.variant ? (
                        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {item.variant.name}
                          {item.variant.price > 0 ? ` +${formatEur(item.variant.price)}` : ""}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-xs font-bold text-emerald-600">{formatEur(item.price)}</span>
                      {item.note ? (
                        <span className="mt-0.5 block text-[11px] text-amber-500">✎ {item.note}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {isCombo ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Kombi</span>
                      ) : (
                        <>
                          <button
                            onClick={() => onQty(item.cart_id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => onQty(item.cart_id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-300"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {!isCombo && (
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => onNote(item.cart_id, e.target.value)}
                      placeholder={tr.cart_item_note}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upsell */}
        {cart.length > 0 && upsell.length > 0 ? (
          <div className="px-4 pb-2">
            {!upsellCollapsed ? (
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                <div className="flex cursor-pointer items-center justify-between px-3 py-2" onClick={() => setUpsellCollapsed(true)}>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-emerald-600">auto_awesome</span>
                    <span className="text-[11px] font-bold text-emerald-700">Passende Extras</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-emerald-400">close</span>
                </div>
                <div className="space-y-1 px-2 pb-2">
                  {upsell.slice(0, 2).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate text-[11px] font-bold text-gray-900">
                          {lang === "en" && s.name_en ? s.name_en : s.name}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600">{formatEur(s.display_price)}</div>
                      </div>
                      <button
                        onClick={() => onUpsell(s)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white transition-transform active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button onClick={() => setUpsellCollapsed(false)} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100">
                  <span className="material-symbols-outlined text-xs">add</span>
                  Passende Extras anzeigen
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Total */}
        <div className="border-t border-gray-100 px-6 py-3">
          <div className="flex justify-between text-lg font-black text-gray-900">
            <span>{tr.basket_total}</span>
            <span className="text-emerald-600">{formatEur(cartTotal)}</span>
          </div>
        </div>

        {/* Submit */}
        <div className="px-4 pb-4">
          {ordersAllowed ? (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">{isSubmitting ? "progress_activity" : "send"}</span>
              <span>{isSubmitting ? tr.order_sending : tr.order_pay}</span>
            </button>
          ) : (
            <button disabled className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gray-200 text-sm font-black uppercase tracking-wider text-gray-400">
              <span className="material-symbols-outlined text-lg">block</span>
              <span>{tr.order_locked}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceOption({
  value,
  label,
  icon,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  icon: string;
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full rounded-2xl p-4 text-left transition-all ${
        selected === value
          ? "border-2 border-emerald-500 bg-emerald-50 shadow-md"
          : "border border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-bold text-gray-900">{label}</span>
        {selected === value ? (
          <span className="ml-auto material-symbols-outlined text-lg text-emerald-600">check_circle</span>
        ) : null}
      </span>
    </button>
  );
}

function PaymentOption({
  value,
  icon,
  label,
  selected,
  onSelect,
}: {
  value: string;
  icon: string;
  label: string;
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`flex flex-col items-center gap-2 rounded-2xl p-5 transition-all ${
        selected === value
          ? "border-2 border-emerald-500 bg-emerald-50 shadow-md"
          : "border border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95"
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-xs font-bold text-gray-900">{label}</span>
    </button>
  );
}

function ServiceModal({
  tr,
  open,
  isShisha,
  selected,
  setSelected,
  onClose,
  onConfirm,
}: {
  tr: (typeof T)[Lang];
  open: boolean;
  isShisha: boolean;
  selected: string;
  setSelected: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-1 pb-4">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>
        <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <span className="material-symbols-outlined text-3xl text-emerald-600">notifications_active</span>
        </div>
        <h3 className="mb-2 text-center text-xl font-extrabold text-gray-900">{tr.service_header_modal}</h3>
        <p className="mb-6 text-center text-sm text-gray-500">{tr.service_desc_modal}</p>
        <div className="space-y-3">
          <ServiceOption value="kellner" label={tr.btn_kellner} icon="🛎️" selected={selected} onSelect={setSelected} />
          {isShisha ? (
            <ServiceOption value="kohle" label={tr.btn_kohle} icon="💨" selected={selected} onSelect={setSelected} />
          ) : null}
        </div>
        <button onClick={onConfirm} className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98]">
          {tr.btn_send_request}
        </button>
      </div>
    </div>
  );
}

function PaymentModal({
  tr,
  open,
  acceptsCard,
  selected,
  setSelected,
  unpaidSum,
  onClose,
  onConfirm,
}: {
  tr: (typeof T)[Lang];
  open: boolean;
  acceptsCard: boolean;
  selected: string;
  setSelected: (v: string) => void;
  unpaidSum: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const cols = acceptsCard ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-1 pb-4">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>
        <button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <span className="material-symbols-outlined text-3xl text-emerald-600">payments</span>
        </div>
        <h3 className="mb-2 text-center text-xl font-extrabold text-gray-900">{tr.payment_header_modal}</h3>
        <p className="mb-2 text-center text-sm text-gray-500">{tr.payment_desc_modal}</p>
        {unpaidSum > 0 ? (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tr.payment_outstanding}</span>
            <span className="text-lg font-black text-gray-900">{formatEur(unpaidSum)}</span>
          </div>
        ) : null}
        <div className={`grid ${cols} gap-3`}>
          <PaymentOption value="zahlen_bar" label={tr.pay_bar} icon="💵" selected={selected} onSelect={setSelected} />
          {acceptsCard ? (
            <PaymentOption value="zahlen_karte" label={tr.pay_card} icon="💳" selected={selected} onSelect={setSelected} />
          ) : null}
        </div>
        <button onClick={onConfirm} className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98]">
          {tr.btn_send_request}
        </button>
      </div>
    </div>
  );
}

function WalletModal({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-t-3xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-emerald-600">card_membership</span>
            <h2 className="text-xl font-extrabold text-gray-900">Stempelkarte</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-5 text-sm text-gray-500">Wähle deine Wallet</p>

          <a
            href={`/${slug}/loyalty/pass/apple`}
            className="mb-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 12.04c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .91-3.78.91-.79 0-1.99-.89-3.27-.86-1.68.03-3.23.98-4.09 2.48-1.74 3.02-.44 7.46 1.26 9.91.83 1.21 1.82 2.56 3.12 2.51 1.26-.05 1.73-.81 3.25-.81 1.53 0 1.96.81 3.29.79 1.36-.03 2.22-1.23 3.06-2.44.96-1.4 1.36-2.76 1.38-2.83-.03-.01-2.65-1.01-2.68-4.01zM14.78 5.49c.69-.84 1.16-1.99 1.03-3.14-1 .04-2.21.66-2.93 1.5-.64.74-1.2 1.92-1.05 3.04 1.12.09 2.26-.57 2.95-1.4z" />
            </svg>
            <span className="text-sm font-semibold">In Apple Wallet hinzufügen</span>
          </a>

          <a
            href={`/${slug}/loyalty/pass/google`}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-semibold">Zu Google Wallet hinzufügen</span>
          </a>

          <p className="mt-5 text-center text-xs leading-relaxed text-gray-400">
            Deine Stempelkarte wird direkt in deiner Wallet gespeichert — keine extra App nötig.
          </p>
        </div>
      </div>
    </div>
  );
}

function LegalModal({
  tr,
  doc,
  impressum,
  datenschutz,
  onClose,
}: {
  tr: (typeof T)[Lang];
  doc: "impressum" | "datenschutz" | null;
  impressum: string | null;
  datenschutz: string | null;
  onClose: () => void;
}) {
  if (!doc) return null;
  const title = doc === "impressum" ? tr.impressum : tr.datenschutz;
  const content = doc === "impressum" ? impressum : datenschutz;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-panel my-4 flex max-h-[80vh] w-full max-w-md lg:max-w-2xl flex-col rounded-3xl border border-outline-variant p-5 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
        >
          <MaterialIcon className="text-2xl">close</MaterialIcon>
        </button>
        <h3 className="font-display mb-5 text-2xl font-extrabold text-on-surface">
          {title}
        </h3>
        <div className="font-sans scrollbar-none flex-1 overflow-y-auto pr-2 text-sm leading-relaxed whitespace-pre-line text-on-surface-variant">
          {content}
        </div>
      </div>
    </div>
  );
}

function ThankYouModal({
  tr,
  open,
  onClose,
}: {
  tr: (typeof T)[Lang];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
        </div>
        <h2 className="mb-2 text-2xl font-extrabold text-gray-900">{tr.thank_you}</h2>
        <p className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
          {tr.thank_you_desc}
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          {tr.more_orders}
        </button>
      </div>
    </div>
  );
}

function CookieBanner({
  tr,
  open,
  onAccept,
  onPrivacy,
}: {
  tr: (typeof T)[Lang];
  open: boolean;
  onAccept: () => void;
  onPrivacy: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="glass-panel fixed bottom-24 left-4 z-[90] w-[calc(100vw-1rem)] max-w-md lg:max-w-lg rounded-3xl border border-outline-variant p-6 shadow-2xl transition-all duration-500 md:left-auto md:right-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="pulse-green mt-1 shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 16v.01" />
              <path d="M6 12v.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-extrabold text-white">{tr.cookie_header}</h3>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-on-surface-variant">
              {tr.cookie_desc}
            </p>
          </div>
        </div>
        <div className="font-display mt-2 flex items-center justify-between gap-4">
          <button
            onClick={onPrivacy}
            className="py-1 text-sm font-bold text-primary underline transition-colors hover:text-primary-hover"
          >
            {tr.cookie_privacy}
          </button>
          <button
            onClick={onAccept}
            className="btn-premium btn-premium-primary rounded-xl px-5 py-3 text-sm font-bold shadow-md shadow-primary/10 active:scale-95"
          >
            {tr.cookie_btn}
          </button>
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose]);
  if (!image) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <button className="absolute right-4 top-4 text-4xl font-bold text-white transition hover:text-primary">
        &times;
      </button>
      <MenuImg
        src={image}
        alt=""
        className="max-h-[95vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
        draggable={false}
        style={{ pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}
      />
    </div>
  );
}

function AdminDrawer({
  table,
  tableOrders,
  drawerOpen,
  setDrawerOpen,
  pendingByOrder,
  serveSingleItem,
  serveAllPending,
  cancelItem,
  selectedSplitKeys,
  toggleSplitCheckbox,
  getSplitQty,
  adjustSplitQty,
  splitTotal,
  submitDrawerPayment,
  actionInProgress,
}: {
  table: string;
  tableOrders: { pending: TableItem[]; delivered: TableItem[]; total: number };
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  pendingByOrder: Map<number, TableItem[]>;
  serveSingleItem: (item: TableItem) => void;
  serveAllPending: () => void;
  cancelItem: (item: TableItem) => void;
  selectedSplitKeys: string[];
  toggleSplitCheckbox: (item: TableItem) => void;
  getSplitQty: (item: TableItem) => number;
  adjustSplitQty: (item: TableItem, delta: number) => void;
  splitTotal: number;
  submitDrawerPayment: (partial: boolean) => void;
  actionInProgress: boolean;
}) {
  const deliveredByOrder = useMemo(() => {
    const map = new Map<number, TableItem[]>();
    for (const item of tableOrders.delivered) {
      const list = map.get(item.order_id) ?? [];
      list.push(item);
      map.set(item.order_id, list);
    }
    return map;
  }, [tableOrders.delivered]);

  // Track new orders for highlighting
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const prevPendingCount = useRef(tableOrders.pending.length);

  useEffect(() => {
    // Detect new orders (count increased)
    if (tableOrders.pending.length > prevPendingCount.current) {
      // Mark the newest items (first in array) as new
      const newestItems = tableOrders.pending.slice(0, tableOrders.pending.length - prevPendingCount.current);
      const newIds = new Set(newestItems.map(item => item.key));
      setNewOrderIds(newIds);
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        setNewOrderIds(new Set());
      }, 5000);
    }
    prevPendingCount.current = tableOrders.pending.length;
  }, [tableOrders.pending]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background/95 font-display shadow-2xl backdrop-blur-xl transition-all duration-300"
      style={{
        height: drawerOpen ? "75vh" : "4rem",
        maxHeight: "75vh",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "none",
      }}
    >
      <div
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="flex h-16 shrink-0 cursor-pointer items-center justify-between border-b border-outline-variant/50 px-6 transition-colors select-none hover:bg-primary/5"
      >
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-sm font-extrabold tracking-tight text-on-surface md:text-base">
            {table} • Offen:{" "}
            <span className="ml-1 font-black text-primary">
              {formatEur(tableOrders.total)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {drawerOpen ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(false);
              }}
              className="flex items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <MaterialIcon className="text-2xl">close</MaterialIcon>
            </button>
          ) : (
            <MaterialIcon className="text-2xl text-on-surface-variant">
              keyboard_arrow_up
            </MaterialIcon>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {/* Pending */}
          <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 shadow-lg shadow-emerald-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Ausstehend / Zubereitung
                </h4>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                  {tableOrders.pending.length}
                </span>
              </div>
              {tableOrders.pending.length > 0 ? (
                <button
                  onClick={serveAllPending}
                  disabled={actionInProgress}
                  className="flex items-center gap-1 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MaterialIcon className="text-sm font-black">done_all</MaterialIcon>
                  Alle serviert
                </button>
              ) : null}
            </div>
            <div className="space-y-2">
              {tableOrders.pending.length === 0 ? (
                <p className="py-2 text-center text-xs font-semibold text-emerald-500/60 italic">
                  Keine ausstehenden Bestellungen.
                </p>
              ) : (
                // Sort orders: newest first (by order_id descending)
                Array.from(pendingByOrder.entries())
                  .sort(([a], [b]) => b - a)
                  .flatMap(([, items]) =>
                    items.map((item, idx) => {
                      const isNew = newOrderIds.has(item.key);
                      const isFirstOfNewOrder = isNew && idx === 0;
                      return (
                        <div
                          key={item.key}
                          className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-all duration-300 ${
                            isNew
                              ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                              : "border-outline-variant/60 bg-surface-container-high"
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <button
                              onClick={() => serveSingleItem(item)}
                              disabled={actionInProgress}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <MaterialIcon className="text-base">check</MaterialIcon>
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="block truncate text-[13px] font-extrabold text-on-surface">
                                  {item.quantity}x {item.name}
                                </span>
                                {isFirstOfNewOrder && (
                                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white animate-pulse">
                                    NEU
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const { variant, extras } = parseItemOptions(item.extras);
                                const noteRest = cleanAutoNote(item.note);
                                return (
                                  <>
                                    {(variant || extras.length > 0) ? (
                                      <span className="mt-1 flex flex-wrap gap-1">
                                        {variant ? (
                                          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black text-indigo-300 ring-1 ring-indigo-500/30">
                                            {variant}
                                          </span>
                                        ) : null}
                                        {extras.map((ex) => (
                                          <span
                                            key={ex}
                                            className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-300 ring-1 ring-emerald-500/30"
                                          >
                                            + {ex}
                                          </span>
                                        ))}
                                      </span>
                                    ) : null}
                                    {noteRest ? (
                                      <span className="mt-0.5 block text-[10px] font-medium text-amber-500">
                                        ✎ {noteRest}
                                      </span>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-extrabold text-on-surface">
                              {formatEur(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => cancelItem(item)}
                              disabled={actionInProgress}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                            >
                              <MaterialIcon className="text-base">close</MaterialIcon>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
              )}
            </div>
          </div>

          {/* Delivered */}
          <div className="space-y-3 rounded-2xl border border-outline-variant bg-surface/30 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-on-surface-variant/40" />
              <h4 className="text-xs font-black uppercase tracking-wider text-on-surface-variant">
                Serviert / Geliefert
              </h4>
              <span className="rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-[10px] font-black text-on-surface-variant">
                {tableOrders.delivered.length}
              </span>
            </div>
            <div className="space-y-2">
              {tableOrders.delivered.length === 0 ? (
                <p className="py-2 text-center text-xs font-semibold text-on-surface-variant/60 italic">
                  Noch keine Artikel serviert.
                </p>
              ) : (
                Array.from(deliveredByOrder.entries()).flatMap(([, items]) =>
                  items.map((item) => {
                    const selected = selectedSplitKeys.includes(item.key);
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border border-outline-variant/60 bg-surface-container-high p-3 text-xs"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSplitCheckbox(item)}
                            className="h-11 w-11 min-w-[44px] cursor-pointer rounded border-2 border-outline-variant bg-surface text-primary focus:ring-0"
                            style={{ accentColor: "#c9a84c" }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-extrabold text-on-surface">
                              {item.quantity}x {item.name}
                            </span>
                            {(() => {
                              const { variant, extras } = parseItemOptions(item.extras);
                              const noteRest = cleanAutoNote(item.note);
                              return (
                                <>
                                  {(variant || extras.length > 0) ? (
                                    <span className="mt-1 flex flex-wrap gap-1">
                                      {variant ? (
                                        <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black text-indigo-300 ring-1 ring-indigo-500/30">
                                          {variant}
                                        </span>
                                      ) : null}
                                      {extras.map((ex) => (
                                        <span
                                          key={ex}
                                          className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-300 ring-1 ring-emerald-500/30"
                                        >
                                          + {ex}
                                        </span>
                                      ))}
                                    </span>
                                  ) : null}
                                  {noteRest ? (
                                    <span className="mt-0.5 block text-[10px] font-medium text-amber-500">
                                      ✎ {noteRest}
                                    </span>
                                  ) : null}
                                </>
                              );
                            })()}
                            {selected && item.quantity > 1 ? (
                              <div className="mt-1.5 flex w-fit items-center gap-2 rounded-lg border border-outline-variant bg-surface px-2 py-0.5">
                                <button
                                  onClick={() => adjustSplitQty(item, -1)}
                                  className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 py-2 text-base font-black text-on-surface-variant hover:text-on-surface"
                                >
                                  -
                                </button>
                                <span className="font-mono text-[11px] font-black text-on-surface">
                                  {getSplitQty(item)}
                                </span>
                                <button
                                  onClick={() => adjustSplitQty(item, 1)}
                                  className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 py-2 text-base font-black text-on-surface-variant hover:text-on-surface"
                                >
                                  +
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-on-surface">
                            {formatEur(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="flex shrink-0 flex-col gap-3 border-t border-outline-variant bg-background p-4 md:p-6">
          {selectedSplitKeys.length > 0 ? (
            <div className="flex items-center justify-between px-1 text-xs font-bold text-on-surface-variant">
              <span>Ausgewählt für Teilrechnung:</span>
              <span className="font-mono text-sm font-black text-primary md:text-base">
                {formatEur(splitTotal)}
              </span>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => submitDrawerPayment(true)}
              disabled={selectedSplitKeys.length === 0 || actionInProgress}
              className={`flex h-12 select-none items-center justify-center gap-2 rounded-xl text-xs font-black transition-all active:scale-95 md:text-sm ${
                selectedSplitKeys.length > 0 && !actionInProgress
                  ? "cursor-pointer border border-outline-variant bg-surface-container-high text-on-surface shadow-lg shadow-black/10 hover:bg-surface"
                  : "cursor-not-allowed border border-outline-variant/40 bg-surface/50 text-on-surface-variant/40"
              }`}
            >
              <MaterialIcon className="text-base font-black">call_split</MaterialIcon>
              Teilrechnung
            </button>
            <button
              onClick={() => submitDrawerPayment(false)}
              disabled={
                tableOrders.pending.length > 0 ||
                tableOrders.delivered.length === 0 ||
                actionInProgress
              }
              className={`flex h-12 select-none items-center justify-center gap-2 rounded-xl text-xs font-black transition-all active:scale-95 md:text-sm ${
                tableOrders.pending.length === 0 &&
                tableOrders.delivered.length > 0 &&
                !actionInProgress
                  ? "cursor-pointer bg-primary text-black shadow-lg shadow-primary/10 hover:bg-emerald-400"
                  : "cursor-not-allowed border border-outline-variant/40 bg-surface/50 text-on-surface-variant/40"
              }`}
            >
              <MaterialIcon className="text-base font-black">payments</MaterialIcon>
              Gesamtrechnung
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
