// packages/shared/types/user.ts

interface INotificationPreferences {
  appointments: boolean;
  documents: boolean;
  promotions: boolean;
  service: boolean;
}

export interface IUserBase {
  _id: string; 
  role: 'customer' | 'provider' | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
  createdAt: Date | string; 
  updatedAt: Date | string;
  notificationPreferences?: INotificationPreferences;
}

export interface ISignUpRequest extends Omit<IUserBase, '_id' | 'createdAt' | 'updatedAt'> {
  password: string; 
  role: 'customer' | 'provider' | null; // Required for signup
}


export interface IAuthUser {
  id: string; 
  email: string;
  phoneNumber: string;
  fullName: string;
  role: 'customer' | 'provider' | null;  
  rating?: number;
  notificationPreferences?: INotificationPreferences | undefined; 
}

export interface IAuthSuccessResponse {
  message: string;
  token: string;
  user: IAuthUser; // <--- Much cleaner!
}

export interface IUserUpdateResponse {
  message: string;
  user: IAuthUser; // Return the updated user info
}

export interface ILoginRequest {
  email: string;
  password: string;
}

