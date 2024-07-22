import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import PermissionTab from '../permissionTab';

jest.mock('../../assets/copy.png', () => 'mocked-copy.png');

describe('PermissionTab Component', () => {
    let history;
    let closeModal, fetchUserNotePermission, updateNotePermission;
    let noteID;

    beforeEach(() => {
        history = createMemoryHistory();
        history.push = jest.fn();
        closeModal = jest.fn();
        fetchUserNotePermission = jest.fn();
        updateNotePermission = jest.fn().mockResolvedValue({ status: 200 });
        noteID = '888';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders PermissionTab component', () => {
        render(
        <Router location={history.location} navigator={history}>
            <PermissionTab
                isOwner={true}
                showModal={true}
                closeModal={closeModal}
                noteID={noteID}
                fetchUserNotePermission={fetchUserNotePermission}
                updateNotePermission={updateNotePermission}
            />
        </Router>);

        expect(screen.getByText('Note Permission')).toBeInTheDocument();
        expect(screen.getByText('Can Edit')).toBeInTheDocument();
        expect(screen.getByText('Can View')).toBeInTheDocument();
    });

    test('should not renders PermissionTab component', () => {
        render(<PermissionTab
            isOwner={true}
            showModal={false}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);

        expect(screen.queryByText('Note Permission')).toBeNull();
    });

    test('switches tabs correctly', () => {
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);

        const canEditTab = screen.getByText('Can Edit');
        const canViewTab = screen.getByText('Can View');

        fireEvent.click(canViewTab);
        expect(canViewTab).toHaveClass('active');
        expect(canEditTab).not.toHaveClass('active');

        fireEvent.click(canEditTab);
        expect(canEditTab).toHaveClass('active');
        expect(canViewTab).not.toHaveClass('active');
    });

    
    test('handles form submission correctly for edit permission', async () => {
        alert = jest.fn();
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);
    
        const input = screen.getByPlaceholderText('username');
        fireEvent.change(input, { target: { value: 'testuser' } });
    
        const submitButton = screen.getByText('Update Permissions');
        fireEvent.click(submitButton);
    
        expect(updateNotePermission).toHaveBeenCalledWith('888', 'testuser', true, true);
        await waitFor(() => {
            expect(updateNotePermission).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(fetchUserNotePermission).toHaveBeenCalled();
        });
        expect(alert).toHaveBeenCalledWith('Permissions updated successfully.');
    });

    test('handles form submission correctly for view permission', async () => {
        alert = jest.fn();
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);
    
        const canViewTab = screen.getByText('Can View');
        fireEvent.click(canViewTab);

        const input = screen.getByPlaceholderText('username');
        fireEvent.change(input, { target: { value: 'testuser' } });
    
        const submitButton = screen.getByText('Update Permissions');
        fireEvent.click(submitButton);
    
        expect(updateNotePermission).toHaveBeenCalledWith('888', 'testuser', true, false);
        await waitFor(() => {
            expect(updateNotePermission).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(fetchUserNotePermission).toHaveBeenCalled();
        });
        expect(alert).toHaveBeenCalledWith('Permissions updated successfully.');
    });

    test('handles form submission error', async () => {
        alert = jest.fn();
        console.error = jest.fn();
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={
                jest.fn().
                mockRejectedValueOnce({
                    response: {
                        data: {
                            errors: [{ msg: 'An error occurred' }]
                        }
                    }
                })
            }
        />);

        const input = screen.getByPlaceholderText('username');
        fireEvent.change(input, { target: { value: 'testuser' } });
    
        const submitButton = screen.getByText('Update Permissions');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(alert).toHaveBeenCalledWith('An error occurred');
        });
    });

    test('copies URL to clipboard', async () => {
        alert = jest.fn();
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);

        const originalClipboard = { ...global.navigator.clipboard };
        global.navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };
      
        const copyButton = screen.getByText('Copy Note URL');
        fireEvent.click(copyButton);
      
        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
        await waitFor(() => {
            expect(alert).toHaveBeenCalledWith('URL copied to clipboard!');
        });

        global.navigator.clipboard = originalClipboard;
    });

    test('closes modal when clicking on close button', () => {
        render(<PermissionTab
            isOwner={true}
            showModal={true}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
        />);
      
        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);
        
        expect(closeModal).toHaveBeenCalled();
    });
});