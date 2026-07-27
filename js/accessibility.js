// accessibility.js - Client-side accessibility, compatibility & security monitoring
(function () {
  "use strict";

  console.log("🔍 Kiba School - Accessibility & Monitoring Active\n");

  // ========== ACCESSIBILITY CHECKS ==========
  function checkAccessibility() {
    const issues = [];

    // Check images for alt text
    document.querySelectorAll("img").forEach((img, index) => {
      if (!img.hasAttribute("alt") || img.getAttribute("alt") === "") {
        issues.push({
          element: "img",
          message: `Image missing alt text: ${img.src || "unknown source"}`,
          severity: "warning",
        });
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (level - lastLevel > 1 && lastLevel !== 0) {
        issues.push({
          element: heading.tagName,
          message: `Heading level skipped from H${lastLevel} to H${level}`,
          severity: "warning",
        });
      }
      lastLevel = level;
    });

    // Check for color contrast (basic)
    const textElements = document.querySelectorAll(
      "p, span, li, a, h1, h2, h3, h4",
    );
    textElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;
      // Simple check - if text is white on white-ish background
      if (color === "rgb(255, 255, 255)" && bgColor === "rgb(255, 255, 255)") {
        issues.push({
          element: el.tagName,
          message: "Poor contrast: White text on white background",
          severity: "error",
        });
      }
    });

    // Check for aria labels on interactive elements
    const interactive = document.querySelectorAll(
      "button, a, input, select, textarea",
    );
    interactive.forEach((el) => {
      if (
        !el.hasAttribute("aria-label") &&
        !el.hasAttribute("aria-labelledby") &&
        !el.textContent.trim()
      ) {
        issues.push({
          element: el.tagName,
          message: "Interactive element missing accessible label",
          severity: "warning",
        });
      }
    });

    return issues;
  }

  // ========== COMPATIBILITY CHECKS ==========
  function checkCompatibility() {
    const issues = [];
    const userAgent = navigator.userAgent;

    // Browser detection
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      console.log("✅ Chrome detected - fully compatible");
    } else if (userAgent.includes("Firefox")) {
      console.log("✅ Firefox detected - fully compatible");
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      console.log("✅ Safari detected - fully compatible");
    } else if (userAgent.includes("Edg")) {
      console.log("✅ Edge detected - fully compatible");
    } else {
      issues.push({
        type: "compatibility",
        message: "Unknown browser - some features may not work optimally",
        severity: "warning",
      });
    }

    // Check for CSS Grid support
    const testDiv = document.createElement("div");
    testDiv.style.display = "grid";
    if (testDiv.style.display !== "grid") {
      issues.push({
        type: "compatibility",
        message: "CSS Grid not supported - layout may appear broken",
        severity: "error",
      });
    }

    // Check viewport size
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    if (viewport.width < 768) {
      console.log("📱 Mobile view detected - responsive layout active");
    }

    return issues;
  }

  // ========== SECURITY CHECKS ==========
  function checkSecurity() {
    const issues = [];

    // Check for HTTPS (in production)
    if (location.protocol === "http:" && location.hostname !== "localhost") {
      issues.push({
        type: "security",
        message: "Connection not secure - use HTTPS in production",
        severity: "warning",
      });
    }

    // Check for console warnings (potential XSS)
    const originalConsoleWarn = console.warn;
    console.warn = function () {
      if (arguments[0] && arguments[0].includes("XSS")) {
        issues.push({
          type: "security",
          message: "Potential XSS detected - check user inputs",
          severity: "error",
        });
      }
      originalConsoleWarn.apply(console, arguments);
    };

    return issues;
  }

  // ========== PERFORMANCE CHECKS ==========
  function checkPerformance() {
    const issues = [];

    // Check Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "largest-contentful-paint") {
            const lcp = entry.renderTime || entry.loadTime;
            if (lcp > 2500) {
              issues.push({
                type: "performance",
                message: `Slow LCP: ${(lcp / 1000).toFixed(1)}s (recommended < 2.5s)`,
                severity: "warning",
              });
            }
          }
        });
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    }

    // Check for unoptimized images
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth > 1200) {
        issues.push({
          type: "performance",
          message: `Large image: ${img.src.split("/").pop()} (${img.naturalWidth}px wide)`,
          severity: "warning",
        });
      }
    });

    return issues;
  }

  // ========== DISPLAY REPORT ==========
  function displayReport(accessibility, compatibility, security, performance) {
    const allIssues = [
      ...accessibility,
      ...compatibility,
      ...security,
      ...performance,
    ];

    console.log(
      "\n╔════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║              KIBA SCHOOL - MONITORING REPORT                  ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n",
    );

    if (allIssues.length === 0) {
      console.log("✅ No issues detected! Your website is well optimized.\n");
    } else {
      console.log(`📊 Found ${allIssues.length} issue(s):\n`);

      // Group by severity
      const errors = allIssues.filter((i) => i.severity === "error");
      const warnings = allIssues.filter((i) => i.severity === "warning");

      if (errors.length) {
        console.log("❌ ERRORS:");
        errors.forEach((e) => console.log(`   - ${e.message}`));
        console.log("");
      }
      if (warnings.length) {
        console.log("⚠️ WARNINGS:");
        warnings.forEach((w) => console.log(`   - ${w.message}`));
        console.log("");
      }
    }

    console.log(
      "📱 Device: " +
        (window.innerWidth < 768
          ? "Mobile"
          : window.innerWidth < 1024
            ? "Tablet"
            : "Desktop"),
    );
    console.log(
      "🌐 Browser: " + navigator.userAgent.split(" ").slice(-2).join(" "),
    );
    console.log(
      "🎨 Theme: " +
        (document.documentElement.hasAttribute("data-theme")
          ? "Dark"
          : "Light"),
    );
    console.log(
      "\n✅ Monitoring active - Report generated at " +
        new Date().toLocaleTimeString(),
    );
  }

  // Run all checks after page loads
  window.addEventListener("load", function () {
    setTimeout(() => {
      const accessibility = checkAccessibility();
      const compatibility = checkCompatibility();
      const security = checkSecurity();
      const performance = checkPerformance();
      displayReport(accessibility, compatibility, security, performance);
    }, 1000);
  });

  // Monitor for dynamic content changes
  const observer = new MutationObserver(function (mutations) {
    // Re-check accessibility when content changes
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length) {
        const newIssues = checkAccessibility();
        if (newIssues.length) {
          console.log("🔄 New content detected - re-checking accessibility...");
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
