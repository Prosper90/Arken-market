import { combineReducers } from "redux";

import account from './account';
import { read, common } from './common';
import modal from './modal';

export default combineReducers({
    account,
    read,
    common,
    modal
});