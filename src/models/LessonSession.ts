import mongoose, { Schema, Document } from 'mongoose';

export interface IScores {
  driver: number;
  iron: number;
  approach: number;
  putting: number;
}

export interface IMission {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface ILessonSession extends Document {
  coachId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  sessionNumber: number;
  lessonDate: Date;
  location: string;
  isShared: boolean;
  goodPoints: string;
  improvements: string;
  coachComment: string;
  scores: IScores;
  mediaUrls: string[];
  memberNote: string;
  missions: IMission[];
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>({
  id: String,
  text: String,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
}, { _id: false });

const LessonSessionSchema = new Schema<ILessonSession>({
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionNumber: { type: Number, required: true },
  lessonDate: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  isShared: { type: Boolean, default: false },
  goodPoints: { type: String, default: '' },
  improvements: { type: String, default: '' },
  coachComment: { type: String, default: '' },
  scores: {
    driver: { type: Number, default: 7 },
    iron: { type: Number, default: 7 },
    approach: { type: Number, default: 7 },
    putting: { type: Number, default: 7 },
  },
  mediaUrls: [String],
  memberNote: { type: String, default: '' },
  missions: [MissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LessonSessionSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export default mongoose.models.LessonSession ||
  mongoose.model<ILessonSession>('LessonSession', LessonSessionSchema);
