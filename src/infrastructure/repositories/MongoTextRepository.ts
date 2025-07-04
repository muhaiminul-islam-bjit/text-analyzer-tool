import { TextRepository } from '../../domain/repositories/TextRepository';
import { Text } from '../../domain/entities/Text';
import { TextModel } from '../database/models/TextModel';

export class MongoTextRepository implements TextRepository {
  async create(text: Text): Promise<Text> {
    const textDoc = new TextModel(text);
    const savedText = await textDoc.save();
    
    return {
      id: savedText._id.toString(),
      title: savedText.title,
      content: savedText.content,
      userId: savedText.userId,
      createdAt: savedText.createdAt,
      updatedAt: savedText.updatedAt,
    };
  }

  async findById(id: string): Promise<Text | null> {
    const textDoc = await TextModel.findById(id);
    
    if (!textDoc) {
      return null;
    }

    return {
      id: textDoc._id.toString(),
      title: textDoc.title,
      content: textDoc.content,
      userId: textDoc.userId,
      createdAt: textDoc.createdAt,
      updatedAt: textDoc.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Text[]> {
    const textDocs = await TextModel.find({ userId }).sort({ createdAt: -1 });
    
    return textDocs.map((textDoc: any) => ({
      id: textDoc._id.toString(),
      title: textDoc.title,
      content: textDoc.content,
      userId: textDoc.userId,
      createdAt: textDoc.createdAt,
      updatedAt: textDoc.updatedAt,
    }));
  }

  async update(id: string, text: Partial<Text>): Promise<Text | null> {
    const updatedDoc = await TextModel.findByIdAndUpdate(
      id,
      { ...text, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedDoc) {
      return null;
    }

    return {
      id: updatedDoc._id.toString(),
      title: updatedDoc.title,
      content: updatedDoc.content,
      userId: updatedDoc.userId,
      createdAt: updatedDoc.createdAt,
      updatedAt: updatedDoc.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await TextModel.findByIdAndDelete(id);
    return result !== null;
  }
}
