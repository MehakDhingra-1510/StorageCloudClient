import { axiosWithCreds } from "./axiosInstances";

export const deleteFile = async (id) => {
  const { data } = await axiosWithCreds.delete(`/file/${id}`);
  return data;
};

export const renameFile = async (id, newFilename) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}`, {
    newFilename,
  });
  return data;
};

export const uploadInitiate = async (fileData) => {
  const { data } = await axiosWithCreds.post("/file/upload/initiate", fileData);
  return data;
};

export const uploadComplete = async (fileId) => {
  const { data } = await axiosWithCreds.post("/file/upload/complete", {
    fileId,
  });

  return data;
};
export const restoreFile = async (id) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}/restore`);
  return data;
};

export const permanentlyDeleteFile = async (id) => {
  const { data } = await axiosWithCreds.delete(`/file/${id}/permanent`);
  return data;
};

export const moveFile = async (id, newParentDirId) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}/move`, {
    newParentDirId,
  });
  return data;
};