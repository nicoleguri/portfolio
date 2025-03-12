import React, { useState } from "react";
import classes from "./login.module.css";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../backend/createClient";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/userStore";

const Login = () => {
  // initialise routes, email, password, and state of showing password
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // navigates to main whiteboard after sign in
  const SignIn = async (e) => {
    if (email && password) {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (data.length!=0 && !error) {
        dispatch(loginUser({ user: email, type: "auth" }));
        navigate("/dashboard");
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage("Please enter valid details");
    }
  };

  const Join = () => {
    navigate("/");
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.loginForm}>
        <h3>Login</h3>

        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={classes.formInput}
        />

        <div className={classes.passwordField}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={classes.passwordInput}
          />
          <button
            className={classes.showButton}
            onClick={() => setShow(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button className={classes.formButton} onClick={SignIn}>
          Continue
        </button>

        {errorMessage && <p className={classes.formErrorMessage}>{errorMessage}</p>}

        <hr className={classes.formDivider} />

        <button
          className={classes.formButton}
          style={{ opacity: "75%" }}
          onClick={Join}
        >
          Join as guest user!
        </button>

        <Link to="/register">No account? Register today!</Link>
      </div>
    </div>
  );
};

export default Login;
