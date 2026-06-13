import { loginSchema, registerSchema } from "./auth.types";

describe("auth validation schemas", () => {
  it("accepts valid login data", () => {
    expect(
      loginSchema.safeParse({
        email: "owner@example.test",
        password: "secret123",
      }).success,
    ).toBe(true);
  });

  it("returns validation errors for invalid login data", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.email).toContain("Enter a valid email address.");
      expect(errors.password).toContain(
        "Password must be at least 6 characters.",
      );
    }
  });

  it("accepts valid registration data for actual app roles", () => {
    expect(
      registerSchema.safeParse({
        name: "Mila Owner",
        email: "mila@example.test",
        password: "secret123",
        role: "owner",
      }).success,
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        name: "Vet Clinic",
        email: "vet@example.test",
        password: "secret123",
        role: "vet",
      }).success,
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        name: "Shelter Home",
        email: "shelter@example.test",
        password: "secret123",
        role: "shelter",
      }).success,
    ).toBe(true);
  });

  it("returns validation errors for invalid registration data", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "invalid",
      password: "123",
      role: "guest",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toContain("Name must be at least 2 characters.");
      expect(errors.email).toContain("Enter a valid email address.");
      expect(errors.password).toContain(
        "Password must be at least 6 characters.",
      );
      expect(errors.role).toBeDefined();
    }
  });
});
