import axiosInstance from "./axios";

export const productAPI = {
  getProducts: async () => {
    return await axiosInstance.get("/products");
  },

  createProduct: async (data) => {
    return await axiosInstance.post("/products", data);
  },

  updateProduct: async (id, data) => {
    return await axiosInstance.put(`/products/${id}`, data);
  },

  deleteProduct: async (id) => {
    return await axiosInstance.delete(`/products/${id}`);
  },
};