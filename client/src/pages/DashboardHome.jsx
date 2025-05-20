import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
} from "@mui/material";
import TrafficChart from "./TrafficChart";
import AccomplishmentChart from "./AccomplishmentChart";

const statusColors = {
  Submitted: "#fbc02d",
  Accepted: "#1976d2",
  "In-progress": "#0288d1",
  Completed: "#388e3c",
  Rejected: "#d32f2f",
};

function DashboardHome() {
  const [counts, setCounts] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch report data
  const fetchOverviewData = async () => {
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/reports/list-all",
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        const statusCounts = data.reports.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {});
        setCounts(statusCounts);

        const sorted = [...data.reports].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRecentReports(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  // Fetch employee count
  const fetchEmployeeCount = async () => {
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/user/list-all",
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success && typeof data.count === "number") {
        setEmployeeCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch employee list:", err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchOverviewData(), fetchEmployeeCount()]);
      setLoading(false);
    })();
  }, []);

  const statuses = [
    "Submitted",
    "Accepted",
    "In-progress",
    "Completed",
    "Rejected",
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Dashboard Overview
      </Typography>

      {/* Status Summary Cards */}
      <Box
        mb={4}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {statuses.map((status) => (
          <Card
            key={status}
            sx={{
              flex: "1 1 calc(20% - 16px)",
              minWidth: 150,
              borderLeft: `5px solid ${statusColors[status]}`,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
              >
                {status}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  counts[status] || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main + Sidebar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
        }}
      >
        {/* Left: Charts stacked */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Card sx={{ width: "100%" }}>
            <CardContent sx={{ p: 1 }}>
              <TrafficChart />
            </CardContent>
          </Card>
          <Card sx={{ width: "100%" }}>
            <CardContent sx={{ p: 1 }}>
              <AccomplishmentChart />
            </CardContent>
          </Card>
        </Box>

        {/* Right: Sidebar */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "0 0 320px" } }}>
          {/* Employee count card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Employees
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {loading ? <CircularProgress size={24} /> : employeeCount}
              </Typography>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Recent Reports
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentReports.map((r) => (
                <Card key={r.id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {r.classification} - {r.measurement || "N/A"}
                      </Typography>
                      <Chip
                        label={r.status}
                        size="small"
                        sx={{
                          bgcolor: statusColors[r.status] || "grey",
                          color: "white",
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      {r.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default DashboardHome;
