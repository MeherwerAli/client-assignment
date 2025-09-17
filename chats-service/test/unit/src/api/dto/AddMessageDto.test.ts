import { validate } from 'class-validator';
import { AddMessageDto } from '../../../../../src/api/dto/AddMessageDto';

describe('AddMessageDto', () => {
  let dto: AddMessageDto;

  beforeEach(() => {
    dto = new AddMessageDto();
  });

  it('should pass validation with valid data', async () => {
    dto.sender = 'user';
    dto.content = 'Hello, this is a test message';
    dto.context = { some: 'data' };

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when sender is missing', async () => {
    dto.content = 'Hello, this is a test message';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmpty).toBe('Sender is required');
  });

  it('should fail validation when sender is invalid', async () => {
    dto.sender = 'invalid' as any;
    dto.content = 'Hello, this is a test message';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isIn).toBe('Sender must be one of: user, assistant, system');
  });

  it('should fail validation when content is missing', async () => {
    dto.sender = 'user';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmpty).toBe('Content is required');
  });

  it('should fail validation when content is empty', async () => {
    dto.sender = 'user';
    dto.content = '';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.minLength).toBe('Content cannot be empty');
  });

  it('should fail validation when content is too long', async () => {
    dto.sender = 'user';
    dto.content = 'a'.repeat(10001);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.maxLength).toBe('Content cannot be longer than 10000 characters');
  });

  it('should pass validation when context is undefined (optional)', async () => {
    dto.sender = 'user';
    dto.content = 'Hello, this is a test message';
    dto.context = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
