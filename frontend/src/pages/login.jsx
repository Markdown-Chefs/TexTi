import { useState } from 'react';
import { onLogin } from '../api/auth';
import Layout from '../components/layout';
import { useDispatch } from 'react-redux';
import { authenticateUser } from '../redux/slices/authSlice'

function Login() {
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(false);

    const onChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    const dispatch = useDispatch();

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            await onLogin(values);
            // if success, server will send back token in cookie
            // so just need to change redux state
            dispatch(authenticateUser());
            
            // set isAuth to localStorage
            // so that isAuth won't be reset if user refresh page
            localStorage.setItem('isAuth', 'true');

        } catch (error) {
            //console.log(error.response.data.errors[0].msg);
            setError(error.response.data.errors[0].msg);
        }
    }

    return (
        <Layout>
            <form onSubmit={event => onSubmit(event)} className='container mt-3'>
                <h1>Login</h1>
                <div className='mb-3'>
                    {/* <label htmlFor="username" className='form-label'>Username</label>
                    <input 
                        onChange={event => onChange(event)}
                        type='text'
                        className='form-control'
                        id='username'
                        name='username'
                        value={values.username}
                        required
                    /> */}
                    <label htmlFor="email" className='form-label'>Email Address</label>
                    <input 
                        onChange={event => onChange(event)}
                        type='email'
                        className='form-control'
                        id='email'
                        name='email'
                        value={values.email}
                        required
                    />
                    <label htmlFor="password" className='form-label'>Password</label>
                    <input 
                        onChange={event => onChange(event)}
                        type='password'
                        className='form-control'
                        id='password'
                        name='password'
                        value={values.password}
                        required
                    />
                </div>
                
                <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>

                <button type='submit' className='btn btn-primary'>Submit</button>
            </form>
        </Layout>
    );
}

export default Login;