import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './core/store';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './core/jsconsole.css';

const rootEl = document.getElementById('root');

// Create a reusable render method that we can call more than once
let render = () => {
  // Dynamically import our main App component, and render it
  const App = require('./core/containers/App').default;

  ReactDOM.render(React.createElement(Provider, { store }, <App />), rootEl);
};

if (module.hot) {
  // Support hot reloading of components
  // and display an overlay for runtime errors
  const renderApp = render;
  const renderError = error => {
    const RedBox = require('redbox-react').default;
    ReactDOM.render(<RedBox error={error} />, rootEl);
  };

  // In development, we wrap the rendering function to catch errors,
  // and if something breaks, log the error and render it to the screen
  render = () => {
    try {
      renderApp();
    } catch (error) {
      console.error(error);
      renderError(error);
    }
  };

  // Whenever the App component file or one of its dependencies
  // is changed, re-import the updated component and re-render it
  module.hot.accept('./core/containers/App', () => {
    setTimeout(render);
  });
}

render();
registerServiceWorker();
