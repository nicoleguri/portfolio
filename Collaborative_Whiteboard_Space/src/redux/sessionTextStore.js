import { createSlice } from "@reduxjs/toolkit"; // Import createSlice function from Redux Toolkit

const initialState = { // Define initial state for the sessionText slice
  sessionText: localStorage.getItem("SessionText") // Retrieve sessionText from localStorage or set to an empty array if not found
    ? JSON.parse(localStorage.getItem("SessionText"))
    : [],
};

export const sessionTextSlice = createSlice({ // Define a slice for managing sessionText state
  name: "sessionText", // Specify the slice name
  initialState, // Set initial state
  reducers: { // Define reducer functions
    storeSessionText: (state, action) => { // Reducer to store session text
      state.sessionText = [...state.sessionText, action.payload]; // Add new session text to sessionText array in state
      localStorage.setItem("SessionText", JSON.stringify(state.sessionText)); // Store sessionText in localStorage
    },
    clearSessionText: (state) => { // Reducer to clear session text
      state.sessionText = []; // Clear sessionText array in state
      localStorage.removeItem("SessionText"); // Remove sessionText from localStorage
    },
  },
});

export const { storeSessionText, clearSessionText } = sessionTextSlice.actions; // Export action creators
export default sessionTextSlice.reducer; // Export reducer