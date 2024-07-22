import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AppBar from '../appBar';

jest.mock('../../assets/TexTi-logo.jpg', () => 'mocked-logo.jpg');

const mockStore = configureStore([]);

describe('AppBar Component', () => {
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

    test('renders AppBar component', () => {
        render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <AppBar />
                </Router>
            </Provider>
        );
    
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.getByText('TexTi')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    test('clicking Sign In redirects to login page', () => {
        render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <AppBar />
                </Router>
            </Provider>
        );

        const signInButton = screen.getByRole('link', { name: /Sign in/i });

        fireEvent.click(signInButton);
        expect(history.push).toBeCalledWith(
            {
                pathname : '/login',
                search : '',
                hash : ''
            },
            undefined,
            expect.any(Object)
        );
    });

    test('clicking Sign In redirects to login page', () => {
        render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <AppBar />
                </Router>
            </Provider>
        );

        const signUpButton = screen.getByRole('link', { name: /Sign up/i });

        fireEvent.click(signUpButton);
        expect(history.push).toBeCalledWith(
            {
                pathname : '/register',
                search : '',
                hash : ''
            },
            undefined,
            expect.any(Object)
        );
    });
});