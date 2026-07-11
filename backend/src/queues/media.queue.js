export const addMediaJob = async (data) => {
  console.debug("Media uploaded:", {
    type: data?.type,
    publicId: data?.publicId,
  });

  return true;
};
