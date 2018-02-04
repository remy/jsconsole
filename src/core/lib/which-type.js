import ArrayType from '../components/types/ArrayType';
import ObjectType from '../components/types/ObjectType';
import FunctionType from '../components/types/FunctionType';
import ErrorType from '../components/types/ErrorType';
import NullType from '../components/types/NullType';
import UndefinedType from '../components/types/UndefinedType';
import NumberType from '../components/types/NumberType';
import StringType from '../components/types/StringType';
import BooleanType from '../components/types/BooleanType';
import SetType from '../components/types/SetType';
import PromiseType from '../components/types/PromiseType';

function whichType(value) {
  let type = '[object Object]';
  try {
    type = ({}).toString.call(value);
  } catch (e) { // only happens when typeof is protected (...randomly)
  }

  if (type === '[object String]') {
    return StringType;
  }

  if (type === '[object Number]') {
    return NumberType;
  }

  if (type === '[object Boolean]') {
    return BooleanType;
  }

  if (type === '[object Set]' || type === '[object Map]') {
    return SetType;
  }

  if (type === '[object Promise]') {
    return PromiseType;
  }

  if (value instanceof Error || type === '[object Error]') {
    return ErrorType;
  }

  if (value === undefined) {
    return UndefinedType;
  }

  if (value === null) {
    return NullType;
  }

  if (type === '[object Array]') {
    return ArrayType;
  }

  if (type === '[object Function]') {
    return FunctionType;
  }

  // TODO DOM nodes, etc.

  // everything is eventually an object!
  return ObjectType;
}

export default whichType;
