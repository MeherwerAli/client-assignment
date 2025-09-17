import { CODES } from '../../../../../src/api/errors/errorCodeConstants';
import { StdError, toStandardErrorCode, toStandardErrorFormat } from '../../../../../src/api/errors/errorCodes';

describe('errorCodes', () => {
  it('should format error to standard format when errObj is not provided', () => {
    const errCode = CODES.InvalidBody;
    const result: StdError = toStandardErrorFormat(errCode);
    expect(result.code).toBe('CHATS_SERVICE.GLOBAL.BODY_INVALID');
    expect(result.message).toBe('Invalid Request Parameters');
    expect(result.description).toBe('Invalid Request Parameters');
  });

  it('should format error to standard format when errObj does not have message or description', () => {
    const errCode = CODES.InvalidBody;
    const errObj = {};
    const result: StdError = toStandardErrorFormat(errCode, errObj);
    expect(result.code).toBe('CHATS_SERVICE.GLOBAL.BODY_INVALID');
    expect(result.message).toBe('Invalid Request Parameters');
    expect(result.description).toBe('Invalid Request Parameters');
  });

  it('should format error code to standard format', () => {
    const errCode = CODES.InvalidBody;
    const result: string = toStandardErrorCode(errCode);
    expect(result).toBe('CHATS_SERVICE.InvalidBody');
  });

  it('should return the same error code if it already has the standard prefix', () => {
    const errCode = 'CHATS_SERVICE.InvalidBody';
    const result: string = toStandardErrorCode(errCode);
    expect(result).toBe(errCode);
  });
});
