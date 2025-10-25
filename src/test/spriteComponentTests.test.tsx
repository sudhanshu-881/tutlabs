import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

// Mock sprite component for testing
interface SpriteComponentProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  visible?: boolean;
  animated?: boolean;
  onClick?: () => void;
  onAnimationComplete?: () => void;
}

const SpriteComponent: React.FC<SpriteComponentProps> = ({
  id,
  x,
  y,
  width,
  height,
  rotation = 0,
  scale = 1,
  opacity = 1,
  visible = true,
  animated = false,
  onClick,
  onAnimationComplete,
}) => {
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(animated);

  React.useEffect(() => {
    if (animated && isAnimating) {
      const interval = setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = prev + 1;
          if (nextFrame >= 4) { // 4 frames animation
            setIsAnimating(false);
            onAnimationComplete?.();
            return 0;
          }
          return nextFrame;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [animated, isAnimating, onAnimationComplete]);

  if (!visible) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    height,
    transform: `rotate(${rotation}rad) scale(${scale})`,
    opacity,
    backgroundColor: `hsl(${id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: animated ? 'all 0.1s ease' : 'none',
  };

  return (
    <div
      data-testid={`sprite-${id}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={`Sprite ${id}`}
    >
      {animated && (
        <div
          data-testid={`sprite-frame-${id}`}
          style={{
            position: 'absolute',
            top: 0,
            left: `${currentFrame * 25}%`,
            width: '25%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />
      )}
    </div>
  );
};

// Sprite manager hook for testing
const useSpriteManager = () => {
  const [sprites, setSprites] = React.useState<Map<string, SpriteComponentProps>>(new Map());

  const createSprite = React.useCallback((id: string, props: Partial<SpriteComponentProps>) => {
    setSprites(prev => {
      const newSprites = new Map(prev);
      newSprites.set(id, {
        id,
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        ...props,
      });
      return newSprites;
    });
  }, []);

  const updateSprite = React.useCallback((id: string, updates: Partial<SpriteComponentProps>) => {
    setSprites(prev => {
      const newSprites = new Map(prev);
      const sprite = newSprites.get(id);
      if (sprite) {
        newSprites.set(id, { ...sprite, ...updates });
      }
      return newSprites;
    });
  }, []);

  const removeSprite = React.useCallback((id: string) => {
    setSprites(prev => {
      const newSprites = new Map(prev);
      newSprites.delete(id);
      return newSprites;
    });
  }, []);

  const getSprite = React.useCallback((id: string) => {
    return sprites.get(id);
  }, [sprites]);

  return {
    sprites: Array.from(sprites.values()),
    createSprite,
    updateSprite,
    removeSprite,
    getSprite,
  };
};

// Test wrapper component
const SpriteTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '800px', height: '600px' }}>
      {children}
    </div>
  );
};

describe('Sprite Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Sprite Rendering', () => {
    it('should render a basic sprite', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent id="test-sprite" x={100} y={100} width={64} height={64} />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-test-sprite');
      expect(sprite).toBeInTheDocument();
      expect(sprite).toHaveStyle({
        left: '100px',
        top: '100px',
        width: '64px',
        height: '64px',
      });
    });

    it('should not render invisible sprites', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="invisible-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64} 
            visible={false} 
          />
        </SpriteTestWrapper>
      );

      expect(screen.queryByTestId('sprite-invisible-sprite')).not.toBeInTheDocument();
    });

    it('should apply transformations correctly', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="transformed-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
            rotation={Math.PI / 4}
            scale={1.5}
            opacity={0.8}
          />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-transformed-sprite');
      expect(sprite).toHaveStyle({
        transform: `rotate(${Math.PI / 4}rad) scale(1.5)`,
        opacity: '0.8',
      });
    });
  });

  describe('Sprite Interactions', () => {
    it('should handle click events', () => {
      const onClick = vi.fn();
      
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="clickable-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
            onClick={onClick}
          />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-clickable-sprite');
      expect(sprite).toHaveAttribute('role', 'button');
      expect(sprite).toHaveStyle({ cursor: 'pointer' });

      fireEvent.click(sprite);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable without onClick handler', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="non-clickable-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
          />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-non-clickable-sprite');
      expect(sprite).toHaveAttribute('role', 'img');
      expect(sprite).toHaveStyle({ cursor: 'default' });
    });
  });

  describe('Sprite Animation', () => {
    it('should animate sprites when animated prop is true', async () => {
      const onAnimationComplete = vi.fn();
      
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="animated-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
            animated={true}
            onAnimationComplete={onAnimationComplete}
          />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-animated-sprite');
      const frameIndicator = screen.getByTestId('sprite-frame-animated-sprite');
      
      expect(sprite).toBeInTheDocument();
      expect(frameIndicator).toBeInTheDocument();

      // Wait for animation to complete
      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should not animate when animated prop is false', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="static-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
            animated={false}
          />
        </SpriteTestWrapper>
      );

      expect(screen.queryByTestId('sprite-frame-static-sprite')).not.toBeInTheDocument();
    });
  });

  describe('Sprite Manager Hook', () => {
    const SpriteManagerTest: React.FC = () => {
      const { sprites, createSprite, updateSprite, removeSprite } = useSpriteManager();

      return (
        <div>
          <button onClick={() => createSprite('test-sprite', { x: 100, y: 100 })}>
            Create Sprite
          </button>
          <button onClick={() => updateSprite('test-sprite', { x: 200, y: 200 })}>
            Update Sprite
          </button>
          <button onClick={() => removeSprite('test-sprite')}>
            Remove Sprite
          </button>
          
          {sprites.map(sprite => (
            <SpriteComponent key={sprite.id} {...sprite} />
          ))}
        </div>
      );
    };

    it('should create sprites through manager', () => {
      render(
        <SpriteTestWrapper>
          <SpriteManagerTest />
        </SpriteTestWrapper>
      );

      const createButton = screen.getByText('Create Sprite');
      fireEvent.click(createButton);

      expect(screen.getByTestId('sprite-test-sprite')).toBeInTheDocument();
    });

    it('should update sprites through manager', () => {
      render(
        <SpriteTestWrapper>
          <SpriteManagerTest />
        </SpriteTestWrapper>
      );

      // Create sprite first
      fireEvent.click(screen.getByText('Create Sprite'));
      
      const sprite = screen.getByTestId('sprite-test-sprite');
      expect(sprite).toHaveStyle({ left: '100px', top: '100px' });

      // Update sprite
      fireEvent.click(screen.getByText('Update Sprite'));
      
      expect(sprite).toHaveStyle({ left: '200px', top: '200px' });
    });

    it('should remove sprites through manager', () => {
      render(
        <SpriteTestWrapper>
          <SpriteManagerTest />
        </SpriteTestWrapper>
      );

      // Create sprite first
      fireEvent.click(screen.getByText('Create Sprite'));
      expect(screen.getByTestId('sprite-test-sprite')).toBeInTheDocument();

      // Remove sprite
      fireEvent.click(screen.getByText('Remove Sprite'));
      expect(screen.queryByTestId('sprite-test-sprite')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent id="accessible-sprite" x={100} y={100} width={64} height={64} />
        </SpriteTestWrapper>
      );

      const sprite = screen.getByTestId('sprite-accessible-sprite');
      expect(sprite).toHaveAttribute('aria-label', 'Sprite accessible-sprite');
    });

    it('should have proper role attributes', () => {
      render(
        <SpriteTestWrapper>
          <SpriteComponent 
            id="clickable-sprite" 
            x={100} 
            y={100} 
            width={64} 
            height={64}
            onClick={() => {}}
          />
          <SpriteComponent 
            id="static-sprite" 
            x={200} 
            y={200} 
            width={64} 
            height={64}
          />
        </SpriteTestWrapper>
      );

      expect(screen.getByTestId('sprite-clickable-sprite')).toHaveAttribute('role', 'button');
      expect(screen.getByTestId('sprite-static-sprite')).toHaveAttribute('role', 'img');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle multiple sprites efficiently', () => {
      const MultipleSpritesTest: React.FC = () => {
        const sprites = Array.from({ length: 100 }, (_, i) => ({
          id: `sprite-${i}`,
          x: (i % 10) * 80,
          y: Math.floor(i / 10) * 60,
          width: 64,
          height: 64,
        }));

        return (
          <div>
            {sprites.map(sprite => (
              <SpriteComponent key={sprite.id} {...sprite} />
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      render(
        <SpriteTestWrapper>
          <MultipleSpritesTest />
        </SpriteTestWrapper>
      );
      const endTime = performance.now();

      // Should render 100 sprites quickly
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Verify all sprites are rendered
      for (let i = 0; i < 100; i++) {
        expect(screen.getByTestId(`sprite-sprite-${i}`)).toBeInTheDocument();
      }
    });
  });
});

