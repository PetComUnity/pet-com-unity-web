import { apiRequest as staticApiRequest } from "@/lib/api";

type FetchInitWithHeaders = RequestInit & {
  headers: Record<string, string>;
};

const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

let fetchMock: jest.MockedFunction<typeof fetch>;

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

async function importApiRequest() {
  const apiModule = await import("@/lib/api");
  return apiModule.apiRequest;
}

describe("apiRequest", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  afterAll(() => {
    if (originalApiBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    }

    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it("sends requests to the configured API base URL", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.pet-unity.test/v1/";
    fetchMock.mockResolvedValue(mockJsonResponse({ data: { ok: true } }));
    const apiRequest = await importApiRequest();

    await apiRequest("/pets");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pet-unity.test/v1/pets",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("attaches an Authorization bearer token when a token exists", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ data: { id: "user-1" } }));
    const apiRequest = await importApiRequest();

    await apiRequest("/me", { token: "secure-token" });

    expect(getLastFetchInit().headers.Authorization).toBe(
      "Bearer secure-token",
    );
  });

  it("does not attach an Authorization header when token is absent", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ data: { id: "pet-1" } }));
    const apiRequest = await importApiRequest();

    await apiRequest("/pets");

    expect(getLastFetchInit().headers).not.toHaveProperty("Authorization");
  });

  it("serializes JSON request bodies", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ data: { id: "pet-1" } }));
    const apiRequest = await importApiRequest();
    const body = { name: "Milo", species: "Dog" };

    await apiRequest("/pets", { method: "POST", body });

    expect(getLastFetchInit()).toEqual(
      expect.objectContaining({
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );
  });

  it("returns successful JSON response data", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({ data: { id: "pet-1", name: "Milo" } }),
    );

    await expect(staticApiRequest("/pets/pet-1")).resolves.toEqual({
      id: "pet-1",
      name: "Milo",
    });
  });

  it("throws backend API error messages", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(
        { message: "Pet name already exists." },
        { ok: false, status: 409 },
      ),
    );

    await expect(staticApiRequest("/pets")).rejects.toThrow(
      "Pet name already exists.",
    );
  });

  it("handles 401 responses with an authentication error", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({}, { ok: false, status: 401 }),
    );

    await expect(staticApiRequest("/me")).rejects.toThrow(
      "Please sign in to continue.",
    );
  });

  it("handles 403 responses with an authorization error", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({}, { ok: false, status: 403 }),
    );

    await expect(staticApiRequest("/admin")).rejects.toThrow(
      "You do not have permission to perform this action.",
    );
  });
});
