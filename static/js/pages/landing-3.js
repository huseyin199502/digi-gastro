// Preloader — robust against PWA load-event race condition.
        // In iOS PWAs the 'load' event can fire BEFORE this script registers
        // the listener (page comes from cache, very fast). The preloader then
        // stays visible forever and blocks all taps on the nav.
        // Fix: check readyState immediately + multiple fallbacks.
        function killPreloader() {
            const preloader = document.getElementById('preloader');
            if (!preloader) return;
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            setTimeout(() => {
                if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 550);
        }
        // Case 1: Page already fully loaded (cache hit, PWA cold start).
        if (document.readyState === 'complete') {
            killPreloader();
        } else if (document.readyState === 'interactive') {
            // DOMContentLoaded bereits gefeuert → Preloader sofort killen
            setTimeout(killPreloader, 100);
        }
        // Case 2: Still loading — register listener.
        window.addEventListener('load', killPreloader);
        // Case 3: Fallback — kill nach max 3s egal was passiert
        setTimeout(killPreloader, 3000);

        // ── Hero Video: Sources direkt im HTML als <source> Tags — JS nur für play() ──
        (function() {
            const heroVideo = document.getElementById('hero-video');
            if (!heroVideo) return;

            heroVideo.muted = true;
            heroVideo.defaultMuted = true;
            try { heroVideo.playsInline = true; } catch(e) {}
            try { heroVideo.setAttribute('webkit-playsinline', 'webkit-playsinline'); } catch(e) {}

            let playStarted = false;

            function attemptPlay(reason) {
                if (playStarted) return;
                console.log('[Hero Video] attemptPlay:', reason, 'readyState:', heroVideo.readyState);
                try {
                    const p = heroVideo.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => { playStarted = true; console.log('[Hero Video] SUCCESS:', reason); removeListeners(); })
                         .catch(() => {});
                    } else { playStarted = true; }
                } catch(e) {}
            }

            function onInteraction(e) { if (!playStarted) attemptPlay('interaction'); }
            function removeListeners() {
                ['touchstart','touchend','click','scroll','wheel','keydown','pointerdown'].forEach(ev => 
                    document.removeEventListener(ev, onInteraction, true));
                window.removeEventListener('scroll', onInteraction, true);
            }

            attemptPlay('immediate');
            heroVideo.addEventListener('loadedmetadata', () => attemptPlay('loadedmetadata'));
            heroVideo.addEventListener('canplay', () => attemptPlay('canplay'));
            heroVideo.addEventListener('playing', () => { playStarted = true; removeListeners(); });

            const opts = { capture: true, passive: true };
            ['touchstart','touchend','click','scroll','wheel','keydown','pointerdown'].forEach(ev => 
                document.addEventListener(ev, onInteraction, opts));
            window.addEventListener('scroll', onInteraction, opts);

            setTimeout(() => attemptPlay('1s'), 1000);
            setTimeout(() => attemptPlay('3s'), 3000);
            setTimeout(() => attemptPlay('5s'), 5000);

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && !playStarted) setTimeout(() => attemptPlay('visible'), 100);
            });

            heroVideo.addEventListener('error', () => {
                console.error('[Hero Video] ERROR:', heroVideo.error ? heroVideo.error.code : 'unknown');
            });
        })();

        // Navbar scroll
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 40) {
                nav.classList.remove('h-20');
                nav.classList.add('h-16', 'border-zinc-800/80', 'bg-zinc-950/90');
            } else {
                nav.classList.remove('h-16', 'border-zinc-800/80', 'bg-zinc-950/90');
                nav.classList.add('h-20', 'border-zinc-800/40', 'bg-zinc-950/70');
            }
        });

        // Cookie Consent
        window.addEventListener('DOMContentLoaded', () => {
            if (!localStorage.getItem('cookie_consent_accepted')) {
                setTimeout(() => {
                    const banner = document.getElementById('cookieBanner');
                    if (banner) {
                        banner.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
                        banner.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
                    }
                }, 1000);
            }
        });

        function acceptCookies() {
            localStorage.setItem('cookie_consent_accepted', 'true');
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
                banner.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            }
        }

        // Scroll Reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('revealed');
            });
        }, { threshold: 0.06 });

        document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));

        // Mouse glow + 3D tilt for glass cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });

            if (window.innerWidth >= 1024) {
                card.style.transition = 'transform 0.12s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
                card.style.transformStyle = 'preserve-3d';

                card.addEventListener('mousemove', e => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xc = rect.width / 2;
                    const yc = rect.height / 2;
                    const angleX = (yc - y) / 16;
                    const angleY = (x - xc) / 16;
                    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-4px)`;
                    card.style.borderColor = 'rgba(201, 168, 76, 0.25)';
                    card.style.boxShadow = '0 15px 35px -10px rgba(0, 0, 0, 0.7)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                    card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    card.style.boxShadow = 'none';
                });
            }
        });
