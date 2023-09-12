import {ArrayValidator} from '../../src/ArrayValidator';
import {GroupValidator} from '../../src/GroupValidator';
import {TupleValidator} from '../../src/TupleValidator';
import {ValidationFn} from '../../src/Validator';
import {ValidationError} from '../../src/errors/ValidationError';
import {InferValidator} from '../../src/helpers/Inference';
import {isBoolean, isNumber, isString} from '../../src/helpers/typeFunctions';
import {validatorBuilder as builder} from '../../src/helpers/validatorBuilder';
import {describe, expect, it, test} from 'vitest';

describe('Testing the ValidatorBuilder functions', () => {
  const person = builder.group(true, {
    name: [isString()],
    lastname: [isString()],
    age: [isNumber()],
    active: [isBoolean()],
  });

  it('Should build GroupValidators', () => {
    expect(person).toBeInstanceOf(GroupValidator);
  });

  test('GroupValidator should validate', () => {
    expect(() => person.validate(null)).toThrow(ValidationError);
    expect(() =>
      person.validate({
        name: 'Alfonso',
        lastname: 'Valencia',
        age: 24,
        active: false,
      })
    ).not.toThrow();
  });

  const length =
    <T extends {length: number}>(
      operation: '=' | '>' | '<' | '>=' | '<=',
      length: number
    ): ValidationFn<T | undefined> =>
    obj => {
      if (obj === null || obj === undefined) return;
      switch (operation) {
        case '=':
          return obj.length === length
            ? undefined
            : `Length must be equal to ${length}!`;

        case '>':
          return obj.length > length
            ? undefined
            : `Length must be greater than ${length}!`;

        case '<':
          return obj.length < length
            ? undefined
            : `Length must be less than ${length}!`;
        case '>=':
          return obj.length >= length
            ? undefined
            : `Length must be greater than or equal to ${length}!`;

        case '<=':
          return obj.length <= length
            ? undefined
            : `Length must be less than or equal to ${length}!`;
      }
    };
  const list = builder.array(
    true,
    [isNumber()],
    [length('>', 0), length('<=', 10)]
  );

  test('Should build ArrayValidator', () => {
    expect(list).toBeInstanceOf(ArrayValidator);
  });

  test('ArrayValidator should validate', () => {
    expect(() => list.validate(null)).toThrow(ValidationError);

    let invalid = list.validateSafe([]).invalid;
    expect(invalid?._errors?.at(0)).toBe('Length must be greater than 0!');

    invalid = list.validateSafe(Array.from({length: 11}, (_, k) => k)).invalid;
    expect(invalid?._errors?.at(0)).toBe(
      'Length must be less than or equal to 10!'
    );

    expect(() =>
      list.validate(Array.from({length: 10}, (_, k) => k))
    ).not.toThrow();
  });

  const tuple = builder.tuple(
    true,
    [[isString()], [isString()], [isNumber()]],
    [isString()],
    [length('>', 0)]
  );

  test('Should build TupleValidator', () => {
    expect(tuple).toBeInstanceOf(TupleValidator);
  });

  test('TupleValidator should validate', () => {
    expect(() => tuple.validate(null)).toThrow(ValidationError);

    const {invalid} = tuple.validateSafe([]);
    expect(invalid?._errors?.at(0)).toBe('Length must be greater than 0!');

    const [name, lastname, age, ...codenames] = tuple.validate([
      'Dick',
      'Grayson',
      24,
      'Robin',
      'Nightwing',
    ]);

    expect(name).toBe('Dick');
    expect(lastname).toBe('Grayson');
    expect(age).toBe(24);
    expect(codenames.length).toBe(2);
    expect(codenames.at(0)).toBe('Robin');
    expect(codenames.at(1)).toBe('Nightwing');
  });

  test('Mixing all validators with builder', () => {
    const petOwner = builder.group(true, {
      name: [isString()],
      lastname: [isString()],
      vip: [isBoolean()],
      // Pet: [name, species, age]
      pets: builder.array(
        true,
        builder.tuple(true, [[isString()], [isString()], [isNumber()]])
      ),
      domicile: builder.group(false, {
        addressLine: [isString()],
        country: [isString()],
        state: [isString()],
        zipcode: [isNumber()],
      }),
    });
    expect(petOwner).toBeInstanceOf(GroupValidator);

    type PetOwner = InferValidator<typeof petOwner>;
    const someOwner: PetOwner = {
      name: 'Alfonso',
      lastname: 'Valencia',
      pets: [['Kira', 'Dog', 4]],
      vip: true,
      domicile: {
        addressLine: 'Prime number street #61',
        country: 'Prime nation',
        state: 'Fibonacci',
        zipcode: 28657,
      },
    };
    expect(() => petOwner.validate(someOwner)).not.toThrow();
  });
});
