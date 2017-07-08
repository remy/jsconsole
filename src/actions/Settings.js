export const SET_THEME = 'SET_THEME';
export const SET_LAYOUT = 'SET_LAYOUT';
export function setTheme(value) { return { type: SET_THEME, value }; };
export function setLayout(value) { return { type: SET_LAYOUT, value }; };