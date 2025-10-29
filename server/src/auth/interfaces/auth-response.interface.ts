import { UserPayload } from './user-payload.interface';

export interface AuthResponse {
  user: UserPayload;
  access_token: string;
}
