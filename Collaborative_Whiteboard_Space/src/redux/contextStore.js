import { configureStore } from "@reduxjs/toolkit"; // Import the configureStore function from Redux Toolkit
import userReducer from "./userStore"; // Import the userReducer from userStore
import sessionCodeReducer from "./sessionCodeStore"; // Import the sessionCodeReducer from sessionCodeStore
import sessionTextReducer from "./sessionTextStore"; // Import the sessionTextReducer from sessionTextStore

export default configureStore({ // Export a Redux store instance configured with reducers
  reducer: { // Combine reducers into a single object
    user: userReducer, // Assign userReducer to the 'user' slice of the state
    sessionCode: sessionCodeReducer, // Assign sessionCodeReducer to the 'sessionCode' slice of the state
    sessionText: sessionTextReducer, // Assign sessionTextReducer to the 'sessionText' slice of the state
  }
});