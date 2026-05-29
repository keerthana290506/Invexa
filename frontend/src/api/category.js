import axiosInstance from "./axios";

// GET categories
export const getCategories = () => {
  return axiosInstance.get("/categories");
};

// CREATE category
export const createCategory = (data) => {
  return axiosInstance.post("/categories", data);
};