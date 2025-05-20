import * as React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";

function RegUserTable() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pageSize, setPageSize] = React.useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/reguser/list-all",
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        const mapped = data.users.map((u, i) => ({
          id: u.id || i,
          username: u.username,
          email: u.email,
          phone: u.phone,
        }));
        setRows(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
  ];

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(query)
    );
  });

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Username", "Email", "Phone"],
      ...rows.map((u) => [u.id, u.username, u.email, u.phone]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "regular_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Users
      </Typography>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        spacing={1}
      >
        {/* Search + Reload grouped on the left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <IconButton
            onClick={fetchUsers}
            color="default"
            disabled={loading}
            title="Reload data"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Export button on the right */}
        <Button onClick={exportToCSV} variant="contained">
          Export CSV
        </Button>
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        rowsPerPageOptions={[10, 20, 50, 100]}
        pagination
        autoHeight
      />
    </Box>
  );
}

export default RegUserTable;
