import { useEffect, useState } from "react";
import { fetchProtectedInfo, onLogout, onChangeUsername, onChangeEmail, onChangePassword } from "../api/auth";
import { useDispatch } from "react-redux";
import { unAuthenticateUser } from "../redux/slices/authSlice";
// import { onLogout } from "../api/auth";
import Navbar from "../components/navbar/navbar";


function UserSettings() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [protectedData, setProtectedData] = useState(null);

    const userSettingsAction = ['Change Username', 'Change Email', 'Change Password'];
    const [newUsername, setNewUsername] = useState({
        newUsername: '',
    });
    const [newEmail, setNewEmail] = useState({
        newEmail: '',
    });
    const [newPassword, setNewPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });


    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

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

    const protectedInfo = async () => {
        try {
            const { data } = await fetchProtectedInfo();
            setProtectedData(data.info);
            setLoading(false);
        } catch (error) {
            logout();
        }
    }

    const onSubmitUsernameChange = async (event) => {
        event.preventDefault();
        try {
            const response = await onChangeUsername(newUsername);

            localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo));
            setError('');
            setSuccess(response.data.message);
            setNewUsername({newUsername: ''});
        } catch (error) {
            setSuccess('');
            setError(error.response.data.errors[0].msg);
        }
    }

    const onSubmitEmailChange = async (event) => {
        event.preventDefault();
        try {
            const response = await onChangeEmail(newEmail);
            setError('');
            setSuccess(response.data.message);
            setNewEmail({newEmail: ''});
        } catch (error) {
            setSuccess('');
            setError(error.response.data.errors[0].msg);
        }
    }

    const onSubmitPasswordChange = async (event) => {
        event.preventDefault();
        try {
            const response = await onChangePassword(newPassword);
            setError('');
            setSuccess(response.data.message);
            setNewPassword({currentPassword: '', newPassword: '', confirmPassword: ''});
        } catch (error) {
            setSuccess('');
            setError(error.response.data.errors[0].msg);
        }
    }

    const renderForm = () => {
        switch (selectedIndex) {
            case 0:
                return (
                    <form onSubmit={onSubmitUsernameChange}>
                    <input 
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter new username"
                        value={newUsername.newUsername}
                        onChange={e => setNewUsername({...newUsername, newUsername: e.target.value})}
                        required
                    />
                    <button type="submit">Change Username</button>
                    <div style={{ color: 'red', margin: '10px 0'}}>{error}</div>
                    <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>
                    </form>
                );
            case 1:
                return (
                    <form onSubmit={onSubmitEmailChange}>
                    <input 
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter new email"
                        value={newEmail.newEmail}
                        onChange={e => setNewEmail({...newEmail, newEmail: e.target.value})}
                        required
                    />
                    <button type="submit">Change Email</button>
                    <div style={{ color: 'red', margin: '10px 0'}}>{error}</div>
                    <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={onSubmitPasswordChange}>
                    <input 
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        placeholder="Enter current password"
                        style={{ display: "block", marginBottom: "5px" }}
                        value={newPassword.currentPassword}
                        onChange={e => setNewPassword({...newPassword, currentPassword: e.target.value})}
                        required
                    />
                    <input 
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        placeholder="Enter new password"
                        style={{ display: "block", marginBottom: "5px" }}
                        value={newPassword.newPassword}
                        onChange={e => setNewPassword({...newPassword, newPassword: e.target.value})}
                        required
                    />
                    <input 
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        style={{ display: "block", marginBottom: "5px" }}
                        value={newPassword.confirmPassword}
                        onChange={e => setNewPassword({...newPassword, confirmPassword: e.target.value})}
                        required
                    />
                    <button type="submit">Change Password</button>
                    <div style={{ color: 'red', margin: '10px 0'}}>{error}</div>
                    <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>
                    </form>
                );
            default:
                break;
        }
    }

    useEffect(() => {protectedInfo()});

    return (loading ? (
        <>
        <h1>Loading...</h1>
        </>
    ) : (
        <>
        <h1>User Settings</h1>
        <br />
        <div className="settings-container" style={{ display: 'flex', alignItems: 'flex-start', padding: '20px' }}>
            <div className="menu-container" style={{ flex: 1, marginRight: '20px' }}>
                <ul className="list-group" style={{ width: '100%', marginLeft: '2%'}}>
                    {userSettingsAction.map((item, index) => (
                        <li
                            className={selectedIndex === index ? "list-group-item active" : "list-group-item"}
                            onClick={() => {
                                setSelectedIndex(index);
                                setError('');
                                setSuccess('');
                            }}
                            key={item}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="form-container" style={{ flex: 2 }}>
                {renderForm()}
            </div>
        </div>
        </>
    ));
}

export default UserSettings;