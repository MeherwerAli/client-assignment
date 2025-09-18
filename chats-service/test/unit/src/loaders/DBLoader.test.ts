import { AppDataSource } from '../../../../src/database/data-source';
import connectDB from '../../../../src/loaders/DBLoader';

jest.mock('../../../../src/database/data-source');

describe('connectDB', () => {
  const mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    mockAppDataSource.initialize = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(mockAppDataSource, 'options', {
      value: {
        host: 'localhost',
        port: 5432,
        database: 'testDB'
      },
      writable: false
    });

    await connectDB();

    expect(mockAppDataSource.initialize).toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    const connectionError = new Error('Connection error');
    mockAppDataSource.initialize = jest.fn().mockRejectedValue(connectionError);

    await expect(connectDB()).rejects.toThrow('Connection error');
    expect(mockAppDataSource.initialize).toHaveBeenCalled();
  });
});
