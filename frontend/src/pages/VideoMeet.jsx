import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, Snackbar, TextField, Tooltip } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import server from "../environment";
import { motion, AnimatePresence } from "framer-motion";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FF9839" },
    secondary: { main: "#6c63ff" },
    background: { default: "#050508", paper: "#111118" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#2a2a3e" },
            "&:hover fieldset": { borderColor: "#6c63ff" },
            "&.Mui-focused fieldset": { borderColor: "#FF9839" },
            backgroundColor: "#0a0a0f",
          },
          "& .MuiInputLabel-root": { color: "#a0a0b0" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
          "& .MuiOutlinedInput-input": { color: "#ffffff" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(135deg, #FF9839, #e07820)",
          boxShadow: "0 4px 20px rgba(255,152,57,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #e07820, #FF9839)",
            boxShadow: "0 6px 28px rgba(255,152,57,0.4)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { color: "#ffffff" } },
    },
  },
});

const server_url = server;

const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// RTCPeerConnection instances keyed by remote socket id
var connections = {};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  // Extract meeting ID from current URL path (e.g. /abc-defg-hij → abc-defg-hij)
  const meetingId = window.location.pathname.replace("/", "");

  // ─── Permissions & initial local stream ──────────────────────────────────
  useEffect(() => {
    getPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: !!videoPermission,
        audio: !!audioPermission,
      });
      window.localStream = stream;
      if (localVideoref.current) localVideoref.current.srcObject = stream;
    } catch (err) {
      console.log(err);
    }
  };

  // ─── Enter meeting ────────────────────────────────────────────────────────
  const connect = () => {
    setAskForUsername(false);
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // ─── Toggle video (enable/disable track — no re-negotiation needed) ───────
  const handleVideo = () => {
    setVideo((prev) => {
      const next = !prev;
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  // ─── Toggle audio ─────────────────────────────────────────────────────────
  const handleAudio = () => {
    setAudio((prev) => {
      const next = !prev;
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  // ─── Screen share ─────────────────────────────────────────────────────────
  const handleScreen = async () => {
    if (!screen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        const oldVideoTrack = window.localStream?.getVideoTracks()[0];

        // Replace the video sender in every RTCPeerConnection
        for (let id in connections) {
          const sender = connections[id]
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        }

        if (localVideoref.current) localVideoref.current.srcObject = screenStream;
        window.localStream = screenStream;
        setScreen(true);

        screenTrack.onended = () => stopScreenShare();
      } catch (e) {
        console.log(e);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable,
      });
      const cameraVideoTrack = cameraStream.getVideoTracks()[0];

      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(cameraVideoTrack);
      }

      window.localStream = cameraStream;
      if (localVideoref.current) localVideoref.current.srcObject = cameraStream;
    } catch (e) {
      console.log(e);
    }
    setScreen(false);
  };

  // ─── End call ─────────────────────────────────────────────────────────────
  const handleEndCall = () => {
    try {
      if (localVideoref.current?.srcObject) {
        localVideoref.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      for (let id in connections) {
        connections[id].close();
      }
      connections = {};
    } catch (e) {}
    window.location.href = "/";
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const addMessage = (data, sender, socketIdSender, timestamp) => {
    setMessages((prev) => [
      ...prev,
      { sender, data, timestamp: timestamp || new Date().toISOString() },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
  };

  // ─── WebRTC signalling helpers ────────────────────────────────────────────
  const sendOffer = (id) => {
    connections[id]
      .createOffer()
      .then((desc) => connections[id].setLocalDescription(desc))
      .then(() => {
        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({ sdp: connections[id].localDescription })
        );
      })
      .catch((e) => console.log(e));
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((desc) => connections[fromId].setLocalDescription(desc))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: connections[fromId].localDescription })
                );
              })
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log(e));
    }

    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.log(e));
    }
  };

  // ─── Socket + RTCPeerConnection setup ────────────────────────────────────
  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        setVideos((v) => v.filter((vid) => vid.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        // Create an RTCPeerConnection for every client in the room
        clients.forEach((socketListId) => {
          if (connections[socketListId]) return; // already exists

          connections[socketListId] = new RTCPeerConnection(peerConfig);

          // Send ICE candidates as they are discovered
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Incoming remote stream → add to video grid
          connections[socketListId].ontrack = (event) => {
            const remoteStream = event.streams[0];
            const exists = videoRef.current.find((v) => v.socketId === socketListId);
            if (exists) {
              setVideos((videos) => {
                const updated = videos.map((v) =>
                  v.socketId === socketListId ? { ...v, stream: remoteStream } : v
                );
                videoRef.current = updated;
                return updated;
              });
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: remoteStream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updated = [...videos, newVideo];
                videoRef.current = updated;
                return updated;
              });
            }
          };

          // Add local tracks to the peer connection
          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        // The user who just joined (us) creates offers to all existing participants
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            sendOffer(id2);
          }
        }
      });
    });
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  const controlButtonStyle = {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "50%",
    padding: "10px",
    margin: "0 4px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <AnimatePresence mode="wait">
          {askForUsername ? (
            // ── Lobby ──────────────────────────────────────────────────────
            <motion.div
              key="lobby"
              className={styles.lobbyContainer}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Enter the Lobby
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <video ref={localVideoref} autoPlay muted className={styles.lobbyVideo} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <TextField
                  label="Your Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  sx={{ minWidth: "220px" }}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    variant="contained"
                    onClick={connect}
                    sx={{ py: 1.8, px: 3, borderRadius: "10px", fontWeight: 700 }}
                  >
                    Connect
                  </Button>
                </motion.div>
              </motion.div>

              {/* Meeting ID card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 18px",
                  background: "rgba(108,99,255,0.1)",
                  border: "1px solid rgba(108,99,255,0.3)",
                  borderRadius: "12px",
                  minWidth: "300px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#a0a0b0", fontSize: "0.72rem", marginBottom: "2px" }}>
                    Meeting ID — share this with others
                  </p>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", letterSpacing: "1px" }}>
                    {meetingId}
                  </p>
                </div>
                <Tooltip title={copied ? "Copied!" : "Copy ID"}>
                  <IconButton onClick={handleCopyId} size="small" sx={{ color: copied ? "#FF9839" : "#a0a0b0" }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </motion.div>
          ) : (
            // ── Meeting room ───────────────────────────────────────────────
            <motion.div
              key="meet"
              className={styles.meetVideoContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Chat panel */}
              <AnimatePresence>
                {showModal && (
                  <motion.div
                    className={styles.chatRoom}
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <div className={styles.chatContainer}>
                      <h1>Chat</h1>
                      <div className={styles.chattingDisplay}>
                        {messages.length !== 0 ? (
                          messages.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                marginBottom: "12px",
                                padding: "10px 12px",
                                background: "rgba(108,99,255,0.1)",
                                borderRadius: "10px",
                                border: "1px solid rgba(108,99,255,0.2)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "4px",
                                }}
                              >
                                <p style={{ fontWeight: "bold", color: "#FF9839", fontSize: "0.82rem" }}>
                                  {item.sender}
                                </p>
                                <span style={{ color: "#555570", fontSize: "0.72rem" }}>
                                  {formatTime(item.timestamp)}
                                </span>
                              </div>
                              <p style={{ color: "#e0e0e8", fontSize: "0.88rem" }}>
                                {item.data}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <p style={{ color: "#a0a0b0", fontSize: "0.9rem", textAlign: "center", marginTop: "2rem" }}>
                            No messages yet
                          </p>
                        )}
                      </div>
                      <div className={styles.chattingArea}>
                        <TextField
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                          label="Message"
                          variant="outlined"
                          size="small"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            onClick={sendMessage}
                            sx={{ borderRadius: "8px", minWidth: "60px" }}
                          >
                            Send
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Control bar */}
              <motion.div
                className={styles.buttonContainers}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton onClick={handleVideo} style={controlButtonStyle}>
                    {video ? <VideocamIcon /> : <VideocamOffIcon style={{ color: "#ff5555" }} />}
                  </IconButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton
                    onClick={handleEndCall}
                    style={{
                      ...controlButtonStyle,
                      background: "rgba(255,50,50,0.25)",
                      border: "1px solid rgba(255,50,50,0.3)",
                    }}
                  >
                    <CallEndIcon style={{ color: "#ff4444" }} />
                  </IconButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton onClick={handleAudio} style={controlButtonStyle}>
                    {audio ? <MicIcon /> : <MicOffIcon style={{ color: "#ff5555" }} />}
                  </IconButton>
                </motion.div>

                {screenAvailable && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton onClick={handleScreen} style={controlButtonStyle}>
                      {screen ? (
                        <ScreenShareIcon style={{ color: "#6c63ff" }} />
                      ) : (
                        <StopScreenShareIcon />
                      )}
                    </IconButton>
                  </motion.div>
                )}

                <Badge badgeContent={newMessages} max={999} color="warning">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton
                      onClick={() => { setModal(!showModal); setNewMessages(0); }}
                      style={controlButtonStyle}
                    >
                      <ChatIcon />
                    </IconButton>
                  </motion.div>
                </Badge>
              </motion.div>

              {/* Local video (picture-in-picture) */}
              <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted />

              {/* Remote participant videos */}
              <div className={styles.conferenceView}>
                {videos.map((vid) => (
                  <motion.div
                    key={vid.socketId}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <video
                      data-socket={vid.socketId}
                      ref={(ref) => {
                        if (ref && vid.stream) ref.srcObject = vid.stream;
                      }}
                      autoPlay
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Meeting ID copied to clipboard"
      />
    </ThemeProvider>
  );
}
