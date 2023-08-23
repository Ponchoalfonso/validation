import {ValidationFunction, Validator} from './Validator';

/**
 * A class that makes easier to store, validate and make Validator lists.
 */
export class ListValidator<T = unknown> extends Validator<T[]> {
  children: Validator<T>[];
  /**
   * Creates a new ListValidator instance.
   * @param list The list of Validators.
   * @param validationFunctions The validation functions that state the validity of the ListValidator.
   */
  constructor(
    list: Validator<T>[],
    validationFunctions: ValidationFunction[] | ValidationFunction = []
  ) {
    super(null!, validationFunctions);
    this.children = list;
    this.setChildrenParent(list);
  }

  get length(): number {
    return this.children.length;
  }

  get valid(): boolean {
    let valid = super.valid;
    for (const child of this.children) {
      if (!child) continue;
      valid &&= child.valid;
    }

    return valid;
  }

  get value(): T[] {
    return ListValidator.calculateValue(this.children);
  }

  /**
   * Calculate the overall value list formed by Validators values.
   * @param list The list formed by Validator values.
   * @returns A list that gathers all Validators values.
   */
  protected static calculateValue<T = unknown>(list: Validator<T>[]): T[] {
    return list.map(({value}) => value);
  }

  /**
   * Sets the current instance as parent of all the Validator objects
   * within the children list.
   */
  protected setChildrenParent(children: Validator<T>[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  /**
   * Updates the value held in the current ListValidator.
   * @param value The list of values.
   * @throws Error when given value is longer that current length of the ListValidator
   *
   * To increase the length of the ListValidator push new Validators.
   */
  setValue(value: T[]): void {
    if (!Array.isArray(value)) return;
    if (value.length > this.children.length)
      throw new Error('Value list is longer than current ValidatorList.');
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!child) throw new Error('Cannot patch value of undefined.');
      const val = value[i];
      if (val !== null && val !== undefined) child.setValue(val);
    }
  }

  /**
   * Updates a single index-value within the held list.
   * @param idx The specific Validator index to update.
   * @param value The new value.
   */
  patchValue(idx: number, value: T): void {
    const child = this.children[idx];
    if (!child) throw new Error('Cannot patch value of undefined.');
    child.setValue(value);
  }

  /**
   * Gets the raw value of an specific Validator within the current list.
   * @param idx The specific value index.
   * @returns The desired raw value of the specified Validator.
   */
  getValue(idx: number): T | undefined {
    return this.children[idx]?.value;
  }

  /**
   * Gets an specific Validator object within the current list.
   * @param idx The specific Validator index.
   * @returns The desired Validator object.
   */
  getValidator(idx: number): Validator<T> | undefined {
    return this.children[idx];
  }

  /**
   * Override a Validator object as child of the current list.
   * @param idx The specific Validator index
   * @param validator The Validator object to set
   */
  setValidator(idx: number, validator: Validator<T>): void {
    if (this.children[idx]) this.children[idx].parent = null;
    this.children[idx] = validator;
    validator.parent = this;
  }

  validate(): void {
    super.validate();
    for (const child of this.children) {
      if (!child) continue;
      child.validate();
    }
  }
}
