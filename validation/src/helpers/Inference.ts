import {ArrayValidator} from '../ArrayValidator';
import {GroupValidator} from '../GroupValidator';
import {TupleValidator} from '../TupleValidator';
import {Validator} from '../Validator';

export type InferTuple<
  Base extends [...unknown[]],
  Rest = null,
> = Rest extends null ? Base : [...Base, ...Rest[]];

export type InferRequired<
  Required extends true | false,
  Shape = unknown,
> = Required extends true ? Shape : Shape | undefined;

// T = Type, S = Shape, O = Required, R = Rest
export type InferValidator<Type> = Type extends Validator<infer T>
  ? T
  : Type extends GroupValidator<infer O, infer S>
  ? InferRequired<O, S>
  : Type extends TupleValidator<infer O, infer T, infer R>
  ? InferRequired<O, InferTuple<T, R>>
  : Type extends ArrayValidator<infer O, infer T>
  ? InferRequired<O, T>
  : never;
