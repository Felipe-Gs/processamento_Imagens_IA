import axios from "axios";

export const api = axios.create({
   baseURL: "https://api.clarifai.com",
   headers: {
      Authorization: "Key f628ea290eb14b7b8a04b1d4a271b7f7",
   },
});
