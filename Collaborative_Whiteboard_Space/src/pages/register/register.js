import React, { useState } from "react";
import classes from "./register.module.css";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../backend/createClient";

const Register = () => {
  // initialises routes, email, password, confirm password, state  of showing password
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirm] = useState("");
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // navigates to login page after sign up
  const SignUp = async (e) => {
    if (email && password && confirmPassword && password === confirmPassword) {
      let { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (data.length != 0 && !error) {
        navigate("/login");
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage("Please enter valid details");
    }
  };

  // Function to navigate to the home page
  const Join = () => {
    navigate("/");
  };

  return (
    <div className={classes.registerPage}>
      <div className={classes.registerForm}>
        <h3>Register</h3>

        <input
          type="text"
          value={email}
          onChange={(change) => setEmail(change.target.value)}
          placeholder="Email"
          className={classes.formInput}
        />

        <div className={classes.passwordField}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(change) => setPassword(change.target.value)}
            placeholder="Password"
            className={classes.passwordInput}
          />
          <button
            className={classes.showButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className={classes.passwordField}>
          <input
            type={showConfirmedPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(change) => setConfirm(change.target.value)}
            placeholder="Confirm password"
            className={classes.passwordInput}
          />
          <button
            className={classes.showButton}
            onClick={() => setShowConfirmedPassword(!showConfirmedPassword)}
          >
            {showConfirmedPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button className={classes.formButton} onClick={SignUp}>
          Continue
        </button>

        {errorMessage && <p className={classes.errorMessage}>{errorMessage}</p>}

        <hr className={classes.formDivider} />

        <button
          className={classes.formButton}
          style={{ opacity: "75%" }}
          onClick={Join}
        >
          Join as guest user!
        </button>

        <Link to="/login">Already registered? Login here!</Link>
      </div>
    </div>
  );
};

export default Register;
