import { petFormSchema } from "./pet.schema";

describe("petFormSchema", () => {
  it("accepts valid pet profile data", () => {
    const result = petFormSchema.safeParse({
      name: "Milo",
      species: "Dog",
      breed: "Mixed",
      birthDate: "2022-04-12",
      color: "Brown",
      description: "Friendly and curious.",
      microchipId: "CHIP-123",
      isAdoptable: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.breed).toBe("Mixed");
    }
  });

  it("converts blank optional pet profile fields to undefined", () => {
    const result = petFormSchema.safeParse({
      name: "Luna",
      species: "Cat",
      breed: "   ",
      birthDate: "",
      color: "",
      description: "",
      microchipId: "",
      isAdoptable: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(
        expect.objectContaining({
          birthDate: undefined,
          breed: undefined,
          color: undefined,
          description: undefined,
          microchipId: undefined,
        }),
      );
    }
  });

  it("returns validation errors for invalid pet profile data", () => {
    const result = petFormSchema.safeParse({
      name: "A",
      species: "",
      birthDate: "12/04/2022",
      isAdoptable: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toContain("Pet name must be at least 2 characters.");
      expect(errors.species).toContain("Species is required.");
      expect(errors.birthDate).toContain("Use the YYYY-MM-DD format.");
    }
  });
});
