import TexTiLogo from '../assets/TexTi-logo.jpg'

const SimpleAppBar = () => {
    return (
    <div className="app-bar">
        <div className="navbar-brand">
            <img src={TexTiLogo} alt="Logo" />
            <span className='productName'>TexTi</span>
        </div>
    </div>
    );
};

export default SimpleAppBar;