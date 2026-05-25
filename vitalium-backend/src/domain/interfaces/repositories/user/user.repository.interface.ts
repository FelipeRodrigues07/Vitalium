import type { User } from '../../../../infrastructure/database/models/user.models';
import type { CreateUserDTO } from '../../../../presentation/dto/userDTO/create-user.dto';
import type { UpdateUserDTO } from '../../../../presentation/dto/userDTO/update-user.dtp';
export interface IUserRepository {
  // Métodos básicos
  create(createUserDTO: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findAllByUnitIds(unitIds: string[]): Promise<User[]>;
  update(id: string, updateUserDTO: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}
