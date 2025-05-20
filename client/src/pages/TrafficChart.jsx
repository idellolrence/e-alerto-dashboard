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
          `/api/reports/analytics?filter=${filter}`,
        { credentials: "include" }
      );
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formatXAxisLabel = (label) => {
    if (!label) return "N/A";

    if (filter === "week") {
      const [year, week] = label.split("-");
      return week && year ? `Week ${week}, ${year}` : "N/A";
    }

    if (filter === "month") {
      const [year, month] = label.split("-");
      return new Date(year, parseInt(month) - 1).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    if (filter === "year") return label;

    if (filter === "day") {
      const date = new Date(label);
      return isNaN(date)
        ? "Invalid"
        : date.toLocaleDateString("default", { weekday: "long" });
    }

    return label ?? "N/A";
  };

  const formattedData =
    filter === "day"
      ? weekdays.map((day) => {
          const found = data.find((entry) => {
            const date = new Date(entry.label);
            const weekday = date.toLocaleDateString("default", {
              weekday: "long",
            });
            return weekday === day;
          });

          return {
            name: day,
            count: found ? found.count : 0,
          };
        })
      : data.map((entry) => ({
          name: formatXAxisLabel(entry.label),
          count: entry.count,
        }));

  return (
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
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-10}
              textAnchor="end"
              height={60}
              tick={{ fill: tickColor, fontSize: 12 }}
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
                color: isDark ? "#fff" : "#000",
              }}
              labelStyle={{ color: tickColor }}
              itemStyle={{ color: tickColor }}
            />
            <Legend
              wrapperStyle={{
                color: tickColor,
                fontSize: 14,
              }}
            />
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
  );
}

export default TrafficChart;
