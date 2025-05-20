// src/pages/ReportsTable.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function ReportsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);

  // Report-detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Image-zoom dialog
  const [imgOpen, setImgOpen] = useState(false);

  // Task-overview dialog
  const [taskOpen, setTaskOpen] = useState(false);

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports/list-all`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setRows(
          data.reports.map((r, i) => ({
            id: r.id || i,
            image: r.image,
            classification: r.classification,
            measurement: r.measurement,
            location: r.location,
            status: r.status,
            description: r.description,
            timestamp: r.timestamp,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchReports();
    })();
  }, []);

  const statusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
      case "completed":
        return "success";
      case "submitted":
        return "warning";
      case "in-progress":
      case "in progress":
        return "info";
      case "rejected":
        return "error";
      case "accepted":
        return "primary";
      default:
        return "default";
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "image",
      headerName: "Img",
      width: 80,
      renderCell: ({ value }) => (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/api/reports/image/${value}`}
          alt=""
          style={{
            width: 40,
            height: 40,
            objectFit: "cover",
            borderRadius: 4,
            cursor: "pointer",
          }}
        />
      ),
    },
    { field: "classification", headerName: "Class.", flex: 1 },
    { field: "measurement", headerName: "Measure", flex: 1 },
    { field: "location", headerName: "Location", flex: 2 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          label={row.status}
          size="small"
          color={statusColor(row.status)}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    { field: "description", headerName: "Desc.", flex: 2 },
    {
      field: "timestamp",
      headerName: "Date/Time",
      flex: 1,
      renderCell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      field: "taskOverview",
      headerName: "Task Overview",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setCurrent(params.row);
            setTaskOpen(true);
          }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const filtered = rows.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleRowClick = ({ row }) => {
    setCurrent(row);
    setDetailOpen(true);
  };

  const exportCSV = () => {
    const csv = [
      [
        "ID",
        "Classification",
        "Measurement",
        "Location",
        "Status",
        "Description",
        "Timestamp",
      ],
      ...rows.map((r) => [
        r.id,
        r.classification,
        r.measurement,
        r.location,
        r.status,
        r.description,
        new Date(r.timestamp).toLocaleString(),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Reports
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchReports} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Button variant="contained" onClick={exportCSV}>
          Export CSV
        </Button>
      </Stack>

      <Paper>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[10, 20, 50]}
            pagination
            autoHeight
            onRowClick={handleRowClick}
          />
        )}
      </Paper>

      {/* Task Overview Dialog */}
      <Dialog
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Task Overview — Report ID: {current?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1, pb: 2 }}>
          <Typography variant="body1" paragraph>
            Here is the detailed unit‐price analysis based on DUPA (Detailed
            Unit Price Analysis):
          </Typography>
          {/* Replace below with your actual analysis */}
          <Typography variant="body2" component="div">
            • Item A: ₱100 × 10 units = ₱1,000
            <br />
            • Item B: ₱200 × 5 units = ₱1,000
            <br />
            • Item C: ₱150 × 8 units = ₱1,200
            <br />
            <strong>Total Estimated Cost: ₱3,200</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setTaskOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Report Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Report Details — ID: {current?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1, pb: 2 }}>
          {current && (
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={4}
            >
              <Box flex="1" textAlign="center">
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_BACKEND_URL}/api/reports/image/${current.image}`}
                  alt=""
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                    borderRadius: 2,
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  onClick={() => setImgOpen(true)}
                />
              </Box>
              <Box flex="2" display="flex" flexDirection="column" gap={2}>
                {[
                  ["Classification", current.classification],
                  ["Measurement", current.measurement],
                  ["Location", current.location],
                  ["Status", current.status],
                  ["Description", current.description],
                  ["Date & Time", new Date(current.timestamp).toLocaleString()],
                ].map(([label, val]) => (
                  <Box key={label}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {label}
                    </Typography>
                    {label === "Status" ? (
                      <Chip
                        label={val}
                        size="small"
                        color={statusColor(val)}
                        sx={{ textTransform: "capitalize", mt: 0.5 }}
                      />
                    ) : (
                      <Typography variant="body1" component="div">
                        {val}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 2, p: 0 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            component="img"
            src={`${import.meta.env.VITE_BACKEND_URL}/api/reports/image/${current?.image}`}
            alt="Zoomed report"
            sx={{ width: "100%", height: "auto", display: "block" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
