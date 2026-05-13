export const galleryQueryKeys = {
  all: ["gallery"] as const,
  publicAll: ["gallery", "public"] as const,
  publicList: ["gallery", "public", "list"] as const,
  adminAll: ["gallery", "admin"] as const,
  adminList: ["gallery", "admin", "list"] as const,
};
