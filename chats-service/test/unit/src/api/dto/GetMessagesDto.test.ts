import { validate } from 'class-validator';
import { GetMessagesDto } from '../../../../../src/api/dto/GetMessagesDto';

describe('GetMessagesDto', () => {
  let dto: GetMessagesDto;

  beforeEach(() => {
    dto = new GetMessagesDto();
  });

  it('should pass validation with valid data', async () => {
    dto.limit = 20;
    dto.skip = 10;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with default values', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.limit).toBe(50);
    expect(dto.skip).toBe(0);
  });

  it('should fail validation when limit is too low', async () => {
    dto.limit = 0;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toBe('Limit must be at least 1');
  });

  it('should fail validation when limit is too high', async () => {
    dto.limit = 101;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.max).toBe('Limit cannot be more than 100');
  });

  it('should fail validation when skip is negative', async () => {
    dto.skip = -1;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toBe('Skip must be at least 0');
  });
});
