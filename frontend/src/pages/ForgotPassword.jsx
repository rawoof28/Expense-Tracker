import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/forgot-password",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      alert("Password Updated Successfully");
      navigate("/login");

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to update password"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="text-center mb-4">

          <div className="logo-circle">
            🔒
          </div>

          <h2 className="mt-3">
            Reset Password
          </h2>

          <p className="text-muted">
            Enter your email and create a new password.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
          >
            Update Password
          </button>

        </form>

        <hr />

        <p className="text-center">
          <Link to="/login">
            Back to Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;