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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function TrafficChart() {
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

  // Fetch data (all or by date range)
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = [];
      if (startDate && endDate) {
        params.push(`start=${startDate}`, `end=${endDate}`);
      }
      const query = params.length ? `?${params.join("&")}` : "";
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/reports/analytics${query}`;
      const res = await fetch(url, { credentials: "include" });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch traffic analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Turn YYYY-MM-DD into “May 21, 2025”
  const formatXAxisLabel = (label) =>
    new Date(label).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Prepare chart data, keep rawDate for filtering
  const formattedData = data.map((entry) => ({
    rawDate: entry.label,
    name: formatXAxisLabel(entry.label),
    count: entry.count,
  }));

  // Filter client-side by date
  const filteredData = formattedData.filter((item) => {
    if (!startDate || !endDate) return true;
    const d = new Date(item.rawDate);
    return d >= new Date(startDate) && d <= new Date(endDate);
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
            Report Traffic
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
            <LineChart
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
                axisLine={{ stroke: tickColor }}
                tickLine={{ stroke: tickColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#222" : "#fff",
                  border: "1px solid #888",
                }}
                labelStyle={{ color: tickColor }}
                itemStyle={{ color: tickColor }}
              />
              <Legend wrapperStyle={{ color: tickColor, fontSize: 14 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
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

export default TrafficChart;
