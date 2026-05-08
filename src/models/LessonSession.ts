import mongoose, { Schema, Document } from 'mongoose';

export interface IFocusArea {
  area: string;
  note: string;
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
  focusAreas: IFocusArea[];
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

const FocusAreaSchema = new Schema<IFocusArea>({
  area: String,
  note: { type: String, default: '' },
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
  focusAreas: { type: [FocusAreaSchema], default: [] },
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
