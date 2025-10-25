import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr.map(() => Math.floor(Math.random() * 256)),
  },
});

// Mock requestAnimationFrame and cancelAnimationFrame for sprite testing
let frameId = 0;
const callbacks: Map<number, FrameRequestCallback> = new Map();

global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  const id = ++frameId;
  callbacks.set(id, callback);
  return id;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  callbacks.delete(id);
});

// Mock performance.now for sprite animation testing
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
});

// Mock DOMMatrix for canvas transformations
global.DOMMatrix = class DOMMatrix {
  constructor() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};