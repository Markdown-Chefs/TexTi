import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Router, Routes, Route, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import EditorNavbar from '../editorNavbar';

jest.mock('../../assets/TexTi-logo.jpg', () => 'mocked-TexTi-logo.jpg');
jest.mock('../../assets/Both Icon.png', () => 'mocked-Both-Icon.png');
jest.mock('../../assets/eye.png', () => 'mocked-eye.png');
jest.mock('../../assets/edit-3.png', () => 'mocked-edit-3.png');
jest.mock('../../assets/lock.png', () => 'mocked-lock.png');
jest.mock('../../assets/edit.png', () => 'mocked-edit.png');
jest.mock('../../assets/share.png', () => 'mocked-share.png');
jest.mock('../../assets/file-lock-2.png', () => 'mocked-file-lock-2.png');
jest.mock('../../assets/copy.png', () => 'mocked-copy.png');
jest.mock('../../assets/published.png', () => 'mocked-published.png');
jest.mock('../../assets/image-plus.png', () => 'mocked-image-plus.png');

jest.mock('../../../api/notes', () => ({
    updateNotePermission: jest.fn()
}));

jest.mock('../../permissionTab/permissionTab', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="mocked-permissions-tab" />)
}));

jest.mock('../../imageUpload', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="mocked-image-upload" />)
}));

describe('EditorNavbar Component', () => {
    let history;
    let noteTitle, trial, fetchUserNotePermission, handleExporting, handlePublishNote, handleUnpublishNote;
    // setMode = 'both' || 'edit' || 'preview'
    // canEdit = true || false
    // isOwner = true || false
    // isAPublicNote = true || false

    beforeEach(() => {
        history = createMemoryHistory();
        history.push = jest.fn();
        noteTitle = 'test note title';
        trial = 'false'; // should not be string, but boolean instead, but not brave enough to touch unbroken thing
        fetchUserNotePermission = jest.fn();
        handleExporting = jest.fn();
        handlePublishNote = jest.fn();
        handleUnpublishNote = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders EditorNavbar component', () => {
        const basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: true,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );

        expect(screen.getByText(noteTitle)).toBeInTheDocument();
        expect(screen.queryByAltText('Edit')).toBeNull();
        expect(screen.queryByText('View Only')).toBeNull();
        expect(screen.getByText('Publish Note')).toBeInTheDocument();
    });

    test('handles mode switch correctly', () => {
        const basicState = {
            mode: jest.fn(),
            canEdit: true,
            isOwner: true,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );

        fireEvent.click(screen.getByText('Editor Only'));
        expect(basicState.mode).toHaveBeenCalledWith('edit');
      
        fireEvent.click(screen.getByText('Editor + Previewer'));
        expect(basicState.mode).toHaveBeenCalledWith('both');
      
        fireEvent.click(screen.getByText('Previewer Only'));
        expect(basicState.mode).toHaveBeenCalledWith('preview');
    });

    test('handles export button click correctly', () => {
        const basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: true,
            isAPublicNote: false,
            handleExporting: jest.fn(),
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={basicState.handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );

        fireEvent.click(screen.getByText('Export Note'));
        fireEvent.click(screen.getByText('PDF'));
        expect(basicState.handleExporting).toHaveBeenCalledWith('pdf');
      
        fireEvent.click(screen.getByText('Export Note'));
        fireEvent.click(screen.getByText('Markdown'));
        expect(basicState.handleExporting).toHaveBeenCalledWith('markdown');
      
        fireEvent.click(screen.getByText('Export Note'));
        fireEvent.click(screen.getByText('HTML'));
        expect(basicState.handleExporting).toHaveBeenCalledWith('styledhtml');
      
        fireEvent.click(screen.getByText('Export Note'));
        fireEvent.click(screen.getByText('Raw HTML'));
        expect(basicState.handleExporting).toHaveBeenCalledWith('rawhtml');
    });

    test('renders permission state correctly when user is owner', () => {
        let basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: true,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );
        expect(screen.queryByAltText('Edit')).toBeNull();
        expect(screen.queryByText('View Only')).toBeNull();
    });

    test('renders permission state correctly when user is not owner but can edit', () => {
        let basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: false,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );
        expect(screen.queryByAltText('Edit')).toBeInTheDocument();
        expect(screen.queryByText('View Only')).toBeNull();
    });

    test('renders permission state correctly when user cannot edit', () => {
        let basicState = {
            mode: 'both',
            canEdit: false,
            isOwner: false,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );
        expect(screen.queryByAltText('Edit')).toBeNull();
        expect(screen.queryByText('View Only')).toBeInTheDocument();
    });

    test('handles permission button click correctly when user is not owner', () => {
        window.alert = jest.fn();
        let basicState = {
            mode: 'both',
            canEdit: false,
            isOwner: false,
            isAPublicNote: false,
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );
      
        expect(screen.queryByText('Share Note')).toBeNull();
    });
    
    test('handles publish note button click correctly', () => {
        let basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: true,
            isAPublicNote: false,
            handlePublishNote: jest.fn(),
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={basicState.handlePublishNote} handleUnpublishNote={handleUnpublishNote} />
            </Router>
        );

        expect(screen.queryByText('Publish Note')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Publish Note'));
        expect(basicState.handlePublishNote).toHaveBeenCalled();
    });

    test('handles unpublish note button click correctly', () => {
        let basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: true,
            isAPublicNote: true,
            handleUnpublishNote: jest.fn(),
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={basicState.handleUnpublishNote} />
            </Router>
        );

        expect(screen.queryByText('Unpublish Note')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Unpublish Note'));
        expect(basicState.handleUnpublishNote).toHaveBeenCalled();
    });

    test('handles publish/unpublish note button click correctly when user is not owner', () => {
        let basicState = {
            mode: 'both',
            canEdit: true,
            isOwner: false,
            isAPublicNote: true,
            handlePublishNote: jest.fn(),
            handleUnpublishNote: jest.fn(),
        }
        render(
            <Router location={history.location} navigator={history}>
                <EditorNavbar noteTitle={noteTitle} setMode={basicState.mode} trial={trial} canEdit={basicState.canEdit} isOwner={basicState.isOwner} fetchUserNotePermission={fetchUserNotePermission} handleExporting={handleExporting} isAPublicNote={basicState.isAPublicNote} handlePublishNote={basicState.handlePublishNote} handleUnpublishNote={basicState.handleUnpublishNote} />
            </Router>
        );

        expect(screen.queryByText('Publish Note')).toBeNull();
        expect(screen.queryByText('Unpublish Note')).toBeNull();
    });
});