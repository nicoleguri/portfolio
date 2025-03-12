import React, { useEffect, useRef, useState } from "react";
import classes from "./dashboard.module.css";

import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/userStore";
import { clearSessionCode } from "../../redux/sessionCodeStore";
import { storeSessionCode } from "../../redux/sessionCodeStore";
import generateSessionCode from "./generateSessionCode";

import { AiOutlineDelete } from "react-icons/ai";
import { supabase } from "../../backend/createClient";

/**
 * Component for the user dashboard, displaying saved sessions and providing actions like session creation, renaming, deletion, and joining.
 * 
 * @returns {JSX.Element} The JSX code for the Dashboard component.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // State for storing sessions data
  const [sessions, setSessions] = useState(null);
  const [sessionName, setSessionName] = useState("");

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! initial retrieval of sessions data
  useEffect(() => {
    const sessionsRetrieval = async () => {
      const { data, error } = await supabase
        .from("Sessions")
        .select()
        .eq("sessionOwner", user.user);

      setSessions(data);
      console.log("sessions retrieved");
    };

    sessionsRetrieval();
  }, []);

  // Logout function
  const logout = () => {
    dispatch(clearSessionCode());
    dispatch(logoutUser());
    navigate("/");
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! sessions create, change name, delete, join backend

  const retrieveSessionsData = async () => {
    const { data, error } = await supabase
      .from("Sessions")
      .select()
      .eq("sessionOwner", user.user);

    setSessions(data);
  };

  const createSession = async () => {
    const sessionCode = generateSessionCode();
    dispatch(storeSessionCode(sessionCode));

    const { data, error } = await supabase.from("Sessions").insert({
      sessionCode: sessionCode,
      sessionName: "Session-" + sessionCode,
      sessionOwner: user.user,
    });

    retrieveSessionsData();
  };

  const sessionNameChange = async (sessionCode) => {
    const { data, error } = await supabase
      .from("Sessions")
      .update({
        sessionName: sessionName,
      })
      .eq("sessionCode", sessionCode);

    setSessionName("");
    window.location.reload();
    retrieveSessionsData();
  };

  const deleteRoom = async (sessionCode) => {
    const { data, error } = await supabase
      .from("Sessions")
      .delete()
      .eq("sessionCode", sessionCode);

    retrieveSessionsData();
  };

  const copyAndJoinSessionCode = (sessionCode) => {
    navigator.clipboard.writeText(sessionCode);
    dispatch(storeSessionCode(sessionCode));
    navigate("/session");
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! render

  return (
    <div className={classes.dashboardPage}>
      <div className={classes.dashboardNavbar}>
        <div className={classes.controls}>
          <button className={classes.navButton1} onClick={createSession}>
            Create Session
          </button>
        </div>
        <div className={classes.controls}>
          <button className={classes.navButton2}>{user.user}</button>
          <button className={classes.navButton1} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className={classes.sessions}>
        {sessions &&
          sessions.length != 0 &&
          sessions.map((session) => (
            <div key={session.id} className={classes.session}>
              <input
                className={classes.nameInput}
                placeholder={session.sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                }}
              />
              <button
                className={classes.button}
                onClick={(e) => {
                  sessionNameChange(session.sessionCode);
                }}
              >
                Change Name
              </button>
              <button
                className={classes.button}
                onClick={(e) => copyAndJoinSessionCode(session.sessionCode)}
              >
                Join {session.sessionCode}
              </button>
              <button
                className={classes.button}
                onClick={(e) => deleteRoom(session.sessionCode)}
              >
                <AiOutlineDelete />
              </button>
            </div>
          ))}

        {sessions && sessions.length == 0 && (
          <p>
            You have no saved sessions{" "}
            <button onClick={createSession}>
              Create your first session today
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
