import AppBar from '../../components/appbar/appBar';
import './home.css'
import { NavLink } from 'react-router-dom';
import Folder from '../../components/assets/Data Base 2.png';
import Multitasking from '../../components/assets/Multitasking.png';


function Home() {
    return (
        <>
            <AppBar />
            <div className="main-page">
                <header className="header">
                    <div className="intro">
                        <h1>Organise Your World with <span className="highlight">TexTi</span></h1>
                        <p className="subheading">
                            Effortlessly structure your notes with customisable folders and capture ideas with a minimalist markdown editor.
                        </p>
                        <div className="signup-prompt">
                            <p>Ready to Transform Your Note-Taking Experience? <NavLink to='/register' className="highlight-link">Join</NavLink> TexTi now!</p>
                        </div>
                    </div>
                </header>
            

            <div className="box">
                <div className="features">
                    <div className="overlap">
                    <div className="feature">
                        <img className="folder" alt="Folder" src={Folder} />
                        <div className="text-wrapper">Folder-Structured Management</div>
                        <p className="div">
                        Organize your notes in a structured, intuitive manner with our customizable folder system. Easily navigate
                        and manage your information.
                        </p>
                    </div>
                    <div className="feature-2">
                        <NavLink to='/editor' className="button">
                            Try Our Markdown Editor Now!
                        </NavLink>
                        <div className="text-wrapper-2">
                            Ever wondered how to make your text beautifully formatted with minimal effort? Dive into the world of
                            Markdown and transform your writing!
                        </div>
                        <img className="multitasking" alt="Multitasking" src={Multitasking} />
                        <div className="text-wrapper-3">Discover the Power of Markdown</div>
                        </div>
                        
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}

export default Home;