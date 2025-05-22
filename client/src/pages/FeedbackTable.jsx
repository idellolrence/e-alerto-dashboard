// src/pages/FeedbackTable.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  useTheme,
  Rating,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

export default function FeedbackTable() {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // fetch all feedback
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback/list-all`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setRows(
          data.feedbacks.map((f) => ({
            id: f._id,
            reportId: f.report_ID,
            overall: f.overall,
            service: f.service,
            speed: f.speed,
            feedback:
              f.feedback.length > 60
                ? f.feedback.slice(0, 60) + "…"
                : f.feedback,
            fullFeedback: f.feedback,
            timestamp: new Date(f.timestamp).toLocaleString(),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // CSV export
  const exportCSV = () => {
    const header = [
      "Feedback ID",
      "Report ID",
      "Overall",
      "Service",
      "Speed",
      "Feedback",
      "Timestamp",
    ];
    const csvRows = rows.map((r) => [
      r.id,
      r.reportId,
      r.overall,
      r.service,
      r.speed,
      r.fullFeedback,
      r.timestamp,
    ]);
    const csvContent = [header, ...csvRows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // row click → detail dialog
  const handleRowClick = ({ row }) => {
    setCurrent(row);
    setDetailOpen(true);
  };

  const columns = [
    { field: "reportId", headerName: "Report ID", flex: 1 },
    {
      field: "overall",
      headerName: "Overall",
      flex: 0.6,
      renderCell: ({ value }) => <Rating value={value} readOnly size="small" />,
    },
    {
      field: "service",
      headerName: "Service",
      flex: 0.6,
      renderCell: ({ value }) => <Rating value={value} readOnly size="small" />,
    },
    {
      field: "speed",
      headerName: "Speed",
      flex: 0.6,
      renderCell: ({ value }) => <Rating value={value} readOnly size="small" />,
    },
    {
      field: "feedback",
      headerName: "Feedback",
      flex: 2,
      renderCell: ({ row }) => (
        <Tooltip title={row.fullFeedback} arrow>
          <Typography variant="body2" noWrap sx={{ cursor: "pointer" }}>
            {row.feedback}
          </Typography>
        </Tooltip>
      ),
    },
    { field: "timestamp", headerName: "Submitted At", flex: 1.2 },
  ];

  const filtered = rows.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        User Feedback
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={1}
        flexWrap="wrap"
      >
        {/* search + reload */}
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchFeedback} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* export CSV */}
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportCSV}
          disabled={loading}
        >
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
            autoHeight
            rows={filtered}
            columns={columns}
            pagination
            pageSizeOptions={[5, 10, 20, 50]}
            pageSize={pageSize}
            onPageSizeChange={(n) => setPageSize(n)}
            onRowClick={handleRowClick}
            sx={{
              border: 0,
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                bgcolor: theme.palette.action.hover,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: theme.palette.action.selected,
              },
            }}
          />
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Feedback Details</DialogTitle>
        <DialogContent dividers sx={{ pt: 2, px: 2, pb: 2 }}>
          <Stack spacing={2}>
            {current &&
              [
                ["Report ID", current.reportId],
                [
                  "Overall",
                  <Rating key="ov" value={current.overall} readOnly />,
                ],
                [
                  "Service",
                  <Rating key="sv" value={current.service} readOnly />,
                ],
                ["Speed", <Rating key="sp" value={current.speed} readOnly />],
                ["Feedback", current.fullFeedback],
                ["Submitted At", current.timestamp],
              ].map(([label, value]) => (
                <Paper key={label} elevation={1} sx={{ p: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {label}
                  </Typography>
                  <Box mt={0.5}>{value}</Box>
                </Paper>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
