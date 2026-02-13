// Confetti particle system for win celebrations
export class ConfettiParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    gravity: number = 0.5;
    life: number = 0;
    maxLife: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        // Explosion pattern - particles shoot outward
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 5; // Bias upward

        this.size = 4 + Math.random() * 8;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.maxLife = 60 + Math.random() * 60;

        // Gold/rainbow colors
        const colors = [
            '#FFD700', // Gold
            '#FFA500', // Orange
            '#FF69B4', // Pink
            '#00CED1', // Cyan
            '#9370DB', // Purple
            '#32CD32', // Green
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98; // Air resistance
        this.rotation += this.rotationSpeed;
        this.life++;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        const opacity = 1 - (this.life / this.maxLife);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;

        // Draw rectangle confetti
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.restore();
    }

    isDead(): boolean {
        return this.life >= this.maxLife || this.y > window.innerHeight + 50;
    }
}

export class ConfettiSystem {
    particles: ConfettiParticle[] = [];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    animationFrame?: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    explode(x: number, y: number, count: number = 50) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new ConfettiParticle(x, y));
        }
    }

    update() {
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    animate() {
        this.update();
        this.draw();

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }

    start() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    clear() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
