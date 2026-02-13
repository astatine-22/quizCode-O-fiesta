// Particle class for fire effect
export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, streakLevel: number) {
    this.x = x;
    this.y = y;
    
    // Velocity based on streak level
    const intensity = streakLevel / 12;
    this.vx = (Math.random() - 0.5) * (2 + intensity * 3);
    this.vy = -Math.random() * (2 + intensity * 4);
    
    this.size = 2 + Math.random() * (3 + intensity * 5);
    this.opacity = 0.3 + intensity * 0.7;
    this.life = 0;
    this.maxLife = 60 + Math.random() * 60;
    
    // Color progression based on streak level
    this.color = this.getColorForLevel(streakLevel);
  }

  getColorForLevel(level: number): string {
    if (level <= 3) {
      // Orange ember
      return `rgba(255, ${120 + Math.random() * 50}, 0, ${this.opacity})`;
    } else if (level <= 6) {
      // Red-orange blaze
      return `rgba(255, ${60 + Math.random() * 80}, 0, ${this.opacity})`;
    } else if (level <= 9) {
      // Gold inferno
      return `rgba(255, ${180 + Math.random() * 75}, ${Math.random() * 50}, ${this.opacity})`;
    } else {
      // White-hot hellfire
      return `rgba(255, ${220 + Math.random() * 35}, ${150 + Math.random() * 105}, ${this.opacity})`;
    }
  }

  update(streakLevel: number) {
    this.x += this.vx;
    this.y += this.vy;
    
    // Add some drift and turbulence
    this.vx += (Math.random() - 0.5) * 0.5;
    this.vy -= 0.05; // Slight upward acceleration
    
    // Add physics bounce for inferno level
    if (streakLevel >= 7) {
      this.vx *= 0.98;
      this.vy *= 0.98;
    }
    
    this.life++;
    
    // Fade out near end of life
    const lifeRatio = this.life / this.maxLife;
    this.opacity = (1 - lifeRatio) * (0.3 + (streakLevel / 12) * 0.7);
  }

  draw(ctx: CanvasRenderingContext2D, streakLevel: number) {
    ctx.save();
    
    // Update color based on current level
    this.color = this.getColorForLevel(streakLevel);
    
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    // Draw glow for higher levels
    if (streakLevel >= 7) {
      ctx.shadowBlur = 10 + streakLevel;
      ctx.shadowColor = this.color;
    }
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  isDead(): boolean {
    return this.life >= this.maxLife;
  }
}

// Particle system manager
export class ParticleSystem {
  particles: Particle[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  streakLevel: number = 0;
  isActive: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setStreakLevel(level: number) {
    this.streakLevel = level;
  }

  setActive(active: boolean) {
    this.isActive = active;
  }

  getParticleCount(): number {
    // 50-150 particles based on streak level
    return Math.floor(50 + (this.streakLevel / 12) * 100);
  }

  spawnParticles() {
    const targetCount = this.getParticleCount();
    
    while (this.particles.length < targetCount) {
      // Spawn from bottom edge with some randomness
      const x = Math.random() * this.canvas.width;
      const y = this.canvas.height - Math.random() * 50;
      
      this.particles.push(new Particle(x, y, this.streakLevel));
    }
  }

  update() {
    if (!this.isActive) return;

    // Update existing particles
    this.particles.forEach(particle => {
      particle.update(this.streakLevel);
    });

    // Remove dead particles
    this.particles = this.particles.filter(p => !p.isDead());

    // Spawn new particles
    this.spawnParticles();
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all particles
    this.particles.forEach(particle => {
      particle.draw(this.ctx, this.streakLevel);
    });
  }

  getIntensity(): number {
    // Return normalized intensity value (0.0 to 1.0) for audio bridge
    return Math.min(this.streakLevel / 12, 1.0);
  }

  clear() {
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
