import { Permissions } from "./permission";

export type Roles = {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  permissions?: Permissions[];
}