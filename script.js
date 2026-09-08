const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;

const loader = document.getElementById('loader');
window.addEventListener('load', () => window.setTimeout(() => loader.classList.add('loaded'), prefersReducedMotion ? 0 : 1500));

const header = document.getElementById('siteHeader');
const nav = document.getElementById('siteNav');
const menuToggle = document.getElementById('menuToggle');
const navLinks = [...document.querySelectorAll('.nav-link')];
menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const updateScrollState = () => {
    header.classList.toggle('scrolled', window.scrollY > 35);
    const current = sections.reduce((active, section) => window.scrollY >= section.offsetTop - 180 ? section.id : active, 'home');
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

document.querySelectorAll('.reveal-up').forEach(element => {
    if (prefersReducedMotion) { element.classList.add('visible'); return; }
    new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); }
    }), { threshold: 0.14 }).observe(element);
});

const stats = document.querySelectorAll('[data-count]');
const statsObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.count);
    const start = performance.now();
    const tick = now => {
        const progress = Math.min((now - start) / 900, 1);
        entry.target.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(tick);
        else entry.target.textContent = `${target}+`;
    };
    requestAnimationFrame(tick);
    statsObserver.unobserve(entry.target);
}), { threshold: .8 });
stats.forEach(stat => statsObserver.observe(stat));

if (!isTouch && !prefersReducedMotion) {
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let cursorX = 0; let cursorY = 0; let ringX = 0; let ringY = 0;
    window.addEventListener('mousemove', event => { cursorX = event.clientX; cursorY = event.clientY; cursorDot.style.left = `${cursorX}px`; cursorDot.style.top = `${cursorY}px`; });
    const animateCursor = () => { ringX += (cursorX - ringX) * .16; ringY += (cursorY - ringY) * .16; cursorRing.style.left = `${ringX}px`; cursorRing.style.top = `${ringY}px`; requestAnimationFrame(animateCursor); };
    animateCursor();
    document.querySelectorAll('a, button, .tilt-card, #neuralCanvas').forEach(element => {
        element.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        element.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });
}

if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', event => {
            const box = card.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width - .5;
            const y = (event.clientY - box.top) / box.height - .5;
            card.style.transform = `perspective(800px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

function createSpaceField() {
    const canvas = document.getElementById('spaceCanvas');
    const context = canvas.getContext('2d');
    const density = isTouch ? 38 : 85;
    const particles = [];
    const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    for (let index = 0; index < density; index += 1) particles.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.3 + .25, speed: Math.random() * .18 + .04, alpha: Math.random() * .45 + .1 });
    const draw = () => {
        context.clearRect(0, 0, innerWidth, innerHeight);
        particles.forEach(particle => { particle.y -= particle.speed; if (particle.y < -5) particle.y = innerHeight + 5; context.fillStyle = `rgba(115,231,219,${particle.alpha})`; context.beginPath(); context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2); context.fill(); });
        if (!prefersReducedMotion) requestAnimationFrame(draw);
    };
    draw();
}
createSpaceField();

function createNeuralField() {
    const canvas = document.getElementById('neuralCanvas');
    if (!window.THREE || !canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 1000);
    camera.position.z = 5.5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    const group = new THREE.Group(); scene.add(group);
    const nodes = [];
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x73e7db });
    const nodeGeometry = new THREE.SphereGeometry(.045, 8, 8);
    const nodeCount = isTouch ? 45 : 82;
    for (let index = 0; index < nodeCount; index += 1) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        const radius = 1.28 + (Math.random() - .5) * .22;
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
        group.add(node); nodes.push(node);
    }
    const linePositions = [];
    nodes.forEach((node, index) => nodes.slice(index + 1).forEach(other => { if (node.position.distanceTo(other.position) < .68) linePositions.push(node.position.x, node.position.y, node.position.z, other.position.x, other.position.y, other.position.z); }));
    const lineGeometry = new THREE.BufferGeometry(); lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x73e7db, transparent: true, opacity: .27 })); group.add(lines);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.55, 1), new THREE.MeshBasicMaterial({ color: 0x93b5ff, wireframe: true, transparent: true, opacity: .42 })); group.add(core);
    const resize = () => { const box = canvas.parentElement.getBoundingClientRect(); renderer.setSize(box.width, box.height, false); camera.aspect = box.width / box.height; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener('resize', resize);
    let targetX = 0; let targetY = 0;
    canvas.addEventListener('pointermove', event => { const box = canvas.getBoundingClientRect(); targetX = ((event.clientX - box.left) / box.width - .5) * .55; targetY = ((event.clientY - box.top) / box.height - .5) * .45; });
    canvas.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    const render = () => { group.rotation.y += .0028; group.rotation.x += (targetY - group.rotation.x) * .025; group.rotation.z += (targetX - group.rotation.z) * .025; core.rotation.x -= .004; core.rotation.y += .006; renderer.render(scene, camera); if (!prefersReducedMotion) requestAnimationFrame(render); };
    render();
}
createNeuralField();

const journey = document.querySelector('.journey-line');
const journeyProgress = document.querySelector('.journey-progress');
const journeyNodes = [...document.querySelectorAll('.journey-node')];
if (journey) {
    const journeyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        journeyNodes.forEach((node, index) => window.setTimeout(() => node.classList.add('active'), index * 180));
        journeyProgress.style.width = '100%';
    }), { threshold: .4 });
    journeyObserver.observe(journey);
}

const assistantPanel = document.getElementById('assistantPanel');
assistantPanel.classList.remove('open');
assistantPanel.setAttribute('aria-hidden', 'true');
document.getElementById('assistantTrigger').addEventListener('click', () => { assistantPanel.classList.toggle('open'); assistantPanel.setAttribute('aria-hidden', String(!assistantPanel.classList.contains('open'))); });
document.getElementById('assistantClose').addEventListener('click', () => assistantPanel.classList.remove('open'));
const responses = {
    'Who is Rushikesh?': 'Rushikesh is a third-year Computer Science Engineering student exploring AI, data and thoughtful software.',
    'What are his skills?': 'His toolkit includes Python, JavaScript, ML, Data Science, Generative AI, AWS, MongoDB, REST APIs and Spring Boot.',
    'Show me his projects.': 'Explore Village Hub, Smart Pulse Sensor and AI Chatbot in the selected work section.',
    'What is his career goal?': 'He is working toward becoming an AI Engineer who builds practical, human-centered intelligent systems.'
};
document.querySelectorAll('.assistant-prompts button').forEach(button => button.addEventListener('click', () => {
    const messages = document.getElementById('assistantMessages');
    const question = button.dataset.question;
    messages.insertAdjacentHTML('beforeend', `<p class="assistant-bubble user">${question}</p><p class="assistant-bubble">${responses[question]}</p>`);
    messages.scrollTop = messages.scrollHeight;
}));

const certificateModal = document.getElementById('certificateModal');
const certificateImage = document.getElementById('certificateModalImage');
const certificateTitle = document.getElementById('certificateModalTitle');
const certificateOrg = document.getElementById('certificateModalOrg');
const certificateClose = document.getElementById('certificateClose');
const certificateBackdrop = document.getElementById('certificateBackdrop');

const openCertificateModal = (card) => {
    const image = card.dataset.image || card.querySelector('img')?.src || '';
    const title = card.dataset.title || card.querySelector('h3')?.textContent || 'Certificate';
    const org = card.dataset.org || card.querySelector('small')?.textContent || 'Organization';

    certificateImage.src = image;
    certificateImage.alt = `${title} certificate`;
    certificateTitle.textContent = title;
    certificateOrg.textContent = org;
    certificateModal.classList.add('open');
    certificateModal.setAttribute('aria-hidden', 'false');
};

const closeCertificateModal = () => {
    certificateModal.classList.remove('open');
    certificateModal.setAttribute('aria-hidden', 'true');
};

document.querySelectorAll('.certificate-card').forEach(card => {
    card.addEventListener('click', () => openCertificateModal(card));
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCertificateModal(card);
        }
    });
});

certificateClose.addEventListener('click', closeCertificateModal);
certificateBackdrop.addEventListener('click', closeCertificateModal);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && certificateModal.classList.contains('open')) closeCertificateModal();
});

document.getElementById('contactForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById('formStatus');
    const submitButton = form.querySelector('button[type="submit"]');
    status.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/contact', {
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
        status.textContent = result.message;
        form.reset();
    } catch (error) {
        status.textContent = error.message || 'Unable to send your message. Please try again.';
    } finally {
        submitButton.disabled = false;
    }
});

document.querySelectorAll('.magnetic').forEach(element => {
    if (isTouch || prefersReducedMotion) return;
    element.addEventListener('mousemove', event => { const box = element.getBoundingClientRect(); element.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .12}px)`; });
    element.addEventListener('mouseleave', () => { element.style.transform = ''; });
});
