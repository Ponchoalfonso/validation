import {describe, it} from 'vitest';
import {ArrayValidator} from '../src/ArrayValidator';
import {Validator} from '../src/Validator';
import {isNumber, isString} from '../src/helpers/typeFunctions';
import {TupleValidator} from '../src/TupleValidator';
import {InferValidator} from '../src/helpers/Inference';
import {expect} from 'vitest';
import {ValidationError} from '../src/errors/ValidationError';

describe('Tests the ArrayValidator class', () => {
  const list = new ArrayValidator(true, new Validator(isString()), arr =>
    arr.length === 0
      ? 'List cannot be empty!'
      : arr.length > 10
      ? 'List may not hold more than 10 elements!'
      : undefined
  );
  // [Name, Lastname, Age]
  const table = new ArrayValidator(
    true,
    new TupleValidator(true, [
      new Validator(isString()),
      new Validator(isString()),
      new Validator(isNumber()),
    ])
  );

  type List = InferValidator<typeof list>;
  type Table = InferValidator<typeof table>;

  const goodList: List = ['Test', 'Dummy', 'Cool', 'Amazing'];
  const titans: Table = [
    ['Dick', 'Grayson', 24],
    ['Garfield', 'Logan', 16],
    ['Rachel', 'Roth', 15],
    ['Damian', 'Wayne', 14],
  ];

  it('Should create a new instance of ArrayValidator', () => {
    expect(list).toBeTruthy();
    expect(list.parent).toBe(null);
    expect(Array.isArray(list.validationFunctions));
  });

  it('Should execute regular validation', () => {
    expect(() => list.validate(undefined)).toThrow(ValidationError);
    try {
      list.validate(null);
      expect('Have error').toBe('No error here');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        const {invalid} = error;
        expect(invalid).toBeTruthy();
        expect(invalid._errors).toBeTruthy();
        expect(invalid._errors?.length).toBe(1);
        expect(invalid._errors?.at(0)).toBe('Value must be an array!');
      }
    }
    expect(list.lastValue).toBe(null);
    expect(() => list.validate(goodList)).not.toThrow();
  });

  it('Should execute safe validation', () => {
    let result = list.validateSafe(undefined);
    expect(result).toBeTruthy();

    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value required!');
    expect(list.lastValue).toBe(undefined);

    result = list.validateSafe(23);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value must be an array!');
    expect(list.lastValue).toBe(23);

    result = list.validateSafe([false, 'hey', 24, {}]);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?.[0]?._errors?.at(0)).toBe('Value must be a string!');
    expect(result.invalid?.[1]).toBe(undefined);
    expect(result.invalid?.[2]?._errors?.at(0)).toBe('Value must be a string!');
    expect(result.invalid?.[3]?._errors?.at(0)).toBe('Value must be a string!');

    result = list.validateSafe([]);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('List cannot be empty!');

    result = list.validateSafe(Array.from({length: 11}, (_, k) => `${k}`));
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe(
      'List may not hold more than 10 elements!'
    );

    result = list.validateSafe(goodList);
    expect(result.value).toBeTruthy();
    expect(result.invalid).toBeFalsy();
    expect(result.value?.at(0)).toBe('Test');
    expect(result.value?.at(1)).toBe('Dummy');
    expect(result.value?.at(2)).toBe('Cool');
    expect(result.value?.at(3)).toBe('Amazing');

    const {invalid} = table.validateSafe([[0, undefined, 'test']]);
    expect(invalid).toBeTruthy();
    expect(invalid?.[0]?.[0]?._errors?.at(0)).toBe('Value must be a string!');
    expect(invalid?.[0]?.[1]?._errors?.at(0)).toBe('Value required!');
    expect(invalid?.[0]?.[2]?._errors?.at(0)).toBe('Value must be a number!');

    const {value} = table.validateSafe(titans);
    expect(value).toBeTruthy();
    expect(value?.length).toBe(4);
    expect(value?.[0].join('.')).toBe('Dick.Grayson.24');
    expect(value?.[1].join('.')).toBe('Garfield.Logan.16');
    expect(value?.[2].join('.')).toBe('Rachel.Roth.15');
    expect(value?.[3].join('.')).toBe('Damian.Wayne.14');
  });
});
