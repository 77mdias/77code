import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from '@studio-freight/lenis';

document.addEventListener('DOMContentLoaded', () => {


    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth ease
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false, // Keep native touch for mobile accessibility
        touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    // Completely forbids GSAP from refreshing on height changes (Keyboard popping up)
    ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });
    let isTransitioning = false;

    // ==========================================
    // SET INITIAL STATES FOR SCENE 5
    // ==========================================
    gsap.set("#scene-5", { clipPath: "inset(100% 0 0 0)", autoAlpha: 0 });
    gsap.set(".s5-bg-image", { scale: 1.1, opacity: 0 });
    gsap.set(".s5-bg-kanji", { scale: 0.9, opacity: 0 });
    gsap.set(".s5-hero-frame", { y: 100, opacity: 0 });
    gsap.set(".s5-img-main", { clipPath: "inset(100% 0 0 0)" });
    gsap.set(".s5-kanji-main span", { y: 30, opacity: 0 });
    gsap.set(".s5-kanji-sub, .s5-chapter-num, .s5-meta-card", { opacity: 0 });
    gsap.set(".sys-module", { x: -30, opacity: 0 });
    gsap.set(".s5-spine-right", { opacity: 0, x: 20 });
    gsap.set(".g-leaf", { opacity: 0, scale: 0.5 }); // Hide S5 leaves initially

    // Set up infinite ambient animations for S5 Leaves (Forced 3D for performance)
    gsap.to(".leaf-1", { y: "-=20", rotation: "+=15", duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, force3D: true });
    gsap.to(".leaf-2", { y: "+=15", rotation: "-=10", duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5, force3D: true });
    gsap.to(".leaf-3", { y: "-=25", rotation: "+=20", duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1, force3D: true });

    // Optimize Particle Leaf Creation with DocumentFragment
    const leafContainer = document.getElementById('leaf-container');
    const leafImages = ['/static/hero/Tez_leaves_V1.webp', '/static/hero/Tez_leaves_V2.webp', '/static/hero/Tez_leavesV3.webp', '/static/hero/Tez_leavesV4.webp'];
    const leafFragment = document.createDocumentFragment();

    // Dynamically reduce particles on mobile to save GPU memory
    const isMobile = window.innerWidth <= 768;
    const leafCount = isMobile ? 25 : 80;

    for(let i = 0; i < leafCount; i++) {
        let leaf = document.createElement('div');
        leaf.classList.add('t-leaf');
        leaf.style.backgroundImage = `url('${leafImages[Math.floor(Math.random() * leafImages.length)]}')`;
        gsap.set(leaf, { x: 3000, y: 3000, force3D: true }); // force3D is great here
        leafFragment.appendChild(leaf);
    }
    leafContainer.appendChild(leafFragment);

    // ==========================================
    // HIGH-PERFORMANCE PARALLAX SYSTEM
    // ==========================================
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const parallaxSetters = Array.from(parallaxLayers).map(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.1;
        return {
            depth: depth,
            setX: gsap.quickSetter(layer, "x", "px"),
            setY: gsap.quickSetter(layer, "y", "px"),
            setRotX: gsap.quickSetter(layer, "rotationX", "deg"),
            setRotY: gsap.quickSetter(layer, "rotationY", "deg")
        };
    });

    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;


    // Only run this heavy loop if the user has a fine pointer (a real mouse)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            if (isTransitioning) return;
            targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        }, { passive: true });

        // Execute DOM writes purely on animation frame
        gsap.ticker.add(() => {
            if (isTransitioning) return;

            currentMouseX += (targetMouseX - currentMouseX) * 0.08;
            currentMouseY += (targetMouseY - currentMouseY) * 0.08;

            for (let i = 0; i < parallaxSetters.length; i++) {
                const p = parallaxSetters[i];
                p.setX(currentMouseX * p.depth * -120);
                p.setY(currentMouseY * p.depth * -120);
                p.setRotX(currentMouseY * p.depth * 3);
                p.setRotY(currentMouseX * p.depth * -3);
            }
        });
    } else {
        // On mobile, explicitly reset all parallax layers to 0 so they don't get stuck
        for (let i = 0; i < parallaxSetters.length; i++) {
            const p = parallaxSetters[i];
            p.setX(0); p.setY(0); p.setRotX(0); p.setRotY(0);
        }
    }

   // ==========================================
    // INITIAL HERO STATES (Pre-Loader)
    // ==========================================

    // 1. BULLETPROOF SCROLL LOCK FUNCTIONS
    function preventScroll(e) { e.preventDefault(); }

    function lockScroll() {
        window.scrollTo(0, 0); // Force to top
        document.documentElement.classList.add('scroll-lock');
        // Actively block wheel and touch swipe events
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
    }

    function unlockScroll() {
        document.documentElement.classList.remove('scroll-lock');
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        ScrollTrigger.refresh(); // Recalculate GSAP triggers now that page can move
    }

    // The hero scene always covers the screen at 16:9, so on narrower screens its sides are cut off.
    // Nudge the name block back inside the visible area when that happens.
    function keepHeroTextInView() {
        const block = document.querySelector('.desktop-text');
        if (!block) return;
        block.style.marginLeft = '0px';
        if (window.innerWidth <= 768) return;
        const left = block.getBoundingClientRect().left;
        const safe = Math.max(24, window.innerWidth * 0.04);
        if (left < safe) block.style.marginLeft = (safe - left) + 'px';
    }
    keepHeroTextInView();
    window.addEventListener('resize', keepHeroTextInView, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(keepHeroTextInView);

    // The floating LAB button hides itself whenever it would sit on top of text or controls
    function startLabFabGuard(fab) {
        const avoid = ['.award-categories-block', '.ambience-toggle-btn', '.chat-input-area',
                       '.f-copyright', '.back-to-top', '.s5-architecture-flow', '.c-form-card'];
        const isShown = el => {
            if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
            const cs = getComputedStyle(el);
            return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05;
        };
        let frame = 0;
        gsap.ticker.add(() => {
            if (++frame % 8) return; // ~8 checks a second is plenty
            const f = fab.getBoundingClientRect();
            if (!f.width) return;
            const pad = 14;
            const covered = avoid.some(sel => [...document.querySelectorAll(sel)].some(el => {
                const r = el.getBoundingClientRect();
                return r.width && r.height &&
                    r.left < f.right + pad && r.right > f.left - pad &&
                    r.top < f.bottom + pad && r.bottom > f.top - pad && isShown(el);
            }));
            fab.classList.toggle('is-tucked', covered);
        });
    }

    // ACTIVATE LOCK IMMEDIATELY
    lockScroll();

    gsap.set('#real-blue-frame', { opacity: 0 });
    gsap.set('.back-leaves img, .character-wrapper img, .hero-front-leaf-img', { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 });
    gsap.set('.info-title span', { opacity: 0, y: 40 });
    gsap.set('.mobile-text', { opacity: 0 });
    gsap.set('.info-subtitle', { opacity: 0, y: 30 });
    gsap.set('.info-links a', { opacity: 0, y: 30 });
    gsap.set('.kanji-main span', { opacity: 0, y: 40 });
    gsap.set('.kanji-sub', { opacity: 0 });
    gsap.set('.hero-scroll-indicator', { opacity: 0 });

    function getTargetInset() {
        const ww = window.innerWidth;
        if (ww <= 768) return "inset(12.5% 5% 12.5% 5%)";
        if (ww <= 1024) return "inset(12% 7.5% 12% 7.5%)";
        return "inset(12% 15% 12% 10%)";
    }

    let progress = { value: 0 };
    const counterEl = document.getElementById('loader-counter');
    const loaderTl = gsap.timeline();

    loaderTl.to(progress, {
        value: 100, duration: 2.5, ease: "power2.inOut",
        onUpdate: () => { counterEl.innerHTML = Math.floor(progress.value) + "%"; }
    }, 0);
    loaderTl.to('#progress-bar', { width: "100%", duration: 2.5, ease: "power2.inOut" }, 0);
    loaderTl.to(".loader-content", { y: -30, opacity: 0, duration: 0.8, ease: "power3.inOut" }, "+=0.2");

    loaderTl.addLabel("reveal", "-=0.2");
    loaderTl.set('#real-blue-frame', { opacity: 1 }, "reveal");

    loaderTl.to('#loader-layer', { clipPath: getTargetInset(), duration: 2.5, ease: "power3.inOut" }, "reveal");

    loaderTl.to('.character-wrapper img', { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 2.2, ease: "power3.inOut" }, "reveal");
    loaderTl.to('.back-leaves img', { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 2.2, ease: "power3.inOut" }, "reveal+=0.4");
    loaderTl.to('.hero-front-leaf-img', { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 2.2, ease: "power3.inOut" }, "reveal+=0.6");

    loaderTl.to('.mobile-text', { opacity: 1, duration: 1.5, ease: "power3.out" }, "reveal+=0.5");
    loaderTl.to('.info-title span', { opacity: 1, y: 0, duration: 1.5, stagger: 0.15, ease: "power3.out" }, "reveal+=0.5");
    loaderTl.to('.info-subtitle', { opacity: 0.8, y: 0, duration: 1.5, ease: "power3.out" }, "reveal+=0.8");
    loaderTl.to('.info-links a', { opacity: 0.9, y: 0, duration: 1.5, stagger: 0.15, ease: "power3.out" }, "reveal+=1.0");
    loaderTl.to('.kanji-main span', { opacity: 1, y: 0, duration: 1.5, stagger: 0.15, ease: "power3.out" }, "reveal+=0.5");
    loaderTl.to('.kanji-sub', { opacity: 1, duration: 1.5, ease: "power3.out" }, "reveal+=0.8");
    loaderTl.to('.hero-scroll-indicator', { opacity: 1, duration: 1.5, ease: "power2.out" }, "reveal+=1.2");

    // 2. UNLOCK SCROLL ONLY WHEN EVERYTHING IS DONE
    loaderTl.add(() => {
        gsap.set('#loader-layer', { display: 'none' });

        // Initialize ScrollTriggers ONLY after the loader has settled the DOM
        initScrollAnimations();

        unlockScroll(); // Free the user to scroll!

        // Reveal the DIAS77 Lab button only once the loader is gone
        const labFab = document.querySelector('.lab-fab');
        if (labFab) {
            labFab.classList.add('is-ready');
            startLabFabGuard(labFab);
            // Touch screens have no hover: briefly show the label once so people know what it is
            if (window.matchMedia('(hover: none)').matches) {
                setTimeout(() => labFab.classList.add('is-open'), 600);
                setTimeout(() => labFab.classList.remove('is-open'), 3200);
            }
        }
    });


    let resizeTimer;
    let currentWindowWidth = window.innerWidth;

    window.addEventListener('resize', () => {
        // Only refresh ScrollTrigger if the screen WIDTH changes (e.g., rotating the phone)
        // We ignore height changes entirely so the virtual keyboard doesn't break the site.
        if (Math.abs(window.innerWidth - currentWindowWidth) > 10) {
            currentWindowWidth = window.innerWidth;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        }
    });

    // =========================================================
    // --- ADVANCED CINEMATIC CURSOR & FLUID TRAIL ---
    // =========================================================
    const cursor = document.querySelector('.k-cursor');
    if (cursor) {
        let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let rendered = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let isHoveringMagnetic = false;
        let isDarkZone = false;
        let trailColorTarget = 0;
        let trailColorRendered = 0;

        const cursorSetX = gsap.quickSetter(cursor, "x", "px");
        const cursorSetY = gsap.quickSetter(cursor, "y", "px");

        window.addEventListener('mousemove', (e) => {
            if(!isHoveringMagnetic) { target.x = e.clientX; target.y = e.clientY; }
        }, { passive: true });

        const magneticElements = document.querySelectorAll('.submit-btn, .ambience-toggle-btn, .modal-close');
        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const distanceX = e.clientX - (rect.left + rect.width / 2);
                const distanceY = e.clientY - (rect.top + rect.height / 2);

                gsap.to(btn, { x: distanceX * 0.3, y: distanceY * 0.3, duration: 0.4, ease: "power2.out" });
                target.x = (rect.left + rect.width / 2) + (distanceX * 0.1);
                target.y = (rect.top + rect.height / 2) + (distanceY * 0.1);
            }, { passive: true });
            btn.addEventListener('mouseenter', () => { isHoveringMagnetic = true; cursor.classList.add('is-active'); }, { passive: true });
            btn.addEventListener('mouseleave', (e) => {
                isHoveringMagnetic = false; cursor.classList.remove('is-active');
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
                target.x = e.clientX; target.y = e.clientY;
            }, { passive: true });
        });

        // Elements can vanish under the pointer (e.g. the popup's CLOSE button), so their mouseleave never fires.
        // This resets every hover state so the cursor can't stay frozen or enlarged.
        window.addEventListener('cursor:reset', () => {
            isHoveringMagnetic = false;
            isDarkZone = false;
            cursor.classList.remove('is-active', 'is-white');
            magneticElements.forEach(btn => gsap.set(btn, { x: 0, y: 0 }));
        });

        const hoverElements = document.querySelectorAll('a, .s5-hero-frame, .g-card-wrapper');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('is-active'), { passive: true });
            el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'), { passive: true });
        });

        const darkZones = document.querySelectorAll('.interactive-showcase, .monolith, .submit-btn, .g-card-wrapper, .c-blue-frame, .s5-hero-frame');
        darkZones.forEach(zone => {
            zone.addEventListener('mouseenter', () => { isDarkZone = true; cursor.classList.add('is-white'); }, { passive: true });
            zone.addEventListener('mouseleave', () => { isDarkZone = false; cursor.classList.remove('is-white'); }, { passive: true });
        });

        const canvas = document.getElementById('cursor-trail');
        const ctx = canvas.getContext('2d', { alpha: true }); // optimize context
        let width, height;
        const points = [];
        const numPoints = 20;

        function initCanvas() {
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = width; canvas.height = height;
            if(points.length === 0) { for(let i=0; i<numPoints; i++) points.push({ x: width/2, y: height/2 }); }
        }
        initCanvas();
        window.addEventListener('resize', initCanvas, { passive: true });

        function lerp(start, end, factor) { return start + (end - start) * factor; }

        function animateTrail() {
            ctx.clearRect(0, 0, width, height);

            rendered.x = lerp(rendered.x, target.x, 0.35);
            rendered.y = lerp(rendered.y, target.y, 0.35);

            cursorSetX(rendered.x);
            cursorSetY(rendered.y);

            points[0].x = rendered.x; points[0].y = rendered.y;

            for (let i = 1; i < numPoints; i++) {
                points[i].x = lerp(points[i].x, points[i-1].x, 0.55);
                points[i].y = lerp(points[i].y, points[i-1].y, 0.55);
            }

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < numPoints - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.lineTo(points[numPoints - 1].x, points[numPoints - 1].y);

            trailColorTarget = isDarkZone ? 255 : 0;
            trailColorRendered = lerp(trailColorRendered, trailColorTarget, 0.1);
            const rgbVal = Math.round(trailColorRendered);

            ctx.strokeStyle = `rgba(${rgbVal}, ${rgbVal}, ${rgbVal}, 0.8)`;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            requestAnimationFrame(animateTrail);
        }
        animateTrail();

        document.addEventListener('mouseleave', () => { gsap.to([cursor, canvas], { opacity: 0, duration: 0.3 }); }, { passive: true });
        document.addEventListener('mouseenter', () => { gsap.to([cursor, canvas], { opacity: 1, duration: 0.3 }); }, { passive: true });
    }

    const frameCount = 40;
    const charImg = document.getElementById("character-sequence");
    const images = [];
    const currentFrame = { frame: 1 };

    // Preload with async decoding to unblock UI thread
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `/static/frames2/Image${i}.webp`;
        images.push(img);
    }

    function initScrollAnimations() {
        // ==========================================
        // 1. SCENE 1 TO SCENE 2 (MASTER HERO TIMELINE)
        // ==========================================
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".viewport-wrapper", start: "top top", end: "+=5000", pin: true, scrub: 1,
                anticipatePin: 1, // Smooths pinning mechanics
                onUpdate: (self) => isTransitioning = (self.progress > 0.35 && self.progress < 0.6)
            }
        });

        masterTl.to(currentFrame, { frame: frameCount, snap: "frame", ease: "none", duration: 4, onUpdate: () => { if(images[currentFrame.frame - 1]?.naturalWidth) charImg.src = images[currentFrame.frame - 1].src; } }).to({}, { duration: 0.5 });

        const gustStart = "windGust";

        masterTl.to(".hero-scroll-indicator", { opacity: 0, y: 20, duration: 0.5, ease: "power2.out" }, 0);
        masterTl.set(".t-leaf", { x: () => window.innerWidth + gsap.utils.random(500,2000), y: () => gsap.utils.random(-window.innerHeight*0.5, window.innerHeight*1.5), rotation: () => gsap.utils.random(-180, 180), scale: () => gsap.utils.random(1.5, 5) }, gustStart);
        masterTl.to("#scene", {scale: 0.98,filter: isMobile ? "none" : "blur(30px)",opacity: 0,duration: 3,ease: "power2.in" }, gustStart);
        masterTl.to([".blue-frame-wrapper", ".character-wrapper"], { x: "-=400", opacity: 0, duration: 2.5, ease: "power2.in" }, gustStart);
        masterTl.to(".hero-front-leaf-img", { x: () => -window.innerWidth - 1500, y: () => gsap.utils.random(-500, 500), rotation: -240, scale: 4, duration: 3.5, ease: "power1.inOut" }, gustStart);
        masterTl.to(".t-leaf", { x: () => -window.innerWidth - gsap.utils.random(1500, 3500), y: () => gsap.utils.random(-window.innerHeight*0.5, window.innerHeight*1.5), rotation: () => "+=" + gsap.utils.random(360, 720), scale: () => gsap.utils.random(5, 12), duration: 5, stagger: { amount: 1.5, from: "random" }, ease: "power1.inOut" }, gustStart);

        const transitionApex = gustStart + "+=2";
        masterTl.to(".whiteout-screen", { autoAlpha: 1, duration: 1, ease: "power2.inOut" }, transitionApex);
        masterTl.set("#award-scene", { autoAlpha: 1, pointerEvents: "auto" }, transitionApex + "+=1");
        masterTl.fromTo(".award-bg-img", { scale: 1.1, opacity: 0 }, { scale: 1.05, opacity: 0.85, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-img img", { scale: 1.2, opacity: 0 }, { scale: 1.05, opacity: 1, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-backdrop", { x: -50, opacity: 0 }, { x: 0, opacity: 0.15, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-kanji", { x: -60, opacity: 0, scale: 0.9 }, { x: 0, opacity: 1, scale: 1, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-cursive", { opacity: 0, rotation: -20, scale: 0.5 }, { opacity: 1, rotation: -8, scale: 1, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-top", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.1 }, transitionApex + "+=1");
        masterTl.fromTo(".award-anim-bottom", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.1 }, transitionApex + "+=1");

        masterTl.to(".whiteout-screen", { autoAlpha: 0, duration: 1.5, ease: "power2.inOut" }, transitionApex + "+=1.2");
        masterTl.to(".award-bg-img", { scale: 1, opacity: 0.85, duration: 3, ease: "power2.out" }, transitionApex + "+=1.2");
        masterTl.to(".award-anim-img img", { scale: 1.05, opacity: 1, duration: 2.5, ease: "power3.out" }, transitionApex + "+=1.2");
        masterTl.to(".award-anim-backdrop", { x: 0, opacity: 0.15, duration: 2, ease: "power3.out" }, transitionApex + "+=1.3");
        masterTl.to(".award-anim-top", { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, transitionApex + "+=1.4");
        masterTl.to(".award-anim-bottom", { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, transitionApex + "+=1.5");
        masterTl.to(".award-anim-kanji", { x: 0, opacity: 1, scale: 1, duration: 2, stagger: 0.2, ease: "back.out(1.2)" }, transitionApex + "+=1.6");
        masterTl.to(".award-anim-cursive", { opacity: 1, rotation: -8, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.7)" }, transitionApex + "+=2.2");
        masterTl.to({}, { duration: 2 });

        // ==========================================
        // 2. SCENE 3 (GALLERY TIMELINE)
        // ==========================================
        const gallerySection = document.querySelector('.gallery-section');
        const galleryWrapper = document.querySelector('.gallery-scroll-wrapper');
        const gItems = document.querySelectorAll('.g-item');
        const clampWobble = gsap.utils.clamp(-8, 8);
        let wobbleTimeout;

        gsap.set([".gallery-back-wall", ".gallery-bg-text", ".gallery-front-leaves", ".gallery-scroll-wrapper"], { autoAlpha: 0 });
        gsap.set(gItems, { y: 80, opacity: 0, rotationZ: (i) => i % 2 === 0 ? 5 : -5 });

        const galleryTl = gsap.timeline({
            scrollTrigger: {
                trigger: gallerySection, start: "top top", end: () => "+=" + (galleryWrapper.scrollWidth + 3000),
                pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
                onUpdate: (self) => {
                    if (self.progress > 0.35) {
                        let vel = self.getVelocity();
                        gsap.to(gItems, { rotationZ: clampWobble(-vel / 300), duration: 0.5, ease: "power1.out", overwrite: "auto" });
                        clearTimeout(wobbleTimeout);
                        wobbleTimeout = setTimeout(() => gsap.to(gItems, { rotationZ: 0, duration: 2.5, ease: "elastic.out(1.2, 0.3)", overwrite: "auto" }), 50);
                    }
                }
            }
        });

        galleryTl.to(".interlude-line", { height: "12vh", duration: 1, ease: "power2.out" })
                 .to(".interlude-kanji", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
                 .to(".interlude-eng", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
                 .to({}, { duration: 1.5 })
                 .to(".interlude-kanji", { opacity: 0, y: -20, letterSpacing: "1vw", filter: "blur(5px)", duration: 1, ease: "power2.in" }, "fadeOut")
                 .to(".interlude-eng", { opacity: 0, y: -20, letterSpacing: "1vw", filter: "blur(5px)", duration: 1, ease: "power2.in" }, "fadeOut")
                 .to(".interlude-line", { height: "0vh", opacity: 0, duration: 0.8, ease: "power2.inOut" }, "fadeOut")
                 .to([".gallery-back-wall", ".gallery-bg-text", ".gallery-front-leaves", ".gallery-scroll-wrapper"], { autoAlpha: 1, duration: 1.5, ease: "power2.inOut" }, "-=0.5")
                 .to(gItems, { y: 0, opacity: 1, rotationZ: 0, duration: 2, stagger: 0.2, ease: "back.out(1.2)" }, "-=1")
                 .to(galleryWrapper, { x: () => -(galleryWrapper.scrollWidth - window.innerWidth), duration: 12, ease: "none" });

        // ==========================================
        // 3. SCENE 4, 5, AND 6 MASTER TRANSITION
        // ==========================================
        gsap.fromTo(".monolith", { height: "0vh" }, {
            height: "100vh", ease: "power2.inOut",
            scrollTrigger: { trigger: "#monolith-trigger", start: "top 85%", end: "top top", scrub: 1 }
        });

        const tlMonolith = gsap.timeline({
            scrollTrigger: { trigger: "#monolith-trigger", start: "top top", end: "+=10000", pin: true, scrub: 1, anticipatePin: 1 }
        });

        tlMonolith.to(".monolith", { width: "22vw", duration: 1.5, ease: "power4.inOut" })
                  .to(".pillar-text", { opacity: 1, duration: 0.5 }, "-=0.5")
                  .to(".outer-text-left", { opacity: 1, x: 20, duration: 1, ease: "power2.out" }, "-=1")
                  .to(".outer-text-right", { opacity: 1, x: -20, duration: 1, ease: "power2.out" }, "-=1")
                  .to({}, { duration: 1.5 })
                  .to([".pillar-text", ".outer-text-left", ".outer-text-right"], { opacity: 0, duration: 0.5, ease: "power2.in" })
                  .to(".monolith", { width: "100vw", duration: 1.5, ease: "expo.inOut" })

                  // ENTER SCENE 4 (Kiko AI)
                  .to(".interactive-showcase", {
                        autoAlpha: 1,
                        pointerEvents: "auto",
                        duration: 0.1,
                        onStart: () => {
                            isInSection4 = true;
                            playAmbience();
                        },
                        onReverseComplete: () => {
                            isInSection4 = false;
                            stopAmbience();
                        }
                    })
                  .fromTo(".showcase-video-layer video", { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }, "<")
                  .fromTo(".showcase-foreground-wrapper", { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" }, "-=2")
                  .fromTo(".cinematic-ui-wrapper", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1.5, ease: "power2.out" }, "-=1.5")

                  // Buffer for chatting with AI
                  .to({}, { duration: 3.5 })

                  // TRANSITION TO SCENE 5 (Architecture)
                   .to(".interactive-showcase", {
                      scale: 0.9,
                      filter: "blur(15px)",
                      opacity: 0.2,
                      duration: 2,
                      onStart: () => {
                          isInSection4 = false;
                          stopAmbience();
                      },
                      onReverseComplete: () => {
                          isInSection4 = true;
                          playAmbience();
                      }
                  })
                  .to("#scene-5", {
                      clipPath: "inset(0% 0 0 0)",
                      duration: 2,
                      ease: "power2.inOut",
                      onStart: () => { gsap.set("#scene-5", { autoAlpha: 1 }); }
                  }, "<")
                  .to(".s5-bg-image", { opacity: 1, scale: 1, duration: 1.5 }, "-=0.8")
                  .to(".s5-bg-kanji", { opacity: 1, scale: 1, duration: 1.5 }, "-=1.5")
                  .to(".s5-hero-frame", { opacity: 1, y: 0, duration: 1 }, "-=1.2")
                  .to(".s5-img-main", { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power3.inOut" }, "-=0.8")
                  .to(".s5-kanji-main span", { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 }, "-=0.5")
                  .to(".s5-kanji-sub, .s5-chapter-num, .s5-meta-card", { opacity: 1, duration: 0.5 }, "-=0.2")
                  .to(".g-leaf", { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: "back.out(1.5)" }, "-=1.5")
                  .to(".sys-module", { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }, "-=1")
                  .to(".s5-spine-right", { opacity: 1, x: 0, duration: 1, ease: "power2.out" }, "-=0.8")

                  // Buffer to read Scene 5
                  .to({}, { duration: 3 })

                  // TRANSITION TO SCENE 6 (Contact)
                  .to(".s5-hero-frame", { y: -50, scale: 0.95, opacity: 0, duration: 1, ease: "power2.inOut" })
                  .to(".sys-module", { x: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power2.inOut" }, "<")
                  .to(".s5-bg-kanji, .s5-spine-right, .g-leaf", { opacity: 0, duration: 0.8 }, "<")
                  .to(".s5-bg-image", { scale: 1.05, filter: window.innerWidth <= 768 ? "none" : "blur(15px)", duration: 2 }, "<")

                  .to("#contact", { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power3.inOut" }, "<0.6")

                  .from(".c-blue-frame", { scale: 0.9, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.8")
                  .from(".c-form-card", { y: 60, x: -30, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.6")
                  .from(".c-hero-kanji span", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "-=0.8")
                  .from(".c-vert-accent", { opacity: 0, y: -20, duration: 0.8 }, "-=0.6")

                  .to({}, { duration: 2 });
    }



    const hoverSfx = new Audio('/static/sound/hover.mp3');
    const clickSfx = new Audio('/static/sound/click.mp3');

    // Keep them very quiet! Subtlety is key for luxury design.
    hoverSfx.volume = 0.05;
    clickSfx.volume = 0.15;

    // Helper function to detect mobile screens
    const isMobileScreen = () => window.matchMedia('(max-width: 768px)').matches;

    // Select everything that feels "interactive"
    const interactiveElements = document.querySelectorAll('a, button, .submit-btn, .ambience-toggle-btn, .modal-close, .g-card-wrapper, .s5-hero-frame, .chat-send-btn, .back-to-top');

    interactiveElements.forEach(el => {
        // Play subtle tick on hover
        el.addEventListener('mouseenter', () => {
            if (isMobileScreen()) return; // Skip playing sound on mobile

            hoverSfx.currentTime = 0; // Rewind to start so rapid hovers work
            // The .catch() hides errors if the browser blocks audio before the user's first click
            hoverSfx.play().catch(() => {});
        });

        // Play soft click on tap/click
        el.addEventListener('click', () => {
            if (isMobileScreen()) return; // Skip playing sound on mobile

            clickSfx.currentTime = 0;
            clickSfx.play().catch(() => {});
        });
    });

    // =========================================================
    // --- 7. INTERACTIVE KIKO AI CHAT & AUDIO ANIMATION LOGIC ---
    // =========================================================
    let currentExpression = 'longidle';
    let isAnimatingExpression = false;

    const kikoVoice = new Audio();

    kikoVoice.addEventListener('play', () => {
        setExpression('explain');
    });

    kikoVoice.addEventListener('ended', () => {
        setExpression('longidle');
    });

    kikoVoice.addEventListener('error', (e) => {
        console.error("Audio failed to decode or play:", e);
    });

    function setExpression(newExpr) {
        if (currentExpression === newExpr) return;
        const oldImg = document.getElementById(`exp-${currentExpression}`);
        const newImg = document.getElementById(`exp-${newExpr}`);

        if (!newImg) {
            if (newExpr !== 'longidle') setExpression('longidle');
            return;
        }

        currentExpression = newExpr;
        if(oldImg) gsap.killTweensOf(oldImg);
        gsap.killTweensOf(newImg);

        gsap.set(newImg, { zIndex: 3, autoAlpha: 0 });
        if (oldImg) gsap.set(oldImg, { zIndex: 2, autoAlpha: 1 });

        gsap.to(newImg, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                if (oldImg) {
                    gsap.set(oldImg, { autoAlpha: 0, zIndex: 1 });
                    oldImg.classList.remove('active');
                }
                newImg.classList.add('active');
            }
        });
    }

    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

  // --- MOBILE KEYBOARD GSAP FIX ---
    // Select all inputs across the entire page (Kiko Chat AND Contact Form)
    const allInputs = document.querySelectorAll('input, textarea');

    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                // Adds the CSS class to teleport the input to the top of the screen
                document.body.classList.add('mobile-input-focus');

                // Stop smooth scrolling from fighting the layout
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        });

        // Replace your blur listener with this updated one
        input.addEventListener('blur', () => {
            if (window.innerWidth <= 768) {
                // INCREASING THIS TIMEOUT TO 400ms!
                // This ensures the "Send" or "Transmit" button has enough time to register the click
                // before the box teleports away.
                setTimeout(() => {
                    if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
                        document.body.classList.remove('mobile-input-focus');
                        if (typeof lenis !== 'undefined') lenis.start();
                    }
                }, 400);
            }
        });
    });

    function appendMessage(text, sender, id = null) {
        const block = document.createElement('div');
        block.className = `chat-block block-${sender}`;
        if (id) block.id = id;

        const nameLabel = document.createElement('div');
        nameLabel.className = 'msg-name';
        nameLabel.textContent = sender === 'bot' ? 'KIKO' : 'GUEST';

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg msg-${sender}`;

        if (text === "typing") {
            msgDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            msgDiv.textContent = text;
        }

        block.appendChild(nameLabel);
        block.appendChild(msgDiv);
        chatMessages.appendChild(block);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function fallbackTimeBasedTalking(replyText) {
        setExpression('explain');
        const talkTimeMs = Math.max(2500, Math.min(replyText.length * 50, 7000));
        setTimeout(() => setExpression('longidle'), talkTimeMs);
    }

    // Chat bloqueado até existir o backend próprio (API do Claude): nada sai do navegador.
    // Para ligar, troque para true e aponte o fetch abaixo para o endpoint novo.
    const CHAT_ENABLED = false;
    const CHAT_OFFLINE_REPLY = "I'm still being set up! Soon you'll be able to ask me anything about DIAS77 and the projects here. For now, reach out through the contact section below.";

    let chatRequestInFlight = false;
    async function processUserMessage() {
        if (!CHAT_ENABLED) {
            const text = chatInput.value.trim();
            if (!text) return;
            appendMessage(text, 'user');
            chatInput.value = '';
            appendMessage(CHAT_OFFLINE_REPLY, 'bot');
            setExpression('kind');
            setTimeout(() => setExpression('longidle'), 3500);
            return;
        }
        const text = chatInput.value.trim();
        if (!text || chatRequestInFlight) return;
        if (text.length > 1200) {
            appendMessage('Please keep your message under 1,200 characters.', 'bot');
            return;
        }
        chatRequestInFlight = true;

        appendMessage(text, 'user');
        chatInput.value = '';

        const typingId = 'typing-' + Date.now();
        appendMessage("typing", "bot", typingId);
        setExpression('thinking');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error(`Chat API returned ${response.status}`);
            const data = await response.json();

            document.getElementById(typingId)?.remove();
            appendMessage(data.reply, 'bot');

            const targetContextExpr = data.expression || 'warm';
            setExpression(targetContextExpr);

            if (data.audio_base64 && data.audio_base64.length > 50) {
                kikoVoice.pause();
                kikoVoice.removeAttribute('src');
                kikoVoice.load();
                kikoVoice.src = "data:audio/mpeg;base64," + data.audio_base64;

                kikoVoice.oncanplaythrough = () => {
                    kikoVoice.oncanplaythrough = null;
                    setTimeout(() => {
                        kikoVoice.play().catch(e => {
                            console.warn("Autoplay blocked. Using fallback timer.", e);
                            fallbackTimeBasedTalking(data.reply);
                        });
                    }, 400);
                };

                setTimeout(() => {
                    if (currentExpression === targetContextExpr && !kikoVoice.paused === false) {
                        fallbackTimeBasedTalking(data.reply);
                    }
                }, 4000);
            } else {
                setTimeout(() => { fallbackTimeBasedTalking(data.reply); }, 800);
            }

        } catch (error) {
            console.error('Kiko chat failed:', error);
            document.getElementById(typingId)?.remove();
            appendMessage("I'm sorry, I'm having trouble connecting to my neural network right now.", 'bot');
            setExpression('shock');
            setTimeout(() => setExpression('longidle'), 2500);
        } finally {
            chatRequestInFlight = false;
        }
    }

    chatSendBtn.addEventListener('click', processUserMessage);
    chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') processUserMessage(); });
    // Instantly fires on mobile touch, bypassing the click delay entirely
    chatSendBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevents the 'click' event from firing twice
        processUserMessage();
        chatInput.blur(); // Manually forces the mobile keyboard to close so you can see Kiko's reaction!
    }, { passive: false });

    // -- AMBIENCE TOGGLE LOGIC --
    const ambienceBtn = document.getElementById('ambience-btn');
    let isAmbienceMuted = false;
    let isInSection4 = false;

    let audioCtx;
    let gainNode;
    let sourceNode;
    let audioBuffer = null;
    let isPlaying = false;

    async function loadSeamlessAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(audioCtx.destination);

        try {
            const response = await fetch('/static/rain.m4a');
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        } catch(e) {
            console.error("Error loading ambience audio:", e);
        }
    }
    loadSeamlessAudio();

    function playAmbience() {
        if (isAmbienceMuted || !isInSection4 || !audioBuffer) return;

        // If not, silently abort to prevent the AudioContext console warning.
        if (typeof navigator.userActivation !== 'undefined' && !navigator.userActivation.hasBeenActive) {
            isAmbienceMuted = true;
            ambienceBtn.classList.add('muted');
            return;
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {
                isAmbienceMuted = true;
                ambienceBtn.classList.add('muted');
                return;
            });
        }
        if (!isPlaying) {
            sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.loop = true;
            sourceNode.connect(gainNode);
            sourceNode.start(0);
            isPlaying = true;
        }
        gsap.killTweensOf(gainNode.gain);
        gsap.to(gainNode.gain, { value: 0.2, duration: 1.5, ease: "power2.inOut" });
        ambienceBtn.classList.remove('muted');
    }

    function stopAmbience() {
        ambienceBtn.classList.add('muted');
        if (!gainNode) return;
        gsap.killTweensOf(gainNode.gain);
        gsap.to(gainNode.gain, {
            value: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                if (sourceNode && isPlaying) {
                    sourceNode.stop();
                    sourceNode.disconnect();
                    isPlaying = false;
                }
            }
        });
    }

    ambienceBtn.addEventListener('click', () => {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        isAmbienceMuted = !isAmbienceMuted;
        if (isAmbienceMuted) {
            stopAmbience();
        } else {
            if (isInSection4) {
                playAmbience();
            } else {
                ambienceBtn.classList.remove('muted');
            }
        }
    });


    // ==========================================
    // FOOTER REVEAL LOGIC & FORM SUBMISSION
    // ==========================================
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const btnText = document.querySelector('.submit-btn span');
        const originalText = btnText.textContent;
        btnText.textContent = "TRANSMITTING...";

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: "32ed7635-a0ab-4135-b458-17153735f046", // <--- PASTE YOUR KEY HERE
                name: document.getElementById('c-name').value,
                email: document.getElementById('c-email').value,
                message: document.getElementById('c-msg').value
            })
        })
        .then(response => response.json())
        .then(data => {
            btnText.textContent = "TRANSMITTED";
            this.reset(); // Clear the form
            setTimeout(() => { btnText.textContent = originalText; }, 3000);
        })
        .catch(error => {
            btnText.textContent = "ERROR";
            setTimeout(() => { btnText.textContent = originalText; }, 3000);
        });
    });


    // =========================================================
    // --- EDITORIAL PROJECT MODAL LOGIC ---
    // =========================================================
    const projectData = [
        {
            title: "CRIPTENV",
            chapter: "序章 / Prologue",
            core: "An open source, zero-knowledge vault for team passwords and API keys: secrets are encrypted on the computer before anything reaches the server.",
            role: "Solo Developer — Product, Backend, Frontend & Infra",
            timeline: "My product — In production",
            link: "https://criptenv.77mdevseven.tech",
            overview: "CriptEnv is an open source alternative to Doppler and Infisical for managing .env files and API keys. Every secret is encrypted on the device with AES-256-GCM before it leaves, and the vault password is created on the client and never sent to the API, so the server only stores encrypted blobs. It is CLI-first, with a web dashboard and support for CI pipelines, and runs on my own VPS behind Cloudflare.",
            heroImg: "/static/projects/criptenv.jpg",
            gallery: [
                "/static/projects/criptenv-mobile.jpg"
            ],
            details: [
                "Client-side AES-256-GCM encryption: the server never sees a secret in plain text",
                "Vault password generated on the client and never sent to the API",
                "CLI-first workflow (login, projects, set, pull) plus a web dashboard and CI usage",
                "Blob versioning to avoid conflicts, audit trail and team invitations",
                "Self-hosted on a VPS behind Cloudflare, with HSTS, CSP and frame protection headers",
                "Released under the MIT license"
            ],
            stack: "Python, FastAPI, Next.js, TypeScript, PostgreSQL, Docker, Cloudflare"
        },
        {
            title: "ATELIESYS",
            chapter: "第一章 / Chapter One",
            core: "Online booking for beauty studios: clients request a slot through a link, the studio confirms on WhatsApp and sees the whole day on one screen.",
            role: "Solo Developer — Product, Backend, Frontend & Infra",
            timeline: "My product — In production",
            link: "https://ateliesys.tech",
            overview: "AtelieSys is a multi-tenant SaaS for beauty studios (nails, brows, lashes and hair). Each studio gets its own booking link; clients pick a service and a time, and the studio confirms on WhatsApp. On top of the agenda it has teams, a WhatsApp assistant that answers clients, deposits paid by Pix and monthly or yearly plans. It runs on my own VPS, with CI and deploy on a self-hosted runner and a synthetic test every 15 minutes.",
            heroImg: "/static/projects/ateliesys.jpg",
            gallery: [
                "/static/projects/ateliesys-mobile.jpg"
            ],
            details: [
                "Multi-tenant studios, each with its own booking link and subdomain",
                "WhatsApp integration through the official Cloud API, with an assistant that answers and books for the studio",
                "Subscriptions with Stripe Billing and booking deposits paid by Pix through Stripe Connect",
                "Team members, optional two-factor authentication and an admin area",
                "Self-hosted on a VPS, with CI and deploy on my own GitHub Actions runner",
                "Synthetic monitoring that runs the main flow every 15 minutes in production"
            ],
            stack: "Next.js 16, TypeScript, PostgreSQL, Stripe, WhatsApp Cloud API, OpenAI, Docker"
        },
        {
            title: "LENE STUDIO BEAUTY",
            chapter: "第二章 / Chapter Two",
            core: "A hair salon's website in Presidente Prudente, with a gallery, before and after photos and booking on WhatsApp.",
            role: "Developer & Designer — Client project",
            timeline: "Client — Live",
            link: "https://lenestudiobeauty.vercel.app/",
            overview: "A fast website for a real local business, built to work well on a phone with one button straight to the chat. It presents the services with their duration, a before and after slider, a gallery, the owner's story, reviews sent through WhatsApp, opening hours and a map route to the salon.",
            heroImg: "/static/projects/lenestudiobeauty.jpg",
            gallery: [
                "/static/projects/lenestudiobeauty-servicos.jpg",
                "/static/projects/lenestudiobeauty-mobile.jpg"
            ],
            details: [
                "Mobile-first landing page with a WhatsApp call to action and a floating chat button",
                "Services with duration, before and after slider and photo gallery",
                "Reviews collected on WhatsApp and published with the owner's approval",
                "Opening hours and address with a Google Maps route",
                "Security headers (HSTS with preload, CSP, frame protection) and a CI/CD pipeline"
            ],
            stack: "Next.js 16, Tailwind CSS 4, Vercel"
        },
        {
            title: "RANGE77",
            chapter: "第三章 / Chapter Three",
            core: "Valorant stats with an AI coach that only gets a summary of the metrics, so it answers precisely and costs little.",
            role: "Solo Developer — Prototype",
            timeline: "Prototype — In development",
            link: "https://range77.vercel.app",
            overview: "RANGE77 turns match data in Riot's official format into derived metrics such as KAST, ADR, ACS, first bloods and round economy. Instead of sending raw data to the language model, it builds a three-layer contract: exact numbers, a rating by range and pre-computed coaching hooks. The model spends fewer tokens and cannot invent data. Data is simulated while the production API key from Riot is pending.",
            heroImg: "/static/projects/range77.jpg",
            gallery: [
                "/static/projects/range77-mobile.jpg"
            ],
            details: [
                "Derived metrics (KAST, ADR, ACS, first blood, round economy) from the VAL-MATCH-V1 format",
                "Three-layer AI contract: raw metrics, contextual rating and coaching hooks",
                "The model only receives the computed summary: fewer tokens and no fabricated data",
                "End-to-end demo profile with match history and a diagnosis",
                "Tested with Vitest; development in Docker with no .env files on disk"
            ],
            stack: "Next.js, TypeScript, Vitest, Docker, Vercel, LLM API"
        }
    ];

    // =========================================================
    // --- EDITORIAL PROJECT POPUP: content, motion, navigation ---
    // =========================================================
    const ACCENTS = ['#4A81C2', '#5E6E9C', '#3B6CB0', '#B5523B', '#8A6A3E', '#56688A'];

    const cardsWrapper = document.querySelectorAll('.g-card-wrapper');
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalContainer = modal.querySelector('.pm-wrap');

    const elIndex = document.getElementById('m-index');
    const elTitle = document.getElementById('m-title');
    const elChapter = document.getElementById('m-chapter');
    const elKanji = document.getElementById('m-kanji');
    const elLink = document.getElementById('m-link');
    const elHero = document.getElementById('m-hero');
    const elHeroImg = document.getElementById('m-hero-img');
    const elCore = document.getElementById('m-core');
    const elRole = document.getElementById('m-role');
    const elTimeline = document.getElementById('m-timeline');
    const elStack = document.getElementById('m-stack');
    const elLead = document.getElementById('m-lead');
    const elOverview = document.getElementById('m-overview');
    const elDetails = document.getElementById('m-details-list');
    const elGallery = document.getElementById('m-gallery');
    const elNext = document.getElementById('m-next');
    const elNextTitle = document.getElementById('m-next-title');
    const elNextKanji = document.getElementById('m-next-kanji');
    const elNextImg = document.getElementById('m-next-img');
    const elProgress = document.getElementById('m-progress');

    let modalOpen = false;
    let modalTl = null;
    let activeCard = null;
    let currentIndex = 0;
    let switching = false;
    let savedOverflow = '';
    let flyEl = null;

    const pad = n => String(n).padStart(2, '0');
    const cardFor = i => document.querySelector(`.g-card-wrapper[data-index="${i}"]`);
    const kanjiFor = i => { const c = cardFor(i); const k = c && c.querySelector('.label-main'); return k ? k.textContent.trim() : ''; };
    const thumbFor = i => { const c = cardFor(i); const im = c && c.querySelector('.g-card-inner img'); return im ? (im.currentSrc || im.src) : ''; };

    // Clip-path that frames the given card on screen (the popup grows out of it and shrinks back into it)
    function cardClip(card) {
        const r = card && card.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        if (!r || r.width === 0 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) {
            return "inset(42% 42% 42% 42% round 8px)"; // card off-screen: small centred frame
        }
        const t = Math.max(0, r.top), l = Math.max(0, r.left);
        const b = Math.max(0, vh - r.bottom), rt = Math.max(0, vw - r.right);
        return `inset(${t}px ${rt}px ${b}px ${l}px round 6px)`;
    }

    // Title split into masked letters so each one can rise into place
    function setTitle(text) {
        elTitle.setAttribute('aria-label', text);
        elTitle.innerHTML = text.split(' ').map(word =>
            `<span class="pm-word" aria-hidden="true">${[...word].map(ch => `<span class="pm-cm"><span class="pm-c">${ch}</span></span>`).join('')}</span>`
        ).join(' ');
    }

    function setNextTitle(text) {
        elNextTitle.setAttribute('aria-label', text);
        elNextTitle.innerHTML = [...text].map((ch, k) => {
            const c = ch === ' ' ? '&nbsp;' : ch;
            return `<span class="pm-nc" style="--i:${k}" aria-hidden="true"><i>${c}</i><i>${c}</i></span>`;
        }).join('');
    }

    function fillModal(i) {
        const data = projectData[i];
        const total = projectData.length;
        currentIndex = i;
        modal.style.setProperty('--pm-accent', ACCENTS[i % ACCENTS.length]);

        elIndex.innerHTML = `<b>${pad(i + 1)}</b> / ${pad(total)}`;
        elChapter.textContent = data.chapter;
        setTitle(data.title);
        elKanji.textContent = kanjiFor(i);
        if (data.link) { elLink.href = data.link; elLink.hidden = false; }
        else { elLink.hidden = true; elLink.removeAttribute('href'); }

        elHeroImg.alt = data.title;
        elCore.textContent = data.core;
        elRole.textContent = data.role;
        elTimeline.textContent = data.timeline;
        elStack.textContent = data.stack;

        // First sentence becomes the large lead line, the rest is body copy
        const m = data.overview.match(/^(.+?[.!?])\s+(.+)$/s);
        elLead.textContent = m ? m[1] : data.overview;
        elOverview.textContent = m ? m[2] : '';

        elDetails.innerHTML = '';
        data.details.forEach((detail, k) => {
            const li = document.createElement('li');
            li.className = 'pm-reveal';
            li.style.transitionDelay = `${(k % 2) * 90}ms`;
            const num = document.createElement('i');
            num.textContent = pad(k + 1);
            const txt = document.createElement('span');
            txt.textContent = detail;
            li.append(num, txt);
            elDetails.appendChild(li);
        });

        elGallery.innerHTML = '';
        data.gallery.forEach((src, k) => {
            const fig = document.createElement('figure');
            fig.className = 'pm-fig';
            fig.innerHTML = `<div class="pm-fig-img"><img src="${src}" alt="${data.title} screenshot ${k + 1}" decoding="async" loading="lazy"></div>
                <figcaption><span><b>Fig. ${pad(k + 1)}</b></span><span>${data.title}</span></figcaption>`;
            elGallery.appendChild(fig);
        });

        const n = (i + 1) % total;
        setNextTitle(projectData[n].title);
        elNextKanji.textContent = kanjiFor(n);
        elNextImg.src = thumbFor(n);
        elNext.setAttribute('aria-label', 'Next project: ' + projectData[n].title);

        observeReveals();
        updateProgress();
    }

    // Wait briefly for the hero image so the reveal never shows the previous project's picture
    function loadHero(src) {
        return new Promise(resolve => {
            elHeroImg.onload = elHeroImg.onerror = null;
            if (elHeroImg.getAttribute('src') === src && elHeroImg.complete) return resolve();
            let timer;
            const done = () => { clearTimeout(timer); elHeroImg.onload = elHeroImg.onerror = null; resolve(); };
            timer = setTimeout(done, 500);
            elHeroImg.onload = elHeroImg.onerror = done;
            elHeroImg.src = src;
        });
    }

    // The hero takes the picture's own proportions, so nothing gets cropped
    function setHeroRatio() {
        const w = elHeroImg.naturalWidth, h = elHeroImg.naturalHeight;
        elHero.style.setProperty('--hero-ar', w && h ? `${w} / ${h}` : '16 / 9');
    }
    elHeroImg.addEventListener('load', setHeroRatio);

    // ---- Scroll inside the popup: reveals, progress line, gentle image parallax ----
    const revealIO = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
    }, { root: modal, threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    function observeReveals() {
        revealIO.disconnect();
        modal.querySelectorAll('.pm-reveal, .pm-fig').forEach(el => { el.classList.remove('is-in'); revealIO.observe(el); });
    }

    let scrollTick = false;
    function updateProgress() {
        const max = modal.scrollHeight - modal.clientHeight;
        elProgress.style.transform = `scaleX(${max > 0 ? Math.min(1, modal.scrollTop / max) : 0})`;
        const vh = window.innerHeight;
        modal.querySelectorAll('.pm-fig.is-in .pm-fig-img img').forEach(img => {
            const r = img.parentElement.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            const off = ((r.top + r.height / 2) - vh / 2) / vh; // -1..1 around the viewport centre
            img.style.transform = `translateY(${(off * -5).toFixed(2)}%) scale(1.14)`;
        });
        const heroR = elHero.getBoundingClientRect();
        if (heroR.bottom > 0 && !switching) elHeroImg.style.transform = `translateY(${(Math.max(0, -heroR.top) * 0.18).toFixed(1)}px) scale(1.02)`;
    }
    modal.addEventListener('scroll', () => {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(() => { scrollTick = false; updateProgress(); });
    }, { passive: true });

    // ---- Shared intro: topline, title letters, kanji, summary ----
    function introTimeline(tl, at) {
        const chars = elTitle.querySelectorAll('.pm-c');
        tl.fromTo('.pm-topline > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" }, at)
          .fromTo(chars, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.035, ease: "expo.out" }, at + 0.05)
          .fromTo(elKanji, { y: 40, opacity: 0 }, { y: 0, opacity: 0.9, duration: 1, ease: "power3.out" }, at + 0.25);
        return tl;
    }

    function killFly() { if (flyEl) { flyEl.remove(); flyEl = null; } }

    async function openModal(card) {
        const i = Number(card.getAttribute('data-index'));
        if (!projectData[i] || modalOpen) return;
        modalOpen = true;
        activeCard = card;
        if (modalTl) modalTl.kill();
        killFly();

        fillModal(i);
        await loadHero(projectData[i].heroImg);
        setHeroRatio();
        if (!modalOpen || activeCard !== card) return; // closed while the image was loading

        window.dispatchEvent(new Event('cursor:reset'));
        savedOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();

        // Start: the popup is framed exactly on the clicked card
        gsap.set(modal, { display: 'block', opacity: 1, clipPath: cardClip(card) });
        gsap.set([modalContainer, modalClose], { opacity: 1, y: 0 });
        modal.scrollTop = 0;
        modal.setAttribute('aria-hidden', 'false');
        gsap.set(elHero, { opacity: 0 });
        gsap.set(elHeroImg, { scale: 1.08, yPercent: 0, clearProps: 'transform' });
        gsap.set(elTitle.querySelectorAll('.pm-c'), { yPercent: 115 });
        gsap.set(['.pm-topline > *', elKanji], { opacity: 0 });
        gsap.set(modalClose, { opacity: 0 });

        // The card's own picture flies up and becomes the hero (shared-element hand-over)
        const from = (card.querySelector('.g-card-inner') || card).getBoundingClientRect();
        const to = elHero.getBoundingClientRect();
        flyEl = document.createElement('div');
        flyEl.className = 'pm-fly';
        flyEl.style.backgroundImage = `url("${thumbFor(i)}")`;
        Object.assign(flyEl.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
        modal.appendChild(flyEl);

        modalTl = gsap.timeline({ onComplete: () => { killFly(); modalClose.focus({ preventScroll: true }); } });
        modalTl.to(modal, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.95, ease: "expo.inOut" }, 0)
               .to(flyEl, { left: to.left, top: to.top, width: to.width, height: to.height, borderRadius: 4, duration: 1.15, ease: "expo.inOut" }, 0.05)
               .set(elHero, { opacity: 1 }, 1.05)
               .to(flyEl, { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.05)
               .to(elHeroImg, { scale: 1, duration: 1.6, ease: "power3.out" }, 1.05)
               .to(modalClose, { opacity: 1, duration: 0.5 }, 0.8);
        introTimeline(modalTl, 0.55);
    }

    function closeModal() {
        if (!modalOpen) return;
        modalOpen = false;
        window.dispatchEvent(new Event('cursor:reset'));
        if (modalTl) modalTl.kill();
        killFly();
        cleanupSwitch();
        gsap.set(elNextTitle, { clearProps: 'opacity' });
        modal.setAttribute('aria-hidden', 'true');

        const card = activeCard;
        // Shrink back into the card when near the top of the popup; from deep inside it, a clean fade
        const backToCard = modal.scrollTop < window.innerHeight * 0.5;

        modalTl = gsap.timeline({
            onComplete: () => {
                gsap.set(modal, { display: 'none', clearProps: 'clipPath,opacity' });
                gsap.set([modalContainer, modalClose], { clearProps: 'opacity,transform' });
                document.body.style.overflow = savedOverflow;
                if (typeof lenis !== 'undefined') lenis.start();
                if (card && card.focus) card.focus({ preventScroll: true });
                activeCard = null;
            }
        });
        modalTl.to([modalContainer, modalClose], { opacity: 0, duration: 0.25, ease: "power2.in" });
        if (backToCard) {
            modalTl.to(modal, { clipPath: cardClip(card), duration: 0.75, ease: "expo.inOut" }, "-=0.05")
                   .to(modal, { opacity: 0, duration: 0.2, ease: "power1.out" }, "-=0.15");
        } else {
            modalTl.to(modal, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.1");
        }
    }

    // ---- Next project: a paper curtain rises, the footer title is carried up into the header ----
    const curtain = document.createElement('div');
    curtain.className = 'pm-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    modal.appendChild(curtain);
    let titleFly = null;

    function cleanupSwitch() {
        if (titleFly) { titleFly.remove(); titleFly = null; }
        gsap.set(curtain, { visibility: 'hidden', yPercent: 100 });
        gsap.set(elTitle, { clearProps: 'opacity' });
        switching = false;
    }

    async function goNext() {
        if (!modalOpen || switching) return;
        switching = true;
        const n = (currentIndex + 1) % projectData.length;
        if (modalTl) modalTl.kill();
        const vw = window.innerWidth, vh = window.innerHeight;

        // A copy of the footer title takes off from exactly where it sits
        const r = elNextTitle.getBoundingClientRect();
        const cs = getComputedStyle(elNextTitle);
        titleFly = document.createElement('div');
        titleFly.className = 'pm-title-fly';
        titleFly.textContent = projectData[n].title;
        Object.assign(titleFly.style, {
            left: r.left + 'px', top: r.top + 'px',
            fontSize: cs.fontSize, lineHeight: cs.lineHeight,
            letterSpacing: getComputedStyle(elTitle).letterSpacing === 'normal' ? '-0.035em' : '-0.035em'
        });
        modal.appendChild(titleFly);
        const wasHover = elNext.matches(':hover');
        gsap.set(titleFly, { color: wasHover ? getComputedStyle(modal).getPropertyValue('--pm-accent') : '#161616' });
        gsap.set(elNextTitle, { opacity: 0 });
        elNext.classList.remove('is-hover');

        // 1. The curtain rises over the page; the title rides up to the middle of the screen
        const startLeft = modalContainer.getBoundingClientRect().left + parseFloat(getComputedStyle(modalContainer).paddingLeft);
        modalTl = gsap.timeline();
        modalTl.set(curtain, { visibility: 'visible', yPercent: 100 })
               .to(curtain, { yPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0)
               .to(titleFly, { left: startLeft, top: vh * 0.5 - r.height / 2, color: '#161616', duration: 0.95, ease: "expo.inOut" }, 0.05);
        await modalTl.then();
        if (!modalOpen) return;

        // 2. Behind the curtain: swap in the next project
        modal.scrollTop = 0;
        fillModal(n);
        activeCard = cardFor(n) || activeCard;
        gsap.set(elNextTitle, { clearProps: 'opacity' });
        await loadHero(projectData[n].heroImg);
        setHeroRatio();
        if (!modalOpen) return;

        const chars = elTitle.querySelectorAll('.pm-c');
        gsap.set(chars, { yPercent: 0, rotate: 0 });
        gsap.set(elTitle, { opacity: 0 });
        gsap.set(['.pm-topline > *', elKanji], { opacity: 0, y: 20 });
        gsap.set(elHero, { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(elHeroImg, { scale: 1.18, clearProps: 'transform' });

        // Where the title lands in the new header, and how much it grows to match it
        const t = elTitle.getBoundingClientRect();
        const scale = parseFloat(getComputedStyle(elTitle).fontSize) / parseFloat(cs.fontSize);

        // 3. The title settles into the header as the curtain lifts away, then the page fills in
        modalTl = gsap.timeline({ onComplete: () => { cleanupSwitch(); gsap.set(elHero, { clearProps: 'clipPath' }); } });
        modalTl.to(titleFly, { left: t.left, top: t.top, scale, duration: 1.0, ease: "expo.inOut" }, 0)
               .to(curtain, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, 0.2)
               .set(elTitle, { opacity: 1 }, 1.0)
               .set(titleFly, { opacity: 0 }, 1.0)
               .to('.pm-topline > *', { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.75)
               .to(elKanji, { opacity: 0.9, y: 0, duration: 0.9, ease: "power3.out" }, 0.85)
               .to(elHero, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" }, 0.7)
               .to(elHeroImg, { scale: 1, duration: 1.6, ease: "power3.out" }, 0.8);
    }

    cardsWrapper.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        const label = card.querySelector('.label-sub');
        if (label) card.setAttribute('aria-label', 'Open project: ' + label.textContent.replace(/~/g, '').trim());
        card.addEventListener('click', () => openModal(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
        });
    });

    elNext.addEventListener('click', goNext);

    // Preview image follows the pointer over the Next button, tilting with its speed
    const nextThumb = elNext.querySelector('.pm-next-thumb');
    const thumbX = gsap.quickTo(nextThumb, 'x', { duration: 0.7, ease: 'power3.out' });
    const thumbY = gsap.quickTo(nextThumb, 'y', { duration: 0.7, ease: 'power3.out' });
    const thumbR = gsap.quickTo(nextThumb, 'rotation', { duration: 0.9, ease: 'power3.out' });
    let lastThumbX = null;
    elNext.addEventListener('mouseenter', (e) => {
        const b = elNext.getBoundingClientRect();
        const x = e.clientX - b.left - nextThumb.offsetWidth / 2, y = e.clientY - b.top - nextThumb.offsetHeight * 0.75;
        gsap.set(nextThumb, { x, y, rotation: 0 });
        lastThumbX = e.clientX;
        elNext.classList.add('is-hover');
    });
    elNext.addEventListener('mousemove', (e) => {
        const b = elNext.getBoundingClientRect();
        thumbX(e.clientX - b.left - nextThumb.offsetWidth / 2);
        thumbY(e.clientY - b.top - nextThumb.offsetHeight * 0.75);
        const vx = lastThumbX === null ? 0 : e.clientX - lastThumbX;
        lastThumbX = e.clientX;
        thumbR(gsap.utils.clamp(-12, 12, vx * 0.6));
    });
    elNext.addEventListener('mouseleave', () => { elNext.classList.remove('is-hover'); thumbR(0); lastThumbX = null; });
    modalClose.addEventListener('click', closeModal);
    modalClose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOpen) closeModal();
    });

    // Back to top functionality
    document.getElementById('back-to-top').addEventListener('click', () => {
        gsap.to(window, { duration: 1.5, scrollTo: 0, ease: "power3.inOut" });
    });

});
