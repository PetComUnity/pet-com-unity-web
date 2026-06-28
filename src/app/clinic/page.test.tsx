import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import ClinicPage from "./page";

jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

describe("ClinicPage", () => {
  beforeEach(() => {
    const appUser = {
      id: "vet-1",
      email: "vet@example.test",
      role: "vet" as const,
      name: "Dr. Taylor",
    };

    mockedUseAuth.mockReturnValue({
      appUser,
      loading: false,
      register: jest.fn(async () => appUser),
      login: jest.fn(async () => appUser),
      logout: jest.fn(async () => undefined),
      updateProfile: jest.fn(async () => appUser),
      getCurrentUser: jest.fn(async () => undefined),
    });
  });

  it("renders the pet verification panel on the clinic page", () => {
    render(<ClinicPage />);

    expect(
      screen.getByRole("heading", { name: "Pet verification" }),
    ).toBeInTheDocument();
  });
});
