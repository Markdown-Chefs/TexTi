import {
    BrowserRouter,
    Navigate,
    Routes,
    Route,
    Outlet,
} from "react-router-dom";
import Home from "./pages/home/home";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
    const { isAuth } = useSelector(state => state.auth);

    // or:
    // const { authState } = useSelector(state => state.auth);
    // authState.isAuth;

    return <>{isAuth ? <Outlet /> : <Navigate to="/login" />}</>;
};

const RestrictedRoute = () => {
    const { isAuth } = useSelector(state => state.auth);

    return <>{!isAuth ? <Outlet /> : <Navigate to="/dashboard" />}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                   <Home></Home> }>
                </Route>

                <Route element={<PrivateRoute></PrivateRoute>}>
                    <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>
                </Route>

                <Route element={<RestrictedRoute></RestrictedRoute>}>
                    <Route path="/register" element={<Register></Register>}></Route>
                    <Route path="/login" element={<Login></Login>}></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
