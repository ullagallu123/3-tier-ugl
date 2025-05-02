const mysql = require('mysql2');

// Mock the mysql2 module
jest.mock('mysql2', () => {
  return {
    createConnection: jest.fn(() => ({
      connect: jest.fn(cb => cb()),
      query: jest.fn()
    }))
  };
});

// Mock console.error and process.exit
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

beforeAll(() => {
  console.error = jest.fn();
  process.exit = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  process.exit = originalProcessExit;
});

describe('Database Configuration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should create a connection with environment variables', () => {
    // Set environment variables for the test
    process.env.DB_HOST = 'test-host';
    process.env.DB_USER = 'test-user';
    process.env.DB_PASSWORD = 'test-password';
    process.env.DB_NAME = 'test-db';

    // Require the database module (which will use the environment variables)
    require('../db-config');

    // Check if createConnection was called with the correct parameters
    expect(mysql.createConnection).toHaveBeenCalledWith({
      host: 'test-host',
      user: 'test-user',
      password: 'test-password',
      database: 'test-db'
    });

    // Clean up environment variables
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });

  it('should handle connection errors', () => {
    // Mock the connection to simulate an error
    mysql.createConnection.mockReturnValueOnce({
      connect: jest.fn(cb => cb(new Error('Connection error'))),
      query: jest.fn()
    });

    // Require the database module (which will try to connect)
    require('../db-config');

    // Verify that error is logged and process.exit is called
    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalled();
  });
});