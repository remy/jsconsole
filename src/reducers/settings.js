import { SET_THEME, SET_LAYOUT } from '../actions/Settings';

const defaultState = {
  theme: 'light',
  layout: 'bottom',
  remote: false,
};

const reducer = (state = defaultState, action) => {
  if (action.type === SET_THEME) {
    return { ...state, theme: action.value };
  }

  if (action.type === SET_LAYOUT) {
    return { ...state, layout: action.value };
  }

  return state;
};

export default reducer;
