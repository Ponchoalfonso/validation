import {GroupValidator} from '../../src/validation/GroupValidator';
import {ValidationFunction, Validator} from '../../src/validation/Validator';

type Person = {name: string; lastname: string};
type User = {email: string; person: Person};

describe('Tests the GroupValidator class', () => {
  let validator: GroupValidator<User>;
  beforeAll(() => {
    validator = new GroupValidator({
      email: new Validator('poncho@mydomain.com'),
      person: new GroupValidator({
        name: new Validator('Alfonso'),
        lastname: new Validator('Valencia'),
      }),
    });
  });

  it('Should create a new instance of GroupValidator', () => {
    expect(validator).toBeTruthy();
    expect(validator.valid).toBe(true);
    expect(validator.invalid).toBe(false);
    expect(validator.errors.length).toBe(0);

    const value = validator.value;
    expect(value.email).toBe('poncho@mydomain.com');
    expect(value.person.name).toBe('Alfonso');
    expect(value.person.lastname).toBe('Valencia');
  });

  it('Should set a new value correctly', () => {
    const user: User = {
      email: 'alfonso@mydomain.com',
      person: {name: 'Poncho', lastname: 'Sandoval'},
    };
    expect(() => {
      validator.setValue(user);
    }).not.toThrow();

    const value = validator.value;
    expect(value.email).toBe('alfonso@mydomain.com');
    expect(value.person.name).toBe('Poncho');
    expect(value.person.lastname).toBe('Sandoval');
  });

  it('Should patch and read single attributes in the GroupValidator', () => {
    expect(() => {
      validator.patchValue('email', 'john@mydomain.com');
    }).not.toThrow();

    expect(validator.getValue('email')).toBe('john@mydomain.com');

    expect(() => {
      validator.patchValue('person', {name: 'John', lastname: 'Doe'});
    }).not.toThrow();

    const person = validator.getValue('person');
    expect(person.name).toBe('John');
    expect(person.lastname).toBe('Doe');
  });

  it('Should get a single Validator from the GroupValidator', () => {
    const v = validator.getValidator('email');
    expect(v).toBeTruthy();
    expect(v).toBeInstanceOf(Validator);
  });

  it('Should override a children validator in GroupValidator', () => {
    const vOld = validator.getValidator('email');
    const vNew = new Validator('test@mydomain.com');

    expect(() => {
      validator.setValidator('email', vNew);
    }).not.toThrow();
    expect(validator.getValidator('email')).toBe(vNew);
    expect(vOld.parent).toBeNull();
  });

  it('Should validate the GroupValidator', () => {
    const isString: ValidationFunction = ({value}) => {
      if (typeof value !== 'string') return 'Value is not a string!';
      return null;
    };

    const checkDomain = (domain: string): ValidationFunction => {
      return ({value}) => {
        if (typeof value !== 'string' || value.endsWith(domain)) return null;
        return `Given value does not belong to domain: ${domain}`;
      };
    };

    const checkLastname = (lastname: string): ValidationFunction => {
      return ({value}) => {
        if (typeof value !== 'string' || value === lastname) return null;
        return `Lastname must be: ${lastname}`;
      };
    };

    validator
      .getValidator('email')
      .validationFunctions.push(isString, checkDomain('mydomain.io'));

    const pValidator = <GroupValidator<Person>>validator.getValidator('person');
    pValidator.getValidator('name').validationFunctions.push(isString);
    pValidator
      .getValidator('lastname')
      .validationFunctions.push(isString, checkLastname('Valencia'));

    // Validate invalid cases
    // {email: 'test@mydomain.com', person: {name: 'John', lastname: 'Doe'}}
    expect(() => {
      validator.validate();
    }).not.toThrow();
    expect(validator.valid).toBe(false);
    expect(validator.invalid).toBe(true);

    // Validate valid cases
    validator.setValue({
      email: 'poncho@mydomain.io',
      person: {name: 'Alfonso', lastname: 'Valencia'},
    });
    validator.validate();

    expect(validator.valid).toBe(true);
    expect(validator.invalid).toBe(false);
  });
});
