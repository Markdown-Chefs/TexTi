import AppBar from '../../components/appbar/appBar';
import './home.css'
import { NavLink } from 'react-router-dom';
import EnhancedProductivity from '../../components/assets/EnhancedProductivity2.gif';
import FolderIcon from '../../components/assets/folderIcon.png';
import TextEditorIcon from '../../components/assets/textEditor.png';
import SearchIcon from '../../components/assets/searchIcon.png';


function Home() {
    return (
        <>
            <AppBar />
            <div className="main-page">
                <header className="header">
                    <div className="intro">
                        <h1>Organise Your World with <span className="highlight">TexTi</span></h1>
                        <p>
                            Effortlessly structure your notes with customisable folders and capture ideas with a minimalist markdown editor.
                        </p>
                        <div className="signup-prompt">
                            <p>Ready to Transform Your Note-Taking Experience? <NavLink to='/register' className="highlight-link">Join</NavLink> TexTi now!</p>
                        </div>
                    </div>
                </header>



                <div className="feature-container">
                        <div className="feature-image">
                            <img src={ EnhancedProductivity} alt=''/>
                        </div>
                        
                        <div className="feature-text">
                            <h2>Why TexTi?</h2>
                            <ol class="list-group">
                                <li className="list-group-item d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div class="icon-text-wrapper">
                                            <img src={FolderIcon} alt=''/>
                                            <div className="text">
                                                <div className="fw-bold">Folder-Structured Management</div>
                                                Organize your notes in a structured, intuitive manner with our customizable folder system. Easily navigate and manage your information.
                                                </div>
                                            </div>
                                        </div>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div class="icon-text-wrapper">
                                            <img src={TextEditorIcon} alt=''/>
                                            <div className="text">
                                            <div className="fw-bold">Markdown Text Editor</div>
                                            A minimalist, Markdown-based editor that facilitates efficient note-taking and supports basic formatting.
                                        </div>
                                        </div>
                                    </div>
                                    
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-start">
                                    <div className="ms-2 me-auto">
                                        <div class="icon-text-wrapper">
                                            <img src={SearchIcon} alt=''/>
                                            <div className="text">
                                                <div className="fw-bold">Advanced Search Capabilities</div>
                                                Quickly locate any note or snippet of information with powerful search functionalities. Save time and stay organized effortlessly.
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                </ol>
                        </div>
                </div>
            </div>
        </>
    );
}

export default Home;