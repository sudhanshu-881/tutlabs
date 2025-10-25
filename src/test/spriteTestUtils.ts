import { vi } from 'vitest';

// Mock sprite data structure
export interface MockSprite {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  visible: boolean;
  animation?: {
    frames: number;
    currentFrame: number;
    duration: number;
    loop: boolean;
  };
}

// Mock sprite manager for testing
export class MockSpriteManager {
  private sprites: Map<string, MockSprite> = new Map();
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;

  constructor() {
    this.lastUpdateTime = performance.now();
  }

  createSprite(id: string, config: Partial<MockSprite> = {}): MockSprite {
    const sprite: MockSprite = {
      id,
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      rotation: 0,
      scale: 1,
      opacity: 1,
      visible: true,
      ...config,
    };
    this.sprites.set(id, sprite);
    return sprite;
  }

  getSprite(id: string): MockSprite | undefined {
    return this.sprites.get(id);
  }

  updateSprite(id: string, updates: Partial<MockSprite>): boolean {
    const sprite = this.sprites.get(id);
    if (!sprite) return false;
    
    Object.assign(sprite, updates);
    return true;
  }

  removeSprite(id: string): boolean {
    return this.sprites.delete(id);
  }

  getAllSprites(): MockSprite[] {
    return Array.from(this.sprites.values());
  }

  startAnimation(): void {
    if (this.animationFrameId) return;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - this.lastUpdateTime;
      this.updateAnimations(deltaTime);
      this.lastUpdateTime = currentTime;
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateAnimations(deltaTime: number): void {
    this.sprites.forEach(sprite => {
      if (sprite.animation) {
        const { frames, duration, loop } = sprite.animation;
        const frameDuration = duration / frames;
        
        sprite.animation.currentFrame += deltaTime / frameDuration;
        
        if (sprite.animation.currentFrame >= frames) {
          if (loop) {
            sprite.animation.currentFrame = 0;
          } else {
            sprite.animation.currentFrame = frames - 1;
          }
        }
      }
    });
  }

  // Collision detection utilities
  checkCollision(sprite1Id: string, sprite2Id: string): boolean {
    const sprite1 = this.sprites.get(sprite1Id);
    const sprite2 = this.sprites.get(sprite2Id);
    
    if (!sprite1 || !sprite2) return false;
    
    return (
      sprite1.x < sprite2.x + sprite2.width &&
      sprite1.x + sprite1.width > sprite2.x &&
      sprite1.y < sprite2.y + sprite2.height &&
      sprite1.y + sprite1.height > sprite2.y
    );
  }

  // Performance testing utilities
  measurePerformance(operation: () => void, iterations: number = 1000): {
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  } {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((a, b) => a + b, 0),
    };
  }
}

// Mock canvas context for sprite rendering tests
export class MockCanvasContext {
  public operations: string[] = [];
  public fillStyle: string = '#000000';
  public strokeStyle: string = '#000000';
  public lineWidth: number = 1;
  public globalAlpha: number = 1;
  public transform: DOMMatrix = new DOMMatrix();

  clearRect(x: number, y: number, width: number, height: number): void {
    this.operations.push(`clearRect(${x}, ${y}, ${width}, ${height})`);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.operations.push(`fillRect(${x}, ${y}, ${width}, ${height})`);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.operations.push(`strokeRect(${x}, ${y}, ${width}, ${height})`);
  }

  drawImage(image: any, x: number, y: number, width?: number, height?: number): void {
    this.operations.push(`drawImage(${x}, ${y}, ${width || 'auto'}, ${height || 'auto'})`);
  }

  save(): void {
    this.operations.push('save()');
  }

  restore(): void {
    this.operations.push('restore()');
  }

  translate(x: number, y: number): void {
    this.operations.push(`translate(${x}, ${y})`);
  }

  rotate(angle: number): void {
    this.operations.push(`rotate(${angle})`);
  }

  scale(x: number, y: number): void {
    this.operations.push(`scale(${x}, ${y})`);
  }

