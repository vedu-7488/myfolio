const themeToggle = document.getElementById("theme-toggle");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const revealElements = document.querySelectorAll(".reveal");
const placeholderLinks = document.querySelectorAll("[data-placeholder-link='true']");
const themeColorMeta = document.querySelector("meta[name='theme-color']");
const parallaxElements = document.querySelectorAll("[data-parallax]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateThemeToggleLabel(theme) {
    if (!themeToggle) {
        return;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    const label = nextTheme === "dark" ? "Switch to dark theme" : "Switch to light theme";

    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
}

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    updateThemeToggleLabel(theme);
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#0d0d0f" : "#f5f5f7");
    }
    localStorage.setItem("theme", theme);
}

function getPreferredTheme() {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }

    return systemPrefersDark.matches ? "dark" : "light";
}

function revealOnScroll() {
    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18
    });

    revealElements.forEach((element) => observer.observe(element));
}

function setupParallax() {
    if (!parallaxElements.length || reduceMotion.matches) {
        return;
    }

    let ticking = false;

    function updateParallax() {
        const viewportHeight = window.innerHeight;

        parallaxElements.forEach((element) => {
            if (window.innerWidth <= 760) {
                element.style.transform = "";
                return;
            }

            const speed = Number(element.dataset.parallax || 0);
            const rect = element.getBoundingClientRect();
            const progress = ((rect.top + rect.height / 2) - viewportHeight / 2) / viewportHeight;
            const offset = Math.max(Math.min(progress * speed, speed), -speed);
            const isSettledImage = element.tagName === "IMG" && element.closest(".achievement-card")?.classList.contains("is-visible");
            const baseTransform = element.tagName === "IMG" ? (isSettledImage ? "scale(1)" : "scale(1.03)") : "";

            element.style.transform = `${baseTransform} translate3d(0, ${offset}px, 0)`;
        });

        ticking = false;
    }

    function requestUpdate() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(updateParallax);
        }
    }

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
}

applyTheme(getPreferredTheme());
revealOnScroll();
setupParallax();

themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
});

systemPrefersDark.addEventListener("change", (event) => {
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme) {
        applyTheme(event.matches ? "dark" : "light");
    }
});

placeholderLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
    });
});
