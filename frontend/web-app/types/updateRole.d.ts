export interface UpdateRoleDto {
  name: string;
  description: string;
  permissionIds: string[]; // This will be mapped to PermissionIds in the backend
}