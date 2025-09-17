// MongoDB initialization script
print('Starting database initialization...');

// Switch to the chat_storage database
db = db.getSiblingDB('chat_storage');

// Drop existing collections if they exist
print('Dropping existing collections...');
db.chatsessions.drop();
db.chatmessages.drop();

// Create collections with validation
print('Creating chatsessions collection...');
db.createCollection('chatsessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'isFavorite'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        userId: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null'
        },
        isFavorite: {
          bsonType: 'bool',
          description: 'must be a boolean and is required'
        },
        lastMessageAt: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

print('Creating chatmessages collection...');
db.createCollection('chatmessages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'sender', 'content'],
      properties: {
        sessionId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        sender: {
          bsonType: 'string',
          enum: ['user', 'assistant', 'system'],
          description: 'must be one of the enum values and is required'
        },
        content: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        context: {
          bsonType: ['object', 'null'],
          description: 'must be an object or null'
        }
      }
    }
  }
});

// Create indexes for performance
print('Creating indexes...');
db.chatsessions.createIndex({ userId: 1 });
db.chatsessions.createIndex({ isFavorite: 1 });
db.chatsessions.createIndex({ lastMessageAt: -1 });

db.chatmessages.createIndex({ sessionId: 1 });
db.chatmessages.createIndex({ createdAt: -1 });
db.chatmessages.createIndex({ sessionId: 1, createdAt: -1 });

print('Database initialization completed successfully!');
