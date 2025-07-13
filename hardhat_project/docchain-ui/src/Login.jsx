import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [Username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword , setShowPassword] = useState(false);

 const handleSubmit = () => {
  if (!Username || !password) {
    alert("Username and wallet are required.");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (isSignup) {
    const alreadyExists = users.some(u => u.Username === Username && u.password === password);

    if (alreadyExists) {
      alert("User already exists. Please login.");
      return;
    }

    const newUser = { Username, password };
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser)); // this is the logged-in user
    alert("Signup successful!");
    onLogin(newUser);

  } else {
    const matchedUser = users.find(u => u.Username === Username && u.password === password);

    if (!matchedUser) {
      alert("❌ Invalid login credentials.");
      return;
    }

    localStorage.setItem('user', JSON.stringify(matchedUser)); // mark as logged in
    onLogin(matchedUser);
    alert("✅ Login Successfull")
  }
};

  return (
    <div className="text-center mb-5">
      <h1 className="mb-4 fw-bold">Proof Of Ownership Dapp</h1>
      <p className="fw-bold mb-5">
        A simple blockchain-based system to register and verify documents
      </p>
    <div className="container d-flex justify-content-center align-items-center min-vh-50">
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: "500px" }}>
        <h3 className="mb-4 text-center">{isSignup ? "Sign Up" : "Login"}</h3>
        <input
          type="Username"
          className="form-control mb-3"
          placeholder= {isSignup ? "Enter a Username" : "Enter your username"}
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
        />
      <div className='input-group mb-3'>
        <input
          type={showPassword ? "Text" : "Password"}
          className="form-control mb-3"
          placeholder= {isSignup ? "Enter a Password" : "Enter your Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
        type="button"
        className="btn btn-outline-secondary mb-3"
        onClick={(e) => setShowPassword(!showPassword)}
        title={password ? "Hide password" : "Show password"}
        >
        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary w-100">
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
     </div>
  );
};

export default Login;
