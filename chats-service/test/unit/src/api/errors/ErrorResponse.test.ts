import { ErrorResponse } from '../../../../../src/api/errors/ErrorResponse';
import { toStandardErrorCode, toStandardErrorFormat } from '../../../../../src/api/errors/errorCodes';

describe('ErrorResponse', () => {
  it('should correctly initialize with constructor', () => {
    const error = new ErrorResponse();
    expect(error.get()).toEqual([]);
  });

  it('should correctly initialize with constructor and error', () => {
    const error = new ErrorResponse('Test error');
    expect(error.get()).toEqual([toStandardErrorFormat('Test error')]);
  });

  it('should push error of type string', () => {
    const error = new ErrorResponse();
    error.push('Test error');
    expect(error.get()).toEqual([toStandardErrorFormat('Test error')]);
  });

  it('should push error of type object', () => {
    const error = new ErrorResponse();
    const errorObject = {
      code: 'ERROR_CODE',
      message: 'Error message',
      description: 'Error description'
    };
    error.push(errorObject);
    expect(error.get()).toEqual([
      {
        code: toStandardErrorCode(errorObject.code),
        message: errorObject.message,
        description: errorObject.description
      }
    ]);
  });

  it('should push error of type ErrorResponse', () => {
    const error = new ErrorResponse();
    const errorResponse = new ErrorResponse('Test error');
    error.push(errorResponse);
    expect(error.get()).toEqual([toStandardErrorFormat('Test error')]);
  });

  it('should push error with constraints', () => {
    const error = new ErrorResponse();
    const errorWithConstraints = {
      errors: [
        {
          constraints: {
            constraint1: 'Constraint 1 message',
            constraint2: 'Constraint 2 message'
          }
        }
      ]
    };
    error.push(errorWithConstraints);
    expect(error.get()).toEqual([
      toStandardErrorFormat('Constraint 1 message'),
      toStandardErrorFormat('Constraint 2 message')
    ]);
  });

  it('should push error with nested constraints', () => {
    const error = new ErrorResponse();
    const errorWithNestedConstraints = {
      errors: [
        {
          children: [
            {
              constraints: {
                constraint1: 'Constraint 1 message',
                constraint2: 'Constraint 2 message'
              }
            }
          ]
        }
      ]
    };
    error.push(errorWithNestedConstraints);
    expect(error.get()).toEqual([
      toStandardErrorFormat('Constraint 1 message'),
      toStandardErrorFormat('Constraint 2 message')
    ]);
  });
});
