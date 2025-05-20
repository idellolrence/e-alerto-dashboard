import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
  Divider,
  Grid,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function AccountInfo() {
  const { userData, isLoading } = useContext(AppContent);
  const navigate = useNavigate();

  const avatarInitial = userData?.name?.[0]?.toUpperCase() || "U";

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        position: userData.position || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  const handleVerifyProfile = () => {
    navigate("/email-verify");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Account Information
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : userData ? (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems="center"
            mb={4}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#263092",
                color: "white",
                fontSize: 40,
              }}
            >
              {avatarInitial}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                display="flex"
                alignItems="center"
                gap={1}
              >
                {formData.name}
                {userData.isAccountVerified ? (
                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
                    icon={<VerifiedUserIcon />}
                  />
                ) : null}
              </Typography>
              <Typography variant="body2" color="text.secondary">
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                fullWidth
                value={userData._id}
                InputProps={{ readOnly: true }}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={formData.name}
                InputProps={{ readOnly: true }}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Position"
                fullWidth
                value={formData.position}
                InputProps={{ readOnly: true }}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                fullWidth
                value={formData.email}
                InputProps={{ readOnly: true }}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={formData.phone}
                InputProps={{ readOnly: true }}
                variant="standard"
              />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
            {!userData.isAccountVerified && (
              <Button variant="outlined" onClick={handleVerifyProfile}>
                Verify Profile
              </Button>
            )}
            <Button variant="contained" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </Stack>
        </Box>
      ) : (
        <Typography color="error">
          Unable to load account information.
        </Typography>
      )}
    </Box>
  );
}
