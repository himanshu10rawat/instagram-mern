import { Mic, MicOff, PhoneOff, Video, VideoOff, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  endLive,
  fetchAgoraRtcToken,
  joinLive,
  leaveLive,
  resetCurrentLive,
} from "../features/live/liveSlice";

const getAgoraConfig = (tokenData) => {
  return {
    appId: tokenData?.appId,
    channelName: tokenData?.channelName,
    token: tokenData?.token,
    uid: tokenData?.uid,
  };
};

const LiveRoomPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { liveId } = useParams();
  const [searchParams] = useSearchParams();

  const clientRef = useRef(null);
  const localTracksRef = useRef({
    microphoneTrack: null,
    cameraTrack: null,
  });

  const currentUser = useSelector((state) => state.auth.user);
  const { actionLoading, currentLive, error } = useSelector(
    (state) => state.live,
  );

  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [LiveVideoPlayer, setLiveVideoPlayer] = useState(null);

  const role = searchParams.get("role") === "host" ? "host" : "audience";
  const isHost = role === "host";

  const viewerCount = useMemo(() => {
    return remoteUsers.length + (joined ? 1 : 0);
  }, [joined, remoteUsers.length]);

  useEffect(() => {
    if (!liveId) return undefined;

    let agoraLib = null;

    const joinLiveRoom = async () => {
      try {
        if (!LiveVideoPlayer) {
          const module =
            await import("../features/live/components/LiveVideoPlayer");
          setLiveVideoPlayer(() => module.default);
        }

        const liveResult = await dispatch(joinLive(liveId));

        if (joinLive.rejected.match(liveResult)) return;

        const channelName =
          liveResult.payload?.channelName || liveResult.payload?._id || liveId;

        const uid =
          currentUser?._id?.slice(-6) ||
          Math.floor(Math.random() * 1000000).toString();

        const tokenResult = await dispatch(
          fetchAgoraRtcToken({
            channelName,
            role: isHost ? "publisher" : "subscriber",
            uid,
          }),
        );

        if (fetchAgoraRtcToken.rejected.match(tokenResult)) return;

        const agoraConfig = getAgoraConfig(tokenResult.payload);
        agoraLib = await import("../lib/agora");

        const client = agoraLib.createAgoraClient();
        clientRef.current = client;

        client.setClientRole(isHost ? "host" : "audience");

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video" || mediaType === "audio") {
            setRemoteUsers(Array.from(client.remoteUsers));
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", () => {
          setRemoteUsers(Array.from(client.remoteUsers));
        });

        client.on("user-left", () => {
          setRemoteUsers(Array.from(client.remoteUsers));
        });

        await client.join(
          agoraConfig.appId,
          agoraConfig.channelName,
          agoraConfig.token,
          agoraConfig.uid,
        );

        if (isHost) {
          const tracks = await agoraLib.createLocalTracks();

          localTracksRef.current = tracks;
          setLocalVideoTrack(tracks.cameraTrack);

          await client.publish([tracks.microphoneTrack, tracks.cameraTrack]);
        }

        setRemoteUsers(Array.from(client.remoteUsers));
        setJoined(true);
      } catch (joinError) {
        console.error("Agora join error:", joinError);
      }
    };

    joinLiveRoom();

    return () => {
      const cleanup = async () => {
        const { microphoneTrack, cameraTrack } = localTracksRef.current;

        if (agoraLib?.stopAndCloseTracks) {
          agoraLib.stopAndCloseTracks([microphoneTrack, cameraTrack]);
        }

        if (clientRef.current) {
          clientRef.current.removeAllListeners();
          await clientRef.current.leave();
        }

        dispatch(resetCurrentLive());
      };

      cleanup();
    };
  }, [LiveVideoPlayer, currentUser?._id, dispatch, isHost, liveId]);

  const handleToggleMic = async () => {
    const track = localTracksRef.current.microphoneTrack;

    if (!track) return;

    await track.setEnabled(!micEnabled);
    setMicEnabled((prev) => !prev);
  };

  const handleToggleCamera = async () => {
    const track = localTracksRef.current.cameraTrack;

    if (!track) return;

    await track.setEnabled(!cameraEnabled);
    setCameraEnabled((prev) => !prev);
  };

  const handleLeave = async () => {
    if (isHost) {
      await dispatch(endLive(liveId));
    } else {
      await dispatch(leaveLive(liveId));
    }

    navigate("/live");
  };

  return (
    <section className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">
            {currentLive?.title || "Live room"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isHost ? "You are hosting this live." : "You are watching live."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users size={18} />
          {viewerCount} watching
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-130 rounded-2xl bg-black p-3">
          {isHost && localVideoTrack && LiveVideoPlayer ? (
            <LiveVideoPlayer track={localVideoTrack} className="h-130 w-full" />
          ) : null}

          {!isHost && remoteUsers.length === 0 ? (
            <div className="flex h-130 items-center justify-center text-white">
              Waiting for host video...
            </div>
          ) : null}

          {!isHost
            ? remoteUsers.map((user) =>
                user.videoTrack && LiveVideoPlayer ? (
                  <LiveVideoPlayer
                    key={user.uid}
                    track={user.videoTrack}
                    className="h-130 w-full"
                  />
                ) : null,
              )
            : null}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Live Controls
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {joined ? "Connected to live room." : "Connecting..."}
          </p>

          <div className="mt-5 space-y-3">
            {isHost ? (
              <>
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                  {micEnabled ? "Mute Mic" : "Unmute Mic"}
                </button>

                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                  {cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={handleLeave}
              disabled={actionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <PhoneOff size={18} />
              {isHost ? "End Live" : "Leave Live"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default LiveRoomPage;
