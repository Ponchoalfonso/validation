import {ValidationFunction, Validator} from '../../src/validation/Validator';

describe('Tests the Validator class', () => {
  let validator: Validator<string>;

  beforeAll(() => {
    validator = new Validator('test value');
  });

  it('Should create a new instance of Validator', () => {
    expect(validator).toBeTruthy();
    expect(validator.valid).toBe(true);
    expect(validator.invalid).toBe(false);
    expect(validator.errors.length).toBe(0);
    expect(validator.value).toBe('test value');
  });

  it('Should validate and return errors', () => {
    const cannnotHaveSpaces: ValidationFunction = ({value}) => {
      if (typeof value !== 'string') return null;
      if (value.includes(' ')) return 'Value cannot have spaces!';
      return null;
    };
    validator.validationFunctions.push(cannnotHaveSpaces);
    expect(() => validator.validate()).not.toThrow();
    expect(validator.invalid).toBe(true);
    expect(validator.errors.length).toBe(1);
  });

  it('Should update the current value of the validator', () => {
    expect(validator.value).toBe('test value');
    expect(() => {
      validator.setValue('test_value');
    }).not.toThrow();
    expect(validator.value).toBe('test_value');
  });

  it('Should validate and return errors', () => {
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(true);
    expect(validator.errors.length).toBe(0);
  });
});
