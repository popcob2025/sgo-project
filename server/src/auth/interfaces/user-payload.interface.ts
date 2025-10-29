import { UserRole } from 'src/common/enums/user-role.enum';

export interface UserPayload {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}
