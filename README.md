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

// Returns undefined'
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

Additional Validation functions will not run unless datatype is sucessful.

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

Get the return type of your validator with the built in helping type InferValidator

```typescript
import {InferValidator} from '@ponch/validation';
...
// Infer type of heroValidator
// {
//   name: string;
//   lastname: string;
//   codenames: string[];
//   teams: string[] | undefined;
//   missions: [string, string, boolean][];
// }
type Hero = InferValidator<typeof heroValidator>;

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

You can also use the validatorBuilder to create the same validators with less text.

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
