import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PetVerificationPanel } from "@/components/verification/PetVerificationPanel";

let fetchMock: jest.MockedFunction<typeof fetch>;

function getExpectedApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api"
  ).replace(/\/$/, "");
}

function mockJsonResponse(
  payload: unknown,
  options: { ok?: boolean; status?: number } = {},
) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: jest.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function mockLookupPet(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      pet: {
        id: "pet-1",
        name: "Milo",
        species: "Dog",
        breed: "Mixed breed",
        gender: "male",
        birthDate: "2022-04-12",
        imageUrl: "https://cdn.example.test/milo.jpg",
        microchipId: "985121",
        passportNumber: "PASS-42",
        verificationStatus: "unverified",
        ownerEmail: "owner@example.test",
        ownerPhone: "555-0100",
        ...overrides,
      },
    },
  };
}

jest.mock("@/components/common/PrivateImage", () => ({
  PrivateImage: ({
    alt,
    fileId,
  }: {
    alt: string;
    fileId: string;
    className?: string;
  }) => <img alt={alt} data-file-id={fileId} />,
}));

async function searchForPet(microchipId = "985121") {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Microchip number"), microchipId);
  await user.click(screen.getByRole("button", { name: /search/i }));

  return user;
}

describe("PetVerificationPanel", () => {
  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
    localStorage.clear();
    localStorage.setItem("auth_token", "vet-token");
  });

  it("renders the verification controls", () => {
    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Pet verification" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Microchip number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("searches by microchip and displays the pet preview", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse(mockLookupPet()));

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    await searchForPet();

    expect(fetchMock).toHaveBeenCalledWith(
      `${getExpectedApiBaseUrl()}/clinics/pets/lookup?microchipId=985121`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer vet-token",
        }),
        method: "GET",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Milo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("PASS-42")).toBeInTheDocument();
    expect(screen.queryByText("owner@example.test")).not.toBeInTheDocument();
    expect(screen.queryByText("555-0100")).not.toBeInTheDocument();
  });

  it("uses private image loading for protected file URLs", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse(
        mockLookupPet({
          imageUrl: "/api/files/pet-avatars--private--abc123",
        }),
      ),
    );

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    await searchForPet();

    expect(await screen.findByRole("img", { name: /Milo pet profile photo/i }))
      .toHaveAttribute("data-file-id", "pet-avatars--private--abc123");
  });

  it("keeps Verify pet disabled until all required checks are selected", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse(mockLookupPet()));

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    const user = await searchForPet();
    const verifyButton = await screen.findByRole("button", {
      name: "Verify pet",
    });

    expect(verifyButton).toBeDisabled();

    await user.click(screen.getByLabelText("Microchip matches the profile"));
    await user.click(screen.getByLabelText("Passport/document data matches"));
    await user.click(screen.getByLabelText("Visual check passed"));

    expect(verifyButton).toBeEnabled();
  });

  it("updates the status badge after a successful verification", async () => {
    fetchMock
      .mockResolvedValueOnce(mockJsonResponse(mockLookupPet()))
      .mockResolvedValueOnce(
        mockJsonResponse(
          mockLookupPet({
            verificationStatus: "verified",
            verifiedAt: "2026-06-27T10:00:00.000Z",
            verifiedClinicName: "Unity Vet Clinic",
          }),
        ),
      );

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    const user = await searchForPet();

    await user.click(screen.getByLabelText("Microchip matches the profile"));
    await user.click(screen.getByLabelText("Passport/document data matches"));
    await user.click(screen.getByLabelText("Visual check passed"));
    await user.click(screen.getByRole("button", { name: "Verify pet" }));

    expect(
      await screen.findByText("Pet verification was approved."),
    ).toBeInTheDocument();
    expect(screen.getByText("Verified by veterinary clinic")).toBeInTheDocument();
    expect(screen.getByText("Unity Vet Clinic")).toBeInTheDocument();
  });

  it("shows only the reject decision for an already verified pet", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse(
        mockLookupPet({
          verificationStatus: "verified",
          verifiedAt: "2026-06-27T10:00:00.000Z",
          verifiedClinicName: "Unity Vet Clinic",
        }),
      ),
    );

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    await searchForPet();

    expect(
      await screen.findByText("Verified by veterinary clinic"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Verify pet" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as pending" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Microchip matches the profile"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Passport/document data matches"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Visual check passed"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reject verification" }),
    ).toBeInTheDocument();
  });

  it("shows a user-friendly API error", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse(
        { message: "Lookup failed. Please try again." },
        { ok: false, status: 500 },
      ),
    );

    render(
      <PetVerificationPanel
        currentVerifier={{ id: "vet-1", name: "Dr. Taylor" }}
      />,
    );

    await searchForPet("missing-chip");

    await waitFor(() =>
      expect(
        screen.getByText("Lookup failed. Please try again."),
      ).toBeInTheDocument(),
    );
  });
});
