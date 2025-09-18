import mongoose, { Schema } from 'mongoose';
import { Logger } from '../../../src/lib/logger';
import { decryptValue, encryptValue } from '../../lib/env/helpers';
import { IChatMessage } from '../Interface/IChatMessage';

const log = new Logger(__filename);

const chatMessageSchema: Schema = new mongoose.Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    context: { type: Schema.Types.Mixed, required: false }
  },
  {
    timestamps: true
  }
);

chatMessageSchema.pre('save', function (next) {
  const message = this as any;
  if (message.isModified('content')) {
    try {
      message.content = encryptValue(message.content);
      log.debug('Content encrypted successfully for message');
    } catch (error: any) {
      log.error('Error encrypting chat message content', { error: error.message });
      // Allow saving without encryption if encryption fails
    }
  }
  next();
});

// Virtual property to hold original content before encryption
chatMessageSchema.virtual('decryptedContent').get(function() {
  if (this.content && typeof this.content === 'string') {
    try {
      return decryptValue(this.content);
    } catch (error: any) {
      log.error('Error decrypting content in virtual', { error: error.message });
      return this.content; // Return encrypted content if decryption fails
    }
  }
  return this.content;
});

// Ensure virtual fields are serialized and content is decrypted in JSON
chatMessageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Replace encrypted content with decrypted content
    if (ret.content && typeof ret.content === 'string') {
      try {
        const originalContent = ret.content;
        ret.content = decryptValue(ret.content);
        log.debug(`Content decrypted in toJSON: ${String(originalContent).substring(0, 20)}... -> ${String(ret.content).substring(0, 20)}...`);
      } catch (error: any) {
        log.error('Error decrypting content in toJSON transform', { error: error.message });
        // Keep encrypted content if decryption fails
      }
    }
    
    // Clean up the return object
    ret.id = ret._id.toString();
    ret.sessionId = ret.sessionId.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.decryptedContent;
    return ret;
  }
});

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

export default ChatMessage;
