import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'coach' | 'member';
  phone?: string;
  profileImageUrl?: string;
  createdAt: Date;
  tempPasswordHash?: string;
  tempPasswordExpiry?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['coach', 'member'], required: true },
  phone: String,
  profileImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  tempPasswordHash: String,
  tempPasswordExpiry: Date,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
