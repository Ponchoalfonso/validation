import {expect, it, describe} from 'vitest';
import {Validator} from '../src/Validator';
import {ValidationError} from '../src/errors/ValidationError';
import {isString} from '../src/helpers/typeFunctions';

describe('Tests the Validator class', () => {
  const validator = new Validator(isString(), value =>
    value.length > 10 ? 'Too long!' : undefined
  );

  it('Should create a new instance of Validator', () => {
    expect(validator).toBeTruthy();
    expect(validator.parent).toBe(null);
    expect(Array.isArray(validator.validationFunctions)).toBe(true);
  });

  it('Should execute regular validation', () => {
    expect(() => validator.validate(undefined)).toThrow(ValidationError);
    // Validate error contains invalid fields
    try {
      validator.validate(undefined);
      expect('Have error').toBe('No error here');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        const {invalid} = error;
        expect(invalid).toBeTruthy();
        expect(invalid._errors).toBeTruthy();
        expect(invalid._errors?.length).toBe(1);
        expect(invalid._errors?.at(0)).toBe('Value required!');
      }
    }
    expect(validator.lastValue).toBe(undefined);
    expect(validator.validate('test')).toBe('test');
  });

  it('Should execute safe validation', () => {
    let result = validator.validateSafe(undefined);
    expect(result).toBeTruthy();

    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value required!');
    expect(validator.lastValue).toBe(undefined);

    result = validator.validateSafe(null);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value must be a string!');
    expect(validator.lastValue).toBe(null);

    result = validator.validateSafe('test');
    expect(result.invalid).toBeFalsy();
    expect(result.value).toBe('test');
    expect(validator.lastValue).toBe('test');

    result = validator.validateSafe('A very long text');
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Too long!');
    expect(validator.lastValue).toBe('A very long text');
  });
});
