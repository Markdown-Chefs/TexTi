import { useEffect, useState } from "react";
import { fetchProtectedInfo, onLogout, onChangeUsername, onChangeEmail, onChangePassword } from "../../api/auth";
import { useDispatch } from "react-redux";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
// import { onLogout } from "../api/auth";
import Navbar from "../../components/navbar/navbar";
import "./userSettings.css"
import Loading from "../loading/loading";
import ShortLoading from "../loading/shortloading";
import Alert from "../../components/alert/alert";
import Mail from "../../components/assets/mail.png";
import Password from "../../components/assets/password.png"

function UserSettings() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [protectedData, setProtectedData] = useState(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

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
            setShowEmailForm(false);
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
            setShowPasswordForm(false);
        } catch (error) {
            setSuccess('');
            setError(error.response.data.errors[0].msg);
        }
    }


    useEffect(() => {
        protectedInfo();
    }, []);

    const renderForm = () => {
        return (
            <>
                {showEmailForm && (
                    <div className="custom-prompt-overlay">
                        <div className="custom-prompt">
                            <h2>Change Email</h2>
                            <form onSubmit={onSubmitEmailChange}>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={newEmail.newEmail}
                                    onChange={e => setNewEmail({...newEmail, newEmail: e.target.value})}
                                    placeholder="Enter new email"
                                    required
                                />
                                <div className="custom-prompt-actions">
                                    <button type="button" onClick={() => setShowEmailForm(false)}>Cancel</button>
                                    <button type="submit">OK</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showPasswordForm && (
                    <div className="custom-prompt-overlay">
                        <div className="custom-prompt">
                            <h2>Change Password</h2>
                            <form onSubmit={onSubmitPasswordChange}>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={newPassword.currentPassword}
                                    onChange={(e) => setNewPassword({ ...newPassword, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                />
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={newPassword.newPassword}
                                    onChange={(e) => setNewPassword({ ...newPassword, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    required
                                />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={newPassword.confirmPassword}
                                    onChange={(e) => setNewPassword({ ...newPassword, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <div className="custom-prompt-actions">
                                    <button type="button" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                                    <button type="submit">OK</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (loading ? (
        <>
        <ShortLoading/>
        </>
    ) : (
        <>
        <Navbar page="settings"></Navbar>
        <div className="settings-page">
            <div className="top"></div>
            <div className="header-container">
                <div className="line"></div>
                <div className="header-text">SETTINGS</div>
                <div className="line"></div>
            </div>
        
            <div className="settings-container">
                <button
                    onClick={() => {
                        setShowEmailForm(true);
                        setShowPasswordForm(false);
                        setError('');
                        setSuccess('');
                    }}
                    className="setting-btn"
                >
                    <img src={Mail} alt="Email" className="mail" />
                    Change Email
                </button>
                <button
                    onClick={() => {
                        setShowPasswordForm(true);
                        setShowEmailForm(false);
                        setError('');
                        setSuccess('');
                    }}
                    className="setting-btn"
                >
                    <img src={Password} alt="Password" className="password"/>
                    Change Password
                </button>
                    {renderForm()}
                    <Alert message={error} type="error" onClose={() => setError('')} />
                    <Alert message={success} type="success" onClose={() => setSuccess('')} />
                </div>
        </div>
        </>
    ));
}

export default UserSettings;