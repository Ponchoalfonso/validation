import {ListValidator} from '../../src/validation/ListValidator';
import {ValidationFunction, Validator} from '../../src/validation/Validator';

describe('Tests the GroupValidator class', () => {
  let validator: ListValidator<string>;
  beforeEach(() => {
    validator = new ListValidator(
      Array.from({length: 3}, () => new Validator(''))
    );
  });

  it('Should create a new instance of ListValidator', () => {
    expect(validator).toBeTruthy();
    expect(validator.valid).toBe(true);
    expect(validator.invalid).toBe(false);
    expect(validator.errors.length).toBe(0);
    expect(Array.isArray(validator.value)).toBe(true);
    expect(validator.value.length).toBe(3);
    expect(validator.value[0]).toBe('');
  });

  it('Should set a new value correctly', () => {
    expect(() => validator.setValue(['Test', 'Jon', 'Doe'])).not.toThrow();

    const value = validator.value;
    expect(value.length).toBe(3);
    expect(value[0]).toBe('Test');
    expect(value[1]).toBe('Jon');
    expect(value[2]).toBe('Doe');

    expect(() => validator.setValue(['C418', 'Jane'])).not.toThrow();
    expect(validator.getValue(3)).toBeFalsy();
    expect(() =>
      validator.setValue(['Sebastian', 'Christopher', 'Jeremy', 'Lena'])
    ).toThrow('Value list is longer than current ValidatorList.');

    // Creating inconsistent array by skipping places
    validator.setValidator(4, new Validator('Break it!'));
    expect(() =>
      validator.setValue(['Sebastian', 'Christopher', 'Jeremy', 'Lena'])
    ).toThrow('Cannot patch value of undefined.');
  });

  it('Should patch and read single values in the ListValidator', () => {
    expect(() => validator.patchValue(2, 'Smith')).not.toThrow();
    expect(validator.getValue(2)).toBe('Smith');
    expect(() => validator.patchValue(3, 'Break it!')).toThrow(
      'Cannot patch value of undefined.'
    );
  });

  it('Should get a single Validator from the ListValidator', () => {
    const v = validator.getValidator(0);
    expect(v).toBeTruthy();
    expect(v).toBeInstanceOf(Validator);
    expect(validator.getValidator(3)).toBeFalsy();
  });

  it('Should override a children validator in the ListValidator', () => {
    const vOld = validator.getValidator(0);
    const vNew = new Validator('test@mydomain.com');

    expect(() => {
      validator.setValidator(0, vNew);
    }).not.toThrow();
    expect(validator.getValidator(0)).toBe(vNew);
    expect(vOld?.parent).toBeNull();
  });

  it('Should validate the ListValidator', () => {
    const isString: ValidationFunction = ({value}) => {
      if (typeof value !== 'string') return 'Value is not a string!';
      return null;
    };

    const minWords = (count: number): ValidationFunction => {
      return ({value}) => {
        if (typeof value !== 'string') return null;
        return value.split(' ').length >= count
          ? null
          : `String must contain at least ${count} words!`;
      };
    };

    validator = new ListValidator(
      Array.from(
        {length: 3},
        (_, k) => new Validator('', [isString, minWords(k + 1)])
      )
    );
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(false);
    expect(validator.invalid).toBe(true);

    // Validate valid cases
    validator.setValue(['Ancestry', 'Stand Tall', 'Left to Bloom']);
    validator.validate();
    expect(validator.valid).toBe(true);
    expect(validator.invalid).toBe(false);

    // Validation should be reliable and skip empty values...
    validator.setValidator(
      6,
      new Validator('Floating Dream', [isString, minWords(2)])
    );
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(true);
  });
});
