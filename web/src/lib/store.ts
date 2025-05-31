import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import { calculateResultMiddleware } from './middlewares';

export default function createStoreFn() {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(calculateResultMiddleware),
        devTools: true, // optional; enables Redux DevTools in dev
    });
}