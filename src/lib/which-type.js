import ArrayType from '../components/ArrayType';
// import PrimativeType from '../components/PrimativeType';
import ObjectType from '../components/ObjectType';
import FunctionType from '../components/FunctionType';
import NullType from '../components/NullType';
import UndefinedType from '../components/UndefinedType';
import NumberType from '../components/NumberType';
import StringType from '../components/StringType';
import BooleanType from '../components/BooleanType';
import SetType from '../components/SetType';

function whichType(value) {
  let type = '[object Object]';
  try {
    type = ({}).toString.call(value);
  } catch (e) { // only happens when typeof is protected (...randomly)
  }

  // if (type === '[object String]' ||
  //     type === '[object Number]' ||
  //     type === '[object Boolean]' ||
  //     value === null ||
  //     value === undefined
  //     ) {
  //   return PrimativeType;
  // }

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

  // TODO Map, DOM nodes, etc.

  // everything is eventually an object!
  return ObjectType;
}

export default whichType;
