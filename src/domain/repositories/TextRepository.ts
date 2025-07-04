import { Text } from '../entities/Text';

export interface TextRepository {
  create(text: Text): Promise<Text>;
  findById(id: string): Promise<Text | null>;
  findByUserId(userId: string): Promise<Text[]>;
  update(id: string, text: Partial<Text>): Promise<Text | null>;
  delete(id: string): Promise<boolean>;
}
