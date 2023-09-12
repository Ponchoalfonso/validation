import {InvalidFields} from '../Validator';

export class ValidationError<T = unknown> extends Error {
  invalid: InvalidFields<T>;

  constructor(message: string, invalid?: InvalidFields<T>) {
    super(message);
    this.name = 'ValidationError';
    this.invalid = invalid || {};
  }
}
