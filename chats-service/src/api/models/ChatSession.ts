import mongoose, { Schema } from 'mongoose';
import { Logger } from '../../../src/lib/logger';
import { decryptValue, encryptValue } from '../../lib/env/helpers';
import { IChatSession } from '../Interface/IChatSession';

const log = new Logger(__filename);

const chatSessionSchema: Schema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'New chat' },
    userId: { type: String, required: false },
    isFavorite: { type: Boolean, default: false },
    lastMessageAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to encrypt sensitive fields
chatSessionSchema.pre('save', function (next) {
  const session = this as any;
  
  // Encrypt title if modified (but not if it's the default "New chat")
  if (session.isModified('title') && session.title && session.title !== 'New chat') {
    try {
      session.title = encryptValue(session.title);
      log.debug('Session title encrypted successfully');
    } catch (error: any) {
      log.error('Error encrypting session title', { error: error.message });
      // Allow saving without encryption if encryption fails
    }
  }
  
  // Note: We don't encrypt userId as it's used for database queries and user isolation
  // Encrypting it would break session lookups and require query parameter encryption
  
  next();
});

// Ensure fields are decrypted when converted to JSON
chatSessionSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Decrypt title (but not if it's the default "New chat")
    if (ret.title && typeof ret.title === 'string' && ret.title !== 'New chat') {
      try {
        ret.title = decryptValue(ret.title);
        log.debug('Session title decrypted in toJSON');
      } catch (error: any) {
        log.error('Error decrypting session title in toJSON', { error: error.message });
        // Keep encrypted content if decryption fails
      }
    }
    
    // Note: userId is not encrypted, so no decryption needed
    
    // Clean up the return object
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);

export default ChatSession;
