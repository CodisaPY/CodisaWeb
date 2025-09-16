import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ISocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: IDateValue;
  personLikes: { name: string; avatarUrl: string }[];
  comments: {
    id: string;
    message: string;
    createdAt: IDateValue;
    author: { id: string; name: string; avatarUrl: string };
  }[];
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  zipCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  isVerified: boolean;
};

export type IUserAccount = {
  city: string;
  email: string;
  state: string;
  about: string;
  address: string;
  zipCode: string;
  isPublic: boolean;
  displayName: string;
  phoneNumber: string;
  country: string | null;
  photoURL: File | string | null;
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};

// Tipos para usuarios GraphQL

export interface UserAccess {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
}

export interface UserAttributes {
  sucursal: string[];
  cargo: string[];
  departamento: string[];
  is_temporary_admin: string[];
  [key: string]: string[];
}

export interface User {
  access: UserAccess;
  attributes: UserAttributes;
  createdTimestamp: string;
  disableableCredentialTypes: string[];
  email: string;
  emailVerified: boolean;
  enabled: boolean;
  firstName: string;
  groupRole: string;
  groupRoleDescription: string;
  id: string;
  lastName: string;
  notBefore: string;
  requiredActions: string[];
  totp: boolean;
  username: string;
}

export interface UsersResponse {
  users: User[];
}

export interface UsersQueryResponse {
  users: User[];
}

// Tipos para crear usuario
export interface CreateUserAttributes {
  sucursal?: string | null;
  cargo?: string | null;
  modulo?: string | null;
  [key: string]: string | null | undefined;
}

export interface CreateUserInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  sucursal: string;
  enabled: boolean;
  emailVerified: boolean;
  attributes: CreateUserAttributes;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface CreateUserMutationResponse {
  createUser: CreateUserResponse;
}

export interface CreateUserMutationVariables {
  input: CreateUserInput;
}

// Tipos para actualizar usuario
export interface UpdateUserAttributes {
  sucursal?: string | null;
  cargo?: string | null;
  modulo?: string | null;
  [key: string]: string | null | undefined;
}

export interface UpdateUserInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  sucursal: string;
  enabled: boolean;
  emailVerified: boolean;
  attributes: UpdateUserAttributes;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
}

export interface UpdateUserMutationResponse {
  updateUser: UpdateUserResponse;
}

export interface UpdateUserMutationVariables {
  updateUserId: string;
  input: UpdateUserInput;
}

export interface ToggleUserStatusData {
  userId: string;
  active: boolean;
}

export interface ToggleUserStatusResponse {
  success: boolean;
  data: ToggleUserStatusData;
  message: string;
}

export interface ToggleUserStatusMutationResponse {
  toggleUserStatus: ToggleUserStatusResponse;
}

export interface ToggleUserStatusMutationVariables {
  userId: string;
}
