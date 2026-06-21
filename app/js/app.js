// ==========================================
// HARNESS AI - FUTURISTIC ANALYSIS APP
// ==========================================

// Particle Background
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
            this.ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 150)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}


// Typing Effect
class TypeWriter {
    constructor(element, texts, speed = 50) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let delay = this.isDeleting ? 30 : this.speed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            delay = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            delay = 500;
        }

        setTimeout(() => this.type(), delay);
    }
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                if (target === 12) counter.textContent = '12.6';
            } else {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(update);
            }
        };
        update();
    });
}

// Score Ring Animation
function animateScoreRing() {
    const circle = document.getElementById('scoreCircle');
    const scoreEl = document.getElementById('mainScore');
    if (!circle || !scoreEl) return;

    const circumference = 2 * Math.PI * 85;
    const score = 12.6;
    const percentage = score / 20;
    const offset = circumference * (1 - percentage);

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 500);

    // Animate number
    let current = 0;
    const duration = 2000;
    const increment = score / (duration / 16);
    const updateScore = () => {
        current += increment;
        if (current >= score) {
            scoreEl.textContent = '12.6';
        } else {
            scoreEl.textContent = current.toFixed(1);
            requestAnimationFrame(updateScore);
        }
    };

    setTimeout(updateScore, 500);
}

// Progress Bar
function updateProgressBar() {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
}

// Reveal on Scroll
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const revealPoint = 150;

        if (elementTop < windowHeight - revealPoint) {
            el.classList.add('active');
        }
    });
}

// Active Nav Link
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
        }
    });
}


// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Particles
    const canvas = document.getElementById('particles');
    if (canvas) new ParticleSystem(canvas);

    // Typing effect
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) {
        new TypeWriter(heroSubtitle, [
            '> Analyzing 93 pages of PFE Report...',
            '> Golden Section Search != AI',
            '> Cost function: Euclidean vs Curvilinear',
            '> 39.4 cm gain on 2 splices only',
            '> DMAIC Control phase is incomplete',
            '> Estimated score: 12.6 / 20'
        ], 40);
    }

    // Counters
    animateCounters();

    // Scroll events
    window.addEventListener('scroll', () => {
        updateProgressBar();
        revealOnScroll();
        updateActiveNav();
    });

    // Initial reveal check
    revealOnScroll();

    // Score ring animation when visible
    const scoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateScoreRing();
                scoreObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const scoreSection = document.getElementById('score');
    if (scoreSection) scoreObserver.observe(scoreSection);

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Question card hover effect
    document.querySelectorAll('.question-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'rgba(123, 47, 255, 0.5)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'rgba(0, 240, 255, 0.15)';
        });
    });

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
});
