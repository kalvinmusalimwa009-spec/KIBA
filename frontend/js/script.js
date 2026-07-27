/* ============================================
   ST. MARY'S KIBABII BOYS NATIONAL SCHOOL (KIBA)
   MASTER JAVASCRIPT - All Interactive Features
   ============================================ */

// ========== AOS INITIALIZATION ==========
if (typeof AOS !== "undefined") {
  AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: "ease-in-out",
  });
}

// ========== BACKGROUND VIDEO CONTROL ==========
const bgVideo = document.getElementById("bgVideo");
if (bgVideo) {
  bgVideo.loop = true;
  bgVideo.play().catch((e) => console.log("Video ready"));
}

// ========== AUDIO CONTROL ==========
const audioControl = document.getElementById("audioControl");
const audioIcon = document.getElementById("audioIcon");
const audioText = document.getElementById("audioText");
const bgAudio = document.getElementById("bgAudio");
let isPlaying = true;

if (bgAudio) {
  bgAudio.volume = 0.25;
  bgAudio.loop = true;
  bgAudio.play().catch((e) => console.log("Audio ready on user interaction"));
}

if (audioControl) {
  audioControl.addEventListener("click", function () {
    if (isPlaying) {
      bgAudio.pause();
      audioIcon.className = "fas fa-volume-mute";
      if (audioText) audioText.innerText = "Music Paused";
      isPlaying = false;
    } else {
      bgAudio.play();
      audioIcon.className = "fas fa-music";
      if (audioText) audioText.innerText = "School Anthem Playing";
      isPlaying = true;
    }
  });
}

// ========== MOBILE HAMBURGER MENU ==========
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    hamburger.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("active");
      if (hamburger) hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// ========== THEME TOGGLE (Dark/Light Mode) ==========
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  });
}

// ========== FLOATING ACTION BUTTON (FAB) ==========
const fabMain = document.getElementById("fabMain");
const fabContainer = document.querySelector(".fab-container");

if (fabMain && fabContainer) {
  fabMain.addEventListener("click", function () {
    fabContainer.classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    if (fabContainer && !fabContainer.contains(e.target)) {
      fabContainer.classList.remove("active");
    }
  });
}

// ========== CUSTOM CURSOR ==========
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

if (cursorDot && cursorOutline && window.innerWidth > 768) {
  window.addEventListener("mousemove", function (e) {
    cursorDot.style.transform =
      "translate(" + (e.clientX - 3) + "px, " + (e.clientY - 3) + "px)";
    cursorOutline.style.transform =
      "translate(" + (e.clientX - 15) + "px, " + (e.clientY - 15) + "px)";
  });

  const hoverTargets = document.querySelectorAll(
    "a, button, .badge, .btn-primary, .fab-main, .feature-card, .admin-card, .staff-card, .alumni-card, .admission-card",
  );
  hoverTargets.forEach(function (target) {
    target.addEventListener("mouseenter", function () {
      cursorDot.classList.add("hover-grow");
      cursorOutline.classList.add("hover-grow");
    });
    target.addEventListener("mouseleave", function () {
      cursorDot.classList.remove("hover-grow");
      cursorOutline.classList.remove("hover-grow");
    });
  });
}

// ========== ANIMATED COUNTERS ==========
const counters = document.querySelectorAll(".counter");

const animateCounter = function (counter) {
  const target = parseInt(counter.getAttribute("data-target"));
  let count = 0;
  const increment = target / 50;
  const updateCount = function () {
    if (count < target) {
      count += increment;
      counter.innerText = Math.ceil(count);
      setTimeout(updateCount, 30);
    } else {
      counter.innerText = target;
    }
  };
  updateCount();
};

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });
}

// ========== TYPED.JS ANIMATION ==========
if (typeof Typed !== "undefined") {
  const typedElement = document.querySelector(".typing-wrapper");
  if (typedElement) {
    new Typed(".typing-wrapper", {
      strings: [
        "Boys National School",
        "Center of Excellence",
        "Kiba School",
        "Home of Champions",
      ],
      typeSpeed: 70,
      backSpeed: 40,
      loop: true,
      showCursor: false,
    });
  }
}

// ========== CONTACT FORM HANDLER ==========
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      inquiry: formData.get("inquiry"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (formStatus) {
          formStatus.innerHTML =
            '<p style="color: #10b981;"><i class="fas fa-check-circle"></i> Message sent successfully! We will get back to you soon.</p>';
        } else {
          alert("Message sent successfully! We will get back to you soon.");
        }
        contactForm.reset();
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      if (formStatus) {
        formStatus.innerHTML =
          '<p style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Failed to send message. Please try again later.</p>';
      } else {
        alert("Failed to send message. Please try again later.");
      }
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      if (formStatus) {
        setTimeout(() => {
          formStatus.innerHTML = "";
        }, 5000);
      }
    }
  });
}

// ========== NEWSLETTER SIGNUP ==========
const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Successfully subscribed to Kiba newsletter!");
        newsletterForm.reset();
      }
    } catch (error) {
      console.log("Newsletter API not available");
    }
  });
}

// ========== SCROLL TO TOP BUTTON ==========
const scrollTopBtn = document.createElement("button");
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 20px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: #c9a03d;
    color: #1a472a;
    border: none;
    cursor: pointer;
    z-index: 1000;
    display: none;
    transition: all 0.3s;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-size: 1.2rem;
`;
document.body.appendChild(scrollTopBtn);

window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

scrollTopBtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ========== CANVAS CONFETTI ON LOAD ==========
if (typeof canvasConfetti !== "undefined") {
  setTimeout(function () {
    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c9a03d", "#1a472a", "#ffffff"],
    });
  }, 2000);
}

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ========== DOWNLOAD LINKS HANDLER ==========
document
  .querySelectorAll(".download-card .btn-outline, .admission-card .btn-outline")
  .forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      alert(
        "Download feature coming soon. Please contact the school office for document requests.",
      );
    });
  });

// ========== KIDA MEMBERS PORTAL ==========
const membersPortalLink = document.getElementById("membersPortalLink");
if (membersPortalLink) {
  membersPortalLink.addEventListener("click", function (e) {
    e.preventDefault();
    alert(
      "KIDA membership registration coming soon. Please contact the alumni office for more information.",
    );
  });
}

// ========== PARALLAX EFFECT ==========
window.addEventListener("scroll", function () {
  const parallax = document.querySelector(".parallax-bg");
  if (parallax) {
    const scrollPosition = window.pageYOffset;
    parallax.style.transform = "translateY(" + scrollPosition * 0.3 + "px)";
  }
});

// ========== CONSOLE WELCOME MESSAGE ==========
console.log(
  "%c🏫 Welcome to St. Mary's Kibabii Boys National School (Kiba) Website",
  "color: #c9a03d; font-size: 16px; font-weight: bold;",
);
console.log(
  "%c📞 Contact: 0734-741162 | ✉️ info@stmaryskibabii.ac.ke",
  "color: #1a472a; font-size: 12px;",
);
console.log(
  "%c🎓 Orare et Laborare - Pray and Work",
  "color: #c9a03d; font-size: 14px; font-style: italic;",
);
