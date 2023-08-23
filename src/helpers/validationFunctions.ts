import {
  ValidationErrors,
  ValidationFunction,
  Validator,
} from '../validation/Validator';

type Predicate = (validator: Validator) => boolean;

type AllowedTypes = 'string' | 'number' | 'boolean';
const isType =
  (type: AllowedTypes) =>
  (
    obj: Predicate | boolean | Validator
  ): ValidationFunction | ValidationErrors | null => {
    let required = true;
    let predicate: Predicate;
    if (typeof obj === 'boolean') required = obj;
    else if (typeof obj === 'function') predicate = obj;

    const valFn: ValidationFunction = validator => {
      if (predicate) required = predicate(validator);
      const {value} = validator;

      if ((value === null || value === undefined) && required)
        return 'Value required!';
      if (value === null || value === undefined || typeof value === type)
        return null;
      return `Value must be a ${type}!`;
    };

    if (obj instanceof Validator) return valFn(obj);
    return valFn;
  };

/**
 * Check if given value is a string.
 * Value is required by default
 */
export function isString(validator: Validator): ValidationErrors | null;
/**
 * Creates a ValidatorFunction that checks if given value is a string.
 * @param required Value that defines wether the value is required or not.
 */
export function isString(required: boolean): ValidationFunction;
/**
 * Creates a ValidatorFunction that checks if given value is a string.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isString(predicate: Predicate): ValidationFunction;
export function isString(
  obj: Predicate | boolean | Validator
): ValidationFunction | ValidationErrors | null {
  return isType('string')(obj);
}

/**
 * Check if given value is a number.
 * Value is required by default
 */
export function isNumber(validator: Validator): ValidationErrors | null;
/**
 * Creates a ValidatorFunction that checks if given value is a number.
 * @param required Value that defines wether the value is required or not.
 */
export function isNumber(required: boolean): ValidationFunction;
/**
 * Creates a ValidatorFunction that checks if given value is a number.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isNumber(predicate: Predicate): ValidationFunction;
export function isNumber(
  obj: Predicate | boolean | Validator
): ValidationFunction | ValidationErrors | null {
  return isType('number')(obj);
}

/**
 * Check if given value is a boolean.
 * Value is required by default.
 */
export function isBoolean(validator: Validator): ValidationErrors | null;
/**
 * Creates a ValidatorFunction that checks if given value is a boolean.
 * @param required Value that defines wether the value is required or not.
 */
export function isBoolean(required: boolean): ValidationFunction;
/**
 * Creates a ValidatorFunction that checks if given value is a boolean.
 * @param predicate Function that defines wether the value is required or not.
 */
export function isBoolean(predicate: Predicate): ValidationFunction;
export function isBoolean(
  obj: Predicate | boolean | Validator
): ValidationFunction | ValidationErrors | null {
  return isType('boolean')(obj);
}
