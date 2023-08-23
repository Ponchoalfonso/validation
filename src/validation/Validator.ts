export type ValidationErrors = string | string[];
export type ValidationFunction = (
  validator: Validator
) => ValidationErrors | null;

/**
 * A class that makes easier to hold and validate unknown input.
 */
export class Validator<T = unknown> {
  protected _value: T;
  protected _errors: string[] = [];

  /**
   * The parent Validator of the current Validator.
   */
  parent: Validator | null = null;
  /**
   * The children nodes of the current Validator.
   */
  children: {[key: string]: Validator} | Validator[] | null = null;
  /**
   * The list of validation functions of the current Validator.
   */
  validationFunctions: ValidationFunction[];

  /**
   * Creates a new Validator Instance.
   * @param value The value to hold.
   * @param validationFunctions The validation functions that state the validity of the Validator.
   */
  constructor(
    value: T,
    validationFunctions: ValidationFunction[] | ValidationFunction = []
  ) {
    this.validationFunctions = Array.isArray(validationFunctions)
      ? validationFunctions
      : [validationFunctions];
    this._value = value;
  }

  /**
   * The raw value being held.
   */
  get value(): T {
    return this._value;
  }

  /**
   * A flag indicating the validity of the Validator.
   * The flag is updated when the @method validate() is called.
   */
  get valid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * A flag indicating the invalidity of the Validator.
   * The flag is updated when the @method validate() is called.
   */
  get invalid(): boolean {
    return !this.valid;
  }

  /**
   * An array that holds the errors created by the validators.
   * The errors array is updated when the @method validate() is called.
   */
  get errors() {
    return this._errors;
  }

  /**
   * Updates the value held in the current Validator.
   * @param value The value to hold.
   */
  setValue(value: T): void {
    this._value = value;
  }

  /**
   * Executes the validation functions.
   * This function also updates the following attributes: errors, valid, invalid.
   */
  validate(): void {
    this._errors = [];
    for (const validator of this.validationFunctions) {
      const error = validator(this);
      if (error !== null)
        if (Array.isArray(error)) this.errors.concat(error);
        else this.errors.push(error);
    }
  }
}
