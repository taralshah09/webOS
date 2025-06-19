import { Desktop } from "../models/desktop.models.js";
import { App } from "../models/app.models.js";
import { WindowInstance } from "../models/windowInstance.models.js";

// Get user's desktop configuration
export const getDesktop = async (req, res) => {
  try {
    let desktop = await Desktop.findOne({ owner: req.userId })
      .populate("desktopIcons.appId")
      .populate("taskbar.pinnedApps")
      .populate({
        path: "openWindows",
        populate: { path: "app" },
      });

    // If no desktop exists, create default one
    if (!desktop) {
      desktop = await createDefaultDesktop(req.userId);
    }

    res.json({
      success: true,
      data: desktop,
    });
  } catch (error) {
    console.error("Error fetching desktop:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch desktop configuration",
    });
  }
};

// Update desktop icon positions
export const updateDesktopIcons = async (req, res) => {
  try {
    const { desktopIcons } = req.body;

    const desktop = await Desktop.findOneAndUpdate(
      { owner: req.userId },
      {
        desktopIcons,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("desktopIcons.appId");

    if (!desktop) {
      return res.status(404).json({
        success: false,
        message: "Desktop not found",
      });
    }

    res.json({
      success: true,
      data: desktop.desktopIcons,
      message: "Desktop icons updated successfully",
    });
  } catch (error) {
    console.error("Error updating desktop icons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update desktop icons",
    });
  }
};

// Update single icon position (for real-time dragging)
export const updateIconPosition = async (req, res) => {
  try {
    const { iconId, position } = req.body;

    const desktop = await Desktop.findOneAndUpdate(
      {
        owner: req.userId,
        "desktopIcons._id": iconId,
      },
      {
        $set: {
          "desktopIcons.$.position": position,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!desktop) {
      return res.status(404).json({
        success: false,
        message: "Desktop icon not found",
      });
    }

    res.json({
      success: true,
      message: "Icon position updated",
    });
  } catch (error) {
    console.error("Error updating icon position:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update icon position",
    });
  }
};

// Update wallpaper
export const updateWallpaper = async (req, res) => {
  try {
    const { wallpaper } = req.body;

    const desktop = await Desktop.findOneAndUpdate(
      { owner: req.userId },
      {
        wallpaper,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!desktop) {
      return res.status(404).json({
        success: false,
        message: "Desktop not found",
      });
    }

    res.json({
      success: true,
      data: { wallpaper },
      message: "Wallpaper updated successfully",
    });
  } catch (error) {
    console.error("Error updating wallpaper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update wallpaper",
    });
  }
};

// Helper function to create default desktop
const createDefaultDesktop = async (userId) => {
  try {
    // Get system apps
    const systemApps = await App.find({
      type: "system",
      isInstalled: true,
    }).limit(6);

    // Create default desktop icons in a grid pattern
    const desktopIcons = systemApps.map((app, index) => ({
      appId: app._id,
      position: {
        x: 50 + (index % 3) * 120, // 3 icons per row
        y: 50 + Math.floor(index / 3) * 120,
      },
      visible: true,
    }));

    // Create desktop configuration
    const desktop = await Desktop.create({
      owner: userId,
      desktopIcons,
      taskbar: {
        position: "bottom",
        pinnedApps: systemApps.slice(0, 4).map((app) => app._id),
        autoHide: false,
      },
      openWindows: [],
    });

    // Populate the created desktop
    return await Desktop.findById(desktop._id)
      .populate("desktopIcons.appId")
      .populate("taskbar.pinnedApps");
  } catch (error) {
    console.error("Error creating default desktop:", error);
    throw error;
  }
};

export default {
  getDesktop,
  updateDesktopIcons,
  updateIconPosition,
  updateWallpaper,
};
