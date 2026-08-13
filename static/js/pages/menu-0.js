(function() {
        function forcePlayVideos() {
            // Alle Videos auf der Landingpage suchen und abspielen
            document.querySelectorAll('video[autoplay], video[data-slideshow-video]').forEach(function(v) {
                v.muted = true;
                v.defaultMuted = true;
                try { v.playsInline = true; } catch(e) {}
                try { v.setAttribute('webkit-playsinline', 'webkit-playsinline'); } catch(e) {}
                try {
                    var p = v.play();
                    if (p && p.catch) p.catch(function() {
                        // iOS blockiert autoplay → bei erster User-Interaction retry
                        var retry = function() {
                            v.play().catch(function(){});
                            document.removeEventListener('touchstart', retry, true);
                            document.removeEventListener('click', retry, true);
                        };
                        document.addEventListener('touchstart', retry, true);
                        document.addEventListener('click', retry, true);
                    });
                } catch(e) {}
            });
        }
        // Sofort versuchen
        forcePlayVideos();
        // Nach DOM ready
        if (document.readyState !== 'loading') forcePlayVideos();
        else document.addEventListener('DOMContentLoaded', forcePlayVideos);
        // Nach Alpine init (x-show könnte display:none → blockiert autoplay)
        document.addEventListener('alpine:initialized', function() {
            setTimeout(forcePlayVideos, 100);
            setTimeout(forcePlayVideos, 500);
            setTimeout(forcePlayVideos, 1500);
        });
        // Bei jeder View-Änderung (landing → menu → landing)
        document.addEventListener('alpine:initialized', function() {
            var observer = new MutationObserver(function() {
                forcePlayVideos();
            });
            var slideshow = document.getElementById('landing-slideshow');
            if (slideshow) {
                observer.observe(slideshow, { attributes: true, attributeFilter: ['style', 'class'] });
            }
        });
        // Bei visibilitychange (Tab zurückkehren)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) setTimeout(forcePlayVideos, 100);
        });
    })();
