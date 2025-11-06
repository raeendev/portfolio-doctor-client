"use client";
import React from "react";

type DevBannerProps = {
  email: string;
  username: string;
  password: string;
};

export const DevBanner: React.FC<DevBannerProps> = ({ email, username, password }) => {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        background: "#111827",
        color: "#F9FAFB",
        border: "1px solid #374151",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        fontSize: 13,
        lineHeight: 1.4,
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Developer Mode</div>
      <div>Default admin credentials:</div>
      <div style={{ marginTop: 6 }}>
        <div><span style={{ opacity: 0.8 }}>Email:</span> {email}</div>
        <div><span style={{ opacity: 0.8 }}>Username:</span> {username}</div>
        <div><span style={{ opacity: 0.8 }}>Password:</span> {password}</div>
      </div>
    </div>
  );
};

export default DevBanner;


