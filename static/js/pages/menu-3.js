// Cookie Banner Consent Logic
        window.addEventListener('DOMContentLoaded', () => {
            if (!localStorage.getItem('cookie_consent_accepted')) {
                setTimeout(() => {
                    const banner = document.getElementById('cookieBanner');
                    if (banner) {
                        banner.style.transform = 'translateY(0)';
                        banner.style.opacity = '1';
                        banner.style.pointerEvents = 'auto';
                        banner.style.zIndex = '9999';
                    }
                }, 2000);
            }
        });

        function acceptCookies() {
            localStorage.setItem('cookie_consent_accepted', 'true');
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.style.transform = 'translateY(150%)';
                banner.style.opacity = '0';
                banner.style.pointerEvents = 'none';
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // BILDSCHUTZ — Verhindert Long-Press-Kontextmenü auf mobilen Geräten
        // ════════════════════════════════════════════════════════════════════
        // Ergänzt die CSS-Regeln mit JS, da iOS Safari manchmal CSS ignoriert.
        // Blockiert:
        // - contextmenu (Rechtsklick Desktop / Long-Press Mobile)
        // - dragstart (Drag von Bildern)
        // - touchstart auf Bildern mit >500ms Halten (Long-Press-Erkennung)
        // - copy/cut (verhindert Bild-Kopie in Zwischenablage)
        (function() {
            // Verhindere Long-Press-Kontextmenü auf allen Bildern (außer Logo)
            document.addEventListener('contextmenu', function(e) {
                if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) {
                    // Logo im Header erlauben (kann gespeichert werden)
                    if (e.target.classList.contains('header-logo') ||
                        e.target.classList.contains('avatar') ||
                        e.target.classList.contains('no-protect')) {
                        return true;  // Erlaube
                    }
                    e.preventDefault();
                    return false;
                }
            }, true);

            // Drag-Start auf Bildern verhindern
            document.addEventListener('dragstart', function(e) {
                if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) {
                    if (e.target.classList.contains('header-logo') ||
                        e.target.classList.contains('avatar') ||
                        e.target.classList.contains('no-protect')) {
                        return true;
                    }
                    e.preventDefault();
                    return false;
                }
            }, true);

            // iOS Safari: Long-Press auf Bilder verhindern
            // Wir fangen touchstart ab und verhindern, dass das Bild als
            // Callout-Target gesetzt wird (was das Kontextmenü auslöst).
            document.addEventListener('touchstart', function(e) {
                if (e.target && e.target.tagName === 'IMG') {
                    if (e.target.classList.contains('header-logo') ||
                        e.target.classList.contains('avatar') ||
                        e.target.classList.contains('no-protect')) {
                        return true;
                    }
                    // -webkit-touch-callout: none wird via CSS gesetzt.
                    // Zusätzlich: touchstart auf Bildern verhindert Long-Press
                    // ABER: Click muss weiterhin funktionieren (für Lightbox etc.)
                    // → Deshalb nur das Kontextmenü unterdrücken, nicht den Klick.
                }
            }, { passive: true });

            // Copy/Cut mit Bild in Auswahl verhindern
            document.addEventListener('copy', function(e) {
                const selection = window.getSelection();
                if (selection && selection.toString()) {
                    // Text-Kopie erlauben (z.B. Bon-Nummern für Support)
                    return true;
                }
                // Wenn keine Textauswahl, aber Bild im Fokus → verhindern
                if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) {
                    e.preventDefault();
                    return false;
                }
            }, true);

            // Verhindere, dass Bilder als Link- dragged werden
            document.addEventListener('mousedown', function(e) {
                if (e.target && e.target.tagName === 'IMG') {
                    if (e.target.classList.contains('header-logo') ||
                        e.target.classList.contains('avatar') ||
                        e.target.classList.contains('no-protect')) {
                        return true;
                    }
                    // Verhindere Mousedown-Drag auf Bildern
                    if (e.button === 0) {
                        // Linksklick: nur verhindern wenn direkt auf Bild
                        // (Wrapper-Element muss Klick erhalten)
                        e.target.style.pointerEvents = 'none';
                        setTimeout(() => { e.target.style.pointerEvents = ''; }, 100);
                    }
                }
            }, true);
        })();

        // SW Registration entfernt — PWA funktioniert via manifest.json

        // Clean up address bar query parameters to hide ?reset=true or any other params but preserve role=admin
        window.addEventListener('DOMContentLoaded', () => {
            if (window.history && window.history.replaceState) {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('role') === 'admin') {
                    window.history.replaceState({}, document.title, window.location.pathname + "?role=admin");
                } else {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        });

        // ════════════════════════════════════════════════════════════════════
        // DYNAMIC BACK-BUTTON POSITIONING
        // The header height varies (h-20 = 80px base, but with safe-area-inset-top
        // it grows). Instead of guessing with CSS calc(), we measure the actual
        // rendered header height and set the back-button's sticky top to match.
        // This guarantees 0px gap between header bottom and back-button.
        // ════════════════════════════════════════════════════════════════════
        // Global definiert, damit Alpine-Komponente (filterCategory) es aufrufen kann
        function adjustBackButtonTop() {
            const header = document.querySelector('header.sticky');
            const backBtn = document.getElementById('back-to-categories-bar');
            if (!header || !backBtn) return;
            const headerHeight = header.getBoundingClientRect().height;
            // Set sticky top to exact header height — button sticks flush with header bottom
            backBtn.style.top = headerHeight + 'px';
            // Force margin/padding to 0 (kills any inherited spacing)
            backBtn.style.marginTop = '0px';
            backBtn.style.paddingTop = '0px';
        }
        window.adjustBackButtonTop = adjustBackButtonTop;

        (function() {
            // Run on load, DOMContentLoaded, resize, orientationchange, and after Alpine.js init
            window.addEventListener('DOMContentLoaded', adjustBackButtonTop);
            window.addEventListener('load', adjustBackButtonTop);
            window.addEventListener('resize', adjustBackButtonTop);
            window.addEventListener('orientationchange', () => setTimeout(adjustBackButtonTop, 200));
            // Re-run after a delay to catch late layout shifts (fonts, images loading)
            setTimeout(adjustBackButtonTop, 500);
            setTimeout(adjustBackButtonTop, 1500);
            // Re-run when scroll happens (in case iOS Safari URL bar show/hide changes viewport)
            let scrollTimer = null;
            window.addEventListener('scroll', () => {
                if (scrollTimer) clearTimeout(scrollTimer);
                scrollTimer = setTimeout(adjustBackButtonTop, 100);
            }, { passive: true });
            // Re-run when iOS Safari URL bar shows/hides (visibilitychange + pageshow)
            window.addEventListener('pageshow', adjustBackButtonTop);
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) setTimeout(adjustBackButtonTop, 100);
            });
        })();

        // ── PWA VISIBILITY CHANGE: Sofortiger WS-Reconnect bei App-Wiederöffnung ──
        // KRITISCH für Gäste-PWA: Wenn die App in den Hintergrund geht, suspendiert
        // iOS das JavaScript. WebSocket trennt sich. Beim Wiederöffnen feuert
        // visibilitychange — ohne diesen Handler bleibt der WS 5s+ tot.
        // Gäste sehen dann keine Live-Updates (Bestellstatus, Service-Rufe).
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            // App kam in Vordergrund — SOFORT reconnecten
            const alpine = document.querySelector('[x-data]');
            if (alpine && alpine._x_dataStack) {
                const comp = alpine._x_dataStack[0];
                if (comp.guestWs && comp.guestWs.readyState === WebSocket.OPEN) return;
                if (comp.guestWsHeartbeatInterval) clearInterval(comp.guestWsHeartbeatInterval);
                if (comp.initGuestWebSocket) comp.initGuestWebSocket();
                if (comp.fetchGuestTableStatus) comp.fetchGuestTableStatus();
            }
        });
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                const alpine = document.querySelector('[x-data]');
                if (alpine && alpine._x_dataStack) {
                    const comp = alpine._x_dataStack[0];
                    if (comp.initGuestWebSocket) comp.initGuestWebSocket();
                    if (comp.fetchGuestTableStatus) comp.fetchGuestTableStatus();
                }
            }
        });
