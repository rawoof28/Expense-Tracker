import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // Use the same CSS as Login

const MAIN_API_URL = "http://localhost:5000";
const RESEND_COOLDOWN = 30;

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpStatus, setOtpStatus] = useState("idle"); // idle | sending | sent | verifying | verified
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      alert("Enter your email first");
      return;
    }

    setOtpStatus("sending");
    try {
      const res = await axios.post(`${MAIN_API_URL}/sendotp`, {
        email: formData.email,
        purpose: "SIGNUP",
      });

      alert(res.data?.message || "OTP sent to your email");
      setOtpStatus("sent");
      startCooldown();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      alert(msg);
      setOtpStatus("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      alert("Enter the OTP first");
      return;
    }

    setOtpStatus("verifying");
    try {
      const res = await axios.post(`${MAIN_API_URL}/validateotp`, {
        user: formData.email,
        otp: formData.otp,
        purpose: "SIGNUP",
      });

      alert(res.data?.message || "OTP verified");
      setOtpStatus("verified");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP";
      alert(msg);
      setOtpStatus("sent");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpStatus !== "verified") {
      alert("Please verify your email with OTP first");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${MAIN_API_URL}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert(res.data.message || "Registration Successful");

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
      setOtpStatus("idle");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Registration Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const emailLocked = otpStatus === "sending" || otpStatus === "sent" || otpStatus === "verifying" || otpStatus === "verified";
  const passwordEnabled = otpStatus === "verified";

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="logo-circle">💰</div>
          <h2 className="mt-3 fw-bold">Create Account</h2>
          <p className="text-muted">Create your Expense Tracker account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="d-flex gap-2">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={emailLocked}
                required
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleSendOtp}
                disabled={emailLocked || cooldown > 0}
                style={{ whiteSpace: "nowrap" }}
              >
                {otpStatus === "sending"
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend (${cooldown}s)`
                  : otpStatus === "sent" || otpStatus === "verifying"
                  ? "Resend OTP"
                  : "Send OTP"}
              </button>
            </div>
          </div>

          {(otpStatus === "sent" || otpStatus === "verifying" || otpStatus === "verified") && (
            <div className="mb-3">
              <label className="form-label">OTP</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  name="otp"
                  className="form-control"
                  placeholder="Enter the OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  disabled={otpStatus === "verified"}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleVerifyOtp}
                  disabled={otpStatus === "verifying" || otpStatus === "verified"}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {otpStatus === "verifying"
                    ? "Verifying..."
                    : otpStatus === "verified"
                    ? "Verified ✓"
                    : "Verify"}
                </button>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder={passwordEnabled ? "Create a password" : "Verify email first"}
              value={formData.password}
              onChange={handleChange}
              disabled={!passwordEnabled}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder={passwordEnabled ? "Confirm your password" : "Verify email first"}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={!passwordEnabled}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!passwordEnabled || submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <hr />

        <p className="text-center mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;