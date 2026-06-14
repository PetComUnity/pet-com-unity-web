import { fireEvent, render, screen } from "@testing-library/react";
import type { Pet } from "@/types";
import { PetAvatarCarousel } from "./PetAvatarCarousel";

function makePet(id: string, name: string): Pet {
  return {
    id,
    ownerId: "owner-1",
    name,
    species: "Dog",
    isLost: false,
    isAdoptable: false,
    verificationStatus: "unverified",
    publicQrId: `${id}-qr`,
  };
}

const pets = [
  makePet("alpha", "Alpha"),
  makePet("bravo", "Bravo"),
  makePet("charlie", "Charlie"),
  makePet("delta", "Delta"),
];

describe("PetAvatarCarousel", () => {
  it("renders pet entries", () => {
    render(
      <PetAvatarCarousel pets={pets.slice(0, 2)} onSelectPet={jest.fn()} />,
    );

    expect(screen.getByLabelText("Select Alpha")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Bravo")).toBeInTheDocument();
  });

  it("handles empty state", () => {
    const { container } = render(<PetAvatarCarousel pets={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("supports carousel navigation", () => {
    render(
      <PetAvatarCarousel
        pets={pets}
        onSelectPet={jest.fn()}
        visibleCount={2}
      />,
    );

    expect(screen.getByLabelText("Select Alpha")).toBeInTheDocument();
    expect(screen.queryByLabelText("Select Charlie")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Show next pets"));

    expect(screen.getByLabelText("Select Charlie")).toBeInTheDocument();
  });

  it("marks the active pet and reports selection", () => {
    const onSelectPet = jest.fn();
    render(
      <PetAvatarCarousel
        pets={pets}
        activePetId="bravo"
        onSelectPet={onSelectPet}
        visibleCount={3}
      />,
    );

    expect(screen.getByLabelText("Select Bravo")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByLabelText("Select Charlie"));

    expect(onSelectPet).toHaveBeenCalledWith("charlie");
  });
});
