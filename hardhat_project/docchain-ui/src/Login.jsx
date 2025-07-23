import React, { useState , useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLogin }) => {
  const [Username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword , setShowPassword] = useState(false);
  const [darkMode , setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      document.body.className = darkMode ? 'bg-dark text-light' : 'bg-light text-dark';
    }, [darkMode]);

 const handleSubmit = () => {
  if (!Username || !password) {
    toast.warning("Username and Password are required.");
    return;
  }
  setLoading(true);
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (isSignup) {
    const alreadyExists = users.some(u => u.Username === Username && u.password === password);

    if (alreadyExists) {
      toast.warning("User already exists. Please login.");
      return;
    }

    const newUser = { Username, password };
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser)); // this is the logged-in user
    toast.success("Signup successful!");
    onLogin(newUser);

  } else {
      const matchedUser = users.find(u => u.Username === Username && u.password === password);

      if (!matchedUser) {
        toast.error("Invalid login credentials.");
        return;
      }

      localStorage.setItem('user', JSON.stringify(matchedUser)); // mark as logged in
      onLogin(matchedUser);
      toast.success("Login Successfull")
  }
  setLoading(false);
};

  return (
    <div className="text-center mb-5">
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill"
        onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '🔆' : '🌙'}
      </button>
      <h1 className="mb-4 fw-bold">Proof Of Ownership Dapp</h1>
      <p className="fw-bold mb-5">
        A simple blockchain-based system to register and verify documents
      </p>
      {loading && (
  <div className="text-center my-3">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)}
    <div className="container d-flex justify-content-center align-items-center min-vh-50 rounded-pill">
      <div className="card p-4 shadow-sm " style={{ width: "100%", maxWidth: "500px",
        color: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent',
        borderColor: darkMode ? '#fff' : '#000',
      }}>
        <h3 className="mb-4 text-center">{isSignup ? "Sign Up" : "Login"}</h3>
        <input
          type="Username"
          className="form-control mb-3 rounded-pill"
          placeholder= {isSignup ? "Enter a Username" : "Enter your username"}
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
        />
      <div className='input-group mb-3 rounded-pill'
      style={{
        color: darkMode ? '#fff' : '#000',
        backgroundColor: darkMode ? 'transparent' : 'transparent',
        borderColor: darkMode ? '#fff' : '#000',
      }}>
        <input
          type={showPassword ? "Text" : "Password"}
          className="form-control mb-3 rounded-pill"
          placeholder= {isSignup ? "Enter a Password" : "Enter your Password"
      }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
        type="button"
        className="btn btn-outline-secondary mb-3 rounded-pill"
        onClick={(e) => setShowPassword(!showPassword)}
        title={password ? "Hide password" : "Show password"}
        >
        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary w-100 rounded-pill">
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="text-center mt-3">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="text-decoration-underline text-primary" style={{ cursor: 'pointer' }} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={3000} />
     </div>
  );
};

export default Login;
