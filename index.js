import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import axios from 'axios';

axios.defaults.baseURL = 'http://192.168.29.4:8000';
(async () => {
    const res = await axios.get('/');
    console.log(res.data);
})();

AppRegistry.registerComponent(appName, () => App);
