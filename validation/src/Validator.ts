import {ValidationError} from './errors/ValidationError';

export type IsTypeFn<T> = (
  value: unknown,
  validator: Validator<T>
) => value is T;

export type ValidationErrors = string | string[];
export type ValidationFn<T = unknown> = (
  value: T,
  validator: Validator
) => ValidationErrors | undefined;

export type InvalidField = {
  _errors: string[];
};

export type InvalidFields<T> = {
  [K in keyof T]?: InvalidFields<T[K]>;
} & Partial<InvalidField>;

/**
 * A class to validate unknown data.
 */
export class Validator<T = unknown> {
  protected _lastValue: unknown;
  /**
   * The parent node of the current Validator.
   */
  parent: Validator | null = null;
  /**
   * The list of validation functions of the current Validator.
   */
  validationFunctions: ValidationFn<T>[];

  /**
   * Creates a new Validator Instance.
   * @param isType A type check function.
   * @param validationFn Functions that state validity of a value.
   *
   * @summary {@link isType} and {@link validationFn} are called when
   * {@link Validator.validate validate} or
   * {@link Validator.validateSafe validateSafe} is called.
   *
   * Note: To use custom error message when {@link isType} is executed make your
   * function throw a {@link ValidationError} with your custom message when type
   * check fails.
   */
  constructor(
    protected isType: IsTypeFn<T>,
    validationFn: ValidationFn<T>[] | ValidationFn<T> = []
  ) {
    this.validationFunctions = Array.isArray(validationFn)
      ? validationFn
      : [validationFn];
  }

  /**
   * Reference to the last value passed to
   * {@link Validator.validate validate} or
   * {@link Validator.validateSafe validateSafe}.
   */
  get lastValue(): unknown {
    return this._lastValue;
  }

  /**
   * Validates subject against the defined rules in the current Validator.
   * @param subject A value of unknown shape.
   * @returns Object containing 'value' if subject is valid otherwise 'invalid'.
   */
  validateSafe(subject: unknown): {value?: T; invalid?: InvalidFields<T>} {
    this._lastValue = subject;
    const errors: string[] = [];
    // Type check is run first.
    // If type check fails Validation functions will not be executed
    try {
      if (!this.isType(subject, this)) {
        errors.push('Type validation failed!');
        return {invalid: <InvalidFields<T>>{_errors: errors}};
      }
    } catch (error) {
      // A ValidationError can be thrown to pass a custom error message
      if (error instanceof ValidationError) {
        errors.push(error.message);
        return {invalid: <InvalidFields<T>>{_errors: errors}};
      } else throw error;
    }

    for (const validator of this.validationFunctions) {
      const error = validator(subject, <Validator>this);
      if (error)
        if (Array.isArray(error)) errors.concat(error);
        else errors.push(error);
    }

    if (errors.length > 0)
      return {invalid: <InvalidFields<T>>{_errors: errors}};
    return {value: subject};
  }

  /**
   * Validates subject against the defined rules in the current Validator.
   * @param subject A value of unknown shape.
   * @returns A reference of {@link subject} after being successfully validated.
   *
   * @throws A {@link ValidationError} when subject is invalid.
   */
  validate(subject: unknown): T {
    const {value, invalid} = this.validateSafe(subject);
    if (invalid)
      throw new ValidationError<{}>(
        'The following fields are incorrect',
        invalid
      );

    return <T>value;
  }
}
