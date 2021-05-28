import { ToastAndroid, Platform, AlertIOS } from 'react-native';
import { store } from '../redux/store';
import { setStatus, setTokenBotGo, setAutoBotGo } from '../redux/actions/Auto Actions';
import { haltTokenBot } from '../scripts/authScripts';
import { haltAutoBot } from '../scripts/autoScripts';

export default function floatingNotify(msg) {
    store.dispatch(setStatus('Automation stopped due to an error.\nPress the \'Power Button\' to try again.', 'R'));
    store.dispatch(setAutoBotGo(false));
    store.dispatch(setTokenBotGo(false));
	haltAutoBot();
    haltTokenBot();
	if (Platform.OS === 'android') {
		ToastAndroid.show(msg, ToastAndroid.SHORT);
	} else {
		AlertIOS.alert(msg);
	}
}
