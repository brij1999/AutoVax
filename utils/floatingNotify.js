import { ToastAndroid, Platform, AlertIOS } from 'react-native';
import { store } from '../redux/store';
import { setStatus, setAutoBotGo } from '../redux/actions/Auto Actions';

export default function floatingNotify(msg) {
    store.dispatch(setStatus('Automation stopped due to an error.\nPress the \'Power Button\' to try again.', 'R'));
    store.dispatch(setAutoBotGo(false));
	if (Platform.OS === 'android') {
		ToastAndroid.show(msg, ToastAndroid.SHORT);
	} else {
		AlertIOS.alert(msg);
	}
}
