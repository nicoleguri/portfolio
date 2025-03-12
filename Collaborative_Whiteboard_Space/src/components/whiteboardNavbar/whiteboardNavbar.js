import React, { useState } from "react";
import classes from "./whiteboardNavbar.module.css";

import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/userStore";
import { logoutUser } from "../../redux/userStore";
import { clearSessionText } from "../../redux/sessionTextStore";
import { clearSessionCode } from "../../redux/sessionCodeStore";
import { useNavigate } from "react-router";

/**
 * Component for displaying the navigation bar in the whiteboard application.
 * 
 * @returns {JSX.Element} The JSX code for the WhiteboardNavbar component.
 */
const WhiteboardNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state selectors
  const { sessionCode } = useSelector((state) => state.sessionCode);
  const { user } = useSelector((state) => state.user);

  // Function to copy the session code to clipboard
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
  };

  // Function to navigate to the dashboard page
  const dashboard = () => {
    dispatch(clearSessionText());
    dispatch(clearSessionCode());
    navigate("/dashboard");
  };

  // Function to logout authenticated user
  const authLogout = () => {
    dispatch(clearSessionText());
    dispatch(clearSessionCode());
    dispatch(logoutUser());
    navigate("/");
  };

  // Function to logout guest user
  const guestLogout = () => {
    dispatch(clearSessionText());
    dispatch(clearSessionCode());
    dispatch(logoutUser());
    navigate("/");
  };

  // Variable to hold the JSX for the navbar based on user type
  let navbar = "";

  if (user.type == "auth") {
    // Navbar for authenticated user
    navbar = (
      <div className={classes.whiteboardNavbar}>
        <div className={classes.controls}>
          <button className={classes.button} onClick={dashboard}>
            Dashboard
          </button>
          <button
            className={classes.sessionCodeButton}
            onClick={copySessionCode}
          >
            {sessionCode}
          </button>
        </div>

        <div className={classes.controls}>
          <button className={classes.sessionOwnerButton}>{user.user}</button>
          <button className={classes.button} onClick={authLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (user.type == "guest") {
    // Navbar for guest user
    navbar = (
      <div className={classes.whiteboardNavbar}>
        <div className={classes.controls}>
          <button className={classes.button} onClick={guestLogout}>
            Exit Room
          </button>

          <button
            className={classes.sessionCodeButton}
            onClick={copySessionCode}
          >
            {sessionCode}
          </button>
        </div>

        <div className={classes.controls}>
          <input
            className={classes.sessionGuestButton}
            value={user.user}
            onChange={(e) => {
              if (user.type == "guest" && e.target.value.length > 0) {
                dispatch(loginUser({ user: e.target.value, type: "guest" }));
              }
            }}
          />
          <button className={classes.sessionGuestTag}>Guest Account</button>
        </div>
      </div>
    );
  }

  return <div>{navbar}</div>;
};

export default WhiteboardNavbar;
