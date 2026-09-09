import "@testing-library/jest-dom/vitest";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoadingOverlay } from "@/components/RootLayout/LoadingOverlay";

const LOADING_TIMEOUT_MS = 10_000;

type UseQueryMockResult = Readonly<{
  data: readonly unknown[] | undefined;
  isError: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
}>;

const mocks = vi.hoisted(() => ({ useQuery: vi.fn(), refetch: vi.fn() }));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  return { ...actual, useQuery: mocks.useQuery };
});

function mockUseQuery(result: Partial<UseQueryMockResult>): void {
  mocks.refetch.mockResolvedValue(undefined);

  mocks.useQuery.mockReturnValue({
    data: undefined,
    isError: false,
    isFetching: false,
    refetch: mocks.refetch,
    ...result,
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("LoadingOverlay", () => {
  describe("renders", () => {
    it("the loading message while the project data is loading.", () => {
      mockUseQuery({ data: undefined, isError: false, isFetching: true });

      render(<LoadingOverlay />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("SRM is loading ...")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /reload/i }),
      ).not.toBeInTheDocument();
    });

    it("a network error message and reload button when loading fails.", () => {
      mockUseQuery({ data: undefined, isError: true, isFetching: false });

      render(<LoadingOverlay />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("A network error has occured. Try again."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reload/i }),
      ).toBeInTheDocument();
    });

    it("a network error message and reload button after the loading timeout.", () => {
      vi.useFakeTimers();

      mockUseQuery({ data: undefined, isError: false, isFetching: true });

      render(<LoadingOverlay />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("SRM is loading ...")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(LOADING_TIMEOUT_MS);
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("A network error has occured. Try again."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reload/i }),
      ).toBeInTheDocument();
    });
  });

  describe("does not render", () => {
    it("after the project data has been loaded.", () => {
      mockUseQuery({ data: [], isError: false, isFetching: false });

      render(<LoadingOverlay />);

      expect(screen.queryByText("SRM is loading ...")).not.toBeInTheDocument();
      expect(
        screen.queryByText("A network error has occured. Try again."),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /reload/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("reloads", () => {
    it("the project data when the reload button is clicked.", async () => {
      const user = userEvent.setup();

      mockUseQuery({ data: undefined, isError: true, isFetching: false });

      render(<LoadingOverlay />);

      await user.click(screen.getByRole("button", { name: /reload/i }));

      expect(mocks.refetch).toHaveBeenCalledTimes(1);
    });

    it("resets the loading timeout when the reload button is clicked.", () => {
      vi.useFakeTimers();

      mockUseQuery({ data: undefined, isError: false, isFetching: true });

      render(<LoadingOverlay />);

      act(() => {
        vi.advanceTimersByTime(LOADING_TIMEOUT_MS);
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("A network error has occured. Try again."),
      ).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /reload/i }));
      });

      expect(mocks.refetch).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("SRM is loading ...")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(LOADING_TIMEOUT_MS - 1);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("SRM is loading ...")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("A network error has occured. Try again."),
      ).toBeInTheDocument();
    });
  });
});
