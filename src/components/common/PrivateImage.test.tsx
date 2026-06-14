import { render, screen, waitFor } from "@testing-library/react";
import { getToken } from "@/features/auth/auth.service";
import { PrivateImage } from "./PrivateImage";

jest.mock("@/features/auth/auth.service", () => ({
  getToken: jest.fn(),
}));

const mockedGetToken = jest.mocked(getToken);

let fetchMock: jest.MockedFunction<typeof fetch>;
let createObjectURLMock: jest.Mock<string, [Blob]>;
let revokeObjectURLMock: jest.Mock<void, [string]>;
let objectUrlIndex = 0;

function mockImageResponse(blob: Blob) {
  return {
    ok: true,
    blob: jest.fn().mockResolvedValue(blob),
  } as unknown as Response;
}

describe("PrivateImage", () => {
  beforeEach(() => {
    objectUrlIndex = 0;
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
    createObjectURLMock = jest.fn((blob: Blob) => {
      void blob;
      objectUrlIndex += 1;
      return `blob:private-image-${objectUrlIndex}`;
    });
    revokeObjectURLMock = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURLMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURLMock,
    });
  });

  it("sends an authorized request and displays the received Blob", async () => {
    const blob = new Blob(["image"], { type: "image/png" });
    mockedGetToken.mockReturnValue("private-token");
    fetchMock.mockResolvedValue(mockImageResponse(blob));

    render(<PrivateImage fileId="pets/milo.png" alt="Milo" />);

    const image = await screen.findByRole("img", { name: "Milo" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5000/api/files/pets--milo.png",
      { headers: { Authorization: "Bearer private-token" } },
    );
    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(image).toHaveAttribute("src", "blob:private-image-1");
  });

  it("revokes the object URL on cleanup", async () => {
    mockedGetToken.mockReturnValue("private-token");
    fetchMock.mockResolvedValue(
      mockImageResponse(new Blob(["image"], { type: "image/png" })),
    );
    const { unmount } = render(
      <PrivateImage fileId="cleanup-image" alt="Cleanup image" />,
    );

    await screen.findByRole("img", { name: "Cleanup image" });
    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:private-image-1");
  });

  it("shows fallback image when authentication is required but no token exists", async () => {
    mockedGetToken.mockReturnValue(null);

    render(
      <PrivateImage
        fileId="no-token-image"
        alt="Fallback pet"
        fallbackSrc="/images/fallback.png"
      />,
    );

    const image = await screen.findByRole("img", { name: "Fallback pet" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(image).toHaveAttribute("src", "/images/fallback.png");
  });

  it("shows fallback image when the private image request fails", async () => {
    mockedGetToken.mockReturnValue("private-token");
    fetchMock.mockResolvedValue({
      ok: false,
    } as Response);

    render(
      <PrivateImage
        fileId="broken-image"
        alt="Broken pet"
        fallbackSrc="/images/fallback.png"
      />,
    );

    const image = await screen.findByRole("img", { name: "Broken pet" });
    expect(image).toHaveAttribute("src", "/images/fallback.png");
  });

  it("renders no image while the private image is loading", () => {
    mockedGetToken.mockReturnValue("private-token");
    fetchMock.mockReturnValue(new Promise<Response>(() => undefined));

    render(<PrivateImage fileId="pending-image" alt="Pending pet" />);

    expect(
      screen.queryByRole("img", { name: "Pending pet" }),
    ).not.toBeInTheDocument();
  });

  it("reloads when fileId changes", async () => {
    mockedGetToken.mockReturnValue("private-token");
    fetchMock
      .mockResolvedValueOnce(
        mockImageResponse(new Blob(["first"], { type: "image/png" })),
      )
      .mockResolvedValueOnce(
        mockImageResponse(new Blob(["second"], { type: "image/png" })),
      );
    const { rerender } = render(
      <PrivateImage fileId="first-image" alt="Changing pet" />,
    );

    expect(await screen.findByRole("img", { name: "Changing pet" })).toHaveAttribute(
      "src",
      "blob:private-image-1",
    );

    rerender(<PrivateImage fileId="second-image" alt="Changing pet" />);

    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Changing pet" })).toHaveAttribute(
        "src",
        "blob:private-image-2",
      ),
    );
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:private-image-1");
  });
});
