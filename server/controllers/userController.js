import userModel from "../models/userModel.js";
import ActivityLog from "../models/activityLogsModel.js"; // ← add this

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not Found" });
    }

    res.json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        position: user.position,
        email: user.email,
        phone: user.phone,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const listAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, "name position email phone");
    const mappedUsers = users.map((user) => ({
      id: user._id,
      fullName: user.name,
      position: user.position,
      email: user.email,
      phone: user.phone,
    }));
    // add count here
    res.json({
      success: true,
      users: mappedUsers,
      count: mappedUsers.length, // ← new
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, position, phone } = req.body;

  try {
    // 1) fetch only the safe fields (excludes password)
    const prev = await userModel
      .findById(id, "name email position phone")
      .lean();
    if (!prev) return res.json({ success: false, message: "User not found" });

    // 2) apply update
    const updated = await userModel
      .findByIdAndUpdate(
        id,
        { name, email, position, phone },
        { new: true, select: "name email position phone" }
      )
      .lean();
    if (!updated)
      return res.json({ success: false, message: "User not found" });

    // 3) lookup actor’s name
    const actor = await userModel.findById(req.body.userId, "name").lean();
    const actorName = actor?.name || "Unknown";

    // 4) build safe payloads
    const safeOld = { id: prev._id, ...prev };
    const safeNew = { id: updated._id, ...updated };

    // 5) log without ever touching password
    await ActivityLog.create({
      employeeId: req.body.userId,
      employeeName: actorName,
      entityType: "Employee",
      entityId: id,
      action: "Updated employee",
      oldValue: JSON.stringify(safeOld),
      newValue: JSON.stringify(safeNew),
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: "User updated" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) fetch only the safe fields
    const prev = await userModel
      .findById(id, "name email position phone")
      .lean();
    if (!prev) return res.json({ success: false, message: "User not found" });

    // 2) delete
    await userModel.findByIdAndDelete(id);

    // 3) lookup actor
    const actor = await userModel.findById(req.body.userId, "name").lean();
    const actorName = actor?.name || "Unknown";

    // 4) build safe payload
    const safeOld = { id: prev._id, ...prev };

    await ActivityLog.create({
      employeeId: req.body.userId,
      employeeName: actorName,
      entityType: "Employee",
      entityId: id,
      action: "Deleted employee",
      oldValue: JSON.stringify(safeOld),
      newValue: null,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const getOneUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id, "name email position phone");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        position: user.position,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
