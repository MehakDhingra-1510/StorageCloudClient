import { axiosWithCreds } from "./axiosInstances";

export const getDirectoryItems = async (dirId = "") => {
  const { data } = await axiosWithCreds.get(`/directory/${dirId}`);
  return data;
};

export const createDirectory = async (dirId = "", newDirname) => {
  const { data } = await axiosWithCreds.post(
    `/directory/${dirId}`,
    {},
    { headers: { dirname: newDirname } }
  );
  return data;
};

export const deleteDirectory = async (id) => {
  const { data } = await axiosWithCreds.delete(`/directory/${id}`);
  return data;
};

export const renameDirectory = async (id, newDirName) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}`, {
    newDirName,
  });
  return data;
};
export const searchDirectory = async (query) => {
  const { data } = await axiosWithCreds.get(
    `/directory/search/items?q=${encodeURIComponent(query)}`
  );

  return data;
};

export const getTrashItems = async () => {
  const { data } = await axiosWithCreds.get(`/directory/trash/items`);
  return data;
};

export const restoreDirectory = async (id) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}/restore`);
  return data;
};

export const permanentlyDeleteDirectory = async (id) => {
  const { data } = await axiosWithCreds.delete(`/directory/${id}/permanent`);
  return data;
};

export const moveDirectory = async (id, newParentDirId) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}/move`, {
    newParentDirId,
  });
  return data;
};