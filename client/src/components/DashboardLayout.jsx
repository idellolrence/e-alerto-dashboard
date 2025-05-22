import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import PeopleIcon from "@mui/icons-material/People";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import { assets } from "../assets/assets";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { MenuList, MenuItem, ListItemText, ListItemIcon } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Popover } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmployeesTable from "../pages/EmployeesTable";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from "@mui/icons-material/Engineering";
import RegUserTable from "../pages/regUserTable";
import WarningIcon from "@mui/icons-material/Warning"; // Import the warning icon
import ResetPasswordIcon from "@mui/icons-material/Lock"; // Import an icon for "Reset Password"
import ReportsTable from "../pages/ReportsTable";
import TrafficChart from "../pages/TrafficChart";
import AccomplishmentChart from "../pages/AccomplishmentChart";
import DashboardHome from "../pages/DashboardHome";
import StarIcon from "@mui/icons-material/Star";
import TimelineIcon from "@mui/icons-material/Timeline";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentsTable from "../pages/AssignmentsTable";
import ActivityLogsTable from "../pages/ActivityLogsTable";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountInfo from "../pages/AccountInfo";
import PageLock from "../pages/PageLock"; // Add at top
import FeedbackTable from "../pages/FeedbackTable";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main",
  },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "report-management",
    title: "Report Management",
    icon: <DescriptionIcon />,
    children: [
      {
        segment: "reports",
        title: "All Reports",
        icon: <LayersIcon />,
      },
      {
        segment: "assignments",
        title: "Job Order",
        icon: <AssignmentIcon />,
      },
      {
        segment: "feedback",
        title: "Feedback",
        icon: <StarIcon />,
      },
    ],
  },
  {
    segment: "accounts",
    title: "Account Management",
    icon: <PeopleIcon />,
    children: [
      {
        segment: "users",
        title: "Regular Users",
        icon: <PersonIcon />,
      },
      {
        segment: "employees",
        title: "Employees",
        icon: <EngineeringIcon />,
      },
    ],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    segment: "charts",
    title: "Charts",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "accomplishment",
        title: "Accomplishment",
        icon: <StackedLineChartIcon />,
      },
      {
        segment: "traffic",
        title: "Traffic",
        icon: <TimelineIcon />,
      },
    ],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "System",
  },
  {
    segment: "settings",
    title: "Settings",
    icon: <SettingsIcon />,
    children: [
      {
        segment: "activity_logs",
        title: "Activity Logs",
        icon: <WarningIcon />,
      },
      {
        segment: "profile_information",
        title: "Profile Information",
        icon: <AccountCircleIcon />,
      },
    ],
  },
];

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

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function SidebarFooterAccount({ mini }) {
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContent);
  const navigate = useNavigate();

  const avatarInitial = userData?.name?.[0]?.toUpperCase() || "U";

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setUserData(false);
        setIsLoggedIn(false);
        navigate("/Login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: { xs: "row", sm: mini ? "column" : "row" },
        gap: 1,
        width: "100%",
      }}
    >
      {/* Avatar and Info */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Avatar
          sx={{
            bgcolor: "#263092",
            color: "white",
            width: 32,
            height: 32,
            fontSize: 14,
          }}
        >
          {avatarInitial}
        </Avatar>

        {/* Info only when expanded */}
        {!mini && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              sx={{ maxWidth: 120 }}
            >
              {userData?.name || "Guest"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: 120 }}
            >
              {userData?.email || ""}
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Logout button - always visible */}
      <IconButton
        onClick={logout}
        size="small"
        title="Logout"
        sx={{
          color: "#555",
          mt: { xs: 0, sm: mini ? 1 : 0 },
          alignSelf: { xs: "flex-end", sm: "center" },
        }}
      >
        <LogoutIcon />
      </IconButton>
    </Box>
  );
}

SidebarFooterAccount.propTypes = {
  mini: PropTypes.bool.isRequired,
};

SidebarFooterAccount.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function DashboardLayoutBasic(props) {
  const { window } = props;
  const router = useDemoRouter("/dashboard");
  const demoWindow = window !== undefined ? window() : undefined;
  const { userData } = useContext(AppContent);
  const isVerified = userData?.isAccountVerified;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        logo: (
          <img src={assets.logo} alt="E-Alerto Logo" style={{ height: 32 }} />
        ),
        title: "",
        homeUrl: "/dashboard",
      }}
    >
      <DashboardLayout
        slots={{
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {router.pathname === "/accounts/employees" ? (
          isVerified ? (
            <EmployeesTable />
          ) : (
            <PageLock
              title="Employees Locked"
              message="Please verify your account in the Profile Information under Settings to access Employees."
            />
          )
        ) : router.pathname === "/accounts/users" ? (
          isVerified ? (
            <RegUserTable />
          ) : (
            <PageLock
              title="Users Locked"
              message="Please verify your account in the Profile Information under Settings to access Regular Users."
            />
          )
        ) : router.pathname === "/report-management/reports" ? (
          isVerified ? (
            <ReportsTable />
          ) : (
            <PageLock
              title="Reports Locked"
              message="Please verify your account in the Profile Information under Settings to access Reports."
            />
          )
        ) : router.pathname === "/report-management/assignments" ? (
          isVerified ? (
            <AssignmentsTable />
          ) : (
            <PageLock
              title="Job Order Locked"
              message="Please verify your account in the Profile Information under Settings to access Job Orders."
            />
          )
        ) : router.pathname === "/report-management/feedback" ? (
          isVerified ? (
            <FeedbackTable />
          ) : (
            <PageLock
              title="Activity Logs Locked"
              message="Please verify your account in the Profile Information under Settings to access Feedback."
            />
          )
        ) : router.pathname === "/charts/traffic" ? (
          isVerified ? (
            <TrafficChart />
          ) : (
            <PageLock
              title="Traffic Chart Locked"
              message="Please verify your account in the Profile Information under Settings to access Traffic Charts."
            />
          )
        ) : router.pathname === "/charts/accomplishment" ? (
          isVerified ? (
            <AccomplishmentChart />
          ) : (
            <PageLock
              title="Accomplishment Chart Locked"
              message="Please verify your account in the Profile Information under Settings to access Accomplishment Charts."
            />
          )
        ) : router.pathname === "/settings/activity_logs" ? (
          isVerified ? (
            <ActivityLogsTable />
          ) : (
            <PageLock
              title="Activity Logs Locked"
              message="Please verify your account in the Profile Information under Settings to access Logs."
            />
          )
        ) : router.pathname === "/settings/profile_information" ? (
          <AccountInfo />
        ) : router.pathname === "/dashboard" ? (
          isVerified ? (
            <DashboardHome />
          ) : (
            <PageLock
              title="Dashboard Locked"
              message="Please verify your account in the Profile Information under Settings to access the Dashboard."
            />
          )
        ) : (
          <DemoPageContent pathname={router.pathname} />
        )}
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutBasic.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutBasic;
