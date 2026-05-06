import mongoose, { Schema, Document } from 'mongoose';

export interface ICoachMember extends Document {
  coachId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  inviteCode: string;
  totalLessons: number;
  remainingLessons: number;
  status: 'active' | 'inactive';
  connectedAt: Date;
}

const CoachMemberSchema = new Schema<ICoachMember>({
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inviteCode: { type: String, required: true, unique: true },
  totalLessons: { type: Number, default: 0 },
  remainingLessons: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  connectedAt: { type: Date, default: Date.now },
});

export default mongoose.models.CoachMember || mongoose.model<ICoachMember>('CoachMember', CoachMemberSchema);
