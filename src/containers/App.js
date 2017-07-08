import { connect } from 'react-redux';
import App from '../components/App';
import { setTheme } from '../actions/Settings';

const mapStateToProps = (state) => {
  return {
    theme: state.settings.theme
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setTheme: () => {
      dispatch( setTheme );
    }
  };
};

export default connect(mapStateToProps, { setTheme })(App);