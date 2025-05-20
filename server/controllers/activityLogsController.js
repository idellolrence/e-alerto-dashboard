import ActivityLog from "../models/activityLogsModel.js";
import userModel from "../models/userModel.js";

// GET /api/activitylogs/list-all
export const listAllLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).lean();

    // Map to front-end shape
    const mapped = logs.map((log) => ({
      id: log._id,
      timestamp: log.createdAt,
      employeeId: log.employeeId,
      employeeName: log.employeeName,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      oldValue: log.oldValue,
      newValue: log.newValue,
      ipAddress: log.ipAddress,
    }));

    res.json({ success: true, logs: mapped });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// POST /api/activitylogs/create
export const createLog = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      action,
      oldValue = null,
      newValue = null,
    } = req.body;

    // 1) We know userAuth populated req.body.userId:
    const employeeId = req.body.userId;
    // 2) Fetch their name from users collection:
    const user = await userModel.findById(employeeId).lean();
    const employeeName = user?.name || "Unknown";

    // 3) Create the ActivityLog with both fields
    const log = await ActivityLog.create({
      employeeId,
      employeeName,
      entityType,
      entityId,
      action,
      oldValue,
      newValue,
      ipAddress: req.ip,
    });

    return res.json({ success: true, log });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// DELETE old logs in bulk (admin only)
export const purgeLogs = async (req, res) => {
  try {
    // 1) Check admin privilege
    const user = await userModel.findById(req.body.userId).lean();
    if (user.position !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // 2) Parse cutoff date
    const { beforeDate } = req.body;
    const cutoff = new Date(beforeDate);
    if (isNaN(cutoff)) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }

    // 3) Bulk delete
    const { deletedCount } = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoff },
    });

    return res.json({
      success: true,
      message: `Purged ${deletedCount} logs before ${cutoff.toISOString()}`,
      deletedCount,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
