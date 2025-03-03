export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface UserProfile extends User {
  department?: string;
  permissions?: string[];
  lastLogin?: Date;
}