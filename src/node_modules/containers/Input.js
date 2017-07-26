import { connect } from 'react-redux';
import Input from '../components/Input';
import { addHistory } from '../actions/Input';

export default connect(({ history }) => ({ history }), { addHistory })(Input);