import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormHelperText,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AccomplishmentChart() {
  // Actual filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Temporary dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [error, setError] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const tickColor = isDark ? "#e0e0e0" : "#333";
  const gridColor = isDark ? "#444" : "#ccc";

  // Fetch all data on mount or whenever filter changes
  const fetchData = async () => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/reports/analytics/status`;
      const res = await fetch(url, { credentials: "include" });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch status analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Format the X-axis labels
  const formatXAxisLabel = (label) => {
    if (!label) return "N/A";
    return new Date(label).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Prepare chart data, keep rawDate for filtering
  const formattedData = data.map((entry) => ({
    rawDate: entry.label,
    name: formatXAxisLabel(entry.label),
    Submitted: entry.Submitted || 0,
    Accepted: entry.Accepted || 0,
    "In-progress": entry["In-progress"] || 0,
    Completed: entry.Completed || 0,
    Rejected: entry.Rejected || 0,
  }));

  // Client-side filter: if both dates set, only include those within range
  const filteredData = formattedData.filter((item) => {
    if (!startDate || !endDate) return true;
    const d = new Date(item.rawDate);
    const from = new Date(startDate);
    const to = new Date(endDate);
    return d >= from && d <= to;
  });

  // Dialog handlers
  const handleOpen = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setError("");
    setDialogOpen(true);
  };
  const handleClose = () => setDialogOpen(false);
  const handleApply = () => {
    if (!tempStart || !tempEnd) {
      setError("Please select both dates");
      return;
    }
    if (new Date(tempEnd) < new Date(tempStart)) {
      setError("To date must be the same or after From date");
      return;
    }
    setStartDate(tempStart);
    setEndDate(tempEnd);
    setDialogOpen(false);
  };

  const LegendItem = ({ color, label }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{ width: 16, height: 16, backgroundColor: color, borderRadius: 1 }}
      />
      <Typography variant="body2" sx={{ color: "#666" }}>
        {label}
      </Typography>
    </Stack>
  );

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h6" fontWeight={600}>
            Accomplishment Breakdown
          </Typography>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleOpen}
          >
            Filter
          </Button>
        </Stack>

        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            >
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-10}
                textAnchor="end"
                tick={{ fill: tickColor, fontSize: 12 }}
                height={60}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: tickColor, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#222" : "#fff",
                  border: "1px solid #888",
                }}
                labelStyle={{ color: tickColor }}
                itemStyle={{ color: tickColor }}
              />
              <Area
                type="monotone"
                dataKey="Submitted"
                stackId="1"
                stroke="#fbc02d"
                fill="#fbc02d"
              />
              <Area
                type="monotone"
                dataKey="Accepted"
                stackId="1"
                stroke="#1976d2"
                fill="#1976d2"
              />
              <Area
                type="monotone"
                dataKey="In-progress"
                stackId="1"
                stroke="#0288d1"
                fill="#0288d1"
              />
              <Area
                type="monotone"
                dataKey="Completed"
                stackId="1"
                stroke="#388e3c"
                fill="#388e3c"
              />
              <Area
                type="monotone"
                dataKey="Rejected"
                stackId="1"
                stroke="#d32f2f"
                fill="#d32f2f"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <Box mt={2}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            <LegendItem color="#fbc02d" label="Submitted" />
            <LegendItem color="#1976d2" label="Accepted" />
            <LegendItem color="#0288d1" label="In-progress" />
            <LegendItem color="#388e3c" label="Completed" />
            <LegendItem color="#d32f2f" label="Rejected" />
          </Stack>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Filter by Date</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              type="date"
              label="From"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
            />
            <TextField
              type="date"
              label="To"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AccomplishmentChart;
