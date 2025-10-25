import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MockSpriteManager,
  MockCanvas,
  SpriteRenderer,
  spriteTestUtils,
  MockSprite,
} from './spriteTestUtils';

describe('Sprite Testing Suite', () => {
  let spriteManager: MockSpriteManager;
  let canvas: MockCanvas;
  let renderer: SpriteRenderer;
  let mockRAF: ReturnType<typeof spriteTestUtils.mockRequestAnimationFrame>;

  beforeEach(() => {
    spriteManager = new MockSpriteManager();
    canvas = new MockCanvas(800, 600);
    renderer = new SpriteRenderer(canvas);
    mockRAF = spriteTestUtils.mockRequestAnimationFrame();
  });

  afterEach(() => {
    spriteManager.stopAnimation();
    mockRAF.cancelAnimationFrame(1);
  });

  describe('Sprite Management', () => {
    it('should create and retrieve sprites', () => {
      const sprite = spriteManager.createSprite('test-sprite', {
        x: 100,
        y: 100,
        width: 64,
        height: 64,
      });

      expect(sprite.id).toBe('test-sprite');
      expect(sprite.x).toBe(100);
      expect(sprite.y).toBe(100);
      expect(sprite.width).toBe(64);
      expect(sprite.height).toBe(64);

      const retrievedSprite = spriteManager.getSprite('test-sprite');
      expect(retrievedSprite).toEqual(sprite);
    });

    it('should update sprite properties', () => {
      spriteManager.createSprite('test-sprite');
      
      const updated = spriteManager.updateSprite('test-sprite', {
        x: 200,
        y: 300,
        rotation: Math.PI / 4,
        scale: 1.5,
        opacity: 0.8,
      });

      expect(updated).toBe(true);
      
      const sprite = spriteManager.getSprite('test-sprite');
      expect(sprite?.x).toBe(200);
      expect(sprite?.y).toBe(300);
      expect(sprite?.rotation).toBe(Math.PI / 4);
      expect(sprite?.scale).toBe(1.5);
      expect(sprite?.opacity).toBe(0.8);
    });

    it('should remove sprites', () => {
      spriteManager.createSprite('test-sprite');
      expect(spriteManager.getSprite('test-sprite')).toBeDefined();

      const removed = spriteManager.removeSprite('test-sprite');
      expect(removed).toBe(true);
      expect(spriteManager.getSprite('test-sprite')).toBeUndefined();
    });

    it('should handle non-existent sprite operations gracefully', () => {
      expect(spriteManager.updateSprite('non-existent', { x: 100 })).toBe(false);
      expect(spriteManager.removeSprite('non-existent')).toBe(false);
      expect(spriteManager.getSprite('non-existent')).toBeUndefined();
    });
  });

  describe('Sprite Animation', () => {
    it('should create animated sprites', () => {
      const animatedSprite = spriteTestUtils.createAnimatedSprite('animated-test');
      
      expect(animatedSprite.animation).toBeDefined();
      expect(animatedSprite.animation?.frames).toBe(4);
      expect(animatedSprite.animation?.currentFrame).toBe(0);
      expect(animatedSprite.animation?.duration).toBe(1000);
      expect(animatedSprite.animation?.loop).toBe(true);
    });

    it('should update animation frames', () => {
      const sprite = spriteTestUtils.createAnimatedSprite('animated-test');
      spriteManager.createSprite(sprite.id, sprite);

      spriteManager.startAnimation();
      
      // Simulate time passing
      const frameDuration = sprite.animation!.duration / sprite.animation!.frames;
      mockRAF.triggerFrame(1);

      const updatedSprite = spriteManager.getSprite('animated-test');
      expect(updatedSprite?.animation?.currentFrame).toBeGreaterThan(0);
    });

    it('should handle animation looping', () => {
      const sprite = spriteTestUtils.createAnimatedSprite('looping-test');
      sprite.animation!.currentFrame = 3; // Last frame
      spriteManager.createSprite(sprite.id, sprite);

      spriteManager.startAnimation();
      
      // Simulate enough time to complete one cycle
      const frameDuration = sprite.animation!.duration / sprite.animation!.frames;
      mockRAF.triggerFrame(1);

      const updatedSprite = spriteManager.getSprite('looping-test');
      // Should loop back to frame 0
      expect(updatedSprite?.animation?.currentFrame).toBeLessThan(sprite.animation!.frames);
    });

    it('should stop animation when requested', () => {
      spriteManager.startAnimation();
      expect(mockRAF.requestAnimationFrame).toHaveBeenCalled();

      spriteManager.stopAnimation();
      expect(mockRAF.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Sprite Rendering', () => {
    it('should render sprites to canvas', () => {
      const sprite = spriteTestUtils.createTestSprite('render-test');
      spriteManager.createSprite(sprite.id, sprite);

      renderer.clear();
      renderer.renderSprite(sprite);

      const operations = renderer.getRenderOperations();
      expect(operations).toContain('save()');
      expect(operations).toContain('restore()');
      expect(operations).toContain(`translate(${sprite.x + sprite.width / 2}, ${sprite.y + sprite.height / 2})`);
      expect(operations).toContain(`fillRect(-${sprite.width / 2}, -${sprite.height / 2}, ${sprite.width}, ${sprite.height})`);
    });

    it('should not render invisible sprites', () => {
      const sprite = spriteTestUtils.createTestSprite('invisible-test');
      sprite.visible = false;
      spriteManager.createSprite(sprite.id, sprite);

      renderer.clear();
      renderer.renderSprite(sprite);

      const operations = renderer.getRenderOperations();
      expect(operations).not.toContain('save()');
    });

    it('should apply sprite transformations correctly', () => {
      const sprite = spriteTestUtils.createTestSprite('transform-test');
      sprite.x = 100;
      sprite.y = 100;
      sprite.rotation = Math.PI / 4;
      sprite.scale = 2;
      sprite.opacity = 0.5;

      renderer.clear();
      renderer.renderSprite(sprite);

      const operations = renderer.getRenderOperations();
      expect(operations).toContain(`translate(${sprite.x + sprite.width / 2}, ${sprite.y + sprite.height / 2})`);
      expect(operations).toContain(`rotate(${sprite.rotation})`);
      expect(operations).toContain(`scale(${sprite.scale}, ${sprite.scale})`);
    });

    it('should render animation frame indicators', () => {
      const sprite = spriteTestUtils.createAnimatedSprite('frame-indicator-test');
      spriteManager.createSprite(sprite.id, sprite);

      renderer.clear();
      renderer.renderSprite(sprite);

      const operations = renderer.getRenderOperations();
      expect(operations).toContain('fillRect('); // Should contain frame indicator
    });
  });

  describe('Collision Detection', () => {
    it('should detect sprite collisions', () => {
      const sprite1 = spriteTestUtils.createTestSprite('collision-1');
      sprite1.x = 100;
      sprite1.y = 100;
      sprite1.width = 50;
      sprite1.height = 50;

      const sprite2 = spriteTestUtils.createTestSprite('collision-2');
      sprite2.x = 120;
      sprite2.y = 120;
      sprite2.width = 50;
      sprite2.height = 50;

      spriteManager.createSprite(sprite1.id, sprite1);
      spriteManager.createSprite(sprite2.id, sprite2);

      expect(spriteManager.checkCollision('collision-1', 'collision-2')).toBe(true);
    });

    it('should not detect collision for non-overlapping sprites', () => {
      const sprite1 = spriteTestUtils.createTestSprite('no-collision-1');
      sprite1.x = 100;
      sprite1.y = 100;
      sprite1.width = 50;
      sprite1.height = 50;

      const sprite2 = spriteTestUtils.createTestSprite('no-collision-2');
      sprite2.x = 200;
      sprite2.y = 200;
      sprite2.width = 50;
      sprite2.height = 50;

      spriteManager.createSprite(sprite1.id, sprite1);
      spriteManager.createSprite(sprite2.id, sprite2);

      expect(spriteManager.checkCollision('no-collision-1', 'no-collision-2')).toBe(false);
    });

    it('should handle collision detection with non-existent sprites', () => {
      spriteManager.createSprite('existing-sprite', spriteTestUtils.createTestSprite('existing-sprite'));
      
      expect(spriteManager.checkCollision('existing-sprite', 'non-existent')).toBe(false);
      expect(spriteManager.checkCollision('non-existent', 'existing-sprite')).toBe(false);
      expect(spriteManager.checkCollision('non-existent-1', 'non-existent-2')).toBe(false);
    });
  });

  describe('Performance Testing', () => {
    it('should measure sprite creation performance', () => {
      const performance = spriteManager.measurePerformance(() => {
        spriteManager.createSprite(`perf-test-${Math.random()}`, {
          x: Math.random() * 800,
          y: Math.random() * 600,
          width: 32,
          height: 32,
        });
      }, 1000);

      expect(performance.averageTime).toBeGreaterThan(0);
      expect(performance.totalTime).toBeGreaterThan(0);
      expect(performance.minTime).toBeGreaterThanOrEqual(0);
      expect(performance.maxTime).toBeGreaterThan(0);
    });

    it('should measure sprite rendering performance', () => {
      const sprite = spriteTestUtils.createTestSprite('render-perf-test');
      
      const performance = spriteTestUtils.measureSpriteOperation(() => {
        renderer.renderSprite(sprite);
      }, 1000);

      expect(performance.averageTime).toBeGreaterThan(0);
      expect(performance.totalTime).toBeGreaterThan(0);
    });

    it('should measure collision detection performance', () => {
      // Create multiple sprites for collision testing
      for (let i = 0; i < 100; i++) {
        spriteManager.createSprite(`collision-perf-${i}`, {
          x: Math.random() * 800,
          y: Math.random() * 600,
          width: 32,
          height: 32,
        });
      }

      const performance = spriteManager.measurePerformance(() => {
        spriteManager.checkCollision('collision-perf-0', 'collision-perf-1');
      }, 1000);

      expect(performance.averageTime).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero-sized sprites', () => {
      const sprite = spriteTestUtils.createTestSprite('zero-size');
      sprite.width = 0;
      sprite.height = 0;

      spriteManager.createSprite(sprite.id, sprite);
      
      // Should not crash
      expect(spriteManager.getSprite('zero-size')).toBeDefined();
      expect(spriteManager.checkCollision('zero-size', 'zero-size')).toBe(false);
    });

    it('should handle negative sprite dimensions', () => {
      const sprite = spriteTestUtils.createTestSprite('negative-size');
      sprite.width = -32;
      sprite.height = -32;

      spriteManager.createSprite(sprite.id, sprite);
      
      // Should handle gracefully
      expect(spriteManager.getSprite('negative-size')).toBeDefined();
    });

    it('should handle extreme sprite positions', () => {
      const sprite = spriteTestUtils.createTestSprite('extreme-pos');
      sprite.x = Number.MAX_SAFE_INTEGER;
      sprite.y = Number.MIN_SAFE_INTEGER;

      spriteManager.createSprite(sprite.id, sprite);
      
      expect(spriteManager.getSprite('extreme-pos')).toBeDefined();
    });

    it('should handle invalid animation parameters', () => {
      const sprite = spriteTestUtils.createTestSprite('invalid-anim');
      sprite.animation = {
        frames: 0,
        currentFrame: -1,
        duration: -1000,
        loop: true,
      };

      spriteManager.createSprite(sprite.id, sprite);
      
      // Should not crash during animation updates
      spriteManager.startAnimation();
      mockRAF.triggerFrame(1);
      
      expect(spriteManager.getSprite('invalid-anim')).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex sprite scenarios', () => {
      // Create multiple sprites with different properties
      const sprites = [
        spriteTestUtils.createTestSprite('static-sprite'),
        spriteTestUtils.createAnimatedSprite('animated-sprite'),
        spriteTestUtils.createTestSprite('collision-sprite-1'),
        spriteTestUtils.createTestSprite('collision-sprite-2'),
      ];

      // Configure sprites
      sprites[0].x = 50;
      sprites[0].y = 50;
      sprites[1].x = 200;
      sprites[1].y = 200;
      sprites[2].x = 300;
      sprites[2].y = 300;
      sprites[3].x = 320;
      sprites[3].y = 320;

      // Add all sprites to manager
      sprites.forEach(sprite => spriteManager.createSprite(sprite.id, sprite));

      // Start animation
      spriteManager.startAnimation();

      // Render all sprites
      renderer.clear();
      sprites.forEach(sprite => renderer.renderSprite(sprite));

      // Check collision between overlapping sprites
      const hasCollision = spriteManager.checkCollision('collision-sprite-1', 'collision-sprite-2');
      expect(hasCollision).toBe(true);

      // Verify all sprites exist
      sprites.forEach(sprite => {
        expect(spriteManager.getSprite(sprite.id)).toBeDefined();
      });

      // Verify rendering operations occurred
      const operations = renderer.getRenderOperations();
      expect(operations.length).toBeGreaterThan(0);
    });

    it('should maintain sprite state consistency', () => {
      const sprite = spriteTestUtils.createTestSprite('consistency-test');
      spriteManager.createSprite(sprite.id, sprite);

      // Update sprite multiple times
      for (let i = 0; i < 10; i++) {
        spriteManager.updateSprite(sprite.id, {
          x: i * 10,
          y: i * 10,
          rotation: i * 0.1,
        });
      }

      const finalSprite = spriteManager.getSprite(sprite.id);
      expect(finalSprite?.x).toBe(90);
      expect(finalSprite?.y).toBe(90);
      expect(finalSprite?.rotation).toBe(0.9);
    });
  });
});

