import axios from "axios";
import { API_URL } from "../utils/constants";

const API = axios.create({
    baseURL: API_URL,
});

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete API.defaults.headers.common["Authorization"];
    }
};

export const getProducts = (search = "") => API.get(`/products?search=${search}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export default API;