import {
  constructLogMessage,
  decrypt,
  encrypt,
  getAlgorithmAES256CBC,
  isEmptyOrNull
} from '../../../../../src/lib/env/helpers';

jest.mock('../../../../../src/lib/env', () => ({
  getOsEnv: jest.fn().mockImplementation(key => {
    const configs = {
      APP_NAME: 'Test Application',
      APP_HOST: 'localhost',
      SOURCE_EMAIL: 'source@example.com', // Correct this to match expected value in SES email format test
      APP_PORT: '3000',
      PORT: '3000'
    };
    return configs[key];
  }),
  normalizePort: jest.fn().mockImplementation(val => parseInt(val, 10) || val),
  toBool: jest.fn().mockImplementation(value => value === 'true' || value === true),
  getPaths: jest.fn().mockImplementation(() => {
    return ['src/api/controllers/**/*Controller.ts'];
  }),
  getOsPaths: jest.fn().mockImplementation(() => {
    return ['src/api/controllers/**/*Controller.ts'];
  }),
  constants: {
    sourceEmail: 'source@example.com',
    encryption: {
      key: Buffer.alloc(32).toString('base64'), // 32 bytes key for AES-256
      iv: Buffer.alloc(16).toString('base64') // 16 bytes IV for AES
    }
  }
}));

describe('isEmptyOrNull', () => {
  it('should return true for null', () => {
    expect(isEmptyOrNull(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmptyOrNull(undefined)).toBe(true);
  });

  it('should return true for an empty string', () => {
    expect(isEmptyOrNull('')).toBe(true);
  });

  it('should return true for an empty object', () => {
    expect(isEmptyOrNull({})).toBe(true);
  });

  it('should return true for an empty array', () => {
    expect(isEmptyOrNull([])).toBe(true);
  });

  it('should return true for NaN', () => {
    expect(isEmptyOrNull(NaN)).toBe(true);
  });

  it('should return true for false', () => {
    expect(isEmptyOrNull(false)).toBe(true);
  });

  it('should return false for a non-empty string', () => {
    expect(isEmptyOrNull('not empty')).toBe(false);
  });

  it('should return false for a non-empty object', () => {
    expect(isEmptyOrNull({ key: 'value' })).toBe(false);
  });

  it('should return false for a non-empty array', () => {
    expect(isEmptyOrNull([1, 2, 3])).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isEmptyOrNull(1)).toBe(false);
  });

  it('should return false for true', () => {
    expect(isEmptyOrNull(true)).toBe(false);
  });
});

describe('constructLogMessage', () => {
  it('should construct a log message with file name and function name', () => {
    const fileName = 'testFile';
    const functionName = 'testFunction';
    const headers = {};

    const result = constructLogMessage(fileName, functionName, headers as any);

    expect(result).toEqual('testFile, testFunction :: ');
  });

  it('should append headers to the log message', () => {
    const fileName = 'testFile';
    const functionName = 'testFunction';
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'test-agent'
    };

    const result = constructLogMessage(fileName, functionName, headers as any);

    expect(result).toEqual(
      'testFile, testFunction ::  :: Content-Type :: application/json,  :: User-Agent :: test-agent, '
    );
  });

  it('should not append authorization, security, or x headers to the log message', () => {
    const fileName = 'testFile';
    const functionName = 'testFunction';
    const headers = {
      Authorization: 'Bearer token',
      'Security-Token': 'security-token',
      'X-Api-Key': 'api-key',
      'User-Agent': 'test-agent'
    };

    const result = constructLogMessage(fileName, functionName, headers as any);

    expect(result).toEqual('testFile, testFunction ::  :: User-Agent :: test-agent, ');
  });
});

describe('getAlgorithmAES256CBC', () => {
  it('should return aes-128-cbc for a 16 byte key', () => {
    const key = Buffer.alloc(16).toString('base64');
    expect(getAlgorithmAES256CBC(key)).toEqual('aes-128-cbc');
  });

  it('should return aes-192-cbc for a 24 byte key', () => {
    const key = Buffer.alloc(24).toString('base64');
    expect(getAlgorithmAES256CBC(key)).toEqual('aes-192-cbc');
  });

  it('should return aes-256-cbc for a 32 byte key', () => {
    const key = Buffer.alloc(32).toString('base64');
    expect(getAlgorithmAES256CBC(key)).toEqual('aes-256-cbc');
  });

  it('should throw an error for an invalid key length', () => {
    const key = Buffer.alloc(10).toString('base64');
    expect(() => getAlgorithmAES256CBC(key)).toThrow('Invalid key length 10');
  });
});

describe('encrypt', () => {
  it('should return encrypted string for valid inputs', () => {
    const plainText = 'Hello, World!';
    const key = Buffer.alloc(32).toString('base64'); // Correct key size for AES-256
    const iv = Buffer.alloc(16).toString('base64'); // Correct IV size for AES
    const encrypted = encrypt(plainText, key, iv);
    expect(encrypted).not.toEqual(plainText);
  });

  it('should throw an error for invalid key length', () => {
    const plainText = 'Hello, World!';
    const key = Buffer.alloc(10).toString('base64'); // Incorrect key size
    const iv = Buffer.alloc(16).toString('base64');
    expect(() => encrypt(plainText, key, iv)).toThrow('Invalid key length 10');
  });

  it('should throw an error for invalid IV length', () => {
    const plainText = 'Hello, World!';
    const key = Buffer.alloc(32).toString('base64');
    const iv = Buffer.alloc(10).toString('base64'); // Incorrect IV size
    expect(() => encrypt(plainText, key, iv)).toThrow();
  });
});

describe('decrypt', () => {
  it('should return decrypted string for valid inputs', () => {
    const plainText = 'Hello, World!';
    const key = Buffer.alloc(32).toString('base64');
    const iv = Buffer.alloc(16).toString('base64');
    const encrypted = encrypt(plainText, key, iv);
    const decrypted = decrypt(encrypted, key, iv);
    expect(decrypted).toEqual(plainText);
  });

  it('should throw an error for invalid key length', () => {
    const encryptedText = 'Hello, World!';
    const key = Buffer.alloc(10).toString('base64');
    const iv = Buffer.alloc(16).toString('base64');
    expect(() => decrypt(encryptedText, key, iv)).toThrow('Invalid key length 10');
  });

  it('should throw an error for invalid IV length', () => {
    const encryptedText = 'Hello, World!';
    const key = Buffer.alloc(32).toString('base64');
    const iv = Buffer.alloc(10).toString('base64');
    expect(() => decrypt(encryptedText, key, iv)).toThrow();
  });
});
