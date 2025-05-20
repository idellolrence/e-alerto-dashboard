import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  useTheme,
} from "@mui/material";
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
  const [filter, setFilter] = useState("month");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";
  const tickColor = isDark ? "#e0e0e0" : "#333";
  const gridColor = isDark ? "#444" : "#ccc";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL +
          `/api/reports/analytics/status?filter=${filter}`,
        { credentials: "include" }
      );
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
  }, [filter]);

  const formatXAxisLabel = (label) => {
    if (!label) return "N/A";

    const [year, value] = label.split("-");
    if (filter === "week") return `W${value}, ${year}`;
    if (filter === "month") {
      return new Date(year, parseInt(value) - 1).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    }
    return label;
  };

  const formattedData = data.map((entry) => ({
    name: formatXAxisLabel(entry.label),
    Submitted: entry.Submitted || 0,
    Accepted: entry.Accepted || 0,
    "In-progress": entry["In-progress"] || 0,
    Completed: entry.Completed || 0,
    Rejected: entry.Rejected || 0,
  }));

  const LegendItem = ({ color, label }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 16,
          height: 16,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <Typography variant="body2" sx={{ color: "#666" }}>
        {label}
      </Typography>
    </Stack>
  );

  return (
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
        <TextField
          select
          size="small"
          label="Filter by"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="week">Weekly</MenuItem>
          <MenuItem value="month">Monthly</MenuItem>
          <MenuItem value="year">Yearly</MenuItem>
        </TextField>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={formattedData}
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
  );
}

export default AccomplishmentChart;
