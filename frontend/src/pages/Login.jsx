import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import loginPhoto from "../assets/Login_Photo.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        formData
      );

     if (res.data.token) {
  localStorage.setItem("token", res.data.token);
}

localStorage.setItem(
  "user",
  JSON.stringify(res.data.user)
);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image-section">
          <img src={loginPhoto} alt="Login Illustration" className="login-image" />
        </div>
        <div className="login-card">
          <div className="text-center mb-4">
            <div className="logo-circle">
              💰
            </div>
            <h2 className="mt-3 fw-bold">
              Expense Tracker
            </h2>
            <p className="text-muted">
              Welcome back! Please login to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex justify-content-between mb-3">
              <div>
                <input type="checkbox" /> Remember me
              </div>
              <Link
                to="/forgot-password"
                className="text-decoration-none"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
            >
              Login
            </button>
          </form>

          <hr />

          <p className="text-center mb-0">
            Don't have an account?{" "}
            <Link to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;