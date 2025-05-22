// controllers/assignmentController.js
import Assignment from "../models/assignmentModel.js";
import Report from "../models/reportModel.js";
import multer from "multer";
import ActivityLog from "../models/activityLogsModel.js";
import userModel from "../models/userModel.js"; // ← for employeeName
import Counter from "../models/idNumberModel.js"; // for Assignment ID

// List all assignments
export const listAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().lean();
    // assignments[i].assignmentNumber will now be available
    return res.json({ success: true, assignments });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { reportId, status, assignedTo } = req.body;

    // 0) figure out year+month key, e.g. "25-01"
    const now = new Date();
    const YY = String(now.getFullYear()).slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const key = `${YY}-${MM}`;

    // 1a) atomically bump counter for this key
    const counter = await Counter.findByIdAndUpdate(
      key,
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    // 1b) build assignmentNumber: R25-01-00001
    const seqNo = String(counter.seq).padStart(5, "0");
    const assignmentNumber = `PA${key}-${seqNo}`;

    // 2) push the same status into the reports collection
    const a = new Assignment({
      reportId,
      status,
      assignedTo: assignedTo || null,
      assignmentNumber,
    });

    await a.save();
    await Report.findByIdAndUpdate(reportId, { status });

    // 3) get user info for logging
    const user = await userModel.findById(req.body.userId).lean();
    const userName = user?.name || "";

    // 4) record the activity
    await ActivityLog.create({
      employeeId: req.body.userId,
      employeeName: userName,
      entityType: "Assignment",
      entityId: a._id,
      action: `Created assignment`,
      oldValue: null,
      newValue: status,
      ipAddress: req.ip,
    });

    return res.json({ success: true, assignment: a });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Update an existing assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    // 1) fetch previous state
    const prev = await Assignment.findById(id).lean();
    if (!prev) return res.json({ success: false, message: "Not found" });

    // 2) build update object & change‐log tasks
    const update = {};
    const logs = [];

    // detect status change
    if (status !== undefined && status !== prev.status) {
      update.status = status;
      logs.push({
        type: "status",
        oldVal: prev.status,
        newVal: status,
      });
    }

    // detect assignee change
    if (
      "assignedTo" in req.body &&
      String(assignedTo) !== String(prev.assignedTo)
    ) {
      update.assignedTo = assignedTo || null;
      logs.push({
        type: "assignee",
        oldVal: prev.assignedTo,
        newVal: assignedTo,
      });
    }

    // 3) apply update
    const a = await Assignment.findByIdAndUpdate(id, update, { new: true });
    if (!a)
      return res.json({ success: false, message: "Not found after update" });

    // mirror status on Report
    if (update.status) {
      await Report.findByIdAndUpdate(a.reportId, { status: update.status });
    }

    // 4) fetch current user for logs
    const user = await userModel.findById(req.body.userId).lean();
    const userName = user?.name || "";

    // 5) create log entries
    for (let lg of logs) {
      if (lg.type === "status") {
        await ActivityLog.create({
          employeeId: req.body.userId,
          employeeName: userName,
          entityType: "Assignment",
          entityId: a._id,
          action: `Changed assignment status`,
          oldValue: lg.oldVal,
          newValue: lg.newVal,
          ipAddress: req.ip,
        });
      } else if (lg.type === "assignee") {
        // resolve names for old/new
        const prevUser = lg.oldVal
          ? await userModel.findById(lg.oldVal).lean()
          : null;
        const newUser = lg.newVal
          ? await userModel.findById(lg.newVal).lean()
          : null;

        await ActivityLog.create({
          employeeId: req.body.userId,
          employeeName: userName,
          entityType: "Assignment",
          entityId: a._id,
          action: `Changed assignment assignee`,
          oldValue: prevUser?.name || null,
          newValue: newUser?.name || null,
          ipAddress: req.ip,
        });
      }
    }

    return res.json({ success: true, assignment: a });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) fetch & delete
    const a = await Assignment.findByIdAndDelete(id);
    if (!a) return res.json({ success: false, message: "Not found" });
    await Report.findByIdAndUpdate(a.reportId, { status: "Submitted" });

    // 2) get user info
    const user = await userModel.findById(req.body.userId).lean();
    const userName = user?.name || "";

    // 3) log the deletion
    await ActivityLog.create({
      employeeId: req.body.userId,
      employeeName: userName,
      entityType: "Assignment",
      entityId: a._id,
      action: `Deleted assignment`,
      oldValue: a.status,
      newValue: null,
      ipAddress: req.ip,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// configure multer to store uploads in ./uploads
const upload = multer({ dest: "uploads/" });

// Upload site inspection PDF and mark completed
export const uploadSiteReport = [
  upload.single("report"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const status = req.body.status || "Completed";

      // 1) fetch previous assignment
      const prev = await Assignment.findById(id).lean();
      if (!prev) return res.json({ success: false, message: "Not found" });

      const file = req.file;
      if (!file) {
        return res.json({ success: false, message: "No file uploaded" });
      }

      // 2) apply upload + status update
      const assignment = await Assignment.findByIdAndUpdate(
        id,
        {
          status,
          siteInspectionReport: file.filename,
          originalFileName: file.originalname,
          accomplishmentDate: new Date(),
        },
        { new: true }
      );
      await Report.findByIdAndUpdate(assignment.reportId, { status });

      // 3) get user info
      const user = await userModel.findById(req.body.userId).lean();
      const userName = user?.name || "";

      // 4) log the upload
      await ActivityLog.create({
        employeeId: req.body.userId,
        employeeName: userName,
        entityType: "Assignment",
        entityId: assignment._id,
        action: `Uploaded site report "${file.originalname}"`,
        oldValue: prev.status,
        newValue: status,
        ipAddress: req.ip,
      });

      return res.json({ success: true, assignment });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },
];
