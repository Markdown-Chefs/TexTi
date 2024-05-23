import { createSlice } from '@reduxjs/toolkit';

// persistent storage
// get isAuth from local storage
// so that isAuth won't be reset if user refresh page
const userAuthFromLocalStorage = () => {
    const isAuth = localStorage.getItem('isAuth');
    if (isAuth && JSON.parse(isAuth) === true) { // have isAuth and is set to true
        return true;
    }
    return false;
}

const initialState = {
    isAuth: userAuthFromLocalStorage(),
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authenticateUser: (state) => {
            state.isAuth = true;
        },
        unAuthenticateUser: (state) => {
            state.isAuth = false;
        },
    },
});

export const {authenticateUser, unAuthenticateUser} = authSlice.actions;

export default authSlice.reducer