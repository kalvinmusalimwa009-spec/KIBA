// script.js - Complete functionality for St. Mary's Kibabii Website

// ==================== PRELOADER ====================
console.log('script.js loaded successfully');

window.addEventListener("load", () => {
    console.log("Window load event fired");
    const preloader = document.getElementById("preloader");
    if (preloader) {
        console.log("Preloader found, hiding now");
        preloader.style.transition = "opacity 0.5s ease";
        preloader.style.opacity = "0";
        setTimeout(() => {
            preloader.style.display = "none";
            console.log("Preloader hidden");
        }, 500);
    } else {
        console.log("Preloader element NOT found!");
    }
});

setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader && preloader.style.display !== "none") {
        console.log("Fallback: hiding preloader after timeout");
        preloader.style.transition = "opacity 0.5s ease";
        preloader.style.opacity = "0";
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500);
    }
}, 3000);

// ==================== TRANSPARENT NAVBAR ON SCROLL ====================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== CUSTOM CURSOR ====================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        cursorOutline.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    });
    
    document.querySelectorAll('a, button, .btn-primary, .card-3d, .co-card, .alumni-card, .admin-card, .staff-card, .filter-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
        });
    });
}

// ==================== TYPING ANIMATION ====================
const typingElement = document.querySelector('.typing-wrapper');
if (typingElement) {
    const strings = ['Boys National School', 'Center of Excellence', 'Home of Champions', 'KSEF Powerhouse'];
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentString = strings[stringIndex];
        if (isDeleting) {
            typingElement.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentString.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            stringIndex = (stringIndex + 1) % strings.length;
            setTimeout(typeEffect, 500);
        } else {
            setTimeout(typeEffect, isDeleting ? 50 : 100);
        }
    }
    typeEffect();
}

// ==================== DARK/LIGHT MODE TOGGLE ====================
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', currentTheme);
if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// ==================== AOS INITIALIZATION ====================
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// ==================== MOBILE MENU TOGGLE ====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            navLinks.classList.remove('active');
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ==================== ACTIVE LINK HIGHLIGHTING ====================
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==================== ANIMATED STATISTICS BARS ====================
const statBars = document.querySelectorAll('.stat-bar-fill');
let barsAnimated = false;

function animateBars() {
    statBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
    });
}

// ==================== NUMBER COUNTERS ====================
const counters = document.querySelectorAll('.stat-number');
let countersStarted = false;

function startCounters() {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let count = 0;
        const updateCounter = () => {
            const increment = target / 50;
            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        updateCounter();
    });
}

// ==================== INTERSECTION OBSERVER FOR STATS ====================
const aboutSection = document.getElementById('about');
if (aboutSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!countersStarted) {
                    countersStarted = true;
                    startCounters();
                }
                if (!barsAnimated) {
                    barsAnimated = true;
                    animateBars();
                }
            }
        });
    }, { threshold: 0.5 });
    observer.observe(aboutSection);
}

// ==================== COUNTDOWN TIMER ====================
function updateCountdown() {
    const targetDate = new Date('August 15, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
        const countdownContainer = document.getElementById('countdownContainer');
        if (countdownContainer) {
            countdownContainer.innerHTML = '<div class="countdown-label">Event Has Begun!</div>';
        }
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ==================== FLOATING ACTION BUTTON ====================
const fabMain = document.getElementById('fabMain');
const fabContainer = document.querySelector('.fab-container');

if (fabMain) {
    fabMain.addEventListener('click', () => {
        fabContainer.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (fabContainer && !fabContainer.contains(e.target)) {
            fabContainer.classList.remove('active');
        }
    });
}

// ==================== TESTIMONIAL CAROUSEL ====================
const track = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');

if (track && prevBtn && nextBtn) {
    const cards = document.querySelectorAll('.testimonial-card');
    const cardWidth = cards[0]?.offsetWidth + 32;
    let currentIndex = 0;
    let autoSlideInterval;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function createDots() {
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
                resetAutoSlide();
            });
            if (dotsContainer) dotsContainer.appendChild(dot);
        });
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });
    
    createDots();
    startAutoSlide();
    
    window.addEventListener('resize', () => {
        const newCardWidth = cards[0]?.offsetWidth + 32;
        track.style.transform = `translateX(-${currentIndex * newCardWidth}px)`;
    });
}

// ==================== ALUMNI DATA - LOAD FROM JSON FILE ====================
let alumniData = [];
let currentFilter = 'all';

async function loadAlumniData() {
    try {
        const response = await fetch('alumni.json');
        if (!response.ok) {
            throw new Error('Failed to load alumni.json');
        }
        const data = await response.json();
        alumniData = data.alumni;
        renderAlumni(currentFilter);
        createFilterButtonsFromData();
    } catch (error) {
        console.error('Error loading alumni data:', error);
        useFallbackAlumniData();
    }
}

function useFallbackAlumniData() {
    alumniData = [
        { id: 1, name: "Ken Lusaka", image: "https://via.placeholder.com/400x400/0a2f2b/f5c542?text=Ken+Lusaka", graduation_year: "1982", position: "Governor, Bungoma County", achievement: "Former Speaker of the Bungoma County Assembly.", category: "Politics & Government" },
        { id: 2, name: "Dr. Moses Sichei", image: "https://via.placeholder.com/400x400/0a2f2b/f5c542?text=Dr.+Sichei", graduation_year: "1985", position: "Consultant, UNDP", achievement: "International development expert.", category: "International Development" },
        { id: 3, name: "Prof. Cornelius Wanjala", image: "https://via.placeholder.com/400x400/0a2f2b/f5c542?text=Prof.+Wanjala", graduation_year: "1984", position: "Head of Chemistry, SEKU", achievement: "Published researcher.", category: "Academia" },
        { id: 4, name: "Benard Mang'oli", image: "https://via.placeholder.com/400x400/0a2f2b/f5c542?text=Benard+Mangoli", graduation_year: "2015", position: "Professional Footballer, AFC Leopards", achievement: "Key midfielder in Kenyan Premier League.", category: "Sports" }
    ];
    renderAlumni(currentFilter);
    createFilterButtonsFromData();
}

function renderAlumni(filter = 'all') {
    const alumniGrid = document.getElementById('alumniGrid');
    if (!alumniGrid) return;
    
    let filteredAlumni = alumniData;
    if (filter !== 'all') {
        filteredAlumni = alumniData.filter(alumnus => alumnus.category === filter);
    }
    
    if (filteredAlumni.length === 0) {
        alumniGrid.innerHTML = `<div class="no-results" style="text-align: center; grid-column: 1/-1; padding: 3rem;">No alumni found in this category.</div>`;
        return;
    }
    
    alumniGrid.innerHTML = filteredAlumni.map(alumnus => `
        <div class="alumni-card" data-aos="fade-up" data-aos-delay="${Math.floor(Math.random() * 200)}">
            <div class="alumni-image">
                <img src="${alumnus.image}" alt="${alumnus.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/0a2f2b/f5c542?text=No+Image'">
                <div class="alumni-overlay">
                    <p>${alumnus.achievement.substring(0, 100)}${alumnus.achievement.length > 100 ? '...' : ''}</p>
                </div>
                <span class="alumni-category">${alumnus.category}</span>
            </div>
            <div class="alumni-info">
                <h3 class="alumni-name">${alumnus.name}</h3>
                <span class="alumni-year"><i class="far fa-calendar-alt"></i> Class of ${alumnus.graduation_year}</span>
                <p class="alumni-position"><i class="fas fa-briefcase"></i> ${alumnus.position}</p>
                <p class="alumni-achievement">${alumnus.achievement}</p>
            </div>
        </div>
    `).join('');
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function createFilterButtonsFromData() {
    const categories = ['all', ...new Set(alumniData.map(a => a.category))];
    const filterContainer = document.querySelector('.filters');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category === 'all' ? 'All' : category;
        btn.classList.add('filter-btn');
        if ((category === 'all' && currentFilter === 'all') || (category === currentFilter)) {
            btn.classList.add('active');
        }
        btn.setAttribute('data-filter', category);
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = category;
            renderAlumni(currentFilter);
        });
        filterContainer.appendChild(btn);
    });
}

// ==================== STAFF DATA ====================
const staffData = [
    { id: 1, name: "Mr. Eliud Lagat",subject: "Maths",image:" https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mrs.+Lagat" },
    { id: 2, name: "Mrs. Deborah ", subject: "English", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mrs.+Deborah" },
    { id: 3, name: "Mr. Martin", subject: "Physics", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mr.+Martin" },
    { id: 4, name: "Ms. kasili", subject: "Chemistry", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Ms.+Kasili" },
    { id: 5, name: "Mr. Moseti Caleb", subject: "Biology", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mr.+Moseti" },
    { id: 6, name: "Mrs. Akila Joseph", subject: "History", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mrs.+Akila" },
    { id: 7, name: "Mr. Tony Lusweti", subject: "Geography", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mr.+Lusweti"},
    { id: 8, name: "Ms. Diana", subject: "Religious Education", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Ms.+Diana" },
    { id: 9, name: "Mr. Makhanu", subject: "Business Studies", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mr.+Makhanu"},
    { id: 10, name: "Mrs. Brenda Nanyama",subject:"Computer", image: "https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Mrs.+Nangabo" }
];

function renderStaff() {
    const staffGrid = document.getElementById('staffGrid');
    if (!staffGrid) return;
    
    staffGrid.innerHTML = staffData.map(staff => `
        <div class="staff-card" data-aos="fade-up" data-aos-delay="${Math.floor(Math.random() * 150)}">
            <div class="staff-image">
                <img src="${staff.image}" alt="${staff.name}" onerror="this.src='https://via.placeholder.com/200x200/0a2f2b/f5c542?text=Staff'">
            </div>
            <h4>${staff.name}</h4>
            <p>${staff.subject}</p>
        </div>
    `).join('');
}

// ==================== CONTACT FORM HANDLER ====================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message. St. Mary\'s Kibabii Boys National School will respond to you shortly.');
        contactForm.reset();
    });
}

// ==================== PARALLAX SCROLL EFFECT ====================
window.addEventListener('scroll', () => {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        const scrolled = window.pageYOffset;
        parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ==================== KIDA PORTAL LINK HANDLERS ====================
const portalLink = document.getElementById('membersPortalLink');
if (portalLink) {
    portalLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('KIDA Members Portal\n\nThis is a members-only area.\n\nPlease enter your KIDA membership credentials to access:\n- Alumni Directory\n- Event Registration\n- Member Benefits\n- Exclusive Content\n\n(Contact KIDA admin if you need assistance with your login)');
    });
}

const forgotLink = document.getElementById('forgotPasswordLink');
if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password Reset\n\nPlease contact KIDA Secretariat at:\n📞 0734-741162\n📧 kida@stmaryskibabii.ac.ke\n\nProvide your membership number for assistance.');
    });
}

const contactKidaLink = document.getElementById('contactKidaLink');
if (contactKidaLink) {
    contactKidaLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Contact KIDA\n\n📧 Email: kida@stmaryskibabii.ac.ke\n📞 Phone: 0734-741162\n\nKIDA Secretariat\nSt. Mary\'s Kibabii Boys National School\nP.O. Box 85, Bungoma 50200');
    });
}

document.querySelectorAll('.event-link.member-only').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        alert('KIDA Members Only\n\nThis event is exclusively for registered KIDA members.\n\nPlease log in to the Members Portal to register for this event.');
    });
});

// ==================== KIDA STATISTICS COUNTER ====================
const kidaSection = document.getElementById('kida');
if (kidaSection) {
    let kidaCountersStarted = false;
    const kidaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !kidaCountersStarted) {
                kidaCountersStarted = true;
                const kidaCounters = document.querySelectorAll('#kida .stat-number');
                kidaCounters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    let count = 0;
                    const updateCounter = () => {
                        const increment = target / 40;
                        if (count < target) {
                            count += increment;
                            counter.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                    };
                    updateCounter();
                });
                kidaObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });
    kidaObserver.observe(kidaSection);
}

// ==================== CONFETTI FOR SPECIAL OCCASIONS ====================
function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#c9a03d', '#0a2f2b', '#f5c542', '#ffffff'];
    
    (function frame() {
        canvasConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors
        });
        canvasConfetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors
        });
        
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

const specialDates = [
    { month: 11, day: 15, name: "KCSE Results Day" },
    { month: 12, day: 10, name: "Graduation Day" },
    { month: 3, day: 15, name: "National School Status Day" }
];

const today = new Date();
specialDates.forEach(date => {
    if (today.getMonth() + 1 === date.month && today.getDate() === date.day) {
        setTimeout(() => triggerConfetti(), 1000);
        const notification = document.createElement('div');
        notification.className = 'special-notification';
        notification.innerHTML = `🎉 Happy ${date.name}! 🎉`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
});

// ==================== INITIALIZE ALL SECTIONS ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    if (document.getElementById('alumniGrid')) {
        loadAlumniData();
    }
    if (document.getElementById('staffGrid')) {
        renderStaff();
    }
});

// ==================== 3D PARALLAX MOUSE EFFECT ON HERO ====================
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        const heroContent = document.querySelector('.hero-content');
        const parallaxBg = document.querySelector('.parallax-bg');
        
        if (heroContent) {
            heroContent.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        }
        if (parallaxBg) {
            parallaxBg.style.transform = `translate(${x * 40}px, ${y * 40}px) scale(1.1)`;
        }
    });
    
    heroSection.addEventListener('mouseleave', () => {
        const heroContent = document.querySelector('.hero-content');
        const parallaxBg = document.querySelector('.parallax-bg');
        if (heroContent) heroContent.style.transform = 'translate(0, 0)';
        if (parallaxBg) parallaxBg.style.transform = 'translate(0, 0) scale(1)';
    });
}