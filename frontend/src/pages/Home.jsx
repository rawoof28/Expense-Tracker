import { Link } from "react-router-dom";
import homePhoto from "../assets/home_photo.png";
import "./Home.css";

function Home() {
  return (
    <div className="home-container d-flex flex-column min-vh-100">

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold fs-3" to="/">
            💰 Expense Tracker
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <div className="d-flex gap-2 mt-3 mt-lg-0">
              <Link
                to="/login"
                className="btn btn-outline-light"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-success"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section flex-grow-1 d-flex bg-light p-0 m-0 overflow-hidden">
        <div className="container-fluid px-0 d-flex flex-grow-1">
          <div className="row m-0 flex-grow-1 w-100">

            {/* Left Side */}
            <div className="col-lg-5 text-center text-lg-start d-flex flex-column justify-content-center p-5">
              <h1 className="hero-title fw-bold mb-4 display-4 text-dark">
                Manage Your Expenses Smartly 💸
              </h1>

              <p className="hero-text mb-4 text-muted fs-5">
                Track your daily expenses, manage your budget,
                and gain insights into your spending habits
                with ease.
              </p>

              <div className="d-flex justify-content-center justify-content-lg-start gap-3 mt-4">
                <Link
                  to="/register"
                  className="btn btn-success btn-lg px-4 shadow-sm fw-bold"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="btn btn-outline-dark btn-lg px-4 shadow-sm fw-bold"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="col-lg-7 p-0 d-flex">
              <img
                src={homePhoto}
                alt="Personal Expense Tracker App"
                style={{ width: '100%', height: '100%', objectFit: 'fill' }}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-5 bg-white m-0">
        <div className="container text-center">

          <h2 className="fw-bold mb-4">
            Features
          </h2>

          <div className="row">

            <div className="col-md-4 mb-4">
              <div className="card feature-card h-100 shadow-sm border-0 bg-light">
                <div className="card-body">
                  <h1 className="mb-3">📊</h1>

                  <h5 className="fw-bold">
                    Track Expenses
                  </h5>

                  <p className="text-muted mb-0">
                    Record and organize your daily expenses easily.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card feature-card h-100 shadow-sm border-0 bg-light">
                <div className="card-body">
                  <h1 className="mb-3">💵</h1>

                  <h5 className="fw-bold">
                    Budget Planning
                  </h5>

                  <p className="text-muted mb-0">
                    Set monthly budgets and control spending.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card feature-card h-100 shadow-sm border-0 bg-light">
                <div className="card-body">
                  <h1 className="mb-3">📈</h1>

                  <h5 className="fw-bold">
                    Reports & Insights
                  </h5>

                  <p className="text-muted mb-0">
                    Understand your spending through simple reports.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} Expense Tracker
        </small>
      </footer>

    </div>
  );
}

export default Home;
