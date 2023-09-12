import {InvalidFields, ValidationFn, Validator} from './Validator';
import {ValidationError} from './errors/ValidationError';
import {InferRequired, InferTuple} from './helpers/Inference';
import {isArray} from './helpers/typeFunctions';

export type ValidatorTuple<T extends [...unknown[]]> = {
  [I in keyof T]: Validator<T[I]>;
};

export class TupleValidator<
  O extends true | false = boolean,
  T extends [...unknown[]] = [...unknown[]],
  R = null,
> extends Validator<InferRequired<O, InferTuple<T, R>>> {
  /**
   * The children nodes of the current Validator.
   */
  protected validators: ValidatorTuple<T>;
  /**
   * A child node of the current validator in charge validating the rest
   * elements of passed tuples
   */
  protected restValidator?: Validator<R>;

  /**
   * Creates a new TupleValidator instance.
   * @param required A boolean value to indicate tuple is required.
   * @param validators Tuple of Validators defining the shape of the TupleValidator.
   * @param validationFn Functions that state validity of a value.
   */
  constructor(
    required: O,
    validators: [...ValidatorTuple<T>],
    restValidator?: Validator<R>,
    validationFn:
      | ValidationFn<InferRequired<O, InferTuple<T, R>>>
      | ValidationFn<InferRequired<O, InferTuple<T, R>>>[] = []
  ) {
    super(<any>isArray<T>(required), validationFn);
    if (restValidator) {
      this.restValidator = restValidator;
      this.restValidator.parent = <Validator>this;
    }
    this.validators = validators;
    this.setChildrenParent(this.validators);
  }

  /**
   * Sets the current instance as parent of all the Validator objects within the
   * children object.
   */
  protected setChildrenParent(children: ValidatorTuple<T>): void {
    for (const child of children) {
      child.parent = <Validator>this;
    }
  }

  /**
   * Gets an specific Validator object within the current Tuple.
   * @param index The specific Validator index.
   * @returns The desired Validator object.
   */
  getValidator<I extends keyof ValidatorTuple<T> = number>(
    index: I
  ): ValidatorTuple<T>[I] {
    return this.validators[index];
  }

  /**
   * Overrides an existing Validator child of the current TupleValidator.
   * @param index The specific Validator index.
   * @param validator The Validator object to set.
   */
  setValidator<I extends keyof ValidatorTuple<T> = number>(
    index: I,
    validator: ValidatorTuple<T>[I]
  ): void {
    const old = this.validators[index];
    if (old && validator) {
      old.parent = null;
      validator.parent = <Validator>this;
      this.validators[index] = validator;
    }
  }

  /**
   * Gets the Rest Validator Tuple was specified to contain rest.
   * @returns The Rest Validator.
   */
  getRestValidator(): R extends null ? undefined : Validator<R> {
    return <R extends null ? undefined : Validator<R>>this.restValidator;
  }

  /**
   * Overrides the Rest Validator if tuple was set to contain rest.
   * @param validator The Validator object to set.
   */
  setRestValidator(validator: R extends null ? undefined : Validator<R>): void {
    if (this.restValidator && validator) {
      this.restValidator.parent = null;
      validator.parent = <Validator>this;
      this.restValidator = validator;
    }
  }

  validateSafe(subject: unknown): {
    value?: InferRequired<O, InferTuple<T, R>>;
    invalid?: InvalidFields<InferRequired<O, InferTuple<T, R>>>;
  } {
    const invalid = <InvalidFields<InferTuple<T, R>>>{};
    const value: unknown[] = [];
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
      // Run children validators if subject is NonNullable
      for (let i = 0; i < this.validators.length; i++) {
        const result = this.validators[i].validateSafe(subject[i]);
        if (result.invalid) (<any>invalid)[i] = result.invalid;
        else if (result.value) value[i] = result.value;
      }
      // Run Validator for rest
      if (subject.length > this.validators.length && this.restValidator) {
        const offset = this.validators.length;
        for (let i = offset; i < subject.length; i++) {
          const result = this.restValidator.validateSafe(subject[i]);
          if (result.invalid) (<any>invalid)[i] = result.invalid;
          else if (result.value) value[i] = result.value;
        }
      }
      if (errors.length > 0) invalid._errors = errors;

      if (Object.values(invalid).length > 0) return {invalid};
      else return {value: value as InferTuple<T, R>};
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
  validate(subject: unknown): InferRequired<O, InferTuple<T, R>> {
    return super.validate(subject);
  }
}
