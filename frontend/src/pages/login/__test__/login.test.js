import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from '../login';

jest.mock('../../../components/assets/TexTiLogoWithText.jpg', () => 'mocked-TexTiLogoWithText.jpg');

jest.mock('../../../api/auth', () => ({
    onLogin: jest.fn()
}));

jest.mock('../../../redux/slices/authSlice', () => ({
    authenticateUser: jest.fn()
}));

// import Loading from '../loading/loading';
// import Alert from '../../components/alert/alert';

const mockStore = configureStore([]);

describe('Login Page', () => {
    let store;
    let history;

    beforeEach(() => {
        store = mockStore({
            auth: { isAuth: false }
        });
        history = createMemoryHistory();
        history.push = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders Login component', () => {
        render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <Login />
                </Router>
            </Provider>
        );

        const emailForm = screen.getByPlaceholderText('Email');
        const passwordForm = screen.getByPlaceholderText('Password');

        expect(screen.getByRole('heading', { level: 1, name: 'L O G I N' })).toBeInTheDocument();
        expect(screen.queryByAltText('Loading Gif')).toBeNull();
    });
});