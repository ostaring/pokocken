import type { PropsWithChildren, ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function TestProviders({ children }: PropsWithChildren) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

type MemoryRouterProvidersProps = PropsWithChildren<{
  initialEntries?: string[];
}>;

function MemoryRouterProviders({
  children,
  initialEntries = ["/"],
}: MemoryRouterProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithMemoryRouter(ui: ReactElement, initialEntries?: string[]) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouterProviders initialEntries={initialEntries}>{children}</MemoryRouterProviders>
    ),
  });
}
