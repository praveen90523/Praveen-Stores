import axios from "axios";
import { API_URL } from "../utils/constants";

const API = `${API_URL}/products`;

export const getProducts = () =>
  axios.get(API);

export const getProductById = (id) =>
  axios.get(`${API}/${id}`);

export const createProduct = (
  data,
  token
) =>
  axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateProduct = (
  id,
  data,
  token
) =>
  axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteProduct = (
  id,
  token
) =>
  axios.delete(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });