// Tipos para roles GraphQL

export interface Role {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}

export interface RolesResponse {
  roles: Role[];
}

export interface RolesQueryResponse {
  roles: Role[];
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  attributes?: {
    name: string[];
  };
}

export interface CreateRoleData {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}

export interface CreateRoleResponse {
  success: boolean;
  message: string;
  data: CreateRoleData;
}

export interface CreateRoleMutationResponse {
  createRole: CreateRoleResponse;
}

export interface CreateRoleMutationVariables {
  input: CreateRoleInput;
}

export interface UpdateRoleInput {
  id: string;
  name?: string;
  description?: string;
  attributes?: {
    name: string[];
  };
}

export interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data: CreateRoleData;
}

export interface UpdateRoleMutationResponse {
  updateRole: UpdateRoleResponse;
}

export interface UpdateRoleMutationVariables {
  input: UpdateRoleInput;
}

export interface DeleteRoleResponse {
  success: boolean;
  message: string;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface DeleteRoleMutationResponse {
  deleteRole: DeleteRoleResponse;
}

export interface DeleteRoleMutationVariables {
  roleName: string;
}

export interface GroupRolesData {
  success: boolean;
  data: Role[];
  message: string | null;
}

export interface GroupRolesQueryResponse {
  groupRoles: GroupRolesData;
}

export interface GroupRolesQueryVariables {
  groupName: string;
}

export interface AddRolesToGroupInput {
  rolesToAdd: string[];
}

export interface AddRolesToGroupData {
  groupName: string;
  addedRoles: Role[];
}

export interface AddRolesToGroupResponse {
  success: boolean;
  message: string;
  data: AddRolesToGroupData;
}

export interface AddRolesToGroupMutationResponse {
  addRolesToSpecificGroup: AddRolesToGroupResponse;
}

export interface AddRolesToGroupMutationVariables {
  groupName: string;
  input: AddRolesToGroupInput;
}

export interface RemoveRolesFromGroupInput {
  rolesToRemove: string[];
}

export interface RemoveRolesFromGroupData {
  groupName: string;
  removedRoles: Role[];
}

export interface RemoveRolesFromGroupResponse {
  success: boolean;
  message: string;
  data: RemoveRolesFromGroupData;
}

export interface RemoveRolesFromGroupMutationResponse {
  removeRolesFromSpecificGroup: RemoveRolesFromGroupResponse;
}

export interface RemoveRolesFromGroupMutationVariables {
  groupName: string;
  input: RemoveRolesFromGroupInput;
}

export interface Permission {
  name: string;
  description: string;
  tipo: 'grupo' | 'pantalla';
  composite?: boolean;
  children?: Permission[];
  attributes: {
    nombre: string[];
    pantalla_id?: string[];
  };
  acciones?: string[];
}

export interface ScreenHierarchyLevel3QueryResponse {
  screenHierarchyLevel3: Permission;
}

export interface RolePermissionsQueryResponse {
  rolePermissions: {
    success: boolean;
    data: Role[];
    message: string;
  };
}

export interface RolePermissionsQueryVariables {
  roleName: string;
} 