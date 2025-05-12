import "@testing-library/jest-dom";
import { vi, expect, afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Rozszerzenie asercji Vitest o matchers z jest-dom
expect.extend(matchers);

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Wyciszanie ostrzeżeń React dla testów
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: useLayoutEffect does nothing on the server/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock dla window.fetch
Object.defineProperty(window, "fetch", {
  value: vi.fn(),
  writable: true,
});

// Mock dla localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
