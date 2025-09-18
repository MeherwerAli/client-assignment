import { validate } from 'class-validator';
import { SessionParamDto } from '../../../../../src/api/dto/SessionParamDto';

describe('SessionParamDto', () => {
  let dto: SessionParamDto;

  beforeEach(() => {
    dto = new SessionParamDto();
  });

  it('should pass validation with valid UUID', async () => {
    dto.id = '550e8400-e29b-41d4-a716-446655440000';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when id is missing', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmpty).toBe('Session ID is required');
  });

  it('should fail validation when id is not a valid UUID', async () => {
    dto.id = 'invalid-id';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isUuid).toBe('Session ID must be a valid UUID');
  });

  it('should fail validation when id is not a string', async () => {
    (dto as any).id = 123;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBe('Session ID must be a string');
  });
});
