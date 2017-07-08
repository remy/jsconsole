import { SET_THEME } from '../actions/Settings';

const defaultState = {
  theme: 'light',
  remote: false,
};

const reducer = (state = defaultState, action) => {
  if (action.type === SET_THEME) {
    return { ...state, theme: action.value };
  }

  return state;
};

export default reducer;
