import Analytics from "../models/analytics.model.js";

const trackAnalytics = async ({
  owner,
  viewer = null,
  type,
  post = null,
  reel = null,
  story = null,
  source = "direct",
  device = "",
  ip = "",
}) => {
  if (!owner || !type) return;

  if (viewer && owner.toString() === viewer.toString()) {
    return;
  }

  await Analytics.create({
    owner,
    viewer,
    type,
    post,
    reel,
    story,
    metadata: {
      source,
      device,
      ip,
    },
  });
};

export default trackAnalytics;
