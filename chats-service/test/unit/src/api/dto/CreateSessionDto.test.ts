import { validate } from 'class-validator';
import { CreateSessionDto } from '../../../../../src/api/dto/CreateSessionDto';

describe('CreateSessionDto', () => {
  let dto: CreateSessionDto;

  beforeEach(() => {
    dto = new CreateSessionDto();
  });

  it('should pass validation with valid title', async () => {
    dto.title = 'Valid chat session title';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation when title is undefined (optional)', async () => {
    dto.title = undefined;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when title is empty string', async () => {
    dto.title = '';
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.minLength).toBe('Title cannot be empty');
  });

  it('should fail validation when title is too long', async () => {
    dto.title = 'a'.repeat(201);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.maxLength).toBe('Title cannot be longer than 200 characters');
  });

  it('should fail validation when title is not a string', async () => {
    (dto as any).title = 123;
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBe('Title must be a string');
  });
});
