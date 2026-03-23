import React, { useState, useRef } from "react";
import T from "../theme";
import Icon from "../components/Icon";

export default function PhotoLogPage({ setTab, photos, photoActions }) {
  const [subTab, setSubTab] = useState("Meals");
  const [viewPhoto, setViewPhoto] = useState(null);
  const fileRef = useRef(null);

  const filtered = photos.filter((p) =>
    subTab === "Meals" ? p.photo_type === "meal" : p.photo_type === "progress"
  );

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await photoActions.uploadPhoto(
      file,
      subTab === "Meals" ? "meal" : "progress"
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 20px 10px",
          gap: 12,
        }}
      >
        <span
          onClick={() => setTab("more")}
          style={{ cursor: "pointer", fontSize: 22 }}
        >
          <Icon name="arrow-left" size={22} color={T.text} />
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Photos</h1>
      </div>

      {/* Sub-tab toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "8px 20px 12px",
        }}
      >
        {["Meals", "Progress"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 20,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: subTab === tab ? T.accent : T.card,
              color: subTab === tab ? "#fff" : T.textDim,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Upload button */}
      <div style={{ padding: "0 20px 12px" }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileRef}
          onChange={handleUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 12,
            border: `2px dashed ${T.accent}`,
            background: "transparent",
            color: T.accent,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add Photo
        </button>
      </div>

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: T.textDim,
            fontSize: 15,
          }}
        >
          {subTab === "Meals"
            ? "No meal photos yet"
            : "No progress photos yet"}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            padding: "0 20px",
          }}
        >
          {filtered.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setViewPhoto(photo)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={photo.photo_url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>
                {photo.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full view overlay */}
      {viewPhoto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <img
            src={viewPhoto.photo_url}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: 10,
              objectFit: "contain",
            }}
          />
          <div
            style={{
              color: "#fff",
              textAlign: "center",
              marginTop: 14,
              fontSize: 13,
            }}
          >
            <div>{viewPhoto.date}</div>
            <div style={{ color: T.textDim, fontSize: 12 }}>
              {viewPhoto.photo_type}
            </div>
            {viewPhoto.note && (
              <div style={{ marginTop: 6, fontStyle: "italic" }}>
                {viewPhoto.note}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 18,
            }}
          >
            <button
              onClick={async () => {
                await photoActions.deletePhoto(viewPhoto);
                setViewPhoto(null);
              }}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background: "#e53935",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setViewPhoto(null)}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background: T.card,
                color: T.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
