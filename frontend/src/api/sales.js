import axiosInstance from "./axios";

export const createSale = (data) =>
  axiosInstance.post("/sales", data);

export const getSales = () =>
  axiosInstance.get("/sales");