import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`, // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);
export const logout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

//user api calls
export const users=(search)=>API.get(`/user?search=${search}`);

//chat api calls
export const chats=(id)=>API.get(`/chat/${id}`);
export const getAllChats=()=>API.get(`/chat`);
export const notifyUser=(chatId)=>API.post('/chat/push-notification',{chatId});

//message api calls
export const doMessage=(chatId,content)=>API.post(`/message`,{chatId,content});

export default API;
