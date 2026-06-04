export const ROUTES = {
  home: "/",
  aboutUs: "/about-us",
  news: "/news",
  login: "/login",
  register: "/register",
  profile: "/profile",
  dashboard: "/dashboard",
  pets: "/pets",
  calendar: "/pets/calendar",
  adoptionList: "/pets/adoption-list",
  lostPets: "/lost-pets",
  adminVerification: "/admin/verification",
} as const;

export const getPetDetailsRoute = (petId: string) => `/pets/${petId}`;
export const getPetEditRoute = (petId: string) => `/pets/${petId}/edit`;
export const getPublicPetRoute = (publicQrId: string) => `/p/${publicQrId}`;
