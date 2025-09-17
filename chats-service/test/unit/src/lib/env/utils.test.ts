import * as utils from '../../../../../src/lib/env/utils';

describe('utils', () => {
  beforeEach(() => {
    // Don't clear the entire process.env, just clear specific test vars
    delete process.env.TEST;
    delete process.env.TEST_PATH;
    delete process.env.TEST_PATHS;
    delete process.env.TEST_ARRAY;
  });

  it('getOsEnv', () => {
    process.env.TEST = 'test';
    expect(utils.getOsEnv('TEST')).toBe('test');
  });

  it('getPath', () => {
    process.env.NODE_ENV = 'production';
    expect(utils.getPath('src/test.ts')).toBe(process.cwd() + '/dist/src/test.js');
    process.env.NODE_ENV = 'development';
    expect(utils.getPath('src/test.ts')).toBe(process.cwd() + '/src/test.ts');
  });

  it('getPaths', () => {
    process.env.NODE_ENV = 'development';
    expect(utils.getPaths(['src/test1.ts', 'src/test2.ts'])).toEqual([
      process.cwd() + '/src/test1.ts',
      process.cwd() + '/src/test2.ts'
    ]);
  });

  it('getOsPath', () => {
    process.env.NODE_ENV = 'development';
    process.env.TEST_PATH = 'src/test.ts';
    expect(utils.getOsPath('TEST_PATH')).toBe(process.cwd() + '/src/test.ts');
  });

  it('getOsPaths', () => {
    process.env.NODE_ENV = 'development';
    process.env.TEST_PATHS = 'src/test1.ts,src/test2.ts';
    expect(utils.getOsPaths('TEST_PATHS')).toEqual([process.cwd() + '/src/test1.ts', process.cwd() + '/src/test2.ts']);
  });

  it('getOsEnvArray', () => {
    process.env.TEST_ARRAY = 'value1,value2';
    expect(utils.getOsEnvArray('TEST_ARRAY')).toEqual(['value1', 'value2']);
  });

  it('toNumber', () => {
    expect(utils.toNumber('123')).toBe(123);
  });

  it('toBool', () => {
    expect(utils.toBool('true')).toBe(true);
    expect(utils.toBool('false')).toBe(false);
  });

  it('normalizePort', () => {
    expect(utils.normalizePort('3000')).toBe(3000);
    expect(utils.normalizePort('namedPipe')).toBe('namedPipe');
  });

  it('getOsEnvBoolean', () => {
    process.env.TEST_BOOL = 'true';
    expect(utils.getOsEnvBoolean('TEST_BOOL')).toBe(true);
  });

  it('getOsEnvObj', () => {
    process.env.TEST_OBJ = JSON.stringify({ key: 'value' });
    expect(utils.getOsEnvObj('TEST_OBJ')).toEqual({ key: 'value' });
  });
});
