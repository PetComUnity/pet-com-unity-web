export const ROUTES = {
  home: "/",
  aboutUs: "/about-us",
  news: "/news",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  pets: "/pets",
  newPet: "/pets/new",
  lostPets: "/lost-pets",
  adminVerification: "/admin/verification",
} as const;

export const getPetDetailsRoute = (petId: string) => `/pets/${petId}`;
export const getPetEditRoute = (petId: string) => `/pets/${petId}/edit`;
export const getPublicPetRoute = (publicQrId: string) => `/p/${publicQrId}`;
