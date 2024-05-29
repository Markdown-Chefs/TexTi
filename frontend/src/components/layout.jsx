import Navbar from "./Navbar/navbar";
import styles from './layout.css'

const Layout = ({ children }) => {
    return (
        <div className="container">
            <Navbar />
            <div className="content">
                {children}
            </div>
        </div>
    );
}

export default Layout;