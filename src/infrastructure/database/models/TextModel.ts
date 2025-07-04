import mongoose, { Schema, Document } from 'mongoose';

interface IText extends Document {
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const textSchema = new Schema<IText>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for user queries
textSchema.index({ userId: 1, createdAt: -1 });

export const TextModel = mongoose.model<IText>('Text', textSchema);
