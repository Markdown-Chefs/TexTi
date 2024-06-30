import { useState } from 'react';
import { onLogin } from '../../api/auth';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authenticateUser } from '../../redux/slices/authSlice'
import TexTiLogo from '../../components/assets/TexTiLogoWithText.jpg'
import './login.css';
import Loading from '../loading/loading';


function Login() {
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(false);
    const [loading, setLoading]  = useState(false);

    const onChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    const dispatch = useDispatch();

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await onLogin(values);
            setLoading(false);
            dispatch(authenticateUser());
            localStorage.setItem('isAuth', 'true');
            localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo));
        } catch (error) {
            setLoading(false);
            setError(error.response.data.errors[0].msg);
        }
    }

    return (
        <>
        {loading && <Loading/> }
        <div className='login-page'>
            <div className="login-tab">
                <div className="login-container">
                    <h1>L O G I N</h1>
                    <form onSubmit={onSubmit} className="login-form">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={values.email}
                            onChange={onChange}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={values.password}
                            onChange={onChange}
                            required
                        />
                        <button type="submit">Sign In</button>
                        {error && <div className="error-message">{error}</div>}
                    </form>
                </div>
                <div className="welcome-section">
                        <div className="welcome-content">
                            <h1>Welcome Back</h1>
                            <img src={TexTiLogo} alt="Logo" />
                            <p>New to TexTi?</p>
                            <NavLink to="/register">
                                <button>Sign Up</button>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <NavLink to='/' className='toHomePage'>
                    Home
                </NavLink>
            </div>
    </>
    );
}

export default Login;