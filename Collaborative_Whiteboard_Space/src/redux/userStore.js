import { createSlice } from "@reduxjs/toolkit"; // Import createSlice function from Redux Toolkit

const initialState = { // Define initial state for the user slice
  user: localStorage.getItem("User") // Retrieve user from localStorage or set to null if not found
    ? JSON.parse(localStorage.getItem("User"))
    : null,
};

export const userSlice = createSlice({ // Define a slice for managing user state
  name: "user", // Specify the slice name
  initialState, // Set initial state
  reducers: { // Define reducer functions
    loginUser: (state, action) => { // Reducer to log in user
      state.user = action.payload; // Update user in state with the payload
      localStorage.setItem("User", JSON.stringify(action.payload)); // Store user in localStorage
    },
    logoutUser: (state) => { // Reducer to log out user
      state.user = null; // Set user to null in state
      localStorage.removeItem("User"); // Remove user from localStorage
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions; // Export action creators
export default userSlice.reducer; // Export reducer