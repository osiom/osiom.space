(function(){
    'use strict';

    // ============================================================================
    // CONSTANTS & CONFIG
    // ============================================================================
    const CONFIG = {
        defaultColors: ['#00CED1', '#4B0082', '#FFD700', '#6A5ACD'],
        dropdowns: [
            { id: 'menuEvents', dataId: 'eventsDropdown', dataFile: 'events.json', colorIndex: 0, itemClass: 'event-item', titleClass: 'event-date', noItemsText: 'No upcoming events' },
            { id: 'menuWeb', dataId: 'webDropdown', dataFile: 'web.json', colorIndex: 1, itemClass: 'web-item', titleClass: 'web-title', noItemsText: 'No items' }
        ],
        colorInputIds: ['color1', 'color2', 'color3', 'color4']
    };

    const CONSTANTS = {
        INV_100: 0.01,
        CANVAS_WIDTH: 380,
        CANVAS_HEIGHT: 480,
        TIME_STEP: 0.35,
        GLITCH_DECAY_MS: 700,
        DROPDOWN_LOAD_DELAY: 120
    };

    // ============================================================================
    // DOM CACHE - All elements cached once at initialization
    // ============================================================================
    const DOM = {};
    function cacheDom() {
        DOM.canvas = document.getElementById('canvas');
        DOM.ctx = DOM.canvas.getContext('2d');
        DOM.glitchBox = document.getElementById('glitchBox');
        DOM.pixelSlider = document.getElementById('pixelSlider');
        DOM.randomizeBtn = document.getElementById('randomizeBtn');
        
        CONFIG.colorInputIds.forEach((id, idx) => {
            DOM[`color${idx + 1}`] = document.getElementById(id);
        });
        
        CONFIG.dropdowns.forEach(cfg => {
            DOM[cfg.id] = document.getElementById(cfg.id);
            DOM[cfg.dataId] = document.getElementById(cfg.dataId);
        });
    }

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    const state = {
        userColors: [...CONFIG.defaultColors],
        rgbColors: [],
        time: 0,
        glitchIntensity: 0.5,
        isHovering: false,
        pixelSize: 1,
        canvas: null,
        ctx: null,
        imageData: null,
        pixels: null
    };

    // ============================================================================
    // CANVAS & IMAGE DATA SETUP
    // ============================================================================
    function initializeCanvas() {
        DOM.canvas.width = CONSTANTS.CANVAS_WIDTH;
        DOM.canvas.height = CONSTANTS.CANVAS_HEIGHT;
        state.canvas = DOM.canvas;
        state.ctx = DOM.ctx;
        state.imageData = DOM.ctx.createImageData(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);
        state.pixels = state.imageData.data;
    }

    // ============================================================================
    // COLOR UTILITIES
    // ============================================================================
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function updateRgbColors() {
        state.rgbColors = state.userColors.map(hexToRgb);
    }

    function getColorValue(colorIndex) {
        return DOM[`color${colorIndex + 1}`]?.value || CONFIG.defaultColors[colorIndex];
    }

    function setColorValue(colorIndex, value) {
        const el = DOM[`color${colorIndex + 1}`];
        if (el) el.value = value;
    }

    // ============================================================================
    // MENU COLOR UPDATES - Generic function for all menus
    // ============================================================================
    function updateMenuColors() {
        const menuIds = ['menuEvents', 'menuWeb', 'menuTools', 'menuBlog'];
        menuIds.forEach((id, idx) => {
            const el = DOM[id];
            if (el) el.style.color = getColorValue(idx);
        });

        CONFIG.dropdowns.forEach(cfg => {
            const dropdown = DOM[cfg.dataId];
            const color = getColorValue(cfg.colorIndex);
            if (dropdown) {
                dropdown.style.borderColor = color;
                dropdown.style.color = color;
            }
        });
    }

    // ============================================================================
    // STORAGE UTILITIES
    // ============================================================================
    function loadColors() {
        const saved = localStorage.getItem('osiom-colors');
        if (saved) {
            try {
                state.userColors = JSON.parse(saved);
                state.userColors.forEach((color, idx) => {
                    setColorValue(idx, color);
                });
            } catch (e) {
                state.userColors = [...CONFIG.defaultColors];
            }
        }
        updateMenuColors();
    }

    function saveColors() {
        state.userColors = CONFIG.colorInputIds.map((_, idx) => getColorValue(idx));
        localStorage.setItem('osiom-colors', JSON.stringify(state.userColors));
        updateRgbColors();
        updateMenuColors();
    }

    function loadPixelSize() {
        const saved = localStorage.getItem('osiom-pixel-size');
        if (saved) {
            state.pixelSize = parseInt(saved);
            if (DOM.pixelSlider) DOM.pixelSlider.value = state.pixelSize;
        }
    }

    function savePixelSize(size) {
        state.pixelSize = size;
        localStorage.setItem('osiom-pixel-size', size);
    }

    // ============================================================================
    // HTML ESCAPE
    // ============================================================================
    const escapeMap = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;" };
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => escapeMap[c]);
    }

    // ============================================================================
    // GENERIC DROPDOWN DATA LOADER
    // ============================================================================
    async function loadDropdownData(config) {
        const dropdown = DOM[config.dataId];
        if (!dropdown) return;

        try {
            const resp = await fetch(`data/${config.dataFile}?t=${Date.now()}`, {cache: 'no-store'});
            if (!resp.ok) throw new Error(`${config.dataFile} not available`);
            const items = await resp.json();

            if (!Array.isArray(items) || items.length === 0) {
                dropdown.innerHTML = `<div class="${config.itemClass}">${config.noItemsText}</div>`;
                return;
            }

            const fragment = document.createDocumentFragment();
            items.forEach(item => {
                const a = document.createElement('a');
                a.className = config.itemClass;
                a.href = item.url || '#';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';

                const span = document.createElement('span');
                span.className = config.titleClass;
                span.textContent = escapeHtml(item.date || item.title || '');

                if (item.title) {
                    a.setAttribute('aria-label', escapeHtml(item.title));
                }

                a.appendChild(span);
                fragment.appendChild(a);
            });

            dropdown.innerHTML = '';
            dropdown.appendChild(fragment);
        } catch (err) {
            dropdown.innerHTML = `<div class="${config.itemClass}">Unable to load ${config.dataFile}</div>`;
            console.warn(`loadDropdownData(${config.dataFile}):`, err);
        }
    }

    // ============================================================================
    // GENERIC DROPDOWN WIRING - DRY principle
    // ============================================================================
    function wireDropdown(config) {
        const btn = DOM[config.id];
        const dropdown = DOM[config.dataId];
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('show');
            dropdown.setAttribute('aria-hidden', String(!isOpen));
            btn.setAttribute('aria-expanded', String(isOpen));
        }, {passive: false});

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                    dropdown.setAttribute('aria-hidden', 'true');
                    btn.setAttribute('aria-expanded', 'false');
                }
            }
        }, {passive: true});

        setTimeout(() => loadDropdownData(config), CONSTANTS.DROPDOWN_LOAD_DELAY);
    }

    // ============================================================================
    // COLOR PICKER SETUP
    // ============================================================================
    function setupColorPickers() {
        CONFIG.colorInputIds.forEach((id, idx) => {
            const el = DOM[`color${idx + 1}`];
            if (el) {
                el.addEventListener('input', saveColors);
            }
        });
    }

    // ============================================================================
    // RANDOMIZE COLORS
    // ============================================================================
    function randomizeColors() {
        const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        CONFIG.colorInputIds.forEach((_, idx) => {
            setColorValue(idx, randomHex());
        });
        saveColors();
        
        state.glitchIntensity = 3;
        setTimeout(() => {
            state.glitchIntensity = state.isHovering ? 1.5 : 0.5;
        }, CONSTANTS.GLITCH_DECAY_MS);
    }

    // ============================================================================
    // PIXEL SLIDER SETUP
    // ============================================================================
    function setupPixelSlider() {
        if (DOM.pixelSlider) {
            DOM.pixelSlider.addEventListener('input', (e) => {
                savePixelSize(parseInt(e.target.value));
            });
        }
    }

    // ============================================================================
    // GLITCH BOX INTERACTIONS
    // ============================================================================
    function setupGlitchBoxInteractions() {
        if (!DOM.glitchBox) return;

        const setIntensity = (intensity) => {
            state.glitchIntensity = intensity;
        };

        DOM.glitchBox.addEventListener('mouseenter', () => {
            state.isHovering = true;
            setIntensity(1.5);
        }, {passive: true});

        DOM.glitchBox.addEventListener('mouseleave', () => {
            state.isHovering = false;
            setIntensity(0.5);
        }, {passive: true});

        DOM.glitchBox.addEventListener('click', () => {
            setIntensity(3);
            setTimeout(() => {
                setIntensity(state.isHovering ? 1.5 : 0.5);
            }, CONSTANTS.GLITCH_DECAY_MS);
        }, {passive: true});

        DOM.glitchBox.addEventListener('touchstart', () => {
            state.isHovering = true;
            setIntensity(1.5);
        }, {passive: true});

        DOM.glitchBox.addEventListener('touchend', () => {
            state.isHovering = false;
            setIntensity(0.5);
        }, {passive: true});

        setInterval(() => {
            if (!state.isHovering && Math.random() > 0.96) {
                setIntensity(2);
                setTimeout(() => {
                    setIntensity(0.5);
                }, CONSTANTS.GLITCH_DECAY_MS);
            }
        }, 4000);
    }

    // ============================================================================
    // RENDERING - Optimized fluid glitch
    // ============================================================================

    function drawFluidGlitch() {
        const t = state.time * 0.03;
        const t8 = t * 0.8;
        const t13 = t * 1.3;
        const t12 = t * 1.2;
        const t27 = t * 2.7;
        const centerX = CONSTANTS.CANVAS_WIDTH >> 1;
        const centerY = CONSTANTS.CANVAS_HEIGHT >> 1;
        const time25 = state.time * 2.5;

        let idx = 0;
        for (let y = 0; y < CONSTANTS.CANVAS_HEIGHT; y++) {
            const yOffset = y * 0.02;
            const yDist = y - centerY;
            const yFlow = Math.sin(yOffset + t) * 30;
            const wave2 = Math.cos(yOffset + t8) * 50;
            const yDistSq = yDist * yDist;

            for (let x = 0; x < CONSTANTS.CANVAS_WIDTH; x++, idx += 4) {
                const xOffset = x * 0.02;
                const xDist = x - centerX;

                // Wave calculations
                const wave1 = Math.sin(xOffset + t) * 60;
                const wave3 = Math.sin((xOffset + yOffset) * 0.75 + t13) * 45;
                const xFlow = Math.cos(xOffset + t12) * 30;

                // Ripple
                const ripple = Math.sin(Math.sqrt(xDist * xDist + yDistSq) * 0.05 - t27) * 35;

                // Color selection
                const baseValue = wave1 + wave2 + wave3 + yFlow + xFlow + ripple + (x + y) * 0.3 + time25;
                const cycle = ((baseValue % 400) + 400) % 400;

                // Interpolate colors inline for performance
                let r, g, b;
                if (cycle < 100) {
                    const f = cycle * CONSTANTS.INV_100;
                    const c1 = state.rgbColors[0], c2 = state.rgbColors[1];
                    r = c1.r + (c2.r - c1.r) * f;
                    g = c1.g + (c2.g - c1.g) * f;
                    b = c1.b + (c2.b - c1.b) * f;
                } else if (cycle < 200) {
                    const f = (cycle - 100) * CONSTANTS.INV_100;
                    const c1 = state.rgbColors[1], c2 = state.rgbColors[2];
                    r = c1.r + (c2.r - c1.r) * f;
                    g = c1.g + (c2.g - c1.g) * f;
                    b = c1.b + (c2.b - c1.b) * f;
                } else if (cycle < 300) {
                    const f = (cycle - 200) * CONSTANTS.INV_100;
                    const c1 = state.rgbColors[2], c2 = state.rgbColors[3];
                    r = c1.r + (c2.r - c1.r) * f;
                    g = c1.g + (c2.g - c1.g) * f;
                    b = c1.b + (c2.b - c1.b) * f;
                } else {
                    const f = (cycle - 300) * CONSTANTS.INV_100;
                    const c1 = state.rgbColors[3], c2 = state.rgbColors[0];
                    r = c1.r + (c2.r - c1.r) * f;
                    g = c1.g + (c2.g - c1.g) * f;
                    b = c1.b + (c2.b - c1.b) * f;
                }

                // Variation
                const variation = Math.sin(baseValue * 0.02) * 0.2 + 1;

                state.pixels[idx] = r * variation;
                state.pixels[idx + 1] = g * variation;
                state.pixels[idx + 2] = b * variation;
                state.pixels[idx + 3] = 255;
            }
        }

        // Optimized glitch effect - store original values (rarer)
        if (state.glitchIntensity > 0.7 || Math.random() > 0.995) {
            const glitchY = (Math.random() * CONSTANTS.CANVAS_HEIGHT) | 0;
            const glitchHeight = Math.min((Math.random() * 50 + 20) | 0, CONSTANTS.CANVAS_HEIGHT - glitchY);
            const offsetR = ((Math.random() - 0.5) * 15 * state.glitchIntensity) | 0;
            const offsetG = ((Math.random() - 0.5) * 12 * state.glitchIntensity) | 0;
            const offsetB = ((Math.random() - 0.5) * 18 * state.glitchIntensity) | 0;

            for (let y = glitchY, maxY = glitchY + glitchHeight; y < maxY; y++) {
                const yBase = y * CONSTANTS.CANVAS_WIDTH;
                for (let x = 0; x < CONSTANTS.CANVAS_WIDTH; x++) {
                    const targetIdx = (yBase + x) << 2;
                    const sourceXR = x + offsetR;
                    const sourceXG = x + offsetG;
                    const sourceXB = x + offsetB;

                    if ((sourceXR | sourceXG | sourceXB) >= 0 && sourceXR < CONSTANTS.CANVAS_WIDTH && sourceXG < CONSTANTS.CANVAS_WIDTH && sourceXB < CONSTANTS.CANVAS_WIDTH) {
                        const srcR = (yBase + sourceXR) << 2;
                        const srcG = (yBase + sourceXG) << 2;
                        const srcB = (yBase + sourceXB) << 2;
                        state.pixels[targetIdx] = state.pixels[srcR];
                        state.pixels[targetIdx + 1] = state.pixels[srcG + 1];
                        state.pixels[targetIdx + 2] = state.pixels[srcB + 2];
                    }
                }
            }
        }

        state.ctx.putImageData(state.imageData, 0, 0);

        // Apply pixelation effect if pixel size > 1
        if (state.pixelSize > 1) {
            // Get current canvas data
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = CONSTANTS.CANVAS_WIDTH;
            tempCanvas.height = CONSTANTS.CANVAS_HEIGHT;

            // Scale down
            const smallWidth = Math.ceil(CONSTANTS.CANVAS_WIDTH / state.pixelSize);
            const smallHeight = Math.ceil(CONSTANTS.CANVAS_HEIGHT / state.pixelSize);

            tempCtx.drawImage(state.canvas, 0, 0, smallWidth, smallHeight);

            // Scale back up with pixelation
            state.ctx.imageSmoothingEnabled = false;
            state.ctx.mozImageSmoothingEnabled = false;
            state.ctx.webkitImageSmoothingEnabled = false;
            state.ctx.msImageSmoothingEnabled = false;

            state.ctx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);
        }

        // Draw figlet text
        drawFiglet();
    }

    // Figlet ASCII art for "osiom"
    const figletText = [
        "           _                 ",
        "  ___  ___(_) ___  _ __ ___  ",
        " / _ \\/ __| |/ _ \\| '_ ` _ \\ ",
        "| (_) \\__ \\ | (_) | | | | | |",
        " \\___/|___/_|\\___/|_| |_| |_|"
    ];

    function drawFiglet() {
        const fontSize = 14;
        const lineHeight = fontSize * 1.1;
        const totalHeight = figletText.length * lineHeight;
        const startY = (CONSTANTS.CANVAS_HEIGHT - totalHeight) / 2;

        state.ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        state.ctx.textAlign = 'center';
        state.ctx.textBaseline = 'middle';

        const jitterX = Math.sin(state.time * 0.1) * 2;
        const jitterY = Math.cos(state.time * 0.13) * 1;

        figletText.forEach((line, i) => {
            const y = startY + i * lineHeight + jitterY;
            const x = CONSTANTS.CANVAS_WIDTH / 2 + jitterX;

            state.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            state.ctx.fillText(line, x + 2, y + 2);

            state.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            state.ctx.fillText(line, x, y);

            if (state.glitchIntensity > 1 && Math.random() > 0.7) {
                state.ctx.fillStyle = 'rgba(255, 0, 100, 0.5)';
                state.ctx.fillText(line, x + 3, y);
                state.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                state.ctx.fillText(line, x - 3, y);
            }
        });
    }

    function animate() {
        state.time += CONSTANTS.TIME_STEP;
        drawFluidGlitch();
        requestAnimationFrame(animate);
    }

    // ============================================================================
    // INITIALIZATION - Single entry point
    // ============================================================================
    function initialize() {
        cacheDom();
        initializeCanvas();
        loadColors();
        updateRgbColors();
        loadPixelSize();
        setupColorPickers();
        setupPixelSlider();
        setupGlitchBoxInteractions();

        if (DOM.randomizeBtn) {
            DOM.randomizeBtn.addEventListener('click', randomizeColors);
        }

        CONFIG.dropdowns.forEach(wireDropdown);

        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();