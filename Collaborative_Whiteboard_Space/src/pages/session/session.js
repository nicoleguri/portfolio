import React from "react";
import classes from "./session.module.css";

import WhiteboardNavbar from "../../components/whiteboardNavbar/whiteboardNavbar"; // Importing WhiteboardNavbar component
import Whiteboard from "../../components/whiteboard/whiteboard"; // Importing Whiteboard component
import WhiteboardChat from "../../components/whiteboardChat/whiteboardChat"; // Importing WhiteboardChat component

const session = () => {
  return (
    <div className={classes.whiteboardPage}>
      <WhiteboardNavbar />
      <div className={classes.whiteboardSection}>
        <Whiteboard />
        <WhiteboardChat />
      </div>
    </div>
  );
};

export default session;
