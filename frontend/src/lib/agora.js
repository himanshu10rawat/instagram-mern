import AgoraRTC from "agora-rtc-sdk-ng";

export const createAgoraClient = () => {
  return AgoraRTC.createClient({
    mode: "live",
    codec: "vp8",
  });
};

export const createLocalTracks = async () => {
  const [microphoneTrack, cameraTrack] =
    await AgoraRTC.createMicrophoneAndCameraTracks();

  return {
    microphoneTrack,
    cameraTrack,
  };
};

export const stopAndCloseTracks = (tracks = []) => {
  tracks.forEach((track) => {
    if (track) {
      track.stop();
      track.close();
    }
  });
};
