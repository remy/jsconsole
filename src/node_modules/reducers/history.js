const ADD_HISTORY = 'ADD_HISTORY';

const defaultState = [];

const reducer = (state = defaultState, action) => {
  if (action.type === ADD_HISTORY) {
    return [ ...state, action.value ];
  }

  return state;
};

export default reducer;
