import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { FlashcardsList } from "../FlashcardsList";
import { useFlashcards } from "../../hooks/useFlashcards";
import type { FlashcardDTO, FlashcardsListDTO, CreateFlashcardCommand } from "@/types";
import userEvent from "@testing-library/user-event";

// Mock hooka useFlashcards
vi.mock("../../hooks/useFlashcards");

// Mock komponentów UI
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-footer">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pagination">{children}</div>
  ),
  PaginationContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pagination-content">{children}</div>
  ),
  PaginationItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pagination-item">{children}</div>
  ),
  PaginationLink: ({
    children,
    onClick,
    isActive,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
  }) => (
    <button data-testid="pagination-link" onClick={onClick} data-active={isActive}>
      {children}
    </button>
  ),
  PaginationNext: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="pagination-next" onClick={onClick} aria-label="Następna strona">
      Następna
    </button>
  ),
  PaginationPrevious: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="pagination-previous" onClick={onClick}>
      Poprzednia
    </button>
  ),
  PaginationFirst: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="pagination-first" onClick={onClick}>
      Pierwsza
    </button>
  ),
  PaginationLast: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="pagination-last" onClick={onClick}>
      Ostatnia
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
}));

// Mock toastu
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Typ dla props komponentu FlashcardForm
interface FlashcardFormProps {
  onSubmit: (data: CreateFlashcardCommand) => void;
  initialValues?: {
    front?: string;
    back?: string;
  };
}

// Mock komponentu FlashcardForm
vi.mock("../FlashcardForm", () => ({
  FlashcardForm: ({ onSubmit, initialValues }: FlashcardFormProps) => (
    <form
      data-testid="flashcard-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          front: initialValues?.front || "Nowy przód",
          back: initialValues?.back || "Nowy tył",
          source: "manual",
        });
      }}
    >
      <input aria-label="Przód" defaultValue={initialValues?.front} />
      <input aria-label="Tył" defaultValue={initialValues?.back} />
      <button type="submit">Zapisz</button>
    </form>
  ),
}));

const mockUserId = "test-user-123";
const mockFlashcard: FlashcardDTO = {
  id: 1,
  user_id: mockUserId,
  front: "Test front",
  back: "Test back",
  source: "manual",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  generated_id: null,
};

const mockFlashcardsList: FlashcardsListDTO = {
  data: [mockFlashcard],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
  },
};

describe("FlashcardsList", () => {
  const mockLoadFlashcards = vi.fn();
  const mockCreateFlashcard = vi.fn();
  const mockUpdateFlashcard = vi.fn();
  const mockDeleteFlashcard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Domyślna implementacja mocka useFlashcards
    (useFlashcards as unknown as Mock).mockReturnValue({
      flashcards: mockFlashcardsList,
      isLoading: false,
      error: null,
      loadFlashcards: mockLoadFlashcards,
      createFlashcard: mockCreateFlashcard,
      updateFlashcard: mockUpdateFlashcard,
      deleteFlashcard: mockDeleteFlashcard,
    });
  });

  it("powinien wyrenderować listę fiszek", () => {
    render(<FlashcardsList userId={mockUserId} />);

    expect(screen.getByText("Test front")).toBeInTheDocument();
    expect(screen.getByText("Test back")).toBeInTheDocument();
  });

  it("powinien wyświetlić komunikat o braku fiszek", () => {
    (useFlashcards as unknown as Mock).mockReturnValue({
      flashcards: { data: [], pagination: { page: 1, limit: 10, total: 0 } },
      isLoading: false,
      error: null,
      loadFlashcards: mockLoadFlashcards,
    });

    render(<FlashcardsList userId={mockUserId} />);

    expect(screen.getByText("Nie masz jeszcze żadnych fiszek")).toBeInTheDocument();
    expect(screen.getByText("Dodaj pierwszą fiszkę")).toBeInTheDocument();
  });

  it("powinien wyświetlić loader podczas ładowania", () => {
    (useFlashcards as unknown as Mock).mockReturnValue({
      flashcards: null,
      isLoading: true,
      error: null,
      loadFlashcards: mockLoadFlashcards,
    });

    render(<FlashcardsList userId={mockUserId} />);

    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
  });

  it("powinien wyświetlić błąd", () => {
    const errorMessage = "Wystąpił błąd podczas ładowania fiszek";
    (useFlashcards as unknown as Mock).mockReturnValue({
      flashcards: null,
      isLoading: false,
      error: errorMessage,
      loadFlashcards: mockLoadFlashcards,
    });

    render(<FlashcardsList userId={mockUserId} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("powinien obsłużyć dodawanie nowej fiszki", async () => {
    const user = userEvent.setup();
    render(<FlashcardsList userId={mockUserId} />);

    // Otwórz dialog dodawania
    await user.click(screen.getByText("Dodaj nową fiszkę"));

    // Wypełnij formularz
    await user.type(screen.getByLabelText("Przód"), "Nowy przód");
    await user.type(screen.getByLabelText("Tył"), "Nowy tył");

    // Zapisz fiszkę
    await user.click(screen.getByText("Zapisz"));

    // Sprawdź czy została wywołana odpowiednia funkcja
    expect(mockCreateFlashcard).toHaveBeenCalledWith({
      front: "Nowy przód",
      back: "Nowy tył",
      source: "manual",
    });
  });

  it("powinien obsłużyć edycję fiszki", async () => {
    const user = userEvent.setup();
    render(<FlashcardsList userId={mockUserId} />);

    // Kliknij przycisk edycji
    await user.click(screen.getByRole("button", { name: /edytuj/i }));

    // Zapisz zmiany
    await user.click(screen.getByText("Zapisz"));

    // Sprawdź czy została wywołana odpowiednia funkcja
    expect(mockUpdateFlashcard).toHaveBeenCalledWith(1, {
      front: "Test front", // używamy oryginalnej wartości z mockFlashcard
      back: "Test back", // używamy oryginalnej wartości z mockFlashcard
      source: "manual",
    });
  });

  it("powinien obsłużyć usuwanie fiszki", async () => {
    const user = userEvent.setup();
    render(<FlashcardsList userId={mockUserId} />);

    // Najpierw sprawdźmy czy mamy w ogóle fiszkę na liście
    expect(screen.getByText("Test front")).toBeInTheDocument();

    // Kliknij przycisk usuwania w karcie
    const deleteButtons = screen.getAllByText("Usuń");
    await user.click(deleteButtons[0]); // Pierwszy przycisk "Usuń" to ten w karcie

    // Sprawdź czy dialog usuwania jest otwarty - używamy wyrażenia regularnego dla elastycznego dopasowania
    expect(screen.getByText(/Czy na pewno chcesz usunąć tę fiszkę/)).toBeInTheDocument();

    // Znajdź przycisk potwierdzający w dialogu i kliknij
    const confirmDeleteButtons = screen.getAllByText("Usuń");
    // W tym momencie powinny być dwa przyciski "Usuń" - wybieramy ten drugi, który jest w dialogu
    await user.click(confirmDeleteButtons[confirmDeleteButtons.length > 1 ? 1 : 0]);

    // Sprawdź czy została wywołana odpowiednia funkcja
    expect(mockDeleteFlashcard).toHaveBeenCalledWith(1);
  });

  it("powinien obsłużyć paginację", async () => {
    const user = userEvent.setup();
    (useFlashcards as unknown as Mock).mockReturnValue({
      flashcards: {
        data: [mockFlashcard],
        pagination: { page: 1, limit: 10, total: 20 },
      },
      isLoading: false,
      error: null,
      loadFlashcards: mockLoadFlashcards,
    });

    render(<FlashcardsList userId={mockUserId} />);

    // Kliknij następną stronę
    await user.click(screen.getByLabelText("Następna strona"));

    // Sprawdź czy została wywołana funkcja z odpowiednim numerem strony
    expect(mockLoadFlashcards).toHaveBeenCalledWith(2);
  });

  it("powinien wyświetlić szczegóły fiszki", async () => {
    const user = userEvent.setup();

    // Mock window.location.href
    const { location } = window;
    delete (window as unknown as Record<string, unknown>).location;
    window.location = { ...location, href: "" } as Location;

    render(<FlashcardsList userId={mockUserId} />);

    // Kliknij przycisk szczegółów
    await user.click(screen.getByRole("button", { name: /szczegóły/i }));

    // Sprawdź czy nastąpiło przekierowanie
    expect(window.location.href).toBe("/flashcards/1");

    // Przywróć oryginalne window.location
    window.location = location;
  });
});
