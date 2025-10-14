
export const cloudinaryConfig = {
  cloudName: "dfiucy0af",
  uploadPreset: "booking_unsigned",
  endpoint: "https://api.cloudinary.com/v1_1/dfiucy0af/image/upload",
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  try {
    const response = await fetch(cloudinaryConfig.endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
