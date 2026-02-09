// projects-slider.js
// Best-practice slider behavior for variable-width thumbs:
// - Next: scrolls to the NEXT thumb that is NOT fully visible on the right
// - Prev: scrolls to the PREVIOUS thumb that is NOT fully visible on the left
// Uses real layout measurements via getBoundingClientRect().

function setupProjectSliders() {
  const sliders = document.querySelectorAll(".project-slider");

  sliders.forEach((slider) => {
    const viewport = slider.querySelector(".project-viewport");
    const track = slider.querySelector(".project-grid");
    const prevBtn = slider.querySelector('[data-slide="prev"]');
    const nextBtn = slider.querySelector('[data-slide="next"]');

    if (!viewport || !track || !prevBtn || !nextBtn) return;

    const TOL = 1;      // pixels tolerance for "fully visible"
    const PAD = 12;     // extra pixels so it doesn't land exactly on the edge

    function thumbs() {
      return Array.from(track.querySelectorAll(".thumb"));
    }

    function maxScrollLeft() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function clamp(x) {
      return Math.max(0, Math.min(x, maxScrollLeft()));
    }

    function scrollToLeft(left) {
      viewport.scrollTo({ left: clamp(left), behavior: "smooth" });
    }

    // Returns the FIRST thumb to the right that is NOT fully visible
    function findNextNotFullyVisible() {
      const vRect = viewport.getBoundingClientRect();
      const vRight = vRect.right;

      return thumbs().find((t) => {
        const r = t.getBoundingClientRect();
        // not fully visible if its right edge goes beyond viewport's right edge
        return r.right > vRight + TOL;
      });
    }

    // Returns the LAST thumb to the left that is NOT fully visible
    function findPrevNotFullyVisible() {
      const vRect = viewport.getBoundingClientRect();
      const vLeft = vRect.left;

      const ts = thumbs();
      for (let i = ts.length - 1; i >= 0; i--) {
        const r = ts[i].getBoundingClientRect();
        // not fully visible if its left edge goes beyond viewport's left edge
        if (r.left < vLeft - TOL) return ts[i];
      }
      return null;
    }

    function nextStep() {
      const t = findNextNotFullyVisible();

      if (!t) {
        // already fully at the end (or everything visible)
        const end = maxScrollLeft();
        if (Math.abs(viewport.scrollLeft - end) > 2) scrollToLeft(end);
        return;
      }

      const vRect = viewport.getBoundingClientRect();
      const tRect = t.getBoundingClientRect();

      // scroll just enough so thumb's right edge becomes inside viewport
      const delta = (tRect.right - vRect.right) + PAD;
      if (Math.abs(delta) <= 2) return;

      scrollToLeft(viewport.scrollLeft + delta);
    }

    function prevStep() {
      const t = findPrevNotFullyVisible();

      if (!t) {
        // already at the start
        if (viewport.scrollLeft > 2) scrollToLeft(0);
        return;
      }

      const vRect = viewport.getBoundingClientRect();
      const tRect = t.getBoundingClientRect();

      // scroll just enough so thumb's left edge becomes inside viewport
      const delta = (tRect.left - vRect.left) - PAD; // negative value
      if (Math.abs(delta) <= 2) return;

      scrollToLeft(viewport.scrollLeft + delta);
    }

    prevBtn.addEventListener("click", prevStep);
    nextBtn.addEventListener("click", nextStep);

    // Trackpad horizontal gesture support (only intercept true horizontal gestures)
    viewport.style.scrollBehavior = "smooth";
    viewport.style.overflowX = "auto";
    viewport.style.overflowY = "hidden";

    viewport.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          viewport.scrollLeft += e.deltaX;
          e.preventDefault();
        }
      },
      { passive: false }
    );
  });
}

document.addEventListener("DOMContentLoaded", setupProjectSliders);