import {GroupValidator} from '../validation/GroupValidator';
import {ListValidator} from '../validation/ListValidator';
import {ValidationFunction, Validator} from '../validation/Validator';

type ValidatorTuple<T = unknown> = [T, ...ValidationFunction[]];

/**
 * GroupValidatorBuilder function to build GroupValidators.
 * @param group The group of Validators or tuples.
 * @param validationFunctions The validation functions for the GroupValidator.
 */
export const groupValidatorBuilder = <T extends object = {}>(
  group: {
    [K in keyof T]: ValidatorTuple<T[K]> | Validator<T[K]>;
  },
  validationFunctions?: ValidationFunction[]
): GroupValidator<T> => {
  const final = <{[K in keyof T]: Validator<T[K]>}>{};
  for (const key in group) {
    const child = group[key];
    if (child instanceof Validator) {
      final[key] = child;
    } else {
      const [value, ...validators] = <ValidatorTuple<T[typeof key]>>child;
      final[key] = new Validator(value, validators);
    }
  }

  return new GroupValidator(final, validationFunctions);
};

/**
 * ListValidatorBuilder function to build ListValidators.
 * @param list The list of Validators or tuples.
 * @param validationFunctions The validation functions for the ListValidator.
 */
export const listValidatorBuilder = <T = unknown>(
  list: (ValidatorTuple<T> | Validator<T>)[],
  validationFunctions?: ValidationFunction[]
): ListValidator<T> => {
  const final: Validator<T>[] = [];
  for (const child of list) {
    if (child instanceof Validator) {
      final.push(child);
    } else {
      const [value, ...validators] = child;
      final.push(new Validator(value, validators));
    }
  }

  return new ListValidator(final, validationFunctions);
};
