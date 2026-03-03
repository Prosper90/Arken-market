import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const initialState = {};
const middleware = [thunk];

let store;

// let envMode = process && process.env && process.env.NODE_ENV ? process.env.NODE_ENV : '';
let envMode = 'Testing';
// let envMode = 'Development';

if (envMode === "Testing" || envMode === "production") {
    store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(...middleware)
        )
    );
} else {
    store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(...middleware),
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        )
    );
}

export default store;