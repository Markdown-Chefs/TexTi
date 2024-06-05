import axios from 'axios';
axios.defaults.withCredentials = true;

export async function onRegistration(registrationData) {
    return await axios.post(
        'http://localhost:8000/api/register',
        registrationData,
    );
}

export async function onLogin(loginData) {
    return await axios.post(
        'http://localhost:8000/api/login',
        loginData,
    );
}

export async function onLogout() {
    return await axios.get('http://localhost:8000/api/logout');
}

export async function fetchProtectedInfo() {
    return await axios.get('http://localhost:8000/api/protected');
}

export async function onChangeUsername(newUsernameData) {
    return await axios.post(
        'http://localhost:8000/api/change-username',
        newUsernameData,
    );
}

export async function onChangeEmail(newEmailData) {
    return await axios.post(
        'http://localhost:8000/api/change-email',
        newEmailData,
    );
}

export async function onChangePassword(newPasswordData) {
    return await axios.post(
        'http://localhost:8000/api/change-password',
        newPasswordData,
    );
}