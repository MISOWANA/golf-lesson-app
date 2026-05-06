import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  toUserId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  type: 'new_feedback' | 'practice_reminder' | 'lesson_booked';
  title: string;
  body: string;
  sessionId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['new_feedback', 'practice_reminder', 'lesson_booked'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'LessonSession' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
