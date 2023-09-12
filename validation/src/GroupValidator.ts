import {InvalidFields, ValidationFn, Validator} from './Validator';
import {ValidationError} from './errors/ValidationError';
import {InferRequired} from './helpers/Inference';
import {isObject} from './helpers/typeFunctions';

/**
 * A class to validate object of unknown shape.
 */
export class GroupValidator<
  R extends true | false = boolean,
  T extends object = {},
> extends Validator<InferRequired<R, T>> {
  /**
   * The children nodes of the current Validator.
   */
  protected validators: {[K in keyof T]: Validator<T[K]>};

  /**
   * Creates a new GroupValidator instance.
   * @param required A boolean value to indicate object is required.
   * @param validators Object of Validators defining the shape of the GroupValidator.
   * @param validationFn Functions that state validity of a value.
   */
  constructor(
    required: R,
    validators: {[K in keyof T]: Validator<T[K]>},
    validationFn:
      | ValidationFn<InferRequired<R, T>>[]
      | ValidationFn<InferRequired<R, T>> = []
  ) {
    super(<any>isObject(required), validationFn);
    this.validators = validators;
    this.setChildrenParent(validators);
  }

  /**
   * Sets the current instance as parent of all the Validator objects within the
   * children object.
   */
  protected setChildrenParent(children: {
    [K in keyof T]: Validator<T[K]>;
  }): void {
    for (const key in children) {
      const child = children[key];
      child.parent = <Validator>this;
    }
  }

  /**
   * Gets an specific Validator object within the current group.
   * @param key The specific nested Validator key.
   * @returns The desired Validator object.
   */
  getValidator<K extends keyof T>(key: K): Validator<T[K]> {
    return this.validators[key];
  }

  /**
   * Overrides an existing Validator child of the current GroupValidator.
   * @param key The specific nested Validator key.
   * @param validator The Validator object to set.
   */
  setValidator<K extends keyof T>(key: K, validator: Validator<T[K]>): void {
    this.validators[key].parent = null;
    this.validators[key] = validator;
    validator.parent = <Validator>this;
  }

  validateSafe(subject: unknown): {
    value?: InferRequired<R, T>;
    invalid?: InvalidFields<T>;
  } {
    const invalid = <InvalidFields<T>>{};
    const value = <T>{};
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
      // Run validation for children if subject is object
      for (const key in this.validators) {
        const result = this.validators[key].validateSafe(subject[key]);
        if (result.invalid) (<any>invalid)[key] = result.invalid;
        else if (result.value) value[key] = result.value;
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
  validate(subject: unknown): InferRequired<R, T> {
    return super.validate(subject);
  }
}
