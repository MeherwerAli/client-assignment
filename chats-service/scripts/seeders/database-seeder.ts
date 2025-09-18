import { AppDataSource } from '../../src/database/data-source';
import { ChatSession } from '../../src/api/entities/ChatSession';
import { ChatMessage } from '../../src/api/entities/ChatMessage';

export class DatabaseSeeder {
  /**
   * Seed development data
   */
  static async seedDevelopmentData(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const sessionRepository = AppDataSource.getRepository(ChatSession);
      const messageRepository = AppDataSource.getRepository(ChatMessage);

      console.log('🌱 Seeding development data...');

      // Create demo sessions for different users
      const demoSessions = [
        {
          title: 'Welcome to Chat Service',
          userId: 'demo-user-1',
          isFavorite: true
        },
        {
          title: 'TypeScript Help',
          userId: 'demo-user-1',
          isFavorite: false
        },
        {
          title: 'Project Planning',
          userId: 'demo-user-1',
          isFavorite: true
        },
        {
          title: 'Technical Discussion',
          userId: 'demo-user-2',
          isFavorite: false
        },
        {
          title: 'Code Review Notes',
          userId: 'demo-user-2',
          isFavorite: true
        }
      ];

      const sessions = sessionRepository.create(demoSessions);
      const savedSessions = await sessionRepository.save(sessions);

      // Create demo messages
      const demoMessages = [
        // Session 1 - Welcome conversation
        {
          sessionId: savedSessions[0].id,
          sender: 'user' as const,
          content: 'Hello! I\'m excited to try out this chat service.',
          session: savedSessions[0]
        },
        {
          sessionId: savedSessions[0].id,
          sender: 'assistant' as const,
          content: 'Welcome! I\'m here to help you with any questions you might have. This chat service supports various types of conversations.',
          session: savedSessions[0]
        },
        {
          sessionId: savedSessions[0].id,
          sender: 'user' as const,
          content: 'What kind of things can we discuss?',
          session: savedSessions[0]
        },
        {
          sessionId: savedSessions[0].id,
          sender: 'assistant' as const,
          content: 'We can discuss programming, project planning, problem-solving, or just have a general conversation. What would you like to explore?',
          session: savedSessions[0]
        },

        // Session 2 - TypeScript help
        {
          sessionId: savedSessions[1].id,
          sender: 'user' as const,
          content: 'I need help with TypeScript interfaces. Can you explain the difference between interfaces and types?',
          context: { topic: 'typescript', subtopic: 'interfaces' },
          session: savedSessions[1]
        },
        {
          sessionId: savedSessions[1].id,
          sender: 'assistant' as const,
          content: 'Great question! Both interfaces and types can define object shapes, but there are key differences:\n\n1. **Interfaces** are more extensible - you can declare them multiple times and they\'ll merge\n2. **Types** are more flexible - they can represent unions, primitives, and computed types\n3. **Interfaces** work better with classes and inheritance\n4. **Types** are better for complex type manipulations',
          context: { topic: 'typescript', subtopic: 'interfaces' },
          session: savedSessions[1]
        },

        // Session 3 - Project planning
        {
          sessionId: savedSessions[2].id,
          sender: 'user' as const,
          content: 'I\'m starting a new web application project. What should I consider for the architecture?',
          context: { topic: 'project-planning', phase: 'architecture' },
          session: savedSessions[2]
        },
        {
          sessionId: savedSessions[2].id,
          sender: 'assistant' as const,
          content: 'For a web application architecture, consider these key areas:\n\n**Frontend**: React/Vue/Angular + state management\n**Backend**: REST/GraphQL API with proper database design\n**Infrastructure**: Deployment, monitoring, and scaling\n**Security**: Authentication, authorization, data protection\n**Testing**: Unit, integration, and e2e testing strategies\n\nWhat type of application are you building?',
          context: { topic: 'project-planning', phase: 'architecture' },
          session: savedSessions[2]
        },

        // Session 4 - Technical discussion (different user)
        {
          sessionId: savedSessions[3].id,
          sender: 'user' as const,
          content: 'What are the benefits of using microservices vs monolithic architecture?',
          context: { topic: 'architecture', subtopic: 'microservices' },
          session: savedSessions[3]
        },
        {
          sessionId: savedSessions[3].id,
          sender: 'assistant' as const,
          content: 'Both architectures have their place:\n\n**Microservices Benefits:**\n- Independent scaling and deployment\n- Technology diversity\n- Team autonomy\n- Fault isolation\n\n**Monolithic Benefits:**\n- Simpler development and testing\n- Better performance (no network calls)\n- Easier deployment for small teams\n- Less operational complexity\n\nThe choice depends on team size, system complexity, and scaling requirements.',
          context: { topic: 'architecture', subtopic: 'microservices' },
          session: savedSessions[3]
        }
      ];

      const messages = messageRepository.create(demoMessages);
      await messageRepository.save(messages);

      // Update last message timestamps for sessions
      for (const session of savedSessions) {
        const lastMessage = await messageRepository.findOne({
          where: { sessionId: session.id },
          order: { createdAt: 'DESC' }
        });
        
        if (lastMessage) {
          session.lastMessageAt = lastMessage.createdAt;
          await sessionRepository.save(session);
        }
      }

      console.log(`✅ Successfully seeded ${savedSessions.length} sessions and ${messages.length} messages`);
    } catch (error) {
      console.error('❌ Failed to seed development data:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      console.log('🧹 Clearing all data...');

      // Clear in proper order (messages first due to foreign key)
      await AppDataSource.query('DELETE FROM chat_messages');
      await AppDataSource.query('DELETE FROM chat_sessions');

      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Reset database (clear + seed)
   */
  static async resetDatabase(): Promise<void> {
    await this.clearAllData();
    await this.seedDevelopmentData();
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      DatabaseSeeder.seedDevelopmentData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'clear':
      DatabaseSeeder.clearAllData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reset':
      DatabaseSeeder.resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: ts-node database-seeder.ts [seed|clear|reset]');
      process.exit(1);
  }
}
