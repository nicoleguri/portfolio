import React, { useState } from "react";
import classes from "./join.module.css";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { storeSessionCode } from "../../redux/sessionCodeStore";
import { loginUser } from "../../redux/userStore";

import { supabase } from "../../backend/createClient";

/**
 * Component for joining an existing session.
 * 
 * Allows users to input a session code and username to join a session.
 * If the session code is valid, the user is redirected to the session page.
 * 
 * @returns {JSX.Element} Join component JSX
 */
const Join = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables for session code, username, and error message
  const [sessionCode, setSessionCode] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to join a session with entered session code and username
  const joinSessionCode = async () => {
    if (username && /^\d{8}$/.test(sessionCode)) {
      const { data, error } = await supabase
        .from("Sessions")
        .select()
        .eq("sessionCode", sessionCode);

      if (data.length != 0 && !error) {
        // If session code is valid, dispatch login action and redirect to session page
        dispatch(loginUser({ user: username, type: "guest" }));
        dispatch(storeSessionCode(sessionCode));
        navigate("/session");
      } else {
        // Set error message if session code is not valid
        setErrorMessage(error.message);
      }
    } else {
      // Set error message for invalid input
      setErrorMessage("Please enter valid details");
    }
  };

  // Function to navigate to login page
  const SignIn = () => {
    navigate("/login");
  };

  // JSX for the Join component
  return (
    <div className={classes.joinPage}>
      <div className={classes.joinForm}>
        <h3>Join Session</h3>

        {/* Input field for session code */}
        <input
          className={classes.formInput}
          type="text"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="8 digit session code"
        />

        {/* Input field for username */}
        <input
          className={classes.formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your session username"
        />

        {/* Button to join session */}
        <button className={classes.formButton} onClick={joinSessionCode}>
          Continue
        </button>

        {/* Error message display */}
        {errorMessage && <p className={classes.formErrorMessage}>{errorMessage}</p>}

        {/* Divider */}
        <hr className={classes.formDivider} />

        {/* Link to login page */}
        <Link to="/login" onClick={SignIn}>
          Login to create session!
        </Link>
      </div>
    </div>
  );
};

export default Join;
