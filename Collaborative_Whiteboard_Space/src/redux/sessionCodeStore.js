import { createSlice } from "@reduxjs/toolkit"; // Import createSlice function from Redux Toolkit

const initialState = { // Define initial state for the sessionCode slice
  sessionCode: localStorage.getItem("SessionCode") // Retrieve sessionCode from localStorage or set to null if not found
    ? JSON.parse(localStorage.getItem("SessionCode"))
    : null,
};

export const sessionCodeSlice = createSlice({ // Define a slice for managing sessionCode state
  name: "sessionCode", // Specify the slice name
  initialState, // Set initial state
  reducers: { // Define reducer functions
    storeSessionCode: (state, action) => { // Reducer to store session code
      state.sessionCode = action.payload; // Update sessionCode in state
      localStorage.setItem("SessionCode", JSON.stringify(action.payload)); // Store sessionCode in localStorage
    },
    clearSessionCode: (state) => { // Reducer to clear session code
      state.sessionCode = null; // Clear sessionCode in state
      localStorage.removeItem("SessionCode"); // Remove sessionCode from localStorage
    },
  },
});

export const { storeSessionCode, clearSessionCode } = sessionCodeSlice.actions; // Export action creators
export default sessionCodeSlice.reducer; // Export reducer