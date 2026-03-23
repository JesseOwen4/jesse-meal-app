import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function usePhotoLog() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("meal_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPhotos(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const uploadPhoto = async (file, photoType, mealId, day, note) => {
    // Compress image
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${file.name}`;
    const path = photoType === "meal" ? `meals/${fileName}` : `progress/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(path, compressed, { contentType: "image/jpeg" });

    if (uploadError) return null;

    const { data: { publicUrl } } = supabase.storage
      .from("meal-photos")
      .getPublicUrl(path);

    const { error } = await supabase.from("meal_photos").insert({
      photo_url: publicUrl,
      photo_type: photoType,
      meal_id: mealId || null,
      day: day || null,
      date: new Date().toISOString().split("T")[0],
      note: note || null,
    });

    if (!error) fetchPhotos();
    return !error;
  };

  const deletePhoto = async (photo) => {
    // Extract path from URL
    const urlParts = photo.photo_url.split("/meal-photos/");
    if (urlParts[1]) {
      await supabase.storage.from("meal-photos").remove([urlParts[1]]);
    }
    await supabase.from("meal_photos").delete().eq("id", photo.id);
    fetchPhotos();
  };

  return { photos, loading, uploadPhoto, deletePhoto, refetch: fetchPhotos };
}

async function compressImage(file, maxWidth = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
