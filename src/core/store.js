import reducers from './reducers';
import { createStore, compose, applyMiddleware } from 'redux';
import { SET_THEME, SET_LAYOUT } from './actions/Settings';
import { ADD_HISTORY } from './actions/Input';

const save = (key, value, store = 'session') => {
  try {
    window[`${store}Storage`].setItem(
      `jsconsole.${key}`,
      JSON.stringify(value)
    );
  } catch (e) {}
};

const middleware = [
  applyMiddleware(store => next => action => {
    const nextAction = next(action);
    const state = store.getState(); // new state after action was applied

    if (action.type === SET_THEME || action.type === SET_LAYOUT) {
      save('settings', state.settings, 'local');
    }

    if (action.type === ADD_HISTORY) {
      save('history', state.history);
    }

    return nextAction;
  }),
];

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  middleware.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const finalCreateStore = compose(...middleware)(createStore);

const defaults = {};
try {
  defaults.settings = JSON.parse(
    localStorage.getItem('jsconsole.settings') || '{}'
  );
  defaults.history = JSON.parse(
    sessionStorage.getItem('jsconsole.history') || '[]'
  );
} catch (e) {
  console.log(e);
}

const store = finalCreateStore(reducers, defaults);
export default store;
