import {collectErrors} from '../../src/helpers/errorCollector';
import {isNumber, isString} from '../../src/helpers/validationFunctions';
import {GroupValidator} from '../../src/validation/GroupValidator';
import {ListValidator} from '../../src/validation/ListValidator';
import {Validator} from '../../src/validation/Validator';

describe('Testing the error collector function', () => {
  it('Should collect errors of Validator class', () => {
    const validator = new Validator(0, [isString]);
    validator.validate();
    const collection = collectErrors(validator);
    expect(collection).toBeTruthy();
    expect(Array.isArray(collection.errors)).toBe(true);
    expect(collection.errors?.length).toBe(1);
    expect(collection.errors?.at(0)).toBe('Value must be a string!');
  });

  it('Should collect errors of a mix of all Validator classes', () => {
    const validator = new GroupValidator({
      name: new Validator('Alfonso', isString),
      lastname: new Validator(null, isString),
      age: new Validator('24', isNumber),
      posts: new ListValidator<unknown>([
        new GroupValidator({
          title: new Validator('Clean Code!', isString),
          body: new Validator("Sometimes it sucks sometimes it doesn't", [
            isString,
          ]),
          date: new Validator('2023/08/20', isString),
          keywords: new ListValidator([
            new Validator('Clean', isString),
            new Validator('Code', isString),
          ]),
        }),
        new GroupValidator({
          title: new Validator('Faulty post!', isString),
          body: new Validator('Sometimes it BREAKS', [isString]),
          date: new Validator('2023/08/20', isString),
          keywords: new ListValidator<unknown>([
            new Validator(0, isString),
            new Validator('Code', isString),
          ]),
        }),
      ]),
    });
    validator.validate();
    const collection = collectErrors(validator);

    expect(collection).toBeTruthy();
    // Only 'name', 'age' and 'posts' should have errors.
    expect(collection.name).toBeFalsy();
    expect(collection.lastname).toBeTruthy();
    expect(collection.age).toBeTruthy();
    expect(collection.posts).toBeTruthy();
    // Field sepcific errors
    expect(collection.lastname.errors?.at(0)).toBe('Value required!');
    expect(collection.age.errors?.at(0)).toBe('Value must be a number!');
    // Only post index 1 shoult have errors.
    expect(collection.posts['0']).toBeFalsy();
    expect(collection.posts['1']).toBeTruthy();
    // Only 'keywords' should have errors.
    expect(collection.posts['1'].title).toBeFalsy();
    expect(collection.posts['1'].body).toBeFalsy();
    expect(collection.posts['1'].date).toBeFalsy();
    expect(collection.posts['1'].keywords).toBeTruthy();
    // Only keyword index 0 should have errors.
    expect(collection.posts['1'].keywords['0']).toBeTruthy();
    expect(collection.posts['1'].keywords['1']).toBeFalsy();
    // Field specific errors
    expect(collection.posts['1'].keywords['0'].errors?.at(0)).toBe(
      'Value must be a string!'
    );
  });
});
