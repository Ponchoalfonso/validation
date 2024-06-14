# @ponch/validation

A TypeScript library to make validations easy!

I recommend using this library with TypeScript with strict option enabled.

## Installation

```bash
npm install @ponch/validation
```

## Quick start

Validate datatypes easily.

```typescript
import {Validator, isString} from '@ponch/validation';

// Validator<string>
const validator = new Validator(isString());

// Throws error: 'Value must be a string!'
validator.validate(61);

// Throws error: 'Value required!'
validator.validate(undefined);

// Returns 'Hello world!'
validator.validate('Hello world!');
```

Define optional values.

```typescript
// Validator<string | undefined>
const validator = new Validator(isString(false));

// Returns undefined
validator.validate(undefined);

// Returns 'Hello world!'
validator.validate('Hello world!');
```

Add custom validation beyond just type checking.

```typescript
import {ValidationFn, Validator, isNumber} from '@ponch/validation';

const positiveNum: ValidationFn<number> = function (value: number) {
  if (value >= 0) return;
  return 'Value must be positive!';
};

// Validator<number>
const validator = new Validator(isNumber(), positiveNum);

// Throws error: 'Value must be positive!'
validator.validate(-7);

// Returns 10
validator.validate(10);
```

Additional Validation functions will not run unless datatype check is sucessful.

```typescript
// Throws error: 'Value must be a number!'
validator.validate(false);
```

Create Object validators of any shape with GroupValidator.

```typescript
import {GroupValidator, Validator, isNumber, isString} from '@ponch/validation';

// Validator<{name: string; lastname: string; age: number}>
const personValidator = new GroupValidator(true, {
  name: new Validator(isString()),
  lastname: new Validator(isString()),
  age: new Validator(isNumber()),
});

// Throws error: 'Object cannot be null!'
personValidator.validate(null);

// Returns a copy of the validated object.
personValidator.validate({name: 'Jon', lastname: 'Doe', age: 24});
```

Elements beyond the shape of the validator are ignored.

```typescript
// Returns {name: 'Jon', lastname: 'Doe', age: 24}
personValidator.validate({
  name: 'Jon',
  lastname: 'Doe',
  age: 24,
  email: 'jon@mydomain.com',
});
```

Create Array validators with ArrayValidator.

```typescript
import {ArrayValidator, Validator, isString} from '@ponch/validation';

// Validator<string[]>
const listValidator = new ArrayValidator(
  true,
  new Validator(isString()),
  arr => (arr.length > 0 ? undefined : 'Array cannot be empty!')
);

// Throws error: 'Array cannot empty!'
listValidator.validate([]);

// Returns a copy of the original array.
listValidator.validate(['Cool', 'Validations', '😎']);
```

Validate tuples of specific shape with TupleValidator.

```typescript
import {
  TupleValidator,
  Validator,
  isBoolean,
  isNumber,
  isString,
} from '@ponch/validation';

// Validator<[string, boolean, number]>
const tupleValidator = new TupleValidator(true, [
  new Validator(isString()),
  new Validator(isBoolean()),
  new Validator(isNumber()),
]);

// Returns a copy of the original tuple.
tupleValidator.validate(['prime', true, 61]);
```

You can also validate the rest of the tuple.

```typescript
// Validator<[string, boolean, number, ...string]>
const tupleValidator = new TupleValidator(
  true,
  [
    new Validator(isString()),
    new Validator(isBoolean()),
    new Validator(isNumber()),
  ],
  new Validator(isString()) // Rest validator
);

// Returns a copy of the original tuple.
tupleValidator.validate(['prime', true, 61, 'Prime numbers', '🥰']);
```

Combine the different types of validators as you need.

```typescript
import {
  ArrayValidator,
  GroupValidator,
  TupleValidator,
  Validator,
  isBoolean,
  isString,
} from '@ponch/validation';

const heroValidator = new GroupValidator(true, {
  name: new Validator(isString()),
  lastname: new Validator(isString()),
  codenames: new ArrayValidator(true, new Validator(isString())),
  teams: new ArrayValidator(false, new Validator(isString())),
  missions: new ArrayValidator(
    true,
    new TupleValidator(true, [
      new Validator(isString()), // Mission code
      new Validator(isString()), // Mission name
      new Validator(isBoolean()), // Mission success
    ])
  ),
});
```

Get the return type of your validator with the built in helping type
InferValidator

```typescript
import {InferValidator} from '@ponch/validation';
...
// Infer type of heroValidator
type Hero = InferValidator<typeof heroValidator>;
// Equivalent to
type Hero = {
  name: string;
  lastname: string;
  codenames: string[];
  teams: string[] | undefined;
  missions: [string, string, boolean][];
}

const hero: Hero = {
  name: 'Dick',
  lastname: 'Grayson',
  codenames: ['Nightwing', 'Robin'],
  teams: ['Teen Titans', 'Batman Family'],
  missions: [
    ['GTH0001', 'Saving Gotham', true],
    ['GTH0002', 'Saving Gotham again...', true],
  ],
};

// Returns a copy of the validated object.
heroValidator.validate(hero);
```

You can also use the validatorBuilder to create the same validators with less
text.

```typescript
import {validatorBuilder as builder} from '@ponch/validation';

const heroValidator = builder.group(true, {
  name: [isString()],
  lastname: [isString()],
  codenames: builder.array(true, [isString()]),
  teams: builder.array(false, [isString()]),
  missions: builder.tuple(true, [[isString()], [isString()], [isBoolean()]]),
});
```

## Reference

### Validator

A class that helps assert the type and rules of a value of unknwon shape.

#### Constructor

A Validator is instantiated with a [IsTypeFn](#istypefn) that will
help check the Type of unknown values.

```typescript
import {Validator, isString} from '@ponch/validation';

// Validator<string>
const validator = new Validator(isString());
```

Optionally you can pass a [ValidationFn](#validationfn) or an array of
ValidationFn to add further validations to your Validator object.

```typescript
import {ValidationFn, Validator, isString} from '@ponch/validation';

const maxLength: ValidationFn<string> = value =>
  value.length > 15 ? 'Only a maximum of 15 characters is allowed!' : undefined;

const validator = new Validator(isString(), maxLength);
```

#### Validate

The `Validate` method receives an unknown value, this value is validated against
the [IsTypeFn](#istypefn), if the assertion is successful then the value will be
passed to the [ValidationFn](#validationfn) if there are any. If the IsTypeFn or
any of the ValidationFn return errors then the method will throw a
[ValidationError](#validationerror) with the details of the failed validation.

```typescript
import {ValidationFn, Validator, isString} from '@ponch/validation';

const maxLength: ValidationFn<string> = value =>
  value.length > 15 ? 'Only a maximum of 15 characters is allowed!' : undefined;

const validator = new Validator(isString(), maxLength);

// Throws: ValidationError {_errors: ['Value must be a string!']}
validator.validate(0);

// Throws: ValidationError {_errors: ['Only a maximum of 15 characters is allowed!']}
validator.validate('Very very long text!');

// Returns: 'Hello world!'
validator.validate('Hello world!');
```

Note: If [IsTypeFn](#istypefn) throws a [ValidationError](#validationerror) with
a custom message, the Validate method will include the message in the error
details.

```typescript
import {IsTypeFn, ValidationError, Validator} from '@ponch/validation';

const isString: IsTypeFn<string> = (value): value is string =>
  typeof value === 'string';
const validator = new Validator(isString);

// Throws: ValidationError {_errors: ['Type validation failed!']}
validator.validate(null);

...

const isString: IsTypeFn<string> = (value): value is string => {
  if (typeof value !== 'string')
    throw new ValidationError('The value must be a string!');
  return true;
};
const validator = new Validator(isString);

// Throws: ValidationError {_errors: ['The value must be a string!']}
validator.validate(null);
```

#### ValidateSafe

The `ValidateSafe` method behaves in the same way as the Validate method, the
difference is that ValidateSafe will not throw an error instead will return an
object containing `value` when validation is successful or `invalid` containing
the details of the failded validation.

```typescript
import {ValidationFn, Validator, isString} from '@ponch/validation';

const maxLength: ValidationFn<string> = value =>
  value.length > 15 ? 'Only a maximum of 15 characters is allowed!' : undefined;

const validator = new Validator(isString(), maxLength);

// Returns: {invalid: {_errors: ['Value must be a string!']}}
validator.validateSafe(0);

// Returns: {invalid: {_errors: ['Only a maximum of 15 characters is allowed!']}}
validator.validate('Very very long text!');

// Returns: {value: 'Hello world!'}
validator.validate('Hello world!');
```

#### LastValue

The `LastValue` attribute contains a reference to the last value passed to the Validate or ValidateSafe mehtods.

```typescript
import {Validator, isString} from '@ponch/validation';

const validator = new Validator(isString());

validator.validate(0);
validator.lastValue; // 0

validator.validateSafe('Hello world!');
validator.lastValue; // 'Hello world!'
```

#### ValidationFunctions

The `ValidationFunctions` attribute is the array containing the
[ValidationFn](#validationfn) of the Validator object. You can use it to remove
or add validations.

```typescript
import {ValidationFn, Validator, isString} from '@ponch/validation';

const validator = new Validator(isString());

const maxLength: ValidationFn<string> = value =>
  value.length > 15 ? 'Only a maximum of 15 characters is allowed!' : undefined;
validator.validationFunctions.push(maxLength);
```

#### Parent

The `Parent` attribute helps you link multiple Validator objects together, its purpose is more clear when using GroupValidator, ArrayValidator or TupleValidator.

### GroupValidator

### IsTypeFn

A function type that receives an unknwon value and returns a boolean indicating
that the received parameter is of a certain type.

```typescript
const isNumber: IsTypeFn<number> = value => typeof value === 'number';
```

TypeScript has built in functionality that helps us do the this like so:

```typescript
const isNumber = (value: unknown): value is number => typeof value === 'number';
```

Having a type from this is helpful for type inference.

#### Built-in IsTypeFn functions

| Function name                 | Return type         |
| ----------------------------- | ------------------- |
| `isString()`                  | `IsTypeFn<string>`  |
| `isNumber()`                  | `IsTypeFn<boolean>` |
| `isBigInt()`                  | `IsTypeFn<bigint>`  |
| `isBoolean()`                 | `IsTypeFn<boolean>` |
| `isOject<T extends object>()` | `IsTypeFn<T>`       |
| `isArray<T>()`                | `IsTypeFn<T[]>`     |

All of these functions have a few overloads:

By default the param value received by these functions is `true`.

```typescript
isString(required: true): IsTypeFn<string>;
```

You can make the value optional by passing `required` as `false`.

```typescript
isString(required: false): IsTypeFn<string | undefined>;
```

You can also pass a `Predicate` function to add more rules on wether the value
is required or not.

```typescript
type Predicate = (value: string, validator: Validator<string>) => boolean;
isString(predicate: Predicate)): IsTypeFn<string | undefined>;
```

\* The `isObject` resulting function will not accept null values unless
`required` is passed as `false`.

#### Built-in isType

Additionally you can create more functions that behave in a similar fashion
using a function called `isType`.

```typescript
import {isType} from '@ponch/validation';

const isDate = isType<Date>('Date', value => value instanceof Date);

// isDate can now be used like so:
isDate(required: true): IsTypeFn<Date>;
isDate(required: false): IsTypeFn<Date | undefined>;
isDate(predicate: Predicate)): IsTypeFn<Date | undefined>;
```

The first parameter passed is a `string` used to throw a custom message when
typecheck is unsuccessful.

```typescript
import {Validator, isType} from '@ponch/validation';

const isDate = isType<Date>('Wonderful Date', value => value instanceof Date);

// Validator<Date>
const validator = new Validator(isDate());

// Throws error: 'Value must be a Wonderful Date!'
validator.validate(0);
```

The second parameter passed is the assertion function, this function receives an
`unknown` value and must return a `boolean` indicating that the received value
is of the desired type.

### ValidationFn

### ValidationError

#### InvalidFields
