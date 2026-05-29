import API from "./axios";

export const dashboardAPI = {
  summary: () => API.get("/dashboard/summary"),

  weeklyTrends: () =>
    API.get("/dashboard/weekly-trend"),

  monthlyTrends: () =>
    API.get("/dashboard/monthly-trend"),

  alerts: () => API.get("/dashboard/alerts"),
};