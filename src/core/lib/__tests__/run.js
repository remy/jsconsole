/* eslint-env jest */
import { preProcess } from '../run';

test('preProcess a string', () => {
  expect(preProcess('"remy"').content).toBe('"remy"');
});

test('preProcess consts', () => {
  console.log(preProcess('const a = 12'));
});

test('multiple vars', () => {
  expect(() => {
    preProcess('var a, b;');
  }).not.toThrow();
});
