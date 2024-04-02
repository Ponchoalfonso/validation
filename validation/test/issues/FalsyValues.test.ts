import {describe, expect, test} from 'vitest';
import {validatorBuilder as builder} from '../../src/helpers/validatorBuilder';
import {isBoolean, isNumber, isString} from '../../src/helpers/typeFunctions';

// GitHub issue #7 Falsy values in GroupValidator, ArrayValidator and TupleValidator are ignored
// https://github.com/Ponchoalfonso/validation/issues/7
describe('Issue: Falsy values ignored when valid', () => {
  test('Validate correct types and falsy values in a GroupValidator', () => {
    const falsyGroup = builder.group(true, {
      str: [isString()],
      num: [isNumber()],
      bool: [isBoolean()],
    });
    const validated = falsyGroup.validate({str: '', num: 0, bool: false});
    expect(validated.str).toBe('');
    expect(validated.num).toBe(0);
    expect(validated.bool).toBe(false);
  });

  test('Validate correct types and falsy values in a ArrayValidator', () => {
    const falsyArrays = builder.group(true, {
      str: builder.array(false, [isString()]),
      num: builder.array(false, [isNumber()]),
      bool: builder.array(false, [isBoolean()]),
    });
    const validated = falsyArrays.validate({
      str: [''],
      num: [0],
      bool: [false],
    });
    expect(Array.isArray(validated.str)).toBe(true);
    expect(validated.str?.at(0)).toBe('');
    expect(Array.isArray(validated.num)).toBe(true);
    expect(validated.num?.at(0)).toBe(0);
    expect(Array.isArray(validated.bool)).toBe(true);
    expect(validated.bool?.at(0)).toBe(false);
  });

  test('Validate correct types and falsy values in a TupleValidator', () => {
    const falsyTuples = builder.group(true, {
      str: builder.tuple(false, [[isString()]]),
      num: builder.tuple(false, [[isNumber()]]),
      bool: builder.tuple(false, [[isBoolean()]]),
      rest: builder.tuple(false, [[isBoolean()]], [isNumber()]),
    });
    const validated = falsyTuples.validate({
      str: [''],
      num: [0],
      bool: [false],
      rest: [false, 0, 0, 0],
    });
    expect(Array.isArray(validated.str)).toBe(true);
    expect(validated.str?.at(0)).toBe('');
    expect(Array.isArray(validated.num)).toBe(true);
    expect(validated.num?.at(0)).toBe(0);
    expect(Array.isArray(validated.bool)).toBe(true);
    expect(validated.bool?.at(0)).toBe(false);
    expect(Array.isArray(validated.rest)).toBe(true);
    expect(validated.rest?.at(0)).toBe(false);
    expect(validated.rest?.at(1)).toBe(0);
    expect(validated.rest?.at(2)).toBe(0);
    expect(validated.rest?.at(3)).toBe(0);
  });
});
