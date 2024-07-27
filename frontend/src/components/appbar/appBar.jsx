import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TexTiLogo from '../assets/TexTi-logo.jpg'
import './appBar.css';

const AppBar = () => {

  const { isAuth } = useSelector(state => state.auth);

  return (
    <div className="app-bar">
      
        <div className="appbar-brand">
          <img src={TexTiLogo} alt="Logo" />
          <span className="productName">TexTi</span>
        </div>
        <div className="appbar-nav flex-row">
          <a href="https://drive.google.com/file/d/1LaQCdkCzO5zuisAWRGwQlhmQZ2qgxoDJ/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="appbar-nav-link">
            Demo
          </a>
          {/* <div className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div className="text-wrapper"> Links </div> 
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Action</a></li>
              <li><a className="dropdown-item" href="#">Another action</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#">Something else here</a></li>
            </ul> 
          </div> */}
            <NavLink to='/login' className='loginButton'>
              Sign in
            </NavLink>
            <NavLink to='/register' className='registerButton'>
              Sign up
            </NavLink>
        </div>
      
    </div>
  );
}


export default AppBar;