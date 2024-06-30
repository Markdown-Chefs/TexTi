import { useEffect, useState } from "react";
import { fetchProtectedInfo, onLogout, onChangeUsername, onChangeEmail, onChangePassword } from "../../api/auth";
import { useDispatch } from "react-redux";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
// import { onLogout } from "../api/auth";
import Navbar from "../../components/navbar/navbar";
import "./userSettings.css"
import Loading from "../loading/loading";


function UserSettings() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [protectedData, setProtectedData] = useState(null);

    const userSettingsAction = ['Change Email', 'Change Password'];

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
            case 1:
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
        <Loading/>
        </>
    ) : (
        <>
        <Navbar page="settings"></Navbar>
        <div className="settings-page">
            <div className="top"></div>
            <div className="header-container">
                <div className="line"></div>
                <div className="header-text">Settings</div>
                <div className="line"></div>
            </div>
        
            <div className="settings-container" >
                <div className="menu-container" >
                    <ul className="list-group" >
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
                <div className="form-container">
                    {renderForm()}
                </div>
            </div>
            </div>
        </>
    ));
}

export default UserSettings;