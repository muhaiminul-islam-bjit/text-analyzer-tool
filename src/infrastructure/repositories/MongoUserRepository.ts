import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class MongoUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const userDoc = new UserModel(user);
    const savedUser = await userDoc.save();
    
    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      password: savedUser.password,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email });
    
    if (!userDoc) {
      return null;
    }

    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      password: userDoc.password,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id);
    
    if (!userDoc) {
      return null;
    }

    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      password: userDoc.password,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }
  
  async findAll(): Promise<User[]> {
    const userDocs = await UserModel.find().select('-password').sort({ createdAt: -1 });
    
    return userDocs.map((userDoc: any) => ({
      id: userDoc._id.toString(),
      email: userDoc.email,
      password: userDoc.password,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    }));
  }
}
