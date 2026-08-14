/**
 * 3D Interactions Controller
 * Adds interactive tilt, scroll-reveal, focus trap, and will-change lifecycle management.
 * Progressive enhancement — fails gracefully if conditions aren't met.
 */
(function() {
  'use strict';

  // Guard: Only enable on devices with hover capability and no motion preference
  const canAnimate = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

  if (!canAnimate) return;

  // ─── Scroll-based 3D Appear Animations ───
  // Elements with [data-3d-appear] get the 'card-appear' animation when scrolled into view
  const appearObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('is-visible');
        appearObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-3d-appear]').forEach(el => {
    el.style.animationPlayState = 'paused';
    appearObserver.observe(el);
  });

  // ─── Delegated Mousemove Tilt (Desktop only) ───
  // One listener per .perspective-container, applies tilt to direct .card-3d children
  let rafId = null;

  document.querySelectorAll('.perspective-container').forEach(container => {
    const cards = container.querySelectorAll('.card-3d, .tilt-on-hover');
    if (!cards.length) return;

    container.addEventListener('mousemove', (e) => {
      if (rafId) return; // Throttle to 1 RAF per frame

      rafId = requestAnimationFrame(() => {
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) / rect.width;
          const deltaY = (e.clientY - centerY) / rect.height;

          // Max 5 degrees rotation
          const rotateY = deltaX * 5;
          const rotateX = -deltaY * 5;

          card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
        });
        rafId = null;
      });
    });

    container.addEventListener('mouseleave', () => {
      cards.forEach(card => {
        card.style.transform = '';
      });
    });
  });

  // ─── Focus Trap for 3D Cards ───
  // Make interactive cards keyboard-accessible with focus/blur tilt
  document.querySelectorAll('.card-3d').forEach(card => {
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    }

    card.addEventListener('focus', () => {
      card.style.willChange = 'transform';
      card.style.transform = 'perspective(1200px) rotateX(2deg) rotateY(-2deg) translateZ(4px)';
    });

    card.addEventListener('blur', () => {
      card.style.transform = '';
      card.style.willChange = '';
    });
  });

  // ─── Will-Change Lifecycle Management ───
  // Add will-change on mouseenter, remove on mouseleave/animationend
  document.querySelectorAll('.card-3d, .tilt-on-hover, .btn-3d-press, .depth-shadow').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.willChange = 'transform';
    });
    el.addEventListener('mouseleave', () => {
      el.style.willChange = '';
    });
    el.addEventListener('animationend', () => {
      el.style.willChange = '';
    });
  });

})();
