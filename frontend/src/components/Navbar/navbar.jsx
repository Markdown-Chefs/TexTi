import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import style from './navbar.css'
import TexTi_logo from '../assets/TexTi-logo.jpg'

const Navbar = () => {
  const { isAuth } = useSelector(state => state.auth);

  return (
    <nav className='navbar flex-column'>
    <div className='profile'>
      <img src={TexTi_logo} alt='Profile' className='profile-pic' />
      <span className='username'>username</span>
    </div>
    <div className='nav-links'>
      <NavLink to='/' className='nav-link'>
        Home
      </NavLink>

      {isAuth ? (
        <NavLink to='/dashboard' className='nav-link'>
          Dashboard
        </NavLink>
      ) : (
        <>
          <NavLink to='/login' className='nav-linklogin'>
            Login
          </NavLink>
        </>
      )}
    </div>
  </nav>
  );
};

export default Navbar;