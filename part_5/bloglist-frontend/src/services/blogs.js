import axios from "axios";
const baseUrl = "/api/blogs";

let token;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = (newBlog) => {
  const config = {
    headers: {
      Authorization: token,
    },
  };
  const request = axios.post(baseUrl, newBlog, config);
  return request.then((response) => response.data);
};

const update = (blogToUpdate) => {
  const request = axios.put(`${baseUrl}/${blogToUpdate.id}`, {
    likes: blogToUpdate.likes + 1,
  });
  return request.then((response) => response.data);
};

const remove = (id) => {
  const config = {
    headers: {
      Authorization: token,
    },
  };
  const request = axios.delete(`${baseUrl}/${id}`, config);
  return request.then((response) => response);
};

export default { getAll, create, update, remove, setToken };
