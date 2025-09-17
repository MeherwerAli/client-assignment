import mongoose, { Schema } from 'mongoose';
// import { Logger } from '../../../src/lib/logger'; // Temporarily disabled for demo
// import { decryptValue, encryptValue } from '../../lib/env/helpers'; // Temporarily disabled for demo
import { IChatMessage } from '../Interface/IChatMessage';

// const log = new Logger(__filename); // Temporarily disabled for demo

const chatMessageSchema: Schema = new mongoose.Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    context: { type: Schema.Types.Mixed, required: false }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).id = ret._id.toString();
        (ret as any).sessionId = ret.sessionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

chatMessageSchema.pre('save', async function (next) {
  // Temporarily disabled encryption for demo purposes
  // const message = this as any;
  // if (message.isModified('content')) {
  //   message.content = await encryptValue(message.content);
  // }
  next();
});

chatMessageSchema.post('init', async function (doc: any) {
  // Temporarily disabled decryption for demo purposes
  // if (doc && doc.content) {
  //   try {
  //     doc.content = await decryptValue(doc.content);
  //   } catch (error: any) {
  //     log.error('Error decrypting chat message content', { error });
  //   }
  // }
});

chatMessageSchema.post(['find', 'findOne', 'findOneAndUpdate'], async function (docs: any) {
  // Temporarily disabled decryption for demo purposes
  // if (Array.isArray(docs)) {
  //   for (const doc of docs) {
  //     if (doc && doc.content) {
  //       try {
  //         doc.content = await decryptValue(doc.content);
  //       } catch (error) {
  //         log.error('Error decrypting chat message content', { error });
  //       }
  //     }
  //   }
  // } else if (docs && docs.content) {
  //   try {
  //     docs.content = await decryptValue(docs.content);
  //   } catch (error) {
  //     log.error('Error decrypting chat message content', { error });
  //   }
  // }
});

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessage;
