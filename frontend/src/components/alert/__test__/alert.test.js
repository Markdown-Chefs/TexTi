import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history'
import Alert from '../alert';

jest.mock('../../assets/Checkboxes.png', () => 'mocked-Checkboxes.png');
jest.mock('../../assets/error.png', () => 'mocked-error.png');

describe('Alert Component', () => {
    let history;
    // alert type = 'error' || 'success'

    beforeEach(() => {
        history = createMemoryHistory();
        history.push = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders Alert component for error message', () => {
        render(
            <Router location={history.location} navigator={history}>
                <Alert message={'test error message'} type={'error'} onClose={jest.fn()}/>
            </Router>
        );

        expect(screen.getByAltText('error')).toBeInTheDocument();
        expect(screen.getByText('test error message')).toBeInTheDocument();
    });

    test('renders Alert component for success message', () => {
        render(
            <Router location={history.location} navigator={history}>
                <Alert message={'test success message'} type={'success'} onClose={jest.fn()}/>
            </Router>
        );

        expect(screen.getByAltText('success')).toBeInTheDocument();
        expect(screen.getByText('test success message')).toBeInTheDocument();
    });
});