import {GroupValidator} from '../GroupValidator';
import {ArrayValidator} from '../ArrayValidator';
import {IsTypeFn, ValidationFn, Validator} from '../Validator';
import {InferRequired, InferTuple} from './Inference';
import {TupleValidator, ValidatorTuple} from '../TupleValidator';

type BuilderTuple<T = unknown> = [IsTypeFn<T>, ...ValidationFn<T>[]];

const groupBuilder = <R extends true | false = boolean, T extends object = {}>(
  required: R,
  group: {
    [K in keyof T]: BuilderTuple<T[K]> | Validator<T[K]>;
  },
  validationFunctions?: ValidationFn<InferRequired<R, T>>[]
): GroupValidator<R, T> => {
  const final = <{[K in keyof T]: Validator<T[K]>}>{};
  for (const key in group) {
    const child = group[key];
    if (child instanceof Validator) {
      final[key] = child;
    } else {
      const [isFn, ...validationFns] = <BuilderTuple<T[typeof key]>>child;
      final[key] = new Validator<T[Extract<keyof T, string>]>(
        isFn,
        validationFns
      );
    }
  }

  return new GroupValidator(required, final, validationFunctions);
};

const arrayBuilder = <R extends true | false = boolean, T = unknown>(
  required: R,
  validator: BuilderTuple<T> | Validator<T>,
  validationFunctions?: ValidationFn<InferRequired<R, T[]>>[]
): ArrayValidator<R, T> => {
  let final: Validator<T>;
  if (validator instanceof Validator) {
    final = validator;
  } else {
    const [isFn, ...validationFns] = validator;
    final = new Validator(isFn, validationFns);
  }

  return new ArrayValidator(required, final, validationFunctions);
};

type BuilderTupleTuple<T extends [...unknown[]]> = {
  [I in keyof T]: Validator<T[I]> | BuilderTuple<T[I]>;
};
const tupleBuilder = <
  O extends true | false = boolean,
  T extends [...unknown[]] = [...unknown[]],
  R = null,
>(
  required: O,
  validators: [...BuilderTupleTuple<T>],
  restValidator?: BuilderTuple<R> | Validator<R>,
  validationFunctions?: ValidationFn<InferRequired<O, InferTuple<T, R>>>[]
): TupleValidator<O, T, R> => {
  const final = <[...ValidatorTuple<T>]>[];
  for (const validator of validators) {
    if (validator instanceof Validator) {
      final.push(validator);
    } else {
      const [isFn, ...validationFns] = <BuilderTuple>validator;
      final.push(new Validator(isFn, validationFns));
    }
  }
  let rest: Validator<R> | undefined;
  if (restValidator) {
    if (restValidator instanceof Validator) {
      rest = restValidator;
    } else {
      const [isFn, ...validationFns] = restValidator;
      rest = new Validator(isFn, validationFns);
    }
  }

  return new TupleValidator(required, final, rest, validationFunctions);
};

export const validatorBuilder = {
  group: groupBuilder,
  array: arrayBuilder,
  tuple: tupleBuilder,
};
