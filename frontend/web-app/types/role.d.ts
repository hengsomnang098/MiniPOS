import { Permissions } from "./permission";

export interface Roles {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  permissions?: Permissions[];
}