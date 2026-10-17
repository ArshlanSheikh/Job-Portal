import Notification from "./notification.model.js";

/**
 * Get paginated notifications for the authenticated user
 */
const GetMyNotifications = async (req, res) => {
  try {
    console.log("Hit GetMyNotifications api...");
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { recipientId: req.user._id };
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("senderId", "name avatar");

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        total,
        unreadCount,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMyNotifications", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get count of unread notifications
 */
const GetUnreadCount = async (req, res) => {
  try {
    console.log("Hit GetUnreadCount api...");
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Unread count retrieved",
      data: { unreadCount },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetUnreadCount", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Mark a single notification as read
 */
const MarkAsRead = async (req, res) => {
  try {
    console.log("Hit MarkAsRead api...");
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
        data: null,
        error: "NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle MarkAsRead", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read for current user
 */
const MarkAllAsRead = async (req, res) => {
  try {
    console.log("Hit MarkAllAsRead api...");
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: null,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle MarkAllAsRead", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 */
const DeleteNotification = async (req, res) => {
  try {
    console.log("Hit DeleteNotification api...");
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
        data: null,
        error: "NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle DeleteNotification", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      data: null,
      error: error.message,
    });
  }
};

export {
  GetMyNotifications,
  GetUnreadCount,
  MarkAsRead,
  MarkAllAsRead,
  DeleteNotification,
};
