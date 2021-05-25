import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './reducers/Root Reducer';

const initialState = {};
const middleware = [thunk];
const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
	whitelist: ['user'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(persistedReducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));
let persistor = persistStore(store);
export { store, persistor };
