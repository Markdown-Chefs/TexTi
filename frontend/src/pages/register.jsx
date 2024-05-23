import { useState } from 'react';
import { onRegistration } from '../api/auth';
import Layout from '../components/layout';

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
        <Layout>
            <form onSubmit={event => onSubmit(event)} className='container mt-3'>
                <h1>Register</h1>
                <div className='mb-3'>
                    <label htmlFor="username" className='form-label'>Username</label>
                    <input 
                        onChange={event => onChange(event)}
                        type='text'
                        className='form-control'
                        id='username'
                        name='username'
                        value={values.username}
                        required
                    />
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
                <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>

                <button type='submit' className='btn btn-primary'>Submit</button>
            </form>
        </Layout>
    );
}

export default Register;