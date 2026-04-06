const themeToggle = document.getElementById("theme-toggle");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const revealElements = document.querySelectorAll(".reveal");
const placeholderLinks = document.querySelectorAll("[data-placeholder-link='true']");
const themeColorMeta = document.querySelector("meta[name='theme-color']");

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
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

applyTheme(getPreferredTheme());
revealOnScroll();

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
