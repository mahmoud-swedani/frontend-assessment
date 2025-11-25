/**
 * Lightweight Particle System
 * Performance-optimized particle engine for ambient effects
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface ParticleConfig {
  count: number;
  speed: number;
  size: { min: number; max: number };
  opacity: { min: number; max: number };
  colors: string[];
  bounds: { width: number; height: number };
  interactive?: boolean;
  mouseX?: number;
  mouseY?: number;
}

const defaultColors = [
  'oklch(0.7 0.12 15)',
  'oklch(0.75 0.1 320)',
  'oklch(0.8 0.08 25)',
  'oklch(0.85 0.05 60)',
];

export function createParticle(config: ParticleConfig): Particle {
  const { size, opacity, colors, bounds } = config;
  
  return {
    x: Math.random() * bounds.width,
    y: Math.random() * bounds.height,
    vx: (Math.random() - 0.5) * config.speed,
    vy: (Math.random() - 0.5) * config.speed,
    size: size.min + Math.random() * (size.max - size.min),
    opacity: opacity.min + Math.random() * (opacity.max - opacity.min),
    color: (colors[Math.floor(Math.random() * colors.length)] ?? colors[0]) as string,
    life: 0,
    maxLife: 1000 + Math.random() * 2000,
  };
}

export function updateParticle(
  particle: Particle,
  config: ParticleConfig,
  deltaTime: number
): Particle {
  const { bounds, interactive, mouseX, mouseY } = config;
  
  // Update position
  let newX = particle.x + particle.vx * deltaTime;
  let newY = particle.y + particle.vy * deltaTime;
  
  // Interactive attraction to mouse
  if (interactive && mouseX !== undefined && mouseY !== undefined) {
    const dx = mouseX - particle.x;
    const dy = mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150;
    
    if (distance < maxDistance && distance > 0) {
      const force = (1 - distance / maxDistance) * 0.02;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
    }
  }
  
  // Boundary wrapping
  if (newX < 0) newX = bounds.width;
  if (newX > bounds.width) newX = 0;
  if (newY < 0) newY = bounds.height;
  if (newY > bounds.height) newY = 0;
  
  // Apply damping
  particle.vx *= 0.98;
  particle.vy *= 0.98;
  
  // Update life
  const newLife = particle.life + deltaTime;
  
  return {
    ...particle,
    x: newX,
    y: newY,
    life: newLife,
    opacity: particle.opacity * (1 - newLife / particle.maxLife),
  };
}

export function createParticleSystem(config: ParticleConfig): Particle[] {
  return Array.from({ length: config.count }, () => createParticle(config));
}

export function updateParticleSystem(
  particles: Particle[],
  config: ParticleConfig,
  deltaTime: number
): Particle[] {
  return particles.map(particle => {
    if (particle.life >= particle.maxLife) {
      return createParticle(config);
    }
    return updateParticle(particle, config, deltaTime);
  });
}

