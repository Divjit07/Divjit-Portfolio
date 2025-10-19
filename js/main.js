/* main.js
   - Navbar style on scroll
 
*/

// ---------- Navbar: add .scrolled on scroll ----------
document.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar") || document.querySelector(".navbar");
  if (!navbar) return;
  if (window.scrollY > 50) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});

// ---------- Smooth scroll for internal nav links ----------
document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// ---------- Logo hover: show full name then revert ----------
(() => {
  const logo = document.querySelector(".logo");
  if (!logo) return;

  const original = "<DS/>";
  const full = "Divjit Singh";

  // Logo currently renders with HTML entities (&lt;DS/&gt;). Use textContent to control exactly.
  logo.addEventListener("mouseenter", () => (logo.textContent = full));
  logo.addEventListener("mouseleave", () => (logo.textContent = original));
})();

// ---------- Skill bars animation (reads data-width) ----------
(() => {
  const bars = document.querySelectorAll(".skill-progress-bar");

  function fillBar(el) {
    const raw = el.getAttribute("data-width") || el.dataset.width || "0";
    const pct = String(raw).includes("%") ? raw : `${raw}%`;
    requestAnimationFrame(() => {
      el.style.width = pct; // CSS transition handles animation
    });

    // Sync numeric label if present
    const label = el.closest(".skill-bar")?.querySelector(".skill-percent");
    if (label) label.textContent = pct;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fillBar(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach((bar) => io.observe(bar));
  } else {
    // Fallback
    bars.forEach(fillBar);
  }

  // Ensure fill if section already visible on load
  window.addEventListener("load", () => {
    const skills = document.getElementById("skills");
    if (!skills) return;
    const r = skills.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom >= 0;
    if (inView) bars.forEach((b) => (b.style.width ? null : fillBar(b)));
  });
})();

// ---------- Reveal .card elements on scroll ----------
(() => {
  const cards = document.querySelectorAll(".card");
  if (!cards.length || !("IntersectionObserver" in window)) return;

  cards.forEach((c) => {
    c.style.transform = "translateY(18px)";
    c.style.opacity = "0";
  });

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.transition = "opacity .7s ease, transform .7s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((c) => io.observe(c));
})();

// ---------- Download CV without leaving the page ----------
(() => {
  const btn = document.getElementById("downloadCvBtn");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = btn.getAttribute("href");
    if (!url) return;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch CV");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = url.split("/").pop() || "Divjit_Singh_Resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      // Fallback: keep the page, open file in a new tab
      window.open(url, "_blank");
    }
  });
})();

// ---------- Simple contact form handler (demo) ----------
(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks! Your message has been recorded locally for this demo.");
    form.reset();
  });
})();
