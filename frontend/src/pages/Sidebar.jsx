import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (

        <div className="sidebar">

            <h2 className="logo">
                💰 Expense Tracker
            </h2>

            <NavLink
                to="/dashboard"
                className="menu"
            >
                📊 Dashboard
            </NavLink>

            <NavLink
                to="/reports"
                className="menu"
            >
                📈 Reports
            </NavLink>

            <NavLink
                to="/profile"
                className="menu"
            >
                👤 Profile
            </NavLink>

            <button
                className="btn btn-danger mt-5 w-100"
                onClick={logout}
            >
                Logout
            </button>

        </div>

    );

}

export default Sidebar;