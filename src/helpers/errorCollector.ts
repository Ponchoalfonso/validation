import {GroupValidator} from '../validation/GroupValidator';
import {ListValidator} from '../validation/ListValidator';
import {Validator} from '../validation/Validator';

export type InvalidField = {
  errors?: string[];
};

export type InvalidFields = {
  [field: string]: InvalidFields;
} & InvalidField;

export function collectErrors(validator: Validator): InvalidFields {
  const fields: InvalidFields = {};
  // Check current
  if (validator.invalid && validator.errors.length > 0)
    fields.errors = validator.errors;

  // Check children
  if (validator instanceof GroupValidator) {
    for (const key in validator.children) {
      const child = validator.children[key];

      if (child.valid) continue;
      fields[key] = collectErrors(child);
    }
  } else if (validator instanceof ListValidator) {
    for (let i = 0; i < validator.children.length; i++) {
      const child = validator.children[i];
      if (!child || child.valid) continue;
      fields[i] = collectErrors(child);
    }
  }
  return fields;
}
