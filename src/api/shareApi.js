import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

// resourceType: "file" | "directory"
// role: "viewer" | "editor"
// sharedWithEmail: omit/null for a public link share
export const createShare = async ({ resourceType, resourceId, role, sharedWithEmail }) => {
  const { data } = await axiosWithCreds.post("/share", {
    resourceType,
    resourceId,
    role,
    sharedWithEmail: sharedWithEmail || undefined,
  });
  return data;
};

export const listSharedByMe = async () => {
  const { data } = await axiosWithCreds.get("/share/shared-by-me");
  return data;
};

export const listSharedWithMe = async () => {
  const { data } = await axiosWithCreds.get("/share/shared-with-me");
  return data;
};

export const revokeShare = async (id) => {
  const { data } = await axiosWithCreds.delete(`/share/${id}`);
  return data;
};

export const updateShareRole = async (id, role) => {
  const { data } = await axiosWithCreds.patch(`/share/${id}`, { role });
  return data;
};

// Public — no auth required, used by the guest link-landing page.
export const accessSharedLink = async (token, { download = false } = {}) => {
  const { data } = await axiosWithoutCreds.get(
    `/share/link/${token}${download ? "?action=download" : ""}`
  );
  return data;
};
