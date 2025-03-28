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

//  check user is authorized or not
API.interceptors.response.use(
  (response) => response, // If response is OK, return it
  (error) => {
    if (error.response) {
      // Check if the token has expired
      console.log(error);
      if (error.response.status === 401) {
        console.log("Token expired. Logging out...");

        // Perform any task (e.g., logout user, redirect, clear storage)
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/auth/login"; // Redirect to login page
      }
    }
    return Promise.reject(error); // Reject the error for further handling
  }
);


// Auth API calls
export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);

//user api calls
export const users = (search, onlyUser, group) =>
  API.get(`/user?search=${search}&onlyUser=${onlyUser}&group=${group?._id}`);
export const getUser = (userId) => API.get(`/user/${userId}`);
export const changePrivacy = (lastSeen, image, about) =>
  API.patch(`/user/change-privacy`, { lastSeen, image, about });

export const updateUser = (formData) =>
  API.patch(`/user/update-profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Ensure correct content type for file upload
    },
  });

//chat api calls
export const chats = (id) => API.get(`/chat/${id}`);
export const getAllChats = () => API.get(`/chat`);
export const getAllUnreadChats = () => API.get(`/chat?unread=${true}`);
export const getAllGroupChats = () => API.get(`/chat?group=${true}`);

export const notifyUser = (chatId) =>
  API.post("/chat/push-notification", { chatId });
export const deleteChat = (chatId) => API.post("/chat/delete-chat", { chatId });
export const pinTheChat = (chatId) => API.post(`/chat/pin-chat`, { chatId });
export const unpinTheChat = (chatId) =>
  API.post(`/chat/unpin-chat`, { chatId });
/* GROUP APIS  */
export const createGroup = (form) =>
  API.post("/chat/create-group", form, {
    headers: {
      "Content-Type": "multipart/form-data", // Ensure correct content type for file upload
    },
  });
export const updateGroup = (form) =>
  API.patch("/chat/group/updateGroup", form, {
    headers: {
      "Content-Type": "multipart/form-data", // Ensure correct content type for file upload
    },
  });
export const getGroupMembers = (groupId) => API.post(`/chat/group/${groupId}`);
export const leaveGroup = (chatId) =>
  API.post(`/chat/group/leave-group`, { chatId });
export const removeMemberAPI = (group, selectedUser) =>
  API.post(`/chat/group/remove-member`, { group, selectedUser });
export const addMembers = (group, selectedUsers) =>
  API.post(`/chat/group/addMembers`, { group, selectedUsers });

//message api calls
export const doMessage = (chatId, content) =>
  API.post(`/message`, { chatId, content });
export const deleteForMe = (messageId) =>
  API.post(`/message/delete-for-me`, { messageId });
export const deleteForEveryone = (messageId) =>
  API.post(`/message/delete-for-everyone`, { messageId });

export default API;
