import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './navbar.css'
import TexTi_logo from '../assets/TexTi-logo.jpg'
import LogoutIcon from '../assets/log-out.png'
import { useEffect, useState } from 'react'
import { onLogout } from "../../api/auth";
import { useDispatch } from "react-redux";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
import { onCreateNote } from "../../api/notes";
import NotePoolIcon from "../assets/world_2.png"
import NoteIcon from '../assets/user.png'
import useUser from '../../hooks/useUser';
import SettingIcon from '../assets/settings.png'

const Navbar = ( {page}) => {
  // const [username, setUsername] = useState('');
  const { username, userId } = useUser();
  const dispatch = useDispatch();
  const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]
  const [active, setActive] = useState(page)

  // useEffect(() => {
  //   const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  //   if (userInfo && userInfo.username) {
  //     setUsername(userInfo.username);
  //   }
  // }, []); 

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
      <NavLink to="/dashboard" className= { active === "my-notes" ? "nav-link nav-link-active" : "nav-link"}>
        <img src={NoteIcon} alt='NoteIcon' className='note-img'/>
        My Notes
      </NavLink>
      <NavLink to='/public_notes' className= { active === "note-pool" ? "nav-link nav-link-active" : "nav-link"}> 
         <img src={NotePoolIcon} alt='NotePool' className='note-pool-img'/>
          Note Pool
      </NavLink>
      <NavLink to='/settings' className={ active === "settings" ? "nav-link nav-link-active" : "nav-link"}> 
        <img src={SettingIcon} alt='Settings' className='note-pool-img'/>
        Settings 
      </NavLink>
      <div onClick={() => logout()} className='nav-link'>
      <img src={LogoutIcon} alt='LogoutIcon' className='note-pool-img'/> Sign Out </div>
    </div>
  </nav>
  );
};

export default Navbar;