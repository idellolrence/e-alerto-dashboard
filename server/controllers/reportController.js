import reportModel from "../models/reportModel.js";

// GET all reports
export const listAllReports = async (req, res) => {
  try {
    const reports = await reportModel.find({});
    const mapped = reports.map((r) => ({
      id: r._id,
      classification: r.classification,
      measurement: r.measurement,
      location: r.location,
      status: r.status,
      description: r.description,
      timestamp: r.timestamp,
      image: r.image_file,
    }));
    res.json({ success: true, reports: mapped });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// GET single report
export const getOneReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await reportModel.findById(id);
    if (!report) {
      return res.json({ success: false, message: "Report not found" });
    }

    const mapped = {
      id: report._id, // ✅ must be 'id'
      classification: report.classification,
      measurement: report.measurement,
      location: report.location,
      status: report.status,
      description: report.description,
      timestamp: report.timestamp,
      image: report.image_file, // ✅ must be 'image'
    };

    res.json({ success: true, report: mapped });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// CREATE new report
export const createReport = async (req, res) => {
  try {
    const {
      reportID,
      classification,
      measurement,
      location,
      status,
      username,
      description,
      image_file,
    } = req.body;

    const newReport = new reportModel({
      reportID,
      classification,
      measurement,
      location,
      status,
      username,
      description,
      image_file,
    });

    await newReport.save();
    res.json({ success: true, message: "Report created" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// UPDATE report
export const updateReport = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updated = await reportModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Report updated" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// DELETE report
export const deleteReport = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await reportModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Report deleted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// For Visualization
export const getReportAnalytics = async (req, res) => {
  const { start, end } = req.query;

  try {
    // 1) build an optional match stage
    const matchStage =
      start && end
        ? [
            {
              $match: {
                timestamp: {
                  $gte: new Date(start),
                  $lte: new Date(end),
                },
              },
            },
          ]
        : [];

    // 2) group by day and count
    const pipeline = [
      ...matchStage,
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      // 3) sort by date ascending
      { $sort: { _id: 1 } },
      // 4) project into { label, count }
      {
        $project: {
          _id: 0,
          label: "$_id",
          count: 1,
        },
      },
    ];

    const result = await reportModel.aggregate(pipeline);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getReportAnalytics:", err);
    return res.json({ success: false, message: err.message });
  }
};

export const getStatusAnalytics = async (req, res) => {
  const { start, end } = req.query;

  try {
    // If both start & end are given, filter by range
    const matchStage =
      start && end
        ? [
            {
              $match: {
                timestamp: { $gte: new Date(start), $lte: new Date(end) },
              },
            },
          ]
        : [];

    const pipeline = [
      // 1) optional date‐range filter
      ...matchStage,

      // 2) group by day + status
      {
        $group: {
          _id: {
            label: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },

      // 3) pivot statuses into an array of k/v
      {
        $group: {
          _id: "$_id.label",
          counts: { $push: { k: "$_id.status", v: "$count" } },
        },
      },

      // 4) turn that array into a `data` object
      {
        $project: {
          label: "$_id",
          data: { $arrayToObject: "$counts" },
        },
      },

      // 5) fill in missing statuses with 0
      {
        $addFields: {
          Submitted: { $ifNull: ["$data.Submitted", 0] },
          Accepted: { $ifNull: ["$data.Accepted", 0] },
          "In-progress": { $ifNull: ["$data.In-progress", 0] },
          Completed: { $ifNull: ["$data.Completed", 0] },
          Rejected: { $ifNull: ["$data.Rejected", 0] },
        },
      },

      // 6) drop the helper `data` field and sort by date
      {
        $project: {
          _id: 0,
          label: 1,
          Submitted: 1,
          Accepted: 1,
          "In-progress": 1,
          Completed: 1,
          Rejected: 1,
        },
      },
      { $sort: { label: 1 } },
    ];

    const result = await reportModel.aggregate(pipeline);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

/* Get Status Count */
export const getStatusCounts = async (req, res) => {
  try {
    const counts = await reportModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Submitted: 0,
      Accepted: 0,
      "In-progress": 0,
      Completed: 0,
      Rejected: 0,
    };

    counts.forEach((entry) => {
      result[entry._id] = entry.count;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
