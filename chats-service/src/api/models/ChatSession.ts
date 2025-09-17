import mongoose, { Schema } from 'mongoose';
import { IChatSession } from '../Interface/IChatSession';

const chatSessionSchema: Schema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'New chat' },
    userId: { type: String, required: false },
    isFavorite: { type: Boolean, default: false },
    lastMessageAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);

export default ChatSession;
