// packages/shared/types/user.ts

export interface IUserBase {
  _id: string; 
  role: 'customer' | 'provider';
  fullName: string;
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
  createdAt: Date | string; 
  updatedAt: Date | string;
}

export interface ISignUpRequest extends Omit<IUserBase, '_id' | 'createdAt' | 'updatedAt'> {
  password: string; 
}