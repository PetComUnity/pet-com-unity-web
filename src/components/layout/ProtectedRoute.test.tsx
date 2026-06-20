import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import type { AppUser, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "./ProtectedRoute";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const replaceMock = jest.fn();
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseRouter = jest.mocked(useRouter);

function makeUser(role: UserRole): AppUser {
  return {
    id: `${role}-1`,
    email: `${role}@example.test`,
    name: `${role} user`,
    role,
  };
}

function mockAuth(appUser: AppUser | null, loading = false) {
  mockedUseAuth.mockReturnValue({
    appUser,
    loading,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
    getCurrentUser: jest.fn(),
  });
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    mockedUseRouter.mockReturnValue({
      replace: replaceMock,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it.each<UserRole>(["owner", "vet", "shelter", "admin"])(
    "renders children for authenticated %s users with the correct role",
    (role) => {
      mockAuth(makeUser(role));

      render(
        <ProtectedRoute allowedRoles={[role]}>
          <p>Protected content</p>
        </ProtectedRoute>,
      );

      expect(screen.getByText("Protected content")).toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();
    },
  );

  it("blocks unauthenticated users", async () => {
    mockAuth(null);

    render(
      <ProtectedRoute>
        <p>Protected content</p>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Checking access...")).toBeInTheDocument();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(ROUTES.login));
  });

  it("blocks users with insufficient role", async () => {
    mockAuth(makeUser("owner"));

    render(
      <ProtectedRoute allowedRoles={["vet", "admin"]}>
        <p>Verification dashboard</p>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Verification dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Checking access...")).toBeInTheDocument();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(ROUTES.pets));
  });
});
