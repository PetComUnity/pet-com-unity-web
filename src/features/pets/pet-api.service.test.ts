import { createPet, getPetByPublicQrId } from "./pet-api.service";

type FetchInitWithHeaders = RequestInit & {
  headers?: Record<string, string>;
};

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

function getLastFetchInit() {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  if (!call?.[1]) {
    throw new Error("Expected fetch to be called with an init object.");
  }

  return call[1] as FetchInitWithHeaders;
}

describe("getPetByPublicQrId", () => {
  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
    localStorage.clear();
  });

  it("fetches a public pet profile without auth and strips private fields", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        success: true,
        data: {
          _id: "internal-pet-id",
          id: "pet-1",
          ownerId: "owner-1",
          owner: {
            email: "owner@example.test",
            phone: "555-0100",
          },
          imageFileId: "private-cloudinary-file-id",
          name: "Milo",
          species: "Dog",
          breed: "Mixed breed",
          birthDate: "2022-04-12",
          gender: "male",
          description: "Friendly and curious.",
          imageUrl: "https://cdn.example.test/milo.jpg",
          isLost: true,
          isAdoptable: false,
          verificationStatus: "verified",
          publicQrId: "milo-qr",
        },
      }),
    );

    const result = await getPetByPublicQrId("milo-qr");

    expect(fetchMock).toHaveBeenCalledWith(
      `${getExpectedApiBaseUrl()}/pets/public/milo-qr`,
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(getLastFetchInit().headers).toBeUndefined();
    expect(result).toEqual({
      name: "Milo",
      species: "Dog",
      breed: "Mixed breed",
      birthDate: "2022-04-12",
      color: undefined,
      gender: "male",
      description: "Friendly and curious.",
      imageUrl: "https://cdn.example.test/milo.jpg",
      isLost: true,
      isAdoptable: false,
      verificationStatus: "verified",
      publicQrId: "milo-qr",
    });
    expect(result).not.toHaveProperty("_id");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("owner");
    expect(result).not.toHaveProperty("imageFileId");
  });

  it("returns null for an unknown public QR ID", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({ message: "Not found" }, { ok: false, status: 404 }),
    );

    await expect(getPetByPublicQrId("missing-qr")).resolves.toBeNull();
  });

  it("throws public endpoint errors", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { message: "Public profile lookup failed." },
        { ok: false, status: 500 },
      ),
    );

    await expect(getPetByPublicQrId("milo-qr")).rejects.toThrow(
      "Public profile lookup failed.",
    );
  });

  it("generates a public QR ID when creating a pet", async () => {
    localStorage.setItem("auth_token", "owner-token");
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        success: true,
        data: {
          id: "pet-1",
          ownerId: "owner-1",
          name: "Milo",
          species: "Dog",
          isLost: false,
          isAdoptable: false,
          verificationStatus: "unverified",
          publicQrId: "milo-created",
        },
      }),
    );

    await createPet({
      name: "Milo",
      species: "Dog",
      isAdoptable: false,
    });

    const requestBody = JSON.parse(String(getLastFetchInit().body)) as {
      publicQrId?: string;
    };
    expect(requestBody.publicQrId).toMatch(/^milo-/);
  });
});
