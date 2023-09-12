import {IsTypeFn, Validator} from '../Validator';
import {ValidationError} from '../errors/ValidationError';

type Predicate<T = unknown> = (
  value: unknown,
  validator: Validator<T>
) => boolean;

const a = (str: string) => {
  let result: string;
  switch (str.toLowerCase().at(0)) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
      result = 'an';
      break;

    default:
      result = 'a';
      break;
  }
  return `${result} ${str}`;
};

export const isType =
  <T>(type: string, assertion: (value: unknown) => boolean) =>
  (obj: Predicate<T> | boolean): IsTypeFn<T> => {
    let required = true;
    let predicate: Predicate<T>;
    if (typeof obj === 'boolean') required = obj;
    else if (typeof obj === 'function') predicate = obj;

    const typeFn: IsTypeFn<T> = (value, validator): value is T => {
      if (predicate) required = predicate(value, validator);

      if (value === undefined && required)
        throw new ValidationError('Value required!');
      if (value === undefined || assertion(value)) return true;
      throw new ValidationError(`Value must be ${a(type)}!`);
    };

    return typeFn;
  };

/**
 * Creates a IsTypeFn that checks if given value is a string.
 * @param required Value that defines wether the value is required or not.
 */
export function isString(required?: true): IsTypeFn<string>;
/**
 * Creates a IsTypeFn that checks if given value is a string.
 * @param required Value that defines wether the value is required or not.
 */
export function isString(required: false): IsTypeFn<string | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is a string.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isString(
  predicate: Predicate<string>
): IsTypeFn<string | undefined>;
export function isString(
  obj: Predicate<string> | boolean = true
): IsTypeFn<string> | IsTypeFn<string | undefined> {
  return isType<string>('string', value => typeof value === 'string')(obj);
}

/**
 * Creates a IsTypeFn that checks if given value is a number.
 * @param required Value that defines wether the value is required or not.
 */
export function isNumber(required?: true): IsTypeFn<number>;
/**
 * Creates a IsTypeFn that checks if given value is a number.
 * @param required Value that defines wether the value is required or not.
 */
export function isNumber(required: false): IsTypeFn<number | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is a number.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isNumber(
  predicate: Predicate<number>
): IsTypeFn<number | undefined>;
export function isNumber(
  obj: Predicate<number> | boolean = true
): IsTypeFn<number> | IsTypeFn<number | undefined> {
  return isType<number>('number', value => typeof value === 'number')(obj);
}

/**
 * Creates a IsTypeFn that checks if given value is a bigint.
 * @param required Value that defines wether the value is required or not.
 */
export function isBigInt(required?: true): IsTypeFn<bigint>;
/**
 * Creates a IsTypeFn that checks if given value is a bigint.
 * @param required Value that defines wether the value is required or not.
 */
export function isBigInt(required: false): IsTypeFn<bigint | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is a bigint.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isBigInt(
  predicate: Predicate<bigint>
): IsTypeFn<bigint | undefined>;
export function isBigInt(
  obj: Predicate<bigint> | boolean = true
): IsTypeFn<bigint> | IsTypeFn<bigint | undefined> {
  return isType<bigint>('bigint', value => typeof value === 'bigint')(obj);
}

/**
 * Creates a IsTypeFn that checks if given value is a boolean.
 * @param required Value that defines wether the value is required or not.
 */
export function isBoolean(required?: true): IsTypeFn<boolean>;
/**
 * Creates a IsTypeFn that checks if given value is a boolean.
 * @param required Value that defines wether the value is required or not.
 */
export function isBoolean(required: false): IsTypeFn<boolean | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is a boolean.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isBoolean(
  predicate: Predicate<boolean>
): IsTypeFn<boolean | undefined>;
export function isBoolean(
  obj: Predicate<boolean> | boolean = true
): IsTypeFn<boolean> | IsTypeFn<boolean | undefined> {
  return isType<boolean>('boolean', value => typeof value === 'boolean')(obj);
}

/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isObject<T extends object>(required?: true): IsTypeFn<T>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isObject<T extends object>(
  required: false
): IsTypeFn<T | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isObject<T extends object>(
  required: boolean
): IsTypeFn<T | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isObject<T extends object>(
  predicate: Predicate<T>
): IsTypeFn<T | undefined>;
export function isObject<T extends object>(
  obj: Predicate<T> | boolean = true
): IsTypeFn<T> | IsTypeFn<T | undefined> {
  const isFn = isType<T>('object', value => typeof value === 'object')(obj);
  const final: IsTypeFn<T> = (value, validator): value is T => {
    const is = isFn(value, validator);
    if (is === false || value !== null) return is;

    const required = typeof obj === 'boolean' ? obj : obj(value, validator);
    if (required) throw new ValidationError('Object cannot be null!');
    return true;
  };

  return final;
}

/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isArray<T>(required?: true): IsTypeFn<T[]>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isArray<T>(required: false): IsTypeFn<T[] | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param required Value that defines wether the value is required or not.
 */
export function isArray<T>(required: boolean): IsTypeFn<T[] | undefined>;
/**
 * Creates a IsTypeFn that checks if given value is an object.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isArray<T>(
  predicate: Predicate<T[]>
): IsTypeFn<T[] | undefined>;
export function isArray<T>(
  obj: Predicate<T[]> | boolean = true
): IsTypeFn<T[]> | IsTypeFn<T[] | undefined> {
  return isType<T[]>('array', value => Array.isArray(value))(obj);
}
