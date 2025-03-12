import React, { useState, useEffect } from "react";
import classes from "./whiteboardChat.module.css";
// Importing Supabase client
import { supabase } from "../../backend/createClient";
// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { storeSessionText } from "../../redux/sessionTextStore";
// UUID generation
import { v4 as uuidv4 } from "uuid";
// Icon for send button
import { AiOutlineSend } from "react-icons/ai";

/**
 * Component for displaying and sending chat messages in a whiteboard session.
 * 
 * @returns {JSX.Element} The JSX code for the WhiteboardChat component.
 */
const WhiteboardChat = () => {
  const dispatch = useDispatch();
  // Redux state selectors
  const { sessionCode } = useSelector((state) => state.sessionCode);
  const { user } = useSelector((state) => state.user);
  const { sessionText } = useSelector((state) => state.sessionText);
  const [sentMsg, setSentMsg] = useState("");
  const [swear, setSwear] = useState([]);

  const channel = supabase.channel(sessionCode);

  useEffect(() => {
    fetch('/data.txt')
      .then((response) => response.text())
      .then((data) => {
        const swearWords = data.split("\n").map((word) => word.trim());
        setSwear(swearWords);
      })
      .catch((error) => {
        console.error("Error fetching swear words:", error);
      });
  }, []);

  const bogusCheck = (text) =>{
    const foundSwears = swear.filter(word => text.toLowerCase() == word);
    if(foundSwears.length){
        console.log('Bad word found');
        alert('Bad word found');
        console.log(text);
    } else {
        console.log('No bad word found');
        handleSentMessage();
    }
}

  channel
    .on("broadcast", { event: "text chat broadcast" }, (payload) =>
      handleListenMsg(payload)
    )
    .subscribe((status) => {
      if (status !== "SUBSCRIBED") {
        return null;
      }
    });

  /**
   * Handles incoming chat messages.
   * 
   * @param {object} payload - The payload containing the message.
   */
  const handleListenMsg = (payload) => {
    if (payload.payload.event != "sent" || !payload.payload.message) {
      return;
    }
    // Dispatching the received message to update Redux state
    dispatch(
      storeSessionText({
        type: "received",
        user: payload.payload.user,
        text: payload.payload.message,
      })
    );
  };

  /**
   * Handles sending a chat message.
   */
  const handleSentMessage = () => {
    if (!sentMsg) {
      return;
    }

    // Sending the message through the channel
    channel.send({
      type: "broadcast",
      event: "text chat broadcast",
      payload: { event: "sent", user: user.user, message: sentMsg },
    });

    // Dispatching the sent message to update Redux state
    dispatch(storeSessionText({ type: "sent", user: user.user, text: sentMsg }));
    setSentMsg("");
  };

  return (
    <div className={classes.whiteboardChat}>
      <div className={classes.textSection}>
        <div classes={classes.textSection}>
          {sessionText &&
            sessionText.map((text) =>
              text.type === "received" ? (
                <div className={classes.receivedText} key={uuidv4()}>
                  <p className={classes.textUser}>{text.user}</p>
                  <p className={classes.textMessage}>
                    {text.text}
                  </p>
                </div>
              ) : (
                <div className={classes.sentText} key={uuidv4()}>
                  <p className={classes.textUser}>{text.user}</p>
                  <p className={classes.textMessage}>
                    {text.text}
                  </p>
                </div>
              )
            )}
        </div>
      </div>

      <div className={classes.sendSection}>
        <input
          className={classes.sendInput}
          value={sentMsg}
          placeholder="Send text"
          onChange={(e) => setSentMsg(e.target.value)}
          onKeyDown={(e) => {if(e.key === "Enter"){bogusCheck(sentMsg)}}}
        />
        <button
          className={classes.sendButton}
          onClick={() => bogusCheck(sentMsg)}
        >
          <AiOutlineSend size={15} />
        </button>
      </div>
    </div>
  );
};

export default WhiteboardChat;
