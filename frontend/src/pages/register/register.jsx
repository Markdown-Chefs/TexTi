import { useState } from 'react';
import { onRegistration } from '../../api/auth';
import TexTiLogo from '../../components/assets/TexTiLogoWithText.jpg';
import { NavLink } from 'react-router-dom';
import './register.css';
import Alert from '../../components/alert/alert';


function Register() {
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const onChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await onRegistration(values);
            //console.log(response);
            setError('');
            setSuccess(response.data.message);
            setValues({ username: '', email: '', password: '' })
        } catch (error) {
            //console.log(error.response.data.errors[0].msg);
            setSuccess('');
            setError(error.response.data.errors[0].msg);
        }
    }

    return (
        <>
            <div className='signup-page'>
                <div className='signup-tab'>
                    <div className="welcome-signup-section">
                        <div className="welcome-signup-content">
                            <h1>Welcome Back</h1>
                            <img src={TexTiLogo} alt="Logo" />
                            <p>Already have an account?</p>
                            <NavLink to="/login" className="to-login">
                                <button>Sign In</button>
                            </NavLink>
                        </div>
                    </div>
                    <div className='signup-container'>
                        <h1> R E G I S T E R </h1>
                        <form onSubmit={ onSubmit } className='signup-form'>
                            <input 
                                onChange={ onChange }
                                type='text'
                                placeholder='Username'
                                id='username'
                                name='username'
                                value={values.username}
                                required
                            />
                            <input 
                                onChange={ onChange }
                                placeholder='Email'
                                type='email'
                                id='email'
                                name='email'
                                value={values.email}
                                required
                            />
                            <input 
                                onChange={ onChange }
                                type='password'
                                placeholder='Password'
                                id='password'
                                name='password'
                                value={values.password}
                                required
                            />
                            <button type="submit">Sign Up</button>
                            <Alert message={error} type="error" onClose={() => setError('')} />
                            <Alert message={success} type="success" onClose={() => setSuccess('')} />
                        </form>
                    </div>
                </div>
                <NavLink to='/' className='toHomePage'>
                    Home
                </NavLink>
            </div>
        </>
    );
}

export default Register;