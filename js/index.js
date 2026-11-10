(function(){
    'use strict';

    // ============================================================================
    // CONSTANTS & CONFIG
    // ============================================================================
    const CONFIG = {
        defaultColors: ['#00CED1', '#4B0082', '#FFD700', '#6A5ACD'],
        dropdowns: [
            { id: 'menuEvents', dataId: 'eventsDropdown', dataFile: 'events.json', colorIndex: 0, itemClass: 'event-item', titleClass: 'event-date', noItemsText: 'No upcoming events' },
            { id: 'menuWeb', dataId: 'webDropdown', dataFile: 'web.json', colorIndex: 1, itemClass: 'web-item', titleClass: 'web-title', noItemsText: 'No items' },
            { id: 'menuTools', dataId: 'toolsDropdown', dataFile: 'tools.json', colorIndex: 2, itemClass: 'web-item', titleClass: 'web-title', noItemsText: 'No tools' }
        ],
        colorInputIds: ['color1', 'color2', 'color3', 'color4'],
        propagationModes: ['zero', 'replicate', 'reflect', 'circular', 'diffuse'],
        defaultPropagationMode: 'zero'
    };

    const CONSTANTS = {
        INV_100: 0.01,
        CANVAS_WIDTH: 380,
        CANVAS_HEIGHT: 480,
        TIME_STEP: 0.35,
        GLITCH_DECAY_MS: 700,
        DROPDOWN_LOAD_DELAY: 120,
        BG_CELL: 8,               // css px per background cell
        BG_MAX_BLOCK: 6,          // block size (in cells) at the screen edge
        BG_FALLOFF: 1.5,          // confidence = (1 - distance)^FALLOFF
        BG_NOISE: 40,             // noise amplitude at the screen edge
        BG_NOISE_RATE: 0.3,       // how fast the noise re-samples
        BG_SMOOTHING: 0.15,       // temporal lag of the forecast
        BG_DIFFUSE_SCALE: 3,      // diffusion runs on a coarser grid so it spreads fast
        BG_DIFFUSE_PASSES: 12,
        BG_PRIORS: {                // the background a model with no information falls back to
            light: { r: 245, g: 245, b: 245 },
            dark: { r: 17, g: 17, b: 17 }
        },
        KNOB_LABEL_MS: 1400
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
        DOM.bgCanvas = document.getElementById('bgCanvas');
        DOM.bgCtx = DOM.bgCanvas.getContext('2d');
        DOM.propagationKnob = document.getElementById('propagationKnob');
        DOM.knobDial = document.getElementById('knobDial');
        DOM.propagationLabel = document.getElementById('propagationLabel');
        DOM.themeToggle = document.getElementById('themeToggle');
        DOM.themeColorMeta = document.querySelector('meta[name="theme-color"]');

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
        pixels: null,
        propagationMode: 0,
        theme: 'light',
        bg: {}
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

    // ============================================================================
    // BACKGROUND FORECAST - the canvas is the only observed data; the background
    // is predicted from it, like a CNN padding past an image border or an
    // inpainting model filling unknown pixels. Confidence decays with distance:
    // blocks grow, noise rises, and the colour falls back to the prior (#f5f5f5)
    // at the screen edge.
    // ============================================================================
    function resizeBackground() {
        const bg = state.bg;
        const prior = CONSTANTS.BG_PRIORS[state.theme];
        bg.cols = Math.ceil(window.innerWidth / CONSTANTS.BG_CELL);
        bg.rows = Math.ceil(window.innerHeight / CONSTANTS.BG_CELL);
        DOM.bgCanvas.width = bg.cols;
        DOM.bgCanvas.height = bg.rows;
        bg.imageData = DOM.bgCtx.createImageData(bg.cols, bg.rows);

        bg.dCols = Math.ceil(bg.cols / CONSTANTS.BG_DIFFUSE_SCALE);
        bg.dRows = Math.ceil(bg.rows / CONSTANTS.BG_DIFFUSE_SCALE);
        bg.display = new Float32Array(bg.cols * bg.rows * 3);
        bg.field = new Float32Array(bg.dCols * bg.dRows * 3);
        bg.seed = new Uint8Array(bg.dCols * bg.dRows);
        [bg.display, bg.field].forEach(buf => {
            for (let k = 0; k < buf.length; k += 3) {
                buf[k] = prior.r;
                buf[k + 1] = prior.g;
                buf[k + 2] = prior.b;
            }
        });
    }

    // Map an out-of-bounds pixel index back into the canvas (CNN padding modes)
    function padIndex(mode, i, n) {
        if (mode === 'replicate') return i < 0 ? 0 : i >= n ? n - 1 : i;
        if (mode === 'circular') return ((i % n) + n) % n;
        const period = n << 1;
        const m = ((i % period) + period) % period;
        return m < n ? m : period - 1 - m;
    }

    // Deterministic noise in [-1, 1] per block and time bucket
    function hashNoise(x, y, s) {
        let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h & 0xffff) / 32767.5 - 1;
    }

    // Inpainting by diffusion: cells under the canvas are seeded with what it
    // shows, every other cell relaxes towards the average of its neighbours
    function diffuseField(rect, sx, sy) {
        const bg = state.bg;
        const { field, seed } = bg;
        const cols = bg.dCols, rows = bg.dRows;
        const cell = CONSTANTS.BG_CELL * CONSTANTS.BG_DIFFUSE_SCALE;
        const W = CONSTANTS.CANVAS_WIDTH, H = CONSTANTS.CANVAS_HEIGHT;
        const total = cols * rows;

        for (let row = 0, i = 0; row < rows; row++) {
            const y = (row + 0.5) * cell;
            const inY = y >= rect.top && y < rect.bottom;
            for (let col = 0; col < cols; col++, i++) {
                const x = (col + 0.5) * cell;
                if (inY && x >= rect.left && x < rect.right) {
                    const u = Math.min(W - 1, ((x - rect.left) * sx) | 0);
                    const v = Math.min(H - 1, ((y - rect.top) * sy) | 0);
                    const p = (v * W + u) << 2;
                    field[i * 3] = state.pixels[p];
                    field[i * 3 + 1] = state.pixels[p + 1];
                    field[i * 3 + 2] = state.pixels[p + 2];
                    seed[i] = 1;
                } else {
                    seed[i] = 0;
                }
            }
        }

        // Alternate sweep direction so the spread has no directional bias
        for (let pass = 0; pass < CONSTANTS.BG_DIFFUSE_PASSES; pass++) {
            const forward = (pass & 1) === 0;
            for (let n = 0; n < total; n++) {
                const i = forward ? n : total - 1 - n;
                if (seed[i]) continue;
                const col = i % cols;
                const l = (col > 0 ? i - 1 : i) * 3;
                const r = (col < cols - 1 ? i + 1 : i) * 3;
                const u = (i >= cols ? i - cols : i) * 3;
                const d = (i < total - cols ? i + cols : i) * 3;
                const k = i * 3;
                field[k] = (field[l] + field[r] + field[u] + field[d]) * 0.25;
                field[k + 1] = (field[l + 1] + field[r + 1] + field[u + 1] + field[d + 1]) * 0.25;
                field[k + 2] = (field[l + 2] + field[r + 2] + field[u + 2] + field[d + 2]) * 0.25;
            }
        }
    }

    function drawBackground() {
        const bg = state.bg;
        const { cols, rows, display, field } = bg;
        const mode = CONFIG.propagationModes[state.propagationMode];
        const rect = DOM.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const cell = CONSTANTS.BG_CELL;
        const W = CONSTANTS.CANVAS_WIDTH, H = CONSTANTS.CANVAS_HEIGHT;
        const sx = W / rect.width, sy = H / rect.height;
        const prior = CONSTANTS.BG_PRIORS[state.theme];
        const pixels = state.pixels;
        const out = bg.imageData.data;
        const smoothing = CONSTANTS.BG_SMOOTHING;
        const bucket = (state.time * CONSTANTS.BG_NOISE_RATE) | 0;

        // Distance is measured relative to the room left in each direction,
        // so confidence reaches zero exactly at the screen edge
        const roomL = Math.max(rect.left, 1);
        const roomR = Math.max(window.innerWidth - rect.right, 1);
        const roomT = Math.max(rect.top, 1);
        const roomB = Math.max(window.innerHeight - rect.bottom, 1);

        if (mode === 'diffuse') diffuseField(rect, sx, sy);

        for (let row = 0, i = 0; row < rows; row++) {
            const y = (row + 0.5) * cell;
            const dy = y < rect.top ? (rect.top - y) / roomT : y > rect.bottom ? (y - rect.bottom) / roomB : 0;

            for (let col = 0; col < cols; col++, i++) {
                const x = (col + 0.5) * cell;
                const dx = x < rect.left ? (rect.left - x) / roomL : x > rect.right ? (x - rect.right) / roomR : 0;
                const t = Math.min(1, Math.max(dx, dy));

                let r = prior.r, g = prior.g, b = prior.b;
                if (mode !== 'zero' && t < 1) {
                    // Resolution of the forecast drops with distance
                    const block = 1 + ((t * CONSTANTS.BG_MAX_BLOCK) | 0);
                    const bc = ((col / block) | 0) * block;
                    const br = ((row / block) | 0) * block;

                    if (mode === 'diffuse') {
                        const scale = CONSTANTS.BG_DIFFUSE_SCALE;
                        const j = (((br / scale) | 0) * bg.dCols + ((bc / scale) | 0)) * 3;
                        r = field[j]; g = field[j + 1]; b = field[j + 2];
                    } else {
                        const u = padIndex(mode, Math.floor(((bc + 0.5) * cell - rect.left) * sx), W);
                        const v = padIndex(mode, Math.floor(((br + 0.5) * cell - rect.top) * sy), H);
                        const p = (v * W + u) << 2;
                        r = pixels[p]; g = pixels[p + 1]; b = pixels[p + 2];
                    }

                    const conf = Math.pow(1 - t, CONSTANTS.BG_FALLOFF);
                    const noise = hashNoise(bc, br, bucket) * t * CONSTANTS.BG_NOISE;
                    r = prior.r + (r + noise - prior.r) * conf;
                    g = prior.g + (g + noise - prior.g) * conf;
                    b = prior.b + (b + noise - prior.b) * conf;
                }

                // The forecast lags slightly behind the canvas
                const k = i * 3, o = i << 2;
                display[k] += (r - display[k]) * smoothing;
                display[k + 1] += (g - display[k + 1]) * smoothing;
                display[k + 2] += (b - display[k + 2]) * smoothing;
                out[o] = display[k];
                out[o + 1] = display[k + 1];
                out[o + 2] = display[k + 2];
                out[o + 3] = 255;
            }
        }

        DOM.bgCtx.putImageData(bg.imageData, 0, 0);
    }

    // ============================================================================
    // PROPAGATION KNOB
    // ============================================================================
    function setPropagationMode(index, announce) {
        const modes = CONFIG.propagationModes;
        state.propagationMode = ((index % modes.length) + modes.length) % modes.length;
        localStorage.setItem('osiom-propagation', modes[state.propagationMode]);

        // Five detents spread over 240 degrees
        const angle = -120 + state.propagationMode * (240 / (modes.length - 1));
        if (DOM.knobDial) DOM.knobDial.style.transform = `rotate(${angle}deg)`;

        if (announce && DOM.propagationLabel) {
            DOM.propagationLabel.textContent = modes[state.propagationMode];
            DOM.propagationLabel.classList.add('show');
            clearTimeout(state.knobLabelTimer);
            state.knobLabelTimer = setTimeout(() => {
                DOM.propagationLabel.classList.remove('show');
            }, CONSTANTS.KNOB_LABEL_MS);
        }
    }

    function loadPropagationMode() {
        const saved = localStorage.getItem('osiom-propagation');
        const index = CONFIG.propagationModes.indexOf(saved);
        setPropagationMode(index >= 0 ? index : CONFIG.propagationModes.indexOf(CONFIG.defaultPropagationMode), false);
    }

    function setupPropagationKnob() {
        if (DOM.propagationKnob) {
            DOM.propagationKnob.addEventListener('click', () => {
                setPropagationMode(state.propagationMode + 1, true);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'p' || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.target instanceof HTMLInputElement) return;
            setPropagationMode(state.propagationMode + 1, true);
        });
    }

    // ============================================================================
    // LIGHT / DARK - flips the prior; the forecast fades into the new one
    // ============================================================================
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('osiom-theme', theme);
        if (DOM.themeColorMeta) {
            const p = CONSTANTS.BG_PRIORS[theme];
            DOM.themeColorMeta.content = `rgb(${p.r},${p.g},${p.b})`;
        }
    }

    function setupThemeToggle() {
        setTheme(localStorage.getItem('osiom-theme') === 'dark' ? 'dark' : 'light');
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', () => {
                setTheme(state.theme === 'dark' ? 'light' : 'dark');
            });
        }
    }

    function animate() {
        state.time += CONSTANTS.TIME_STEP;
        drawFluidGlitch();
        drawBackground();
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
        setupThemeToggle();
        resizeBackground();
        window.addEventListener('resize', resizeBackground, {passive: true});
        loadPropagationMode();
        setupPropagationKnob();

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