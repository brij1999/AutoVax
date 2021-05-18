import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import axios from 'axios';

axios.defaults.baseURL = 'http://192.168.29.4:8000';
// axios.defaults.baseURL = 'https://cdn-api.co-vin.in/api/v2';

AppRegistry.registerComponent(appName, () => App);