  beginPath(): void {
    this.operations.push('beginPath()');
  }

  closePath(): void {
    this.operations.push('closePath()');
  }

  fill(): void {
    this.operations.push('fill()');
  }

  stroke(): void {
    this.operations.push('stroke()');
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
    this.operations.push(`arc(${x}, ${y}, ${radius}, ${startAngle}, ${endAngle})`);
  }

  // Reset operations for clean testing
  reset(): void {
    this.operations = [];
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.transform = new DOMMatrix();
  }
}

// Mock canvas element
export class MockCanvas {
  public width: number = 800;
  public height: number = 600;
  public context: MockCanvasContext;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
    this.context = new MockCanvasContext();
  }

  getContext(contextType: string): MockCanvasContext | null {
    if (contextType === '2d') {
      return this.context;
    }
    return null;
  }

  toDataURL(): string {
    return 'data:image/png;base64,mock-image-data';
  }
}

// Sprite renderer for testing
export class SpriteRenderer {
  private canvas: MockCanvas;
  private context: MockCanvasContext;

  constructor(canvas: MockCanvas) {
    this.canvas = canvas;
    this.context = canvas.context;
  }

  renderSprite(sprite: MockSprite): void {
    if (!sprite.visible) return;

    this.context.save();
    
    // Apply transformations
    this.context.globalAlpha = sprite.opacity;
    this.context.translate(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    this.context.rotate(sprite.rotation);
    this.context.scale(sprite.scale, sprite.scale);
    
    // Draw sprite (mock rectangle for testing)
    this.context.fillStyle = `hsl(${sprite.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`;
    this.context.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
    
    // Draw animation frame indicator if animated
    if (sprite.animation) {
      const frameWidth = sprite.width / sprite.animation.frames;
      const currentFrameX = -sprite.width / 2 + (sprite.animation.currentFrame * frameWidth);
      this.context.fillStyle = '#ffffff';
      this.context.fillRect(currentFrameX, -sprite.height / 2, frameWidth, 4);
    }
    
    this.context.restore();
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getRenderOperations(): string[] {
    return [...this.context.operations];
  }
}

// Test utilities for sprite functionality
export const spriteTestUtils = {
  createTestSprite: (id: string = 'test-sprite'): MockSprite => ({
    id,
    x: 100,
    y: 100,
    width: 64,
    height: 64,
    rotation: 0,
    scale: 1,
    opacity: 1,
    visible: true,
  }),

  createAnimatedSprite: (id: string = 'animated-sprite'): MockSprite => ({
    id,
    x: 200,
    y: 200,
    width: 32,
    height: 32,
    rotation: 0,
    scale: 1,
    opacity: 1,
    visible: true,
    animation: {
      frames: 4,
      currentFrame: 0,
      duration: 1000,
      loop: true,
    },
  }),

  // Mock requestAnimationFrame for testing
  mockRequestAnimationFrame: () => {
    let frameId = 0;
    const callbacks: Map<number, FrameRequestCallback> = new Map();
    
    const mockRAF = vi.fn((callback: FrameRequestCallback) => {
      const id = ++frameId;
      callbacks.set(id, callback);
      return id;
    });
    
    const mockCAF = vi.fn((id: number) => {
      callbacks.delete(id);
    });
    
    // Mock global functions
    global.requestAnimationFrame = mockRAF as any;
    global.cancelAnimationFrame = mockCAF as any;
    
    return {
      requestAnimationFrame: mockRAF,
      cancelAnimationFrame: mockCAF,
      triggerFrame: (id: number) => {
        const callback = callbacks.get(id);
        if (callback) {
          callback(performance.now());
        }
      },
      triggerAllFrames: () => {
        callbacks.forEach((callback) => {
          callback(performance.now());
        });
      },
    };
  },

  // Performance testing helpers
  measureSpriteOperation: (operation: () => void, iterations: number = 1000) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((a, b) => a + b, 0),
      times,
    };
  },
};

