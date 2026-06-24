import { createSlice } from "@reduxjs/toolkit";

const loadWishlist = () => {
  try {
    const serializedWishlist = localStorage.getItem("wishlistItems");
    if (serializedWishlist === null) return [];
    return JSON.parse(serializedWishlist);
  } catch (err) {
    return [];
  }
};

const saveWishlist = (items) => {
  try {
    localStorage.setItem("wishlistItems", JSON.stringify(items));
  } catch (err) {
    // ignore
  }
};

const initialState = {
  items: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((item) => item._id === product._id);
      if (!exists) {
        state.items.push(product);
        saveWishlist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      saveWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlist([]);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
