import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TexTiLogo from '../assets/TexTi-logo.jpg'
import './appBar.css';

const AppBar = () => {

  const { isAuth } = useSelector(state => state.auth);

  return (
    <div className="app-bar">
      <div className="navbar-brand">
        <img src={TexTiLogo} alt="Logo" />
        <span className='productName'>TexTi</span>
      </div>
      <div className="navbar-nav flex-row">
        <a className="nav-link" href="#">Home</a>
         {/* <a className="nav-link" href="#">Link</a>
        <div className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown
          </a>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">Action</a></li>
            <li><a className="dropdown-item" href="#">Another action</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item" href="#">Something else here</a></li>
          </ul> 
        </div> */}
        <NavLink to='/login' className='nav-linklogin'>
            Sign in
          </NavLink>
        <span> | </span>
          <NavLink to='/register' className='nav-linklogin'>
          Sign up
        </NavLink>
      </div>
    </div>
  );
}


export default AppBar;