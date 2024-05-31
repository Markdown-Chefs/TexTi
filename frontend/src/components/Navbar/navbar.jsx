import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './navbar.css'
import TexTi_logo from '../assets/TexTi-logo.jpg'
import LogoutIcon from '../assets/logout.webp'
import { useEffect, useState } from 'react'
import { onLogout } from "../../api/auth";
import { useDispatch } from "react-redux";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
import { onCreateNote } from "../../api/notes";
import PlusIcon from '../assets/plus-icon.png'
import NoteIcon from '../assets/note-icon.png'

const Navbar = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.username) {
      setUsername(userInfo.username);
    }
  }, []); 

  const logout = async () => {
    try {
        await onLogout();
        dispatch(unAuthenticateUser());
        localStorage.removeItem('isAuth');
        localStorage.removeItem('userInfo');
    } catch (error) {
        console.log(error.response);
    }
  }

  const createNote = async () => {
    const title = prompt("Note's Title: ");
    
    try {
        const response = await onCreateNote({noteTitle: title});
        // console.log(response);
        if (response.status === 201) {
            setListOfNotes([...listOfNotes, response.data.noteCreated]);
        }
    } catch (error) {
        alert(error.response.data.errors[0].msg);
    }
  }

  return (
    <nav className='navbar flex-column'>
    <div className='profile'>
      <img src={TexTi_logo} alt='Profile' className='profile-pic' />
      <span className='username'> {username} </span>
    </div>
    <div className='nav-links'>
      <NavLink to='/' className='nav-link'>
        <img src={NoteIcon} alt='NoteIcon' className='note-img'/>
        My Notes
      </NavLink>
      <NavLink to='/editor' className='nav-link'> Editor</NavLink>
    </div>
    <div onClick={() => logout()} className='logout-link'>
      <img src={LogoutIcon} alt='LogoutIcon' /> Sign out </div>
  </nav>
  );
};

export default Navbar;