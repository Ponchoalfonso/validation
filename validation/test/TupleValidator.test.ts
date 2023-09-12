import {expect, it, describe} from 'vitest';
import {TupleValidator} from '../src/TupleValidator';
import {Validator} from '../src/Validator';
import {ValidationError} from '../src/errors/ValidationError';
import {InferValidator} from '../src/helpers/Inference';
import {isNumber, isString} from '../src/helpers/typeFunctions';

describe('Tests the TupleValidator class', () => {
  // [name, lastname, age]
  const person = new TupleValidator(true, [
    new Validator(isString()),
    new Validator(isString()),
    new Validator(isNumber()),
  ]);

  type Person = InferValidator<typeof person>;
  const goodPerson: Person = ['Jon', 'Doe', 24];

  // [id, ...keywords]
  const post = new TupleValidator(
    true,
    [
      new Validator(isString(), value =>
        value.startsWith('PT') && value.length === 10
          ? undefined
          : 'Invalid ID format!'
      ),
    ],
    new Validator(isString()),
    ([, ...keywords]) =>
      keywords.length === 0
        ? 'At least 1 keyword is required!'
        : keywords.length > 5
        ? 'A post can only contain up to 5 keywords!'
        : undefined
  );
  type Post = InferValidator<typeof post>;
  const goodPost: Post = [
    'PT83jd7490',
    'Amazing',
    'Validation',
    'Validate',
    'Easy',
  ];

  it('Should create a new instance of Validator', () => {
    expect(person).toBeTruthy();
    expect(person.parent).toBe(null);
    expect(Array.isArray(person.validationFunctions)).toBe(true);

    expect(post).toBeTruthy();
    expect(post.parent).toBe(null);
    expect(Array.isArray(post.validationFunctions)).toBe(true);
  });

  it('Should execute regular validation', () => {
    expect(() => post.validate(undefined)).toThrow(ValidationError);
    // Validate erros contains invalid fields
    try {
      post.validate(null);
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
    expect(post.lastValue).toBe(null);
    expect(() => post.validate(goodPost)).not.toThrow();
  });

  it('Should execute safe validation', () => {
    let result = person.validateSafe(undefined);
    expect(result).toBeTruthy();

    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value required!');
    expect(person.lastValue).toBe(undefined);

    result = person.validateSafe('test');
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value must be an array!');
    expect(person.lastValue).toBe('test');

    const badPerson = ['Alfonso', 'Valencia', '24'];
    result = person.validateSafe(badPerson);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?.[0]?._errors).toBeFalsy();
    expect(result.invalid?.[1]?._errors).toBeFalsy();
    expect(result.invalid?.[2]?._errors).toBeTruthy();
    expect(result.invalid?.[2]?._errors?.length).toBe(1);
    expect(result.invalid?.[2]?._errors?.at(0)).toBe('Value must be a number!');
    expect(person.lastValue).toBe(badPerson);

    result = person.validateSafe(goodPerson);
    expect(result.invalid).toBeFalsy();
    expect(result.value).toBeTruthy();
    expect(result.value?.[0]).toBe('Jon');
    expect(result.value?.[1]).toBe('Doe');
    expect(result.value?.[2]).toBe(24);

    // Testing tuple validator containing custom validations
    let result2 = post.validateSafe(goodPost);
    expect(result2.invalid).toBeFalsy();
    expect(result2.value).toBeTruthy();
    expect(result2.value?.length).toBe(5);
    expect(result2.value?.at(0)).toBe('PT83jd7490');
    expect(result2.value?.at(1)).toBe('Amazing');
    expect(result2.value?.at(2)).toBe('Validation');
    expect(result2.value?.at(3)).toBe('Validate');
    expect(result2.value?.at(4)).toBe('Easy');

    result2 = post.validateSafe(['Not an ID :P']);
    expect(result2.invalid).toBeTruthy();
    expect(result2.value).toBeFalsy();
    expect(result2.invalid?._errors?.length).toBe(1);
    expect(result2.invalid?._errors?.at(0)).toBe(
      'At least 1 keyword is required!'
    );
    expect(result2.invalid?.[0]?._errors?.length).toBe(1);
    expect(result2.invalid?.[0]?._errors?.at(0)).toBe('Invalid ID format!');

    goodPost.push('Great', 'Cool'); // Turning good post into badPost
    result2 = post.validateSafe(goodPost);
    expect(result2.invalid).toBeTruthy();
    expect(result2.value).toBeFalsy();
    expect(result2.invalid?._errors?.length).toBe(1);
    expect(result2.invalid?._errors?.at(0)).toBe(
      'A post can only contain up to 5 keywords!'
    );
  });
});
