import * as React from "react";
import PropTypes from "prop-types";
import { createTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Crud } from "@toolpad/core/Crud";
import { useDemoRouter } from "@toolpad/core/internal";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Stack,
  Button,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function matchPath(pattern, pathname) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, "([^/]+)")}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function EmployeesTable(props) {
  const { window: windowProp } = props;
  const [searchQuery, setSearchQuery] = React.useState("");

  const router = useDemoRouter("/employees");
  const demoWindow = windowProp !== undefined ? windowProp() : undefined;

  const title = React.useMemo(() => {
    if (router.pathname === "/employees/new") return "New Employee";
    const editId = matchPath("/employees/:employeeId/edit", router.pathname);
    if (editId) return `Employee ${editId} - Edit`;
    const showId = matchPath("/employees/:employeeId", router.pathname);
    if (showId) return `Employee ${showId}`;
    return "Employees";
  }, [router.pathname]);

  const fields = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      editable: true,
      renderEditCell: ({ value, onValueChange }) => (
        <TextField
          label="Full Name"
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          helperText="Letters, spaces & hyphens only"
          fullWidth
        />
      ),
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["District Engineer", "Admin"],
      editable: true,
      renderEditCell: ({ value, onValueChange }) => (
        <TextField
          select
          label="Position"
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="District Engineer">District Engineer</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </TextField>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      editable: true,
      renderEditCell: ({ value, onValueChange }) => (
        <TextField
          label="Email"
          type="email"
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          helperText="must be valid email"
          fullWidth
        />
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
    },
  ];

  if (router.pathname === "/employees/new") {
    fields.push({
      field: "password",
      headerName: "Password",
      renderEditCell: ({ value, onValueChange }) => (
        <TextField
          type="password"
          label="Password"
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          fullWidth
        />
      ),
      editable: true,
    });
  }

  const employeesDataSource = {
    fields,
    getMany: async ({ paginationModel, sortModel, filterModel }) => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/api/user/list-all",
          { credentials: "include" }
        );
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch users");
        }

        let items = data.users;

        // 🔍 Apply Toolpad column filters
        console.log("🔎 Toolpad filterModel:", filterModel);

        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, operator, value }) => {
            if (!value) return;

            items = items.filter((item) => {
              const fieldValue = (item[field] ?? "").toString().toLowerCase();
              const searchValue = value.toLowerCase();

              if (operator === "contains") {
                return fieldValue.includes(searchValue);
              } else if (operator === "equals") {
                return fieldValue === searchValue;
              } else if (operator === "startsWith") {
                return fieldValue.startsWith(searchValue);
              } else if (operator === "endsWith") {
                return fieldValue.endsWith(searchValue);
              }

              return true;
            });
          });
        }

        // ✅ Apply sorting
        if (sortModel?.length) {
          const { field, sort } = sortModel[0];
          items = [...items].sort((a, b) => {
            if (a[field] < b[field]) return sort === "asc" ? -1 : 1;
            if (a[field] > b[field]) return sort === "asc" ? 1 : -1;
            return 0;
          });
        }

        // ✅ Apply pagination
        const start = paginationModel.page * paginationModel.pageSize;
        const paginatedItems = items.slice(
          start,
          start + paginationModel.pageSize
        );

        return {
          items: paginatedItems,
          itemCount: items.length,
        };
      } catch (error) {
        console.error("❌ Fetch error:", error.message);
        return { items: [], itemCount: 0 };
      }
    },

    getOne: async (id) => {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + `/api/user/get/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      return data.user;
    },

    createOne: async (form) => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: form.fullName,
              email: form.email,
              position: form.position,
              phone: form.phone,
              password: form.password,
            }),
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Registration failed");
        }

        return {
          id: Date.now(),
          fullName: form.fullName,
          email: form.email,
          position: form.position,
          phone: form.phone,
          password: "",
        };
      } catch (error) {
        console.error("❌ Registration error:", error.message);
        throw new Error(error.message);
      }
    },

    updateOne: async (id, form) => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + `/api/user/update/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: form.fullName,
              email: form.email,
              position: form.position,
              phone: form.phone,
            }),
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Update failed");
        }

        return {
          id,
          fullName: form.fullName,
          email: form.email,
          position: form.position,
          phone: form.phone,
        };
      } catch (error) {
        console.error("❌ Update error:", error.message);
        throw new Error(error.message);
      }
    },

    deleteOne: async (id) => {
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + `/api/user/delete/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Delete failed");
        }
      } catch (error) {
        console.error("❌ Delete error:", error.message);
        throw new Error(error.message);
      }
    },

    // ---- UPDATED VALIDATION ----
    validate: (form) => {
      const issues = [];
      // required
      if (!form.fullName) {
        issues.push({ message: "Full name is required", path: ["fullName"] });
      } else if (!/^[A-Za-z\s-]+$/.test(form.fullName)) {
        issues.push({
          message: "Name may only contain letters, spaces, and hyphens",
          path: ["fullName"],
        });
      }
      if (!form.position) {
        issues.push({ message: "Position is required", path: ["position"] });
      } else if (!["District Engineer", "Admin"].includes(form.position)) {
        issues.push({
          message: "Position must be District Engineer or Admin",
          path: ["position"],
        });
      }
      if (!form.email) {
        issues.push({ message: "Email is required", path: ["email"] });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        issues.push({
          message: "Must be a valid email address",
          path: ["email"],
        });
      }
      if (!/^09\d{9}$/.test(form.phone || "")) {
        issues.push({
          message: "Phone must start with 09 and have 11 digits",
          path: ["phone"],
        });
      }
      if (router.pathname === "/employees/new" && !form.password) {
        issues.push({
          message: "Password is required",
          path: ["password"],
        });
      }
      return { issues };
    },
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/user/list-all",
        { credentials: "include" }
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch users");
      }

      const rows = data.users;

      const csv = [
        ["ID", "Name", "Position", "Email", "Phone"],
        ...rows.map((u) => [
          `"${u.id}"`,
          `"${u.fullName}"`,
          `"${u.position}"`,
          `"${u.email}"`,
          `"${u.phone}"`,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employees.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ CSV Export error:", error.message);
    }
  };

  return (
    <AppProvider
      navigation={[]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <PageContainer
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            {router.pathname !== "/employees" && (
              <IconButton
                size="small"
                onClick={() => router.navigate("/employees")}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
        }
      >
        {router.pathname === "/employees" && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search employee..."
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
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
                Export CSV
              </Button>
            </Box>
          </>
        )}

        <Crud
          dataSource={employeesDataSource}
          dataSourceCache={null}
          rootPath="/employees"
          defaultValues={{
            fullName: "",
            position: "",
            email: "",
            phone: "",
            password: "",
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </PageContainer>
    </AppProvider>
  );
}

EmployeesTable.propTypes = {
  window: PropTypes.func,
};

export default EmployeesTable;

