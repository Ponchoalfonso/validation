import {ValidationFunction, Validator} from './Validator';

/**
 * A class that makes easier to store, validate and nest Validator objects.
 */
export class GroupValidator<T extends object = {}> extends Validator<T> {
  children: {[K in keyof T]: Validator<T[K]>};

  /**
   * Creates a new GroupValidator instance.
   * @param group The object holding other nested Validators.
   * @param validationFunctions The validation functions that state of the validity of the GroupValidator.
   */
  constructor(
    group: {[K in keyof T]: Validator<T[K]>},
    validationFunctions: ValidationFunction[] | ValidationFunction = []
  ) {
    super(null!, validationFunctions);
    this.children = group;
    this.setChildrenParent(group);
  }

  get valid(): boolean {
    let valid = super.valid;
    for (const key in this.children) {
      valid &&= this.children[key].valid;
    }

    return valid;
  }

  get value(): T {
    return GroupValidator.calculateValue(this.children);
  }

  /**
   * Calculate the overall value of an Object formed by Validator values.
   * @param group The object formed by Validator values.
   * @returns An object that gathers the overall value of the group.
   */
  protected static calculateValue<T extends object = {}>(group: {
    [K in keyof T]: Validator<T[K]>;
  }): T {
    const value = <T>{};
    for (const key in group) {
      value[key] = group[key].value;
    }

    return value;
  }

  /**
   * Sets the current instance as parent of all the Validator objects
   * within the children object.
   */
  protected setChildrenParent(children: {
    [K in keyof T]: Validator<T[K]>;
  }): void {
    for (const key in children) {
      children[key].parent = this;
    }
  }

  /**
   * Updates the value held in the current GroupValidator.
   * @param value The object holding the nested values.
   */
  setValue(value: T): void {
    if (typeof value !== 'object') return;
    for (const key in this.children) {
      const child = this.children[key];
      const val = value[key];
      if (val !== null && val !== undefined) child.setValue(val);
    }
  }

  /**
   * Updates a single key-value within the held object value.
   * @param key The specific nested Validator key to update.
   * @param value The new value.
   */
  patchValue<K extends keyof T>(key: K, value: T[K]): void {
    this.children[key].setValue(value);
  }

  /**
   * Gets the raw value of an specific Validator within the current group.
   * @param key The specific nested value key.
   * @returns The desired raw value of the specified Validator.
   */
  getValue<K extends keyof T>(key: K): T[K] {
    return this.children[key].value;
  }

  /**
   * Gets an specific Validator object within the current group.
   * @param key The specific nested Validator key.
   * @returns The desired Validator object.
   */
  getValidator<K extends keyof T>(key: K): Validator<T[K]> {
    return this.children[key];
  }

  /**
   * Overrides an existing Validator child of the current GroupValidator
   * @param key The specific nested Validator key
   * @param validator The Validator object to set
   */
  setValidator<K extends keyof T>(key: K, validator: Validator<T[K]>): void {
    this.children[key].parent = null;
    this.children[key] = validator;
    validator.parent = this;
  }

  validate(): void {
    super.validate();
    for (const key in this.children) {
      this.children[key].validate();
    }
  }
}
