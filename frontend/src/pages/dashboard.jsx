import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProtectedInfo, onLogout } from "../api/auth";
import { unAuthenticateUser } from "../redux/slices/authSlice";
import Layout from "../components/layout";

function Dashboard() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [protectedData, setProtectedData] = useState(null);

    const logout = async () => {
        try {
            await onLogout();
            dispatch(unAuthenticateUser());
            localStorage.removeItem('isAuth');
        } catch (error) {
            console.log(error.response);
        }
    }

    // for testing
    const protectedInfo = async () => {
        try {
            const { data } = await fetchProtectedInfo();

            setProtectedData(data.info); // because the protected data we set only backend is 'info'

            setLoading(false);
        } catch (error) {
            logout(); // force log out
        }
    }

    useEffect(() => {protectedInfo()}, []);

    return (loading ? (
            <Layout>
                <h1>Loading...</h1>
            </Layout>
        ) : (
            <div>
                <Layout>
                    <h1>Dashboard</h1>
                    <h2>{protectedData}</h2>

                    <button onClick={() => logout()} className="btn btn-primary">Logout</button>
                </Layout>
            </div>
        ));
}

export default Dashboard;