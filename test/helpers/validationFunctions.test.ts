import {Validator} from '../../src/validation/Validator';
import {
  isBoolean,
  isNumber,
  isString,
} from '../../src/helpers/validationFunctions';

describe('Testing a built in set of validation functions', () => {
  it('Should validate with the isString function', () => {
    let validator = new Validator<unknown>('', isString);
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator.setValue(0);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>('', isString(false));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(false);

    validator = new Validator<unknown>('', isString(true));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      '',
      isString(() => true)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      '',
      isString(() => false)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(undefined);
    validator.validate();
    expect(validator.invalid).toBe(false);
  });

  it('Should validate with the isNumber function', () => {
    let validator = new Validator<unknown>(0, isNumber);
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator.setValue(true);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator.setValue(NaN);
    validator.validate();
    expect(validator.valid).toBe(true);

    validator = new Validator<unknown>(0, isNumber(false));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(false);

    validator = new Validator<unknown>(0, isNumber(true));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      0,
      isNumber(() => true)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      0,
      isNumber(() => false)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(undefined);
    validator.validate();
    expect(validator.invalid).toBe(false);
  });

  it('Should validate with the isBoolean function', () => {
    let validator = new Validator<unknown>(false, isBoolean);
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator.setValue('');
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(true, isBoolean(false));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(false);

    validator = new Validator<unknown>(true, isBoolean(true));
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      false,
      isBoolean(() => true)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(null);
    validator.validate();
    expect(validator.invalid).toBe(true);

    validator = new Validator<unknown>(
      true,
      isBoolean(() => false)
    );
    validator.validate();
    expect(validator.valid).toBe(true);

    validator.setValue(undefined);
    validator.validate();
    expect(validator.invalid).toBe(false);
  });
});
