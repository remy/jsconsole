import reducers from './reducers';
import { createStore, compose, applyMiddleware } from 'redux';

const save = (key, value, store = 'session') => {
  try {
    console.log('saving to %s', store);
    window[`${store}Storage`].setItem(`jsconsole.${key}`, JSON.stringify(value));
  } catch (e) {}
};

const middleware = [
  applyMiddleware(
    store => next => action => {
      const nextAction = next(action);
      const state = store.getState(); // new state after action was applied
      console.log(action.type);
      if (action.type === 'SET_THEME') {
        save('theme', state.settings.theme, 'local');
      }

      if (action.type === 'ADD_HISTORY') {
        save('history', state.history);
      }

      return nextAction;
    }
  )
];

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  middleware.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const finalCreateStore = compose(...middleware)(createStore);

const defaults = {};
try {
  defaults.settings = {
    theme: JSON.parse(localStorage.getItem('jsconsole.theme')),
  };

  defaults.history = JSON.parse(sessionStorage.getItem('jsconsole.history') || '[]');
} catch (e) {
  console.log(e);
}

const store = finalCreateStore(reducers, defaults);
export default store;
