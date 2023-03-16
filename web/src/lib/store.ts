import { createStore, applyMiddleware } from 'redux';
import type { Store } from 'redux';

import rootReducer from './reducers';
import { calculateResultMiddleware } from './middlewares';
import { composeWithDevTools } from 'redux-devtools-extension';

export default function createStoreFn(): Store {
    return createStore(rootReducer, composeWithDevTools(applyMiddleware(calculateResultMiddleware)));
}
