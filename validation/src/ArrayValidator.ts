import {InvalidFields, ValidationFn, Validator} from './Validator';
import {ValidationError} from './errors/ValidationError';
import {InferRequired} from './helpers/Inference';
import {isArray} from './helpers/typeFunctions';

export class ArrayValidator<
  R extends true | false = boolean,
  T = unknown,
> extends Validator<InferRequired<R, T[]>> {
  /**
   * A child node of the current validator in charge validating elements passed
   * in an array.
   */
  protected validator: Validator<T>;

  /**
   * Creates a new ArrayValidator instance.
   * @param required A boolean value to indicate array is required.
   * @param validator A validator defining the type of ArrayValidator.
   * @param validationFn Functions that state validity of a value.
   */
  constructor(
    required: R,
    validator: Validator<T>,
    validationFn:
      | ValidationFn<InferRequired<R, T[]>>
      | ValidationFn<InferRequired<R, T[]>>[] = []
  ) {
    super(<any>isArray<T>(required), validationFn);
    this.validator = validator;
    this.validator.parent = <Validator>this;
  }

  /**
   * Gets the Validator which array elements are validated with.
   * @returns The Validator.
   */
  getValidator(): Validator<T> {
    return this.validator;
  }

  /**
   * Overrides the Validator which array elements are validated with.
   * @param validator The Validator object to set.
   */
  setValidator(validator: Validator<T>): void {
    this.validator.parent = null;
    validator.parent = <Validator>this;
    this.validator = validator;
  }

  validateSafe(subject: unknown): {
    value?: InferRequired<R, T[]>;
    invalid?: InvalidFields<InferRequired<R, T[]>>;
  } {
    const invalid = <InvalidFields<T[]>>{};
    const value: T[] = [];
    const errors: string[] = [];

    this._lastValue = subject;
    // Type check is run first.
    // If type check fails Validation functions will not be executed
    try {
      if (!this.isType(subject, this)) {
        errors.push('Type validation failed!');
        return {invalid: <InvalidFields<T>>{_errors: errors}};
      }
      // Run validation functions and collect errors
      for (const validator of this.validationFunctions) {
        const error = validator(subject, <Validator>this);
        if (error)
          if (Array.isArray(error)) errors.concat(error);
          else errors.push(error);
      }
      if (!subject)
        return errors.length > 0
          ? {invalid: <InvalidFields<T>>{_errors: errors}}
          : {value: subject};
      // Run validator if subject is NonNullable
      for (let i = 0; i < subject.length; i++) {
        const result = this.validator.validateSafe(subject[i]);
        if (result.invalid) (<any>invalid)[i] = result.invalid;
        else if (result.value) value[i] = result.value;
      }
      if (errors.length > 0) invalid._errors = errors;

      if (Object.values(invalid).length > 0) return {invalid};
      else return {value};
    } catch (error) {
      // A ValidationError can be thrown to pass a custom error message
      if (error instanceof ValidationError) {
        errors.push(error.message);
        return {invalid: <InvalidFields<T>>{_errors: errors}};
      } else throw error;
    }
  }

  /**
   * Validates subject against the defined rules in the current Validator.
   * @param subject A value of unknown shape.
   * @returns A copy of {@link subject} after being successfully validated,
   * skipping values not defined in the shape of the current validator.
   *
   * @throws A {@link ValidationError} when subject is invalid.
   */
  validate(subject: unknown): InferRequired<R, T[]> {
    return super.validate(subject);
  }
}
