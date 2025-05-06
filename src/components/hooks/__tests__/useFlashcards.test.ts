import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlashcards } from '../useFlashcards';
import type { FlashcardDTO, FlashcardsListDTO, CreateFlashcardCommand } from '@/types';

// Mock data
const mockUserId = 'test-user-123';
const mockFlashcard: FlashcardDTO = {
  id: 1,
  user_id: mockUserId,
  front: 'Test front',
  back: 'Test back',
  source: 'manual',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  generated_id: null
};

const mockFlashcardsResponse: FlashcardsListDTO = {
  data: [mockFlashcard],
  pagination: {
    page: 1,
    limit: 10,
    total: 1
  }
};

// Setup fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useFlashcards', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFlashcards', () => {
    it('powinien załadować fiszki poprawnie', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
      });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.loadFlashcards();
      });

      expect(result.current.flashcards).toEqual(mockFlashcardsResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('powinien obsłużyć błąd podczas ładowania', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.loadFlashcards();
      });

      expect(result.current.error).toBe('Wystąpił błąd podczas pobierania fiszek');
      expect(result.current.isLoading).toBe(false);
    });

    it('powinien wysłać poprawne parametry paginacji', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
      });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.loadFlashcards(2, 20);
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
    });

    it('powinien ustawić isLoading na true podczas ładowania', async () => {
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockImplementationOnce(() => loadingPromise);
      
      const { result } = renderHook(() => useFlashcards(mockUserId));
      
      const loadPromise = result.current.loadFlashcards();
      
      // Czekamy na następny tick, żeby hook zdążył zaktualizować stan
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.isLoading).toBe(true);
      
      // Kończymy ładowanie
      resolvePromise!({
        ok: true,
        json: async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } })
      });
      
      await act(async () => {
        await loadPromise;
      });
    });

    it('powinien obsłużyć pustą odpowiedź', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: [], 
          meta: { page: 1, limit: 10, total: 0 } 
        })
      });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.loadFlashcards();
      });

      expect(result.current.flashcards?.data).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createFlashcard', () => {
    const newFlashcard: CreateFlashcardCommand = {
      front: 'New front',
      back: 'New back',
      source: 'manual'
    };

    it('powinien utworzyć nową fiszkę', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true }) // dla create
        .mockResolvedValueOnce({ 
          ok: true, 
          json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
        }); // dla reload

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.createFlashcard(newFlashcard);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards', expect.any(Object));
      expect(mockFetch).toHaveBeenCalledTimes(2); // create + reload
    });

    it('powinien obsłużyć błąd podczas tworzenia', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        try {
          await result.current.createFlashcard(newFlashcard);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Wystąpił błąd podczas tworzenia fiszki');
    });

    it('powinien wysłać poprawne dane w body requestu', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useFlashcards(mockUserId));

      await act(async () => {
        await result.current.createFlashcard(newFlashcard);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/flashcards',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFlashcard)
        })
      );
    });
  });

  describe('updateFlashcard', () => {
    it('powinien zaktualizować fiszkę', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true }) // dla update
        .mockResolvedValueOnce({ 
          ok: true, 
          json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
        }); // dla reload

      const { result } = renderHook(() => useFlashcards(mockUserId));

      // Najpierw załaduj fiszki
      await act(async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
        });
        await result.current.loadFlashcards();
      });

      await act(async () => {
        await result.current.updateFlashcard(1, { front: 'Updated front' });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/1', expect.any(Object));
    });

    it('powinien obsłużyć błąd podczas aktualizacji', async () => {
      const { result } = renderHook(() => useFlashcards(mockUserId));
      
      // 1. Przygotowujemy poprawne załadowanie fiszek
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: [mockFlashcard], 
          meta: { page: 1, limit: 10, total: 1 } 
        })
      });
      
      // Ładujemy dane
      await act(async () => {
        await result.current.loadFlashcards();
      });

      // Sprawdzamy czy dane zostały załadowane
      expect(result.current.flashcards).not.toBeNull();
      expect(result.current.error).toBeNull();
      
      // Resetujemy mockFetch dla następnej operacji
      mockFetch.mockReset();

      // 2. Przygotowujemy błędną odpowiedź dla aktualizacji
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      // Próba aktualizacji fiszki
      await act(async () => {
        try {
          await result.current.updateFlashcard(1, { front: 'Updated front' });
          // Jeśli dochodzimy tutaj, to test powinien nie przejść
          expect('Test powinien wyrzucić błąd').toBe(false);
        } catch (e) {
          // Oczekujemy błędu, więc to jest oczekiwane zachowanie
          expect(e).toBeDefined();
        }
      });

      // Sprawdzamy czy stan błędu został zaktualizowany w hooku
      expect(result.current.error).toBe('Wystąpił błąd podczas aktualizacji fiszki');
    });

    it('powinien zachować aktualną stronę po aktualizacji', async () => {
      // Symulujemy udane załadowanie strony 2
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: [mockFlashcard], 
          meta: { page: 2, limit: 10, total: 11 } 
        })
      }));

      // Symulujemy udaną aktualizację
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true
      }));

      // Symulujemy ponowne załadowanie strony 2 po aktualizacji
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: [mockFlashcard], 
          meta: { page: 2, limit: 10, total: 11 } 
        })
      }));

      const { result } = renderHook(() => useFlashcards(mockUserId));

      // Czyścimy historię wywołań, aby mieć pewność, że liczymy tylko te po czyszczeniu
      mockFetch.mockClear();

      // Najpierw ładujemy stronę 2
      await act(async () => {
        await result.current.loadFlashcards(2);
      });

      // Sprawdzamy czy żądanie zawierało parametr page=2
      expect(mockFetch.mock.calls[0][0]).toContain('page=2');

      // Następnie aktualizujemy fiszkę
      await act(async () => {
        await result.current.updateFlashcard(1, { front: 'Updated front' });
      });

      // Sprawdzamy wywołania fetch
      const calls = mockFetch.mock.calls;
      expect(calls.length).toBe(3); // load, update, reload
      
      // Update powinien być do /api/flashcards/1
      expect(calls[1][0]).toBe('/api/flashcards/1');
      
      // Reload powinien zawierać page=2
      expect(calls[2][0]).toContain('page=2');
    });
  });

  describe('deleteFlashcard', () => {
    it('powinien usunąć fiszkę', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true }) // dla delete
        .mockResolvedValueOnce({ 
          ok: true, 
          json: async () => ({ data: [], meta: { ...mockFlashcardsResponse.pagination, total: 0 } })
        }); // dla reload

      const { result } = renderHook(() => useFlashcards(mockUserId));

      // Najpierw załaduj fiszki
      await act(async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockFlashcard], meta: mockFlashcardsResponse.pagination })
        });
        await result.current.loadFlashcards();
      });

      await act(async () => {
        await result.current.deleteFlashcard(1);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards/1', expect.any(Object));
    });

    it('powinien obsłużyć błąd podczas usuwania', async () => {
      const { result } = renderHook(() => useFlashcards(mockUserId));
      
      // 1. Przygotowujemy poprawne załadowanie fiszek
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          data: [mockFlashcard], 
          meta: { page: 1, limit: 10, total: 1 } 
        })
      });
      
      // Ładujemy dane
      await act(async () => {
        await result.current.loadFlashcards();
      });
      
      // Sprawdzamy czy dane zostały załadowane
      expect(result.current.flashcards).not.toBeNull();
      expect(result.current.error).toBeNull();
      
      // Resetujemy mockFetch dla następnej operacji
      mockFetch.mockReset();

      // 2. Przygotowujemy błędną odpowiedź dla usuwania
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      // Próba usunięcia fiszki
      await act(async () => {
        try {
          await result.current.deleteFlashcard(1);
          // Jeśli dochodzimy tutaj, to test powinien nie przejść
          expect('Test powinien wyrzucić błąd').toBe(false);
        } catch (e) {
          // Oczekujemy błędu, więc to jest oczekiwane zachowanie
          expect(e).toBeDefined();
        }
      });

      // Sprawdzamy czy stan błędu został zaktualizowany w hooku
      expect(result.current.error).toBe('Wystąpił błąd podczas usuwania fiszki');
    });

    it('powinien zaktualizować paginację po usunięciu ostatniej fiszki na stronie', async () => {
      const page2Response = {
        ok: true,
        json: async () => ({ 
          data: [mockFlashcard], 
          meta: { page: 2, limit: 10, total: 11 } 
        })
      };

      mockFetch
        .mockResolvedValueOnce(page2Response) // initial load
        .mockResolvedValueOnce({ ok: true }) // delete
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: [], 
            meta: { page: 1, limit: 10, total: 0 } 
          })
        }); // reload

      const { result } = renderHook(() => useFlashcards(mockUserId));

      // Załaduj stronę 2
      await act(async () => {
        await result.current.loadFlashcards(2);
      });

      // Usuń fiszkę
      await act(async () => {
        await result.current.deleteFlashcard(1);
      });

      expect(result.current.flashcards?.pagination.page).toBe(1);
    });
  });
}); 