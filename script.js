/* ========================================
   DOM Elements
   ======================================== */
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const backToTopBtn = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const formInputs = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    message: document.getElementById('message')
};
const errorMessages = {
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    subject: document.getElementById('subjectError'),
    message: document.getElementById('messageError')
};
const formSuccess = document.getElementById('formSuccess');
const revealElements = document.querySelectorAll('.reveal');

/* ========================================
   Mobile Menu Toggle
   ======================================== */
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when a nav link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

/* ========================================
   Sticky Navbar with Scroll Effect
   ======================================== */
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide back-to-top button
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }

    // Update active nav link
    updateActiveNavLink();
});

/* ========================================
   Active Navigation Link Based on Section
   ======================================== */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/* ========================================
   Smooth Scrolling
   ======================================== */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Smooth scroll for back-to-top button
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

/* ========================================
   Scroll Reveal Animation with IntersectionObserver
   ======================================== */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all reveal elements
revealElements.forEach(element => {
    observer.observe(element);
});

/* ========================================
   Contact Form Validation
   ======================================== */

// Clear error on input
Object.keys(formInputs).forEach(key => {
    formInputs[key].addEventListener('input', () => {
        errorMessages[key].textContent = '';
        errorMessages[key].style.display = 'none';
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error messages
    Object.keys(errorMessages).forEach(key => {
        errorMessages[key].textContent = '';
        errorMessages[key].style.display = 'none';
    });

    // Validation
    let isValid = true;

    // Name validation
    const nameValue = formInputs.name.value.trim();
    if (nameValue === '') {
        errorMessages.name.textContent = 'Please enter your name';
        errorMessages.name.style.display = 'block';
        isValid = false;
    } else if (nameValue.length < 2) {
        errorMessages.name.textContent = 'Name must be at least 2 characters';
        errorMessages.name.style.display = 'block';
        isValid = false;
    }

    // Email validation
    const emailValue = formInputs.email.value.trim();
    if (emailValue === '') {
        errorMessages.email.textContent = 'Please enter your email';
        errorMessages.email.style.display = 'block';
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        errorMessages.email.textContent = 'Please enter a valid email address';
        errorMessages.email.style.display = 'block';
        isValid = false;
    }

    // Subject validation
    const subjectValue = formInputs.subject.value.trim();
    if (subjectValue === '') {
        errorMessages.subject.textContent = 'Please enter a subject';
        errorMessages.subject.style.display = 'block';
        isValid = false;
    } else if (subjectValue.length < 3) {
        errorMessages.subject.textContent = 'Subject must be at least 3 characters';
        errorMessages.subject.style.display = 'block';
        isValid = false;
    }

    // Message validation
    const messageValue = formInputs.message.value.trim();
    if (messageValue === '') {
        errorMessages.message.textContent = 'Please enter a message';
        errorMessages.message.style.display = 'block';
        isValid = false;
    } else if (messageValue.length < 10) {
        errorMessages.message.textContent = 'Message must be at least 10 characters';
        errorMessages.message.style.display = 'block';
        isValid = false;
    }

    // If all validations pass
    if (isValid) {
        // Show success message
        formSuccess.textContent = '✓ Message received! Thank you for reaching out. I will get back to you soon.';
        formSuccess.classList.add('active');
        formSuccess.classList.remove('hidden');

        // Reset form
        contactForm.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
            formSuccess.classList.remove('active');
            formSuccess.classList.add('hidden');
        }, 5000);
    }
});

/* ========================================
   Prevent Excessive Animations for Reduced Motion
   ======================================== */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   Initialize Active Navigation Link on Page Load
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
});

/* ========================================
   Keyboard Navigation Support
   ======================================== */
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }

    // Alt + T toggles mobile menu (accessibility shortcut)
    if (e.altKey && e.key === 't') {
        menuToggle.click();
    }
});

/* ========================================
   Accessibility: Skip to Main Content Link
   ======================================== */
// This is handled via keyboard navigation (Tab key)
// Users can press Tab to navigate through interactive elements

/* ========================================
   Performance: Lazy Loading Support
   ======================================== */
// This enables lazy loading for images if needed
if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window) {
    const imageObserverOptions = {
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    }, imageObserverOptions);

    // You can use this by adding data-src instead of src to images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
