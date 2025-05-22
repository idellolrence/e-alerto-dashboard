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
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

export default function ActivityLogsTable() {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // CSV export
  const exportCSV = () => {
    const header = [
      "Log ID",
      "Timestamp",
      "Employee ID",
      "Employee Name",
      "Resource Type",
      "Resource ID",
      "Action",
      "Old Value",
      "New Value",
      "IP Address",
    ];
    const csvRows = rows.map((r) => [
      r.id,
      new Date(r.timestamp).toLocaleString(),
      r.employeeId,
      r.employeeName,
      r.entityType,
      r.entityId,
      r.action,
      String(r.oldValue ?? ""),
      String(r.newValue ?? ""),
      r.ipAddress,
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
    a.download = "activity_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Purge dialog state
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [purgeDate, setPurgeDate] = useState("");

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/activitylogs/list-all`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) setRows(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openPurgeDialog = () => {
    setPurgeDate("");
    setPurgeDialogOpen(true);
  };
  const confirmPurge = async () => {
    if (!purgeDate) return;
    const cutoff = new Date(purgeDate);
    if (isNaN(cutoff)) return alert("Invalid date");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/activitylogs/purge`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beforeDate: cutoff }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      alert(`Purged ${data.deletedCount} logs`);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Purge failed: " + err.message);
    } finally {
      setLoading(false);
      setPurgeDialogOpen(false);
    }
  };

  const handleRowClick = ({ row }) => {
    setCurrentLog(row);
    setDetailDialogOpen(true);
  };

  const columns = [
    { field: "id", headerName: "Log ID", flex: 1 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      renderCell: ({ value }) =>
        value ? new Date(value).toLocaleString() : "-",
    },
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "employeeName", headerName: "Employee Name", flex: 1 },
    { field: "entityType", headerName: "Resource Type", flex: 1 },
    { field: "entityId", headerName: "Resource ID", flex: 1 },
    { field: "action", headerName: "Action", flex: 1 },
    { field: "oldValue", headerName: "Old Value", flex: 1 },
    { field: "newValue", headerName: "New Value", flex: 1 },
    { field: "ipAddress", headerName: "IP Address", flex: 1 },
  ];

  const filtered = rows.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Activity Logs
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={1}
        flexWrap="wrap"
      >
        {/* left: search + reload */}
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
          <IconButton onClick={fetchLogs} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* right: purge + export */}
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={openPurgeDialog}
            disabled={loading}
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
            }}
          >
            Purge Logs
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportCSV} disabled={loading}>
            Export CSV
          </Button>
        </Box>
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
            pageSizeOptions={[5, 10, 20]}
            pagination
            onRowClick={handleRowClick}
          />
        )}
      </Paper>

      {/* Purge Dialog */}
      <Dialog
        open={purgeDialogOpen}
        onClose={() => setPurgeDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Purge Logs</DialogTitle>
        <DialogContent sx={{ pt: 2, px: 2, pb: 2 }}>
          <Typography variant="body2" mb={1}>
            Remove logs before:
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={purgeDate}
            onChange={(e) => setPurgeDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setPurgeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmPurge}>
            Confirm Purge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Log Details</DialogTitle>
        <DialogContent dividers sx={{ pt: 2, px: 2, pb: 2 }}>
          <Stack spacing={2}>
            {currentLog &&
              [
                ["Log ID", currentLog.id],
                ["Timestamp", new Date(currentLog.timestamp).toLocaleString()],
                ["Employee ID", currentLog.employeeId],
                ["Employee Name", currentLog.employeeName],
                ["Resource Type", currentLog.entityType],
                ["Resource ID", currentLog.entityId],
                ["Action", currentLog.action],
                ["Old Value", String(currentLog.oldValue ?? "")],
                ["New Value", String(currentLog.newValue ?? "")],
                ["IP Address", currentLog.ipAddress],
              ].map(([label, value]) => (
                <Paper key={label} elevation={1} sx={{ p: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {label}
                  </Typography>
                  <Typography variant="body1">{value}</Typography>
                </Paper>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
