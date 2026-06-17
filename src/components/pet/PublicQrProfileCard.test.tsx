import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PublicQrProfileCard } from "./PublicQrProfileCard";

jest.mock("qrcode.react", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const MockQRCodeCanvas = React.forwardRef<
    HTMLCanvasElement,
    { title?: string; value: string }
  >((props, ref) =>
    React.createElement("canvas", {
      ref,
      "data-testid": "mock-qr-canvas",
      "data-value": props.value,
      title: props.title,
    }),
  );

  MockQRCodeCanvas.displayName = "MockQRCodeCanvas";
  return {
    QRCodeCanvas: MockQRCodeCanvas,
  };
});

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

describe("PublicQrProfileCard", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterAll(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("renders the QR code, public link, and open profile link", async () => {
    render(<PublicQrProfileCard petName="Milo" publicQrId="milo-qr" />);

    expect(
      screen.getByRole("heading", { name: "Public QR profile" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("http://localhost/p/milo-qr"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-qr-canvas")).toHaveAttribute(
      "data-value",
      "http://localhost/p/milo-qr",
    );
    expect(
      screen.getByRole("link", { name: "Open public profile" }),
    ).toHaveAttribute("href", "/p/milo-qr");
  });

  it("copies the full public URL", async () => {
    const clipboard = navigator.clipboard as unknown as {
      writeText: jest.Mock<Promise<void>, [string]>;
    };

    render(<PublicQrProfileCard petName="Milo" publicQrId="milo-qr" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(clipboard.writeText).toHaveBeenCalledWith(
        "http://localhost/p/milo-qr",
      ),
    );
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("uses NEXT_PUBLIC_APP_URL when it is configured", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://pet.example.test/";

    render(<PublicQrProfileCard petName="Milo" publicQrId="milo-qr" />);

    expect(
      await screen.findByText("https://pet.example.test/p/milo-qr"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-qr-canvas")).toHaveAttribute(
      "data-value",
      "https://pet.example.test/p/milo-qr",
    );
  });
});
