/* ============================================================
   ELITE MATH TUTORING - MAIN JAVASCRIPT
   Advanced animations, Three.js integration, and interactivity
   ============================================================ */

// ==================== THREE.JS SCENE SETUP ====================
let scene, camera, renderer, particles;

function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0xffffff, 100, 1000);

    // Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup with performance optimization
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        precision: 'mediump',
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Create animated particle background
    createParticleBackground();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function createParticleBackground() {
    const particleCount = window.innerWidth > 768 ? 1000 : 500;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        colors[i] = Math.random() * 0.3 + 0.7;
        colors[i + 1] = Math.random() * 0.3 + 0.7;
        colors[i + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Rotate particles
    particles.rotation.x = Math.random() * Math.PI;
    particles.rotation.y = Math.random() * Math.PI;
}

function animate() {
    requestAnimationFrame(animate);

    // Animate particles
    if (particles) {
        particles.rotation.x += 0.00005;
        particles.rotation.y += 0.00005;
    }

    // Add mouse interactivity on desktop
    if (window.innerWidth > 768) {
        updateMouseInteraction();
    }

    renderer.render(scene, camera);
}

let mouseX = 0;
let mouseY = 0;

function updateMouseInteraction() {
    if (camera) {
        const rotationSpeed = 0.0001;
        camera.position.x += (mouseX - camera.position.x) * rotationSpeed;
        camera.position.y += (-mouseY - camera.position.y) * rotationSpeed;
        camera.lookAt(scene.position);
    }
}

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100 - 50;
    mouseY = (e.clientY / window.innerHeight) * 100 - 50;
});

function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Initialize Three.js when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initThreeJS, 100);
});

// ==================== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });
});

// ==================== SMOOTH SCROLL TO SECTIONS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's the logo or not a section link
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        }
    });
});

// ==================== MOBILE MENU TOGGLE ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-container')) {
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

// ==================== FAQ ACCORDION ====================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all other items
        document.querySelectorAll('.faq-item').forEach(el => {
            el.classList.remove('open');
        });

        // Toggle current item
        if (!isOpen) {
            item.classList.add('open');
        }
    });
});

// ==================== FORM SUBMISSION ====================
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);

        // Validation
        if (!data.name || !data.email || !data.grade || !data.topic) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const response = await fetch("https://formspree.io/f/xnjwbzad", {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            });

            if (response.ok) {
                showNotification("Thank you! We'll contact you within 24 hours.", "success");
                bookingForm.reset();
            } else {
                showNotification("Submission failed. Please try again.", "error");
            }

        } catch (error) {
            console.error(error);
            showNotification("Network error. Please try again.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}
// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 90%;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ==================== CTA BUTTON SCROLL NAVIGATION ====================
document.querySelectorAll('[data-target]').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            e.preventDefault();
            const offsetTop = targetElement.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        }
    });
});

// ==================== NAVBAR BACKGROUND ON SCROLL ====================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(248, 250, 252, 0.95)';
            navbar.style.borderBottomColor = 'rgba(226, 232, 240, 0.8)';
        } else {
            navbar.style.background = 'rgba(248, 250, 252, 0.8)';
            navbar.style.borderBottomColor = 'rgba(226, 232, 240, 0.5)';
        }
    }
});

// ==================== PERFORMANCE OPTIMIZATION ====================
// Reduce animation complexity on low-end devices
function detectPerformance() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer_info = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    // Check for low-end devices
    const isLowEnd = renderer_info.includes('Adreno') || 
                     renderer_info.includes('Mali') || 
                     renderer_info.includes('Intel');
    
    if (isLowEnd) {
        document.body.classList.add('low-performance');
    }
}

// Initialize performance detection
try {
    detectPerformance();
} catch (e) {
    console.log('Could not detect GPU performance');
}

// ==================== LAZY LOADING FOR IMAGES ====================
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ==================== PARALLAX EFFECT ON SCROLL ====================
window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const scrollY = window.pageYOffset;
        if (particles) {
            particles.rotation.z += scrollY * 0.00001;
        }
    }
});

// ==================== BUTTON HOVER EFFECTS ====================
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ==================== FORM FIELD VALIDATION ====================
const formInputs = document.querySelectorAll('.booking-form input, .booking-form textarea, .booking-form select');

formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#EF4444';
        } else if (this.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.value)) {
                this.style.borderColor = '#EF4444';
            } else {
                this.style.borderColor = '#10B981';
            }
        } else {
            this.style.borderColor = '#10B981';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '#4F46E5';
    });
});

// ==================== STAGGER ANIMATION FOR MULTIPLE ELEMENTS ====================
function staggerAnimation(elements, delay = 100) {
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * delay}ms`;
    });
}

// Initialize staggered animations
document.addEventListener('DOMContentLoaded', () => {
    const gridItems = document.querySelectorAll('.subjects-grid .subject-card, .benefits-grid .benefit-card, .testimonials-grid .testimonial-card');
    if (gridItems.length > 0) {
        gridItems.forEach(el => {
            if (!el.style.animationDelay) {
                el.style.transitionDelay = `${Array.from(gridItems).indexOf(el) * 0.05}s`;
            }
        });
    }
});

// ==================== ACCESSIBILITY IMPROVEMENTS ====================
// Keyboard navigation for menus
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
});

// ==================== UTILITY: DETECT PREFERS-REDUCED-MOTION ====================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('[style*="animation"]').forEach(el => {
        el.style.animation = 'none';
    });
}

// ==================== HASH-BASED NAVIGATION ====================
function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash) {
        const element = document.querySelector(hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

window.addEventListener('hashchange', handleHashNavigation);
document.addEventListener('DOMContentLoaded', handleHashNavigation);

// ==================== CONSOLE LOG ====================
console.log('%c✓ Elite Math Tutoring Website Loaded', 'color: #4F46E5; font-size: 14px; font-weight: bold;');
console.log('%cMade with ❤️ for education', 'color: #06B6D4; font-size: 12px;');
