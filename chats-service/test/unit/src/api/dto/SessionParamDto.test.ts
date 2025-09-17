import { validate } from 'class-validator';
import { SessionParamDto } from '../../../../../src/api/dto/SessionParamDto';

describe('SessionParamDto', () => {
  let dto: SessionParamDto;

  beforeEach(() => {
    dto = new SessionParamDto();
  });

  it('should pass validation with valid MongoDB ObjectId', async () => {
    dto.id = '507f1f77bcf86cd799439011';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when id is missing', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmpty).toBe('Session ID is required');
  });

  it('should fail validation when id is not a valid MongoDB ObjectId', async () => {
    dto.id = 'invalid-id';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isMongoId).toBe('Session ID must be a valid MongoDB ObjectId');
  });

  it('should fail validation when id is not a string', async () => {
    (dto as any).id = 123;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBe('Session ID must be a string');
  });
});
