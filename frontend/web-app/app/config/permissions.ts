export const routePermissions: Record<string, string[]> = {
  "/dashboard/users": ["Users.View"],
  "/dashboard/users/create": ["Users.Create"],
  "/dashboard/stores": ["Stores.View"],
  "/dashboard/stores/delete": ["Stores.Delete"],
  "/dashboard/roles": ["Roles.Manage"],
};
