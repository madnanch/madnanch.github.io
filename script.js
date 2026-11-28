const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const navAnchors = [...document.querySelectorAll(".nav-link")];
const sections = navAnchors.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

// ─── Theme ───────────────────────────────────────────────────────────────────
function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#080d18" : "#f4f7fc");
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    // The theme still works for this page view when storage is unavailable.
  }
}

try {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  }
} catch {
  // Keep the requested dark default when storage is unavailable.
}
themeToggle.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
themeToggle.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

// ─── Mobile Nav ──────────────────────────────────────────────────────────────
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("is-open", !isExpanded);
});

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navLinks.classList.remove("is-open");
}

navAnchors.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

// ─── Scroll-spy & Reveal ─────────────────────────────────────────────────────
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

// ─── Project Filter ───────────────────────────────────────────────────────────
// Set dynamic project count
const projectCards = document.querySelectorAll(".project-card");
const countEl = document.querySelector("#project-count");
if (countEl) countEl.textContent = String(projectCards.length).padStart(2, "0");

const projectsGrid = document.querySelector(".projects-grid");

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    projectCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
    // Fix: collapse to 1-column when only 1 card is visible (e.g. "Ongoing")
    const visibleCount = [...projectCards].filter(c => !c.hidden).length;
    projectsGrid.style.gridTemplateColumns = visibleCount === 1 ? "minmax(0, 560px)" : "";
    projectsGrid.style.justifyContent = visibleCount === 1 ? "center" : "";
  });
});

// ─── Typing Animation ────────────────────────────────────────────────────────
// FIX: start by showing the first role fully, pause, then begin cycling
const roleText = document.querySelector("#role-text");
const roles = [
  "BS Computer Science Graduate | Software & Full-Stack Developer",
  "Desktop Software & Database Developer",
  "Building useful web apps, end to end",
];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  let roleIndex = 0;
  let characterIndex = roles[0].length; // Start fully typed
  let deleting = false;                 // FIX: start by pausing, not deleting

  function typeRole() {
    const currentRole = roles[roleIndex];
    roleText.textContent = currentRole.slice(0, characterIndex);

    if (!deleting && characterIndex === currentRole.length) {
      // Fully typed — pause, then start deleting
      deleting = true;
      window.setTimeout(typeRole, 1900);
      return;
    }
    if (deleting && characterIndex === 0) {
      // Fully deleted — advance to next role and start typing
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      window.setTimeout(typeRole, 260);
      return;
    }
    characterIndex += deleting ? -1 : 1;
    window.setTimeout(typeRole, deleting ? 24 : 38);
  }

  // Pause on the first role before starting the cycle
  window.setTimeout(typeRole, 1900);
}

// ─── Contact Form (Web3Forms) ─────────────────────────────────────────────────
const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");
const formFields = [...form.querySelectorAll("input:not([type=hidden]):not([type=checkbox]), textarea")];

function validateField(field) {
  const error = document.querySelector(`#${field.id}-error`);
  let message = "";
  if (field.validity.valueMissing) {
    message = "This field is required.";
  } else if (field.validity.typeMismatch) {
    message = "Enter a valid email address.";
  } else if (field.validity.tooShort) {
    message = `Please enter at least ${field.minLength} characters.`;
  }
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.setAttribute("aria-describedby", error.id);
  error.textContent = message;
  return !message;
}

formFields.forEach((field) => {
  field.addEventListener("input", () => {
    if (field.hasAttribute("aria-invalid")) validateField(field);
    feedback.textContent = "";
    feedback.classList.remove("error-feedback");
  });
  field.addEventListener("blur", () => {
    if (field.value.trim() || field.hasAttribute("aria-invalid")) validateField(field);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isValid = formFields.map(validateField).every(Boolean);
  if (!isValid) {
    feedback.textContent = "Please fix the highlighted fields and try again.";
    feedback.classList.add("error-feedback");
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  const submitButton = form.querySelector(".submit-button");
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  feedback.textContent = "";
  feedback.classList.remove("error-feedback");

  const accessKey = form.querySelector('[name="access_key"]').value;

  // If no real key is set yet, fall back gracefully to mailto
  if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
    const senderName  = form.elements.name.value.trim();
    const senderEmail = form.elements.email.value.trim();
    const subject     = form.elements.subject.value.trim();
    const message     = form.elements.message.value.trim();
    feedback.textContent = `Thanks, ${senderName}! Your email app will open with your message ready to send.`;
    const mailto = `mailto:madnanch2016@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${senderName} <${senderEmail}>\n\n${message}`)}`;
    window.setTimeout(() => {
      window.location.href = mailto;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send Message <i data-lucide="arrow-right" aria-hidden="true"></i>';
      if (window.lucide) window.lucide.createIcons();
    }, 300);
    return;
  }

  try {
    const formData = new FormData(form);
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      feedback.textContent = `Thanks, ${form.elements.name.value.trim()}! Your message was sent — I'll be in touch soon.`;
      feedback.classList.remove("error-feedback");
      form.reset();
      formFields.forEach((f) => { f.removeAttribute("aria-invalid"); f.removeAttribute("aria-describedby"); });
    } else {
      throw new Error(result.message || "Submission failed.");
    }
  } catch (err) {
    feedback.textContent = "Something went wrong. Please email me directly at madnanch2016@gmail.com.";
    feedback.classList.add("error-feedback");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send Message <i data-lucide="arrow-right" aria-hidden="true"></i>';
    if (window.lucide) window.lucide.createIcons();
  }
});

// ─── Footer year ─────────────────────────────────────────────────────────────
document.querySelector("#current-year").textContent = new Date().getFullYear();

// ─── Lucide Icons ────────────────────────────────────────────────────────────
if (window.lucide) {
  window.lucide.createIcons();
} else {
  window.addEventListener("load", () => window.lucide?.createIcons());
}
