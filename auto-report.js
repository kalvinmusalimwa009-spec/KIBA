// auto-report.js - Automatic accessibility, compatibility, and security reporting
const fs = require("fs");
const path = require("path");
const os = require("os");

class AutoReporter {
  constructor() {
    this.issues = [];
    this.reportFile = path.join(
      __dirname,
      "reports",
      `report-${Date.now()}.json`,
    );
    this.ensureReportDir();
  }

  ensureReportDir() {
    const reportDir = path.join(__dirname, "reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  }

  // Accessibility Checks
  checkAccessibility(htmlContent) {
    const issues = [];

    // Check for alt attributes on images
    const imgTags = htmlContent.match(/<img[^>]*>/g) || [];
    imgTags.forEach((img, index) => {
      if (!img.includes("alt=")) {
        issues.push({
          type: "accessibility",
          severity: "warning",
          message: `Image missing alt attribute (image ${index + 1})`,
          fix: 'Add alt="description" to img tag',
        });
      }
    });

    // Check for heading hierarchy
    const h1Count = (htmlContent.match(/<h1[^>]*>/g) || []).length;
    if (h1Count === 0) {
      issues.push({
        type: "accessibility",
        severity: "error",
        message: "No H1 heading found",
        fix: "Add an H1 heading for main page title",
      });
    }
    if (h1Count > 1) {
      issues.push({
        type: "accessibility",
        severity: "warning",
        message: "Multiple H1 headings found",
        fix: "Use only one H1 per page",
      });
    }

    // Check for language attribute
    if (!htmlContent.includes("lang=")) {
      issues.push({
        type: "accessibility",
        severity: "warning",
        message: "HTML lang attribute missing",
        fix: 'Add lang="en" to html tag',
      });
    }

    return issues;
  }

  // Compatibility Checks
  checkCompatibility() {
    const issues = [];
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

    if (majorVersion < 18) {
      issues.push({
        type: "compatibility",
        severity: "error",
        message: `Node.js version ${majorVersion} is outdated`,
        fix: "Update to Node.js 18 or higher from https://nodejs.org/",
      });
    }

    // Check browser compatibility meta tags
    const frontendPath = path.join(__dirname, "../frontend");
    if (fs.existsSync(frontendPath)) {
      const indexHtml = path.join(frontendPath, "index.html");
      if (fs.existsSync(indexHtml)) {
        const content = fs.readFileSync(indexHtml, "utf8");
        if (!content.includes("viewport")) {
          issues.push({
            type: "compatibility",
            severity: "warning",
            message: "Viewport meta tag missing",
            fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          });
        }
      }
    }

    return issues;
  }

  // Security Checks
  checkSecurity() {
    const issues = [];

    // Check for .env file
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) {
      issues.push({
        type: "security",
        severity: "warning",
        message: ".env file not found",
        fix: "Create .env file and add environment variables",
      });
    }

    // Check for hardcoded secrets
    const filesToCheck = ["server.js", "database.js"];
    filesToCheck.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.includes("password") && !content.includes("process.env")) {
          issues.push({
            type: "security",
            severity: "error",
            message: `Hardcoded password found in ${file}`,
            fix: "Use environment variables for sensitive data",
          });
        }
      }
    });

    return issues;
  }

  // Performance Checks
  checkPerformance() {
    const issues = [];
    const frontendPath = path.join(__dirname, "../frontend");

    if (fs.existsSync(frontendPath)) {
      // Check for large image files
      const imagesPath = path.join(frontendPath, "images");
      if (fs.existsSync(imagesPath)) {
        const images = fs.readdirSync(imagesPath);
        images.forEach((img) => {
          const imgPath = path.join(imagesPath, img);
          const stats = fs.statSync(imgPath);
          if (stats.size > 1024 * 1024) {
            // 1MB
            issues.push({
              type: "performance",
              severity: "warning",
              message: `Large image file: ${img} (${(stats.size / 1024).toFixed(0)}KB)`,
              fix: "Compress images to under 500KB",
            });
          }
        });
      }

      // Check CSS/JS file sizes
      const cssPath = path.join(frontendPath, "css", "style.css");
      if (fs.existsSync(cssPath)) {
        const stats = fs.statSync(cssPath);
        if (stats.size > 100 * 1024) {
          issues.push({
            type: "performance",
            severity: "warning",
            message: `Large CSS file: ${(stats.size / 1024).toFixed(0)}KB`,
            fix: "Minify CSS for production",
          });
        }
      }
    }

    return issues;
  }

  // Generate Complete Report
  generateReport() {
    console.log("\n🔍 Running automated checks...\n");

    // Read HTML files for accessibility checks
    const frontendPath = path.join(__dirname, "../frontend");
    if (fs.existsSync(frontendPath)) {
      const htmlFiles = fs
        .readdirSync(frontendPath)
        .filter((f) => f.endsWith(".html"));
      htmlFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(frontendPath, file), "utf8");
        const accessIssues = this.checkAccessibility(content);
        this.issues.push(...accessIssues.map((i) => ({ ...i, file })));
      });
    }

    // Run other checks
    this.issues.push(...this.checkCompatibility());
    this.issues.push(...this.checkSecurity());
    this.issues.push(...this.checkPerformance());

    // Display report
    console.log(
      "╔════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                    AUTO-REPORT SUMMARY                         ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝\n",
    );

    const grouped = {
      accessibility: this.issues.filter((i) => i.type === "accessibility"),
      compatibility: this.issues.filter((i) => i.type === "compatibility"),
      security: this.issues.filter((i) => i.type === "security"),
      performance: this.issues.filter((i) => i.type === "performance"),
    };

    Object.keys(grouped).forEach((category) => {
      if (grouped[category].length > 0) {
        console.log(
          `\n📋 ${category.toUpperCase()} (${grouped[category].length} issues):`,
        );
        grouped[category].forEach((issue) => {
          const emoji = issue.severity === "error" ? "❌" : "⚠️";
          console.log(`   ${emoji} ${issue.message}`);
          if (issue.file) console.log(`      📄 File: ${issue.file}`);
          if (issue.fix) console.log(`      🔧 Fix: ${issue.fix}`);
        });
      } else {
        console.log(`\n✅ ${category.toUpperCase()}: No issues found`);
      }
    });

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
      },
      summary: {
        total: this.issues.length,
        bySeverity: {
          error: this.issues.filter((i) => i.severity === "error").length,
          warning: this.issues.filter((i) => i.severity === "warning").length,
        },
        byType: {
          accessibility: grouped.accessibility.length,
          compatibility: grouped.compatibility.length,
          security: grouped.security.length,
          performance: grouped.performance.length,
        },
      },
      issues: this.issues,
    };

    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${this.reportFile}`);

    return this.issues;
  }
}

// Run auto-report if executed directly
if (require.main === module) {
  const reporter = new AutoReporter();
  reporter.generateReport();
}

module.exports = AutoReporter;
