// src/pages/PageLock.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

export default function PageLock({ title = "Access Restricted", message }) {
  return (
    <Box
      sx={{
        height: "100%",
        py: 10,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <LockIcon sx={{ fontSize: 60, color: "gray" }} />
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      <Typography color="text.secondary">
        {message ||
          "Please verify your account in the Profile Information to access this page."}
      </Typography>
    </Box>
  );
}
