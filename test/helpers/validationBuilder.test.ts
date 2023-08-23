import {GroupValidator} from '../../src/validation/GroupValidator';
import {isBoolean, isString} from '../../src/helpers/validationFunctions';
import {
  groupValidatorBuilder as gb,
  listValidatorBuilder as lb,
} from '../../src/helpers/validatorBuilder';

describe('Testing the Validator Builders', () => {
  it('Should build a GroupValidator', () => {
    const validator = gb({
      email: ['test@mydomain.com', isString],
      person: gb({
        name: ['Jon', isString],
        lastname: ['Doe', isString],
      }),
    });

    // Validate value is correct
    const value = validator.value;
    expect(value.email).toBe('test@mydomain.com');
    expect(value.person).toBeTruthy();
    expect(value.person.name).toBe('Jon');
    expect(value.person.lastname).toBe('Doe');

    // Validate it validates
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(true);

    // Check nodes structure
    expect(validator.children.email.parent).toBe(validator);
    expect(validator.children.person.parent).toBe(validator);
    // Person validator nodes structure
    const personV = <GroupValidator<typeof value.person>>(
      validator.children.person
    );
    expect(personV.children.name.parent).toBe(personV);
    expect(personV.children.lastname.parent).toBe(personV);
  });

  it('Should build a ListValidator', () => {
    const validator = lb([['Admin', isString], ['Reader'], ['Test']]);

    // Validate value is correct
    const value = validator.value;
    expect(value.length).toBe(3);
    expect(value[0]).toBe('Admin');
    expect(value[1]).toBe('Reader');
    expect(value[2]).toBe('Test');

    // Validate it validates
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(true);

    // Check nodes structure
    expect(validator.children[0].parent).toBe(validator);
    expect(validator.children[1].parent).toBe(validator);
    expect(validator.children[2].parent).toBe(validator);
  });

  it('Should build a mix of Validators', () => {
    const validator = gb({
      name: ['Harry Potter', isBoolean],
      fans: lb([
        gb({
          name: ['Jon'],
          lastname: ['Doe'],
          likings: lb([['magic'], ['story']]),
        }),
        gb({
          name: ['Alfonso'],
          lastname: ['Valencia'],
          likings: lb([['epic'], ['drama']]),
        }),
      ]),
    });

    // Validate value is correct
    const value = validator.value;
    expect(value.name).toBe('Harry Potter');
    expect(Array.isArray(value.fans)).toBe(true);
    expect(value.fans.length).toBe(2);
    expect(value.fans[0].name).toBe('Jon');
    expect(value.fans[0].lastname).toBe('Doe');
    expect(value.fans[1].name).toBe('Alfonso');
    expect(value.fans[1].lastname).toBe('Valencia');
    expect(Array.isArray(value.fans[0].likings)).toBe(true);
    expect(Array.isArray(value.fans[1].likings)).toBe(true);
    expect(value.fans[0].likings[0]).toBe('magic');
    expect(value.fans[0].likings[1]).toBe('story');
    expect(value.fans[1].likings[0]).toBe('epic');
    expect(value.fans[1].likings[1]).toBe('drama');

    // Validate it validates
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(false);
    validator.getValidator('name').validationFunctions = [isString];
    expect(() => validator.validate()).not.toThrow();
    expect(validator.valid).toBe(true);
  });
});
