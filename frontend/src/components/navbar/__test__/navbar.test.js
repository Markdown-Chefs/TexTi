import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Navbar from '../navbar';

jest.mock('../../assets/TexTi-logo.jpg', () => 'mocked-TexTi-logo.jpg');
jest.mock('../../assets/log-out.png', () => 'mocked-log-out.png');
jest.mock('../../assets/world_2.png', () => 'mocked-world_2.png');
jest.mock('../../assets/user.png', () => 'mocked-user.png');
jest.mock('../../assets/settings.png', () => 'mocked-settings.png');

jest.mock('../../../api/notes', () => ({
    onCreateNote: jest.fn()
}));

jest.mock('../../../api/auth', () => ({
    onLogout: jest.fn()
}));

jest.mock('../../../hooks/useUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

import useUser from '../../../hooks/useUser';

const mockStore = configureStore([]);

describe('Navbar Component', () => {
    let store;
    let history;
    // page = 'my-notes' || 'note-pool' || 'settings'

    beforeEach(() => {
        store = mockStore({
            auth: { isAuth: true }
        });
        history = createMemoryHistory();
        history.push = jest.fn();
        useUser.mockReturnValue({ username: 'testuser', userId: '123' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders Navbar component on dashboard', () => {
        const { container } = render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <Navbar page={'my-notes'} />
                </Router>
            </Provider>
        );

        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(container.querySelector('.nav-link-active')).toHaveTextContent('My Notes');
    });

    test('renders Navbar component on public note pool', () => {
        const { container } = render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <Navbar page={'note-pool'} />
                </Router>
            </Provider>
        );

        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(container.querySelector('.nav-link-active')).toHaveTextContent('Note Pool');
    });

    test('renders Navbar component on user settings', () => {
        const { container } = render(
            <Provider store={store}>
                <Router location={history.location} navigator={history}>
                    <Navbar page={'settings'} />
                </Router>
            </Provider>
        );

        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(container.querySelector('.nav-link-active')).toHaveTextContent('Settings');
    });
});