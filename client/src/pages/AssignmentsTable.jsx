// src/pages/AssignmentsTable.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppContent } from "../context/AppContext";
import DownloadIcon from "@mui/icons-material/Download";

const statusColor = (status) => {
  switch (status.toLowerCase()) {
    case "submitted":
      return "warning";
    case "accepted":
      return "primary";
    case "in-progress":
      return "info";
    case "completed":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

export default function AssignmentsTable() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const { userData } = useContext(AppContent);
  const currentUserId = userData?.id || userData?._id;

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState(null);
  const [dialogEmpId, setDialogEmpId] = useState("");
  const [dialogDesiredStatus, setDialogDesiredStatus] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState("");

  // fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, uRes, aRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/list-all`, {
          credentials: "include",
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/list-all`, {
          credentials: "include",
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assignments/list-all`, {
          credentials: "include",
        }),
      ]);
      const [rData, uData, aData] = await Promise.all([
        rRes.json(),
        uRes.json(),
        aRes.json(),
      ]);
      if (uData.success) {
        const filtered = uData.users.filter(
          (u) =>
            u.position?.toLowerCase().includes("district engineer") &&
            u.role?.toLowerCase() !== "admin"
        );
        setEmployees(filtered);
      }
      if (rData.success && aData.success) {
        const assignMap = aData.assignments.reduce((m, a) => {
          m[a.reportId] = a;
          return m;
        }, {});
        setRows(
          rData.reports.map((r) => {
            const a = assignMap[r.id] || {};
            return {
              id: r.id,
              reportId: r.id,
              status: a.status || r.status,
              assignedTo: a.assignedTo || "",
              assignmentId: a._id || "",
              assignmentNumber: a.assignmentNumber || "",
              timestamp: a.createdAt || "",
              siteInspectionReport: a.siteInspectionReport || "",
              originalFileName: a.originalFileName || "",
              accomplishmentDate: a.accomplishmentDate || "",
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
      showError("Load failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API helpers
  const upsertAssignment = async ({ id, reportId, status, assignedTo }) => {
    const url = id
      ? `/api/assignments/update/${id}`
      : `/api/assignments/create`;
    const res = await fetch(import.meta.env.VITE_BACKEND_URL + url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reportId, status, assignedTo }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.assignment;
  };

  const deleteAssignment = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/assignments/delete/${id}`,
      { method: "DELETE", credentials: "include" }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  };

  const uploadReport = async (assignmentId, file, status) => {
    const form = new FormData();
    form.append("report", file);
    form.append("status", status);
    form.append("userId", currentUserId);
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/assignments/upload-report/${assignmentId}`,
      { method: "POST", credentials: "include", body: form }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.assignment;
  };

  const showError = (msg) => {
    setErrorDialogMsg(msg);
    setErrorDialogOpen(true);
  };

  // handlers
  const handleStatusChange = (rowId, newStatus) => {
    const row = rows.find((r) => r.id === rowId);
    const statusLower = newStatus.toLowerCase();
    if (
      (statusLower === "completed" || statusLower === "rejected") &&
      !row.assignmentId
    ) {
      return showError("Please assign someone first.");
    }
    if (statusLower === "completed" || statusLower === "rejected") {
      setDialogRow(row);
      setDialogDesiredStatus(statusLower);
      setCompleteDialogOpen(statusLower === "completed");
      setRejectDialogOpen(statusLower === "rejected");
      return;
    }
    if (statusLower === "submitted" && row.assignmentId) {
      deleteAssignment(row.assignmentId)
        .then(() =>
          setRows((prev) =>
            prev.map((r) =>
              r.id === rowId
                ? {
                    ...r,
                    status: "Submitted",
                    assignedTo: "",
                    assignmentId: "",
                    assignmentNumber: "",
                    timestamp: "",
                    siteInspectionReport: "",
                    accomplishmentDate: "",
                  }
                : r
            )
          )
        )
        .catch((e) => showError("Delete failed: " + e.message));
      return;
    }
    if (!row.assignedTo) {
      return showError("Please assign someone first.");
    }
    upsertAssignment({
      id: row.assignmentId,
      reportId: row.reportId,
      status: newStatus,
      assignedTo: row.assignedTo,
    })
      .then((assignment) =>
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  status: assignment.status,
                  assignmentId: assignment._id,
                  assignmentNumber: assignment.assignmentNumber,
                  timestamp: assignment.createdAt || new Date().toISOString(),
                }
              : r
          )
        )
      )
      .catch((e) => showError("Save failed: " + e.message));
  };

  // Dialog actions
  const confirmComplete = () => {
    setCompleteDialogOpen(false);
    setUploadDialogOpen(true);
  };
  const cancelComplete = () => setCompleteDialogOpen(false);
  const confirmReject = () => {
    setRejectDialogOpen(false);
    setUploadDialogOpen(true);
  };
  const cancelReject = () => setRejectDialogOpen(false);

  const handleUpload = () => {
    uploadReport(dialogRow.assignmentId, reportFile, dialogDesiredStatus)
      .then((assignment) =>
        setRows((prev) =>
          prev.map((r) =>
            r.id === dialogRow.id
              ? {
                  ...r,
                  status:
                    dialogDesiredStatus.charAt(0).toUpperCase() +
                    dialogDesiredStatus.slice(1),
                  assignmentId: assignment._id,
                  assignmentNumber: assignment.assignmentNumber,
                  siteInspectionReport: assignment.siteInspectionReport,
                  originalFileName: assignment.originalFileName,
                  accomplishmentDate: assignment.accomplishmentDate,
                }
              : r
          )
        )
      )
      .catch((e) => showError("Upload failed: " + e.message))
      .finally(() => {
        setUploadDialogOpen(false);
        setReportFile(null);
      });
  };

  const handleAssignClick = (rowId, newEmpId) => {
    if (newEmpId === "") {
      const row = rows.find((r) => r.id === rowId);
      if (row.assignmentId) {
        deleteAssignment(row.assignmentId)
          .then(() =>
            setRows((prev) =>
              prev.map((r) =>
                r.id === rowId
                  ? {
                      ...r,
                      status: "Submitted",
                      assignedTo: "",
                      assignmentId: "",
                      assignmentNumber: "",
                      timestamp: "",
                      siteInspectionReport: "",
                      accomplishmentDate: "",
                    }
                  : r
              )
            )
          )
          .catch((e) => showError("Unassign failed: " + e.message));
      }
      return;
    }
    setDialogRow(rows.find((r) => r.id === rowId));
    setDialogEmpId(newEmpId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAssign = () => {
    setConfirmDialogOpen(false);
    const { id: rowId, reportId, status } = dialogRow;
    upsertAssignment({
      id: dialogRow.assignmentId,
      reportId,
      status,
      assignedTo: dialogEmpId,
    })
      .then((assignment) =>
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  assignedTo: assignment.assignedTo,
                  assignmentId: assignment._id,
                  assignmentNumber: assignment.assignmentNumber,
                  timestamp: assignment.createdAt || new Date().toISOString(),
                }
              : r
          )
        )
      )
      .catch((e) => showError("Save failed: " + e.message));
  };
  const handleCancelAssign = () => setConfirmDialogOpen(false);

  // --- CSV export helper ---
  const exportCSV = () => {
    // Only export what the grid is showing (post-search)
    const filtered = rows.filter((r) =>
      Object.values(r).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    const header = [
      "Report ID",
      "Status",
      "Assigned To",
      "Job Order No.",
      "Assigned At",
      "Site Inspection Report",
      "Completion Date",
    ];
    const csvRows = filtered.map((r) => [
      r.reportId,
      r.status,
      // map assignedTo id → name
      r.assignedTo
        ? employees.find((u) => u.id === r.assignedTo)?.fullName
        : "",
      r.assignmentNumber,
      r.timestamp,
      r.originalFileName || r.siteInspectionReport || "",
      r.accomplishmentDate || "",
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
    a.download = "assignments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { field: "reportId", headerName: "Report ID", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => (
        <TextField
          disabled={["completed", "rejected"].includes(
            row.status.toLowerCase()
          )}
          select
          size="small"
          variant="standard"
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) => (
              <Chip label={v} size="small" color={statusColor(v)} />
            ),
          }}
        >
          {[
            "Submitted",
            "Accepted",
            "In-progress",
            "Completed",
            "Rejected",
          ].map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
      renderCell: ({ row }) => (
        <TextField
          disabled={["completed", "rejected"].includes(
            row.status.toLowerCase()
          )}
          select
          size="small"
          variant="standard"
          value={row.assignedTo}
          onChange={(e) => handleAssignClick(row.id, e.target.value)}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) =>
              v ? (
                <Chip
                  label={employees.find((u) => u.id === v)?.fullName || ""}
                  size="small"
                />
              ) : (
                <em>Unassigned</em>
              ),
          }}
        >
          <MenuItem value="">
            <em>Unassigned</em>
          </MenuItem>
          {employees.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.fullName}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    { field: "assignmentNumber", headerName: "Job Order No.", flex: 1 },
    {
      field: "timestamp",
      headerName: "Assigned At",
      flex: 1,
      renderCell: ({ value }) =>
        value ? new Date(value).toLocaleString() : "-",
    },
    {
      field: "siteInspectionReport",
      headerName: "Site Inspection Report",
      flex: 1,
      renderCell: ({ value, row }) =>
        value ? (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${value}`}
            target="_blank"
          >
            {row.originalFileName || value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      field: "accomplishmentDate",
      headerName: "Completion Date",
      flex: 1,
      renderCell: ({ value }) =>
        value ? new Date(value).toLocaleString() : "-",
    },
  ];

  const filteredRows = rows.filter((r) =>
    Object.values(r).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Job Order
      </Typography>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={1}
        flexWrap="wrap"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search…"
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
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          onClick={exportCSV} // ← wire up the CSV export
          startIcon={<DownloadIcon />}
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
            rows={filteredRows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(n) => setPageSize(n)}
            rowsPerPageOptions={[5, 10, 20, 50]}
            pagination
          />
        )}
      </Paper>

      {/* Confirm Assignment */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelAssign}>
        <DialogTitle>Confirm Assignment</DialogTitle>
        <DialogContent>
          Assign report <strong>{dialogRow?.reportId}</strong> to{" "}
          <strong>
            {employees.find((u) => u.id === dialogEmpId)?.fullName}
          </strong>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAssign}>No</Button>
          <Button onClick={handleConfirmAssign} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Completion */}
      <Dialog open={completeDialogOpen} onClose={cancelComplete}>
        <DialogTitle>Confirm Completion</DialogTitle>
        <DialogContent>
          Mark report <strong>{dialogRow?.reportId}</strong> as completed?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelComplete}>No</Button>
          <Button onClick={confirmComplete} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Rejection */}
      <Dialog open={rejectDialogOpen} onClose={cancelReject}>
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          Mark report <strong>{dialogRow?.reportId}</strong> as rejected?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReject}>No</Button>
          <Button onClick={confirmReject} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Site Inspection Report */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      >
        <DialogTitle>Upload Site Inspection Report</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setReportFile(e.target.files[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!reportFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{errorDialogMsg}</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
