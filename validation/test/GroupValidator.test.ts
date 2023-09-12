import {expect, it, describe} from 'vitest';
import {GroupValidator} from '../src/GroupValidator';
import {InferValidator} from '../src/helpers/Inference';
import {Validator} from '../src/Validator';
import {ValidationError} from '../src/errors/ValidationError';
import {isString} from '../src/helpers/typeFunctions';

describe('Tests the GroupValidator class', () => {
  const post = new GroupValidator(true, {
    title: new Validator(isString()),
    body: new Validator(isString()),
    author: new GroupValidator(true, {
      name: new Validator(isString()),
      lastname: new Validator(isString()),
    }),
    clones: new GroupValidator(false, {
      id: new Validator(isString()),
    }),
  });

  type Post = InferValidator<typeof post>;
  const goodPost = {
    title: 'Building version v2.0.0!',
    body: "I figured v1.0.0 wasn't useful at all 😅",
    author: {name: 'Alfonso', lastname: 'Valencia'},
  } as Post;

  it('Should create a new instance of Validator', () => {
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
        expect(invalid._errors?.at(0)).toBe('Object cannot be null!');
      }
    }
    expect(post.lastValue).toBe(null);
    expect(() => post.validate(goodPost)).not.toThrow();
  });

  it('Should execute safe validation', () => {
    let result = post.validateSafe(undefined);
    expect(result).toBeTruthy();

    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value required!');
    expect(post.lastValue).toBe(undefined);

    result = post.validateSafe(null);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Object cannot be null!');
    expect(post.lastValue).toBe(null);

    result = post.validateSafe('test');
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?._errors).toBeTruthy();
    expect(result.invalid?._errors?.length).toBe(1);
    expect(result.invalid?._errors?.at(0)).toBe('Value must be an object!');
    expect(post.lastValue).toBe('test');

    result = post.validateSafe(goodPost);
    expect(result.invalid).toBeFalsy();
    expect(result.value).toBeTruthy();
    expect(result.value?.title).toBe('Building version v2.0.0!');
    expect(result.value?.body).toBe("I figured v1.0.0 wasn't useful at all 😅");
    expect(result.value?.author).toBeTruthy();
    expect(result.value?.author.name).toBe('Alfonso');
    expect(result.value?.author.lastname).toBe('Valencia');
    expect(result.value?.clones).toBeFalsy();

    result = post.validateSafe({...goodPost, clones: {id: 'someid'}});
    expect(result.invalid).toBeFalsy();
    expect(result.value).toBeTruthy();
    expect(result.value?.clones).toBeTruthy();
    expect(result.value?.clones?.id).toBe('someid');

    post
      .getValidator('title')
      .validationFunctions.push(value =>
        value.length > 10 ? 'Too long!' : undefined
      );
    result = post.validateSafe(goodPost);
    expect(result.invalid).toBeTruthy();
    expect(result.value).toBeFalsy();
    expect(result.invalid?.title).toBeTruthy();
    expect(result.invalid?.title?._errors?.at(0)).toBe('Too long!');
  });

  it('Should get and set validators', () => {
    const validator = post.getValidator('title');
    expect(validator).toBeTruthy();
    expect(validator.parent).toBe(post);
    expect(validator.lastValue).toBe('Building version v2.0.0!');
    expect(() => validator.validate('This is too long')).toThrow(
      ValidationError
    );
    expect(validator.validate('Not long')).toBe('Not long');

    const newValidator = new Validator(isString(), value =>
      value === '' ? 'String cannot be empty!' : undefined
    );
    expect(newValidator.parent).toBe(null);
    expect(() => post.setValidator('title', newValidator)).not.toThrow();
    expect(validator.parent).toBe(null);
    expect(newValidator.parent).toBe(post);
    expect(() => post.validate(goodPost)).not.toThrow();
    const {value, invalid} = post.validateSafe({...goodPost, title: ''});
    expect(value).toBeFalsy();
    expect(invalid).toBeTruthy();
    expect(invalid?.title?._errors?.at(0)).toBe('String cannot be empty!');
  });
});
