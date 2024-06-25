import axios from 'axios';
axios.defaults.withCredentials = true;

const backend_url = process.env.NODE_ENV === 'production'
    ? 'https://texti.onrender.com/api/'
    : 'http://localhost:8000/api/';

export async function onRegistration(registrationData) {
    const api = 'register';
    return await axios.post(
        backend_url + api,
        registrationData,
    );
}

export async function onLogin(loginData) {
    const api = 'login';
    return await axios.post(
        backend_url + api,
        loginData,
    );
}

export async function onLogout() {
    const api = 'logout';
    return await axios.get(backend_url + api);
}

export async function fetchProtectedInfo() {
    const api = 'protected';
    return await axios.get(backend_url + api);
}

export async function onChangeUsername(newUsernameData) {
    const api = 'change-username';
    return await axios.post(
        backend_url + api,
        newUsernameData,
    );
}

export async function onChangeEmail(newEmailData) {
    const api = 'change-email';
    return await axios.post(
        backend_url + api,
        newEmailData,
    );
}

export async function onChangePassword(newPasswordData) {
    const api = 'change-password';
    return await axios.post(
        backend_url + api,
        newPasswordData,
    );
}