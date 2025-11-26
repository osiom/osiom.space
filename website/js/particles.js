/**
 * Particle system: Particles (representing people) are drawn toward the cube center,
 * and turn WHITE when entering the black window (portal to sustainable technology).
 * Red particles appear only when proprietary software is selected.
 * 
 * Philosophy: Each particle represents a person being attracted to alternative
 * technology. The black window is a portal - when people pass through it,
 * they transform (turn white) having been converted to sustainable practices.
 */

// Global state for particle system behavior
window.ParticleState = {
  proprietarySelected: false,
  setProprietaryMode: function(isProprietarySelected) {
    this.proprietarySelected = isProprietarySelected;
  }
};

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Could not get 2D context');
      return;
    }
    
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };

    // Debug info for mobile
    if (window.innerWidth <= 768) {
      console.log('Mobile particles initialized:', {
        canvasId,
        width: this.canvas.width,
        height: this.canvas.height,
        devicePixelRatio: window.devicePixelRatio
      });
    }

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    // Determine particle count based on page
    const isIndexPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname === '';
    let numberOfParticles;
    
    if (isIndexPage) {
      // Full particle count for index page
      numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 8000);
    } else {
      // Reasonable particle count for mobile on decision-tree/discovery pages
      if (window.innerWidth <= 768) {
        numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 15000); // More particles on mobile
      } else {
        numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 20000); // Desktop
      }
    }
    
    // Ensure minimum particle count for visibility
    numberOfParticles = Math.max(numberOfParticles, 20);
    
    this.particles = [];
    for (let i = 0; i < numberOfParticles; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  isInsideBlackWindow(x, y) {
    if (typeof getBlackFaceBounds !== 'function') {
      return false;
    }

    const bounds = getBlackFaceBounds();
    if (
      bounds.minX < 0 ||
      bounds.maxX < 0 ||
      bounds.minY < 0 ||
      bounds.maxY < 0
    ) {
      return false;
    }

    // Small tolerance to make overlap detection smoother
    return (
      x >= bounds.minX - 6 &&
      x <= bounds.maxX + 6 &&
      y >= bounds.minY - 6 &&
      y <= bounds.maxY + 6
    );
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cubeCenter =
      typeof getCubeCenterPosition === 'function'
        ? getCubeCenterPosition()
        : { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    this.particles.forEach((particle) => {
      particle.update(this.canvas.width, this.canvas.height, this.mouse, cubeCenter);

      const insideBlackWindow = this.isInsideBlackWindow(particle.x, particle.y);
      
      // Check if proprietary software is selected
      const proprietarySelected = window.ParticleState && window.ParticleState.proprietarySelected;

      if (proprietarySelected) {
        // When proprietary is selected, all particles turn red (negative path)
        particle.drawAs(this.ctx, '#ff0000');
      } else if (insideBlackWindow) {
        // When entering the black window portal, particles turn white (transformation to sustainable tech)
        particle.drawAs(this.ctx, '#ffffff');
      } else {
        // Default state: black particles (people not yet converted)
        particle.draw(this.ctx);
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    
    // Bigger particles on mobile for better visibility
    if (window.innerWidth <= 768) {
      this.size = Math.random() * 3 + 2.5; // Bigger on mobile: 2.5-5.5px
    } else {
      this.size = Math.random() * 2 + 1.5; // Desktop: 1.5-3.5px
    }
    
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = (Math.random() - 0.5) * 0.8;
    this.baseSpeedX = this.speedX;
    this.baseSpeedY = this.speedY;
  }

  update(canvasWidth, canvasHeight, mouse, cubeCenter) {
    let forceX = 0;
    let forceY = 0;

    // Mouse repulsion - people avoid direct interference (pointer moves them away)
    if (mouse.x != null && mouse.y != null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius && distance > 0) {
        const force = (mouse.radius - distance) / mouse.radius;
        const directionX = dx / distance;
        const directionY = dy / distance;
        // Strong repulsion force to push particles away from mouse
        forceX += directionX * force * 4;
        forceY += directionY * force * 4;
      }
    }

    // Strong attraction to cube center - people drawn to sustainable technology
    const dxToCube = cubeCenter.x - this.x;
    const dyToCube = cubeCenter.y - this.y;
    const distanceToCube = Math.sqrt(dxToCube * dxToCube + dyToCube * dyToCube);

    if (distanceToCube > 0) {
      // Stronger attraction force - representing the pull of alternative technology
      const attractionStrength = 0.0012;
      const normalizedForceX = (dxToCube / distanceToCube) * attractionStrength * Math.min(distanceToCube, 200);
      const normalizedForceY = (dyToCube / distanceToCube) * attractionStrength * Math.min(distanceToCube, 200);
      
      forceX += normalizedForceX;
      forceY += normalizedForceY;
    }

    // Add some subtle randomness to simulate individual choice and movement
    forceX += (Math.random() - 0.5) * 0.02;
    forceY += (Math.random() - 0.5) * 0.02;

    this.speedX = this.baseSpeedX + forceX;
    this.speedY = this.baseSpeedY + forceY;
    
    // Damping to prevent excessive acceleration
    this.speedX *= 0.99;
    this.speedY *= 0.99;
    
    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce off edges with some energy loss
    if (this.x + this.size > canvasWidth || this.x - this.size < 0) {
      this.speedX = -this.speedX * 0.8;
      this.baseSpeedX = -this.baseSpeedX * 0.8;
      this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
    }
    if (this.y + this.size > canvasHeight || this.y - this.size < 0) {
      this.speedY = -this.speedY * 0.8;
      this.baseSpeedY = -this.baseSpeedY * 0.8;
      this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
    }
  }

  draw(ctx) {
    // Use a more visible color on mobile
    if (window.innerWidth <= 768) {
      ctx.fillStyle = '#000000'; // Pure black for mobile
      ctx.strokeStyle = '#333333'; // Add subtle border for visibility
      ctx.lineWidth = 0.5;
    } else {
      ctx.fillStyle = '#000000'; // Black for desktop
    }
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add border on mobile for better visibility
    if (window.innerWidth <= 768) {
      ctx.stroke();
    }
  }

  drawAs(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('particles-canvas');
});
