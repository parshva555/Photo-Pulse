import { createSlice } from "@reduxjs/toolkit";
// Here, you define an initial state object.
// It contains a theme property, which is initialized by attempting 
// to retrieve a value from the browser's 
// local storage using localStorage.getItem("theme"). 
// If there's a value in local storage, it's parsed as JSON (assuming it's stored as a JSON string).
// If the value is not found or cannot be parsed, the default value is set to "light".
const initialState = {
  theme: JSON.parse(window?.localStorage.getItem("theme")) ?? "light",
};
// This code creates a Redux slice using the createSlice function.
// The name property is set to "theme", 
// and the initialState defined earlier is used as the initial state for this slice.
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", JSON.stringify(action.payload));
    },
  },
});

// exports the function
export default themeSlice.reducer;

//  it returns a function that dispatches the setTheme action with the provided value.
// This allows you to dispatch the setTheme action to update the theme in the Redux store
export function SetTheme(value) {
  return (dispatch) => {
    dispatch(themeSlice.actions.setTheme(value));
  };
}
