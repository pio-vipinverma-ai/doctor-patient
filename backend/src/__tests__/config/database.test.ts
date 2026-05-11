// Mock pg Pool before importing database module
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

// Import database module after mocking
import * as database from '../../config/database';

describe('Database Configuration', () => {
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Access the mocked pool instance
    mockPool = database.pool;
    
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    
    mockPool.connect.mockResolvedValue(mockClient);
  });

  describe('testConnection', () => {
    it('should successfully test database connection', async () => {
      const mockResult = { rows: [{ now: new Date() }] };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await database.testConnection();

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockPool.connect.mockRejectedValue(error);

      const result = await database.testConnection();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await database.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockResult = {
        rows: [{ id: 1 }],
        rowCount: 1,
      };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should execute query without parameters', async () => {
      const mockResult = {
        rows: [{ count: 10 }],
        rowCount: 1,
      };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query('SELECT COUNT(*) FROM users');

      expect(result).toEqual(mockResult);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query execution error');
      mockPool.query.mockRejectedValue(error);

      await expect(database.query('INVALID SQL')).rejects.toThrow('Query execution error');
    });
  });

  describe('transaction', () => {
    it('should execute transaction successfully', async () => {
      const mockResult = { id: 1 };
      const callback = jest.fn().mockResolvedValue(mockResult);

      mockClient.query.mockResolvedValue({});

      const result = await database.transaction(callback);

      expect(result).toEqual(mockResult);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockClient);
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Transaction error');
      const callback = jest.fn().mockRejectedValue(error);

      mockClient.query.mockResolvedValue({});

      await expect(database.transaction(callback)).rejects.toThrow('Transaction error');
      
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle rollback failures', async () => {
      const error = new Error('Callback failed');
      const callback = jest.fn().mockRejectedValue(error);

      mockClient.query.mockResolvedValue({});

      await expect(database.transaction(callback)).rejects.toThrow('Callback failed');
      
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('closePool', () => {
    it('should close database pool successfully', async () => {
      mockPool.end.mockResolvedValue(undefined);

      await database.closePool();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should handle close pool errors', async () => {
      const error = new Error('Close failed');
      mockPool.end.mockRejectedValue(error);

      await expect(database.closePool()).rejects.toThrow('Close failed');
    });
  });
});
