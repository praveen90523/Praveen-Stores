import axios from "axios";
import { API_URL } from "../utils/constants";

const AUTH_API_URL = `${API_URL}/auth`;

export const loginUser = (userData) => {
  return axios.post(`${AUTH_API_URL}/login`, userData);
};

export const signupUser = (userData) => {
  return axios.post(`${AUTH_API_URL}/signup`, userData);
};