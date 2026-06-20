import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import { getPetByPublicQrId } from "@/features/pets/pet-api.service";
import PublicPetPage from "./page";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/features/pets/pet-api.service", () => ({
  getPetByPublicQrId: jest.fn(),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedGetPetByPublicQrId = jest.mocked(getPetByPublicQrId);

describe("PublicPetPage", () => {
  beforeEach(() => {
    mockedUseParams.mockReturnValue({ publicQrId: "milo-qr" });
    mockedGetPetByPublicQrId.mockReset();
  });

  it("shows a loading state while the public profile is loading", () => {
    mockedGetPetByPublicQrId.mockReturnValue(new Promise(() => undefined));

    render(<PublicPetPage />);

    expect(screen.getByText("Opening public profile...")).toBeInTheDocument();
  });

  it("renders public-safe pet information", async () => {
    mockedGetPetByPublicQrId.mockResolvedValue({
      name: "Milo",
      species: "Dog",
      breed: "Mixed breed",
      birthDate: "2022-04-12",
      gender: "male",
      color: "Brown",
      description: "Friendly and curious.",
      imageUrl: "https://cdn.example.test/milo.jpg",
      isLost: true,
      isAdoptable: true,
      verificationStatus: "verified",
      publicQrId: "milo-qr",
    });

    render(<PublicPetPage />);

    expect(
      await screen.findByRole("heading", { name: "Milo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("Mixed breed")).toBeInTheDocument();
    expect(screen.getByText("Apr 12, 2022")).toBeInTheDocument();
    expect(screen.getByText("Lost")).toBeInTheDocument();
    expect(screen.getByText("Adoptable")).toBeInTheDocument();
    expect(
      screen.getByText(/Owner contact details remain private/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("owner@example.test")).not.toBeInTheDocument();
  });

  it("renders a not found state", async () => {
    mockedGetPetByPublicQrId.mockResolvedValue(null);

    render(<PublicPetPage />);

    expect(await screen.findByText("Pet not found")).toBeInTheDocument();
    expect(
      screen.getByText(/The QR code might be outdated/i),
    ).toBeInTheDocument();
  });

  it("renders an error state", async () => {
    mockedGetPetByPublicQrId.mockRejectedValue(
      new Error("Public profile lookup failed."),
    );

    render(<PublicPetPage />);

    await waitFor(() =>
      expect(
        screen.getByText("Public profile lookup failed."),
      ).toBeInTheDocument(),
    );
  });
});
