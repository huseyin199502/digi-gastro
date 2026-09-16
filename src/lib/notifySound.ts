// Akustische Signale für neue Bestellungen und Service-Rufe.
// Wird von der Live-Ansicht (Admin) und vom KDS geteilt, damit überall
// derselbe Ton läuft. Der Service Worker cached die MP3s cache-first.
//
// Browser blockieren Audio ohne vorherige Nutzer-Interaktion. `unlockAudio()`
// sollte daher einmalig an ein `pointerdown`-Event gehängt werden (z. B. auf
// einem Küchen-Tablet, das sonst nie geklickt wird).

const newOrderAudio =
  typeof Audio !== "undefined" ? new Audio("/sounds/neue-bestellung.mp3") : null;
if (newOrderAudio) newOrderAudio.preload = "auto";

const serviceCallAudio =
  typeof Audio !== "undefined" ? new Audio("/sounds/service-ruf.mp3") : null;
if (serviceCallAudio) serviceCallAudio.preload = "auto";

export function playBeepFallback() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const beep = (start: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(
        0.25,
        ctx.currentTime + start + 0.03
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + start + 0.22
      );
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.25);
    };
    beep(0, 880);
    beep(0.28, 1100);
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // ignore
  }
}

export function playNewOrderAlert() {
  try {
    navigator.vibrate?.([120, 80, 120]);
  } catch {
    // ignore
  }
  if (newOrderAudio) {
    try {
      newOrderAudio.currentTime = 0;
      void newOrderAudio.play().catch(() => playBeepFallback());
      return;
    } catch {
      // fall through to beep
    }
  }
  playBeepFallback();
}

export function playServiceCallAlert() {
  try {
    navigator.vibrate?.([220, 90, 220]);
  } catch {
    // ignore
  }
  if (serviceCallAudio) {
    try {
      serviceCallAudio.currentTime = 0;
      void serviceCallAudio.play().catch(() => {});
    } catch {
      // ignore
    }
  }
}

let unlocked = false;

/** Einmalig nach der ersten Nutzer-Interaktion aufrufen, damit Autoplay
 *  beim KDS nicht blockiert wird. */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  for (const audio of [newOrderAudio, serviceCallAudio]) {
    if (!audio) continue;
    const previous = audio.volume;
    try {
      audio.volume = 0;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = previous;
        })
        .catch(() => {
          audio.volume = previous;
        });
    } catch {
      audio.volume = previous;
    }
  }
}
