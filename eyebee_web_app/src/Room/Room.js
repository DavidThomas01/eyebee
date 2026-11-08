import React, { useState, useEffect, useRef } from "react";

import "./HexGrid.css";

import { ThemeProvider, StyledEngineProvider, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme, createTheme, adaptV4Theme } from '@mui/material/styles';
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import CloseIcon from "@mui/icons-material/Close";

import makeStyles from '@mui/styles/makeStyles';

import MediaPlayerWidget from "../MediaPlayerWidget";
import RoomActionsWidget from "./RoomActionsWidget";

import WebRTCManager from "../WebRTCManager";
import config from '../config';
import RTCPeerConnectionFactory from "../RTCPeerConnectionFactory";
import RTCIceCandidateFactory from "../RTCIceCandidateFactory";
import SideBoxWidget from "./SideBoxWidget";
import Screen from "../Screen";
import ScreenView from "../ScreenView";
import RoomGrid from "../RoomGrid";
import CreateNewSubRoom from "./CreateNewSubRoom";
import MobileRoomBar from "./MobileRoomBar";
import MobileRoomGrid from "./MobileRoomGrid";
import RoomOptionsSheet from "./RoomOptionsSheet";
import RoomInviteSheet from "./RoomInviteSheet";
import ConnectionStatusSheet from "./ConnectionStatusSheet";
import MobileParticipantsSheet from "./MobileParticipantsSheet";
import ConnectionHexes from "../PreJoin/ConnectionHexes";

const mobileTheme = createTheme(adaptV4Theme({
  palette: {
    mode: "dark",
    background: {
      default: "#000"
    },
    primary: {
      main: "#F2C600",
      contrastText: "#17130A"
    },
    secondary: {
      main: "#FAFAFA",
      contrastText: "#17130A"
    },
    text: {
      primary: "#F5F1EC",
      secondary: "#A79F96"
    },
    divider: "#332E29",
    lighterBg: {
      main: "#1C1C1C"
    },
    action: {
      backgroundColor: "#AAAAAA",
      selected: "#2D2D2D"
    }
  },
  typography: {
    fontFamily: "var(--font-brand)"
  }
}));

const useStyles = makeStyles(theme => ({
  mainBox: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
    flexDirection: "column",
    flex: "2"
  },
  videoCallBox: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    flexDirection: "column",
    flex: "2"
  },
  sideBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    color: "#f5f5f5",
    width: "100%",
  },
  roomPlayersBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: "2",
  },
  localMediaBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  mobilePage: {
    "--color-focus": "var(--color-brand-yellow-strong)",
    height: "100dvh",
    minHeight: "100dvh",
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#000",
    color: "#F5F1EC",
    fontFamily: "var(--font-brand)",
    overflow: "hidden"
  },
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 16px",
    paddingTop: "max(12px, env(safe-area-inset-top))",
    backgroundColor: "#000"
  },
  mobileHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0
  },
  mobileTitle: {
    margin: 0,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "20px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#F5F1EC"
  },
  mobileHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0
  },
  mobileMark: {
    width: "38px",
    height: "17px",
    display: "block",
    flexShrink: 0
  },
  mobileMarkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 0,
    border: 0,
    background: "transparent",
    cursor: "pointer"
  },
  mobileCount: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    height: "36px",
    padding: "0 10px",
    border: 0,
    borderRadius: "10px",
    backgroundColor: "var(--color-brand-white)",
    color: "var(--color-brand-ink)",
    fontFamily: "var(--font-brand)",
    fontSize: "14px",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "var(--color-brand-line)"
    }
  },
  mobileInvite: {
    width: "40px",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    color: "#111111",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#E0E0E0"
    }
  },
  mobileMain: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "12px"
  },
  mobileSelf: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  mobileSideOverlay: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: "calc(76px + env(safe-area-inset-bottom))",
    zIndex: 450,
    backgroundColor: "rgba(0, 0, 0, 0.55)"
  },
  mobileSideSheet: {
    position: "fixed",
    left: "12px",
    right: "12px",
    top: "max(72px, calc(env(safe-area-inset-top) + 64px))",
    bottom: "calc(84px + env(safe-area-inset-bottom))",
    zIndex: 460,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1C1C1C",
    border: "1px solid #2E2E2E",
    borderRadius: "18px",
    overflow: "hidden"
  },
  mobileSideHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #2E2E2E"
  },
  mobileSideTitle: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#F5F1EC"
  },
  mobileClose: {
    width: "36px",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 0,
    border: 0,
    background: "transparent",
    color: "#F5F1EC",
    cursor: "pointer"
  }
}));

const getPlayerSize = (userType, smScreen, mdScreen, lgScreen) => {
  let size = 98;

  if (smScreen) {
    size = 138
  }

  if (mdScreen) {
    size = 176
  }

  if (lgScreen) {
    size = 214
  }

  if (userType === "presenter") {
    size = Math.ceil(size * 0.60);
  }

  if (userType === "spectator") {
    size = Math.ceil(size * 0.40);
  }

  return size;
}

const Room = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const [roomManager, setRoomManager] = useState(null);
  const [peerId, setPeerId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isPresenter, setIsPresenter] = useState(false);
  const [isMainPresenter, setIsMainPresenter] = useState(false);
  const [roomUsers, setRoomUsers] = useState({});
  const [webrtcManager, setWebRTCManager] = useState(null);
  const [remotePeerStreams, setRemotePeerStreams] = useState({});
  const [presentationRequested, setPresentationRequested] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(false);


  const [subRooms, setSubRooms] = useState([]);
  const [createSubRooState, setCreateSubRooState] = useState(false);

  const [sideBoxState, setSideBoxState] = useState({
    opened: false,
    section: ""
  });
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [connectionLevel, setConnectionLevel] = useState(3);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const leavingRef = useRef(false);
  const [localCameraOn, setLocalCameraOn] = useState(props.localCamera ? props.localCamera.isVideoEnabled() : false);
  const [localMicOn, setLocalMicOn] = useState(props.localCamera ? props.localCamera.isAudioEnabled() : false);

  const xsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const smScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const mdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const lgScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [playerSizes, setPlayerSizes] = useState({
    owner: 20,
    presenter: 110,
    spectator: 5
  });

  const [screen, setScreen] = useState(null);
  const [currentSection, setCurrentSection] = useState("main");
  const [selectedScreenPresenter, setSelectedScreenPresenter] = useState(null);

  const [defaultVideoConstraints] = useState({
    height: {
      ideal: 240,
      max: 480
    },
    width: {
      ideal: 320,
      max: 640
    },
    frameRate: {
      min: 5,
      ideal: 15,
      max: 15
    }
  });

  const [lowVideoConstraints] = useState({
    height: {
      ideal: 240,
      max: 480
    },
    width: {
      ideal: 320,
      max: 640
    },
    frameRate: {
      ideal: 2,
      max: 5
    }
  });

  const [oldScreenPresenter, setOldScreenPresenter] = useState(null);


  const onUserJoined = data => {
    setRoomUsers({
      ...data.users
    });
      
    if(data.newUser.sfu){
      webrtcManager.updatePeerSFUOrder(data.newUser.id, data.newUser.sfuOrder);
    }

  };

  const onPeerMediaChanged = (data, peer) => {



    if (data.type === "deleted") {


      if(data.label === "screen" && selectedScreenPresenter && selectedScreenPresenter.id === peer.id){

        setOldScreenPresenter(null);  
        setCurrentSection("main");
        setSelectedScreenPresenter(null);

      }

      let streamToRemove = remotePeerStreams[peer.id][data.streamId];
      if (streamToRemove) {


        webrtcManager.removeMediaFromPCs(streamToRemove);

      }





      
    }else{
      if(roomUsers[props.userData.peerId].assignedSFU === peer.id && data.label !== "camera" ){
        webrtcManager.requestPeerStream(peer.id,data.streamId);
      }

    }

    roomUsers[peer.id].localStreams = peer.localStreams;
    webrtcManager.updatePeerLocalStreams(peer.id, peer.localStreams);
    setRoomUsers({
      ...roomUsers
    });

  };

  const onSFUAssigned = async (peer, users) => {

    if (peer.id === props.userData.peerId) {

      let sfuPeer = users[peer.assignedSFU];


      webrtcManager.assignedSFU = sfuPeer;

      webrtcManager.updatePeerLocalStreams(sfuPeer.id, users[sfuPeer.id].localStreams);
  

      let peerConnExists = webrtcManager.getPCToPeer(peer.assignedSFU);

      if (peerConnExists) {
        webrtcManager.addLocalStreamsToPC(peer.id, peer.assignedSFU);
      } else {
        await requestPeerConnections(sfuPeer, webrtcManager);
        await webrtcManager.requestPeersStreams(users, props.userData.isOwner, props.userData.isPresenter);
      }


    } else {
      webrtcManager.updatePeerAssignedSFU(peer.id, peer.assignedSFU);
    }

    setRoomUsers({
      ...users
    });

  };


  useEffect(() => {
    if (roomManager) {

      roomManager.addRoomEventCallbacks({
        "onUserJoined": onUserJoined,
        "onPeerMediaChanged": onPeerMediaChanged,
        "onUsers": onUsers,
        "onChatMessage": onChatMessage,
        "onNewSubRoom": onNewSubRoom,
        "onNewPresenter": onNewPresenter,
        "onUserPresentationRequest": onUserPresentationRequest,
        "onUserPresentationCancelled": onUserPresentationCancelled,
        "onUserPresentationGranted": onUserPresentationGranted,
        "onUserPresentationRemoved": onUserPresentationRemoved,
        "onUserLeft": onUserLeft,
        "onNewMainPresenter": onNewMainPresenter,
        "onSFUAssigned": onSFUAssigned,
        "onError": onRoomManagerError
      });

      return () => {
        roomManager.removeRoomEventCallbacks();
      }

    }




  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomManager, roomUsers, remotePeerStreams]);

  useEffect(() => {

    if (webrtcManager) {
      webrtcManager.setEventCallbacks({
        "onRemoteTrack": onRemoteTrack,
        "onRemoteStreamRemoved": onRemoteStreamRemoved,
        "onClonedStreamsUpdated": onClonedStreamsUpdated,
        "onStreamLoaded":onStreamLoaded
      });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webrtcManager, roomUsers, remotePeerStreams,oldScreenPresenter]);

  const onChatMessage = (msg, messages) => {
    if (messages && messages.length > 0) {
      setNewMessages(true);
    }

    setMessages([...messages]);

  }

  const onNewSubRoom = (msg, subRooms) => {
    setSubRooms([...subRooms]);
  }

  const onNewPresenter = (newPresenter, updatedUserList) => {


    setRoomUsers({
      ...updatedUserList
    });

  };

  const closePeerConnection = (peer) => {
    webrtcManager.closePeerConnection(peer);
  }

  const deleteRemotePeerStreams = peerId => {
    if (remotePeerStreams[peerId]) {
      let streamIds = Object.keys(remotePeerStreams[peerId]);
      streamIds.forEach(s => {
        delete remotePeerStreams[peerId][s];
      });
      delete remotePeerStreams[peerId];
    }


  }

  useEffect(() => {
    if (roomUsers[props.userData.peerId]) {
      setIsOwner(roomUsers[props.userData.peerId].owner);
      setIsPresenter(roomUsers[props.userData.peerId].presenter);
      setIsMainPresenter(roomUsers[props.userData.peerId].mainPresenter);

    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUsers]);

  const onUserLeft = data => {
    closePeerConnection({
      peerId: data.userId
    },true);
    deleteRemotePeerStreams(data.userId);

    setRemotePeerStreams({
      ...remotePeerStreams
    });



    delete roomUsers[data.userId];

    setRoomUsers({
      ...roomUsers
    });

    if (webrtcManager.assignedSFU && data.userId === webrtcManager.assignedSFU.id) {
      webrtcManager.assignedSFU = null;
      delete roomUsers[props.userData.peerId].assignedSFU;

    }


  };

  const onNewMainPresenter = (mainPresenterId, users) => {


      webrtcManager.updateMainPresenter(mainPresenterId);

    setRoomUsers({ ...users });

  }

  const onUserPresentationRequest = (user, users) => {

    setRoomUsers({
      ...users
    });

  };

  const onUserPresentationCancelled = (data, users) => {

    if (users[data.userId]) {

      if (!isOwner && !isPresenter) {

        closePeerConnection({
          peerId: data.userId
        });

        deleteRemotePeerStreams(data.userId);

      }

      if (data.userId === peerId) {

        if(props.localCamera){

          props.localCamera.mute();
          applyLocalVideoConstraints(lowVideoConstraints).then(() => {
          }).catch(err => {
          });

        }
        

      }


      setRoomUsers({
        ...users
      });
    }

  };

  const onUserPresentationGranted = (data, users) => {

    if (data.target === peerId) {
      setPresentationRequested(false);
      setIsPresenter(true);

      applyLocalVideoConstraints(defaultVideoConstraints).then(() => {
      }).catch(err => {
      });

    } else {
      setRoomUsers({
        ...users
      });

    }



  };



  const onUsers = async users => {

    setRoomUsers({
      ...users
    });
  };

  const removeConnectedSimplePeers = (users) => {
    Object.keys(users).forEach(u => {
      let user = users[u];
      if (user.id !== peerId) {
        if (!user.owner && !user.presenter) {
          closePeerConnection({
            peerId: user.id
          });
          deleteRemotePeerStreams(user.id);
          delete users[user.id];
          setRoomUsers({
            ...users
          })
        }
      }

    });


  }

  const applyLocalVideoConstraints = async videoConstraints => {
    if (props.localCamera && props.localCamera.getStream()) {
      await props.localCamera.getStream().getVideoTracks()[0].applyConstraints(videoConstraints);
      return true;
    } else {
      // eslint-disable-next-line no-throw-literal
      throw "NO_STREAM_IN_LOCAL_CAMERA";
    }

  }

  const onUserPresentationRemoved = (data, users) => {

    if (data.target === peerId) {
      setPresentationRequested(false);
      setIsPresenter(false);


      let rs = {
        ...roomUsers
      }

      setRoomUsers({
        ...users
      })

      if(props.localCamera){
        props.localCamera.mute();
        applyLocalVideoConstraints(lowVideoConstraints).then(() => {
        }).catch(err => {
        }).finally(() => {
          removeConnectedSimplePeers(rs);
        });
      }
      



    } else {

      if (!isOwner && !isPresenter) {
        closePeerConnection({
          peerId: data.target
        });
        deleteRemotePeerStreams(data.target);

      }


      setRoomUsers({
        ...users
      })

    }



  };

  const onRemoteTrack = (peerId, track, stream) => {
    if (!remotePeerStreams[peerId]) {
      remotePeerStreams[peerId] = {};
    }



    remotePeerStreams[peerId][stream.id] = stream;


    if (remotePeerStreams[peerId][stream.id].active) {




    } else {
      delete remotePeerStreams[peerId][stream.id];
    }

    setRemotePeerStreams({
      ...remotePeerStreams
    });
  }

  const onStreamLoaded = (peerId, stream,streamLabel) => {
    if( streamLabel === "screen"){
        if(oldScreenPresenter&&!props.userData.sfu){
          let currScreenStreamId = Object.keys(oldScreenPresenter.localStreams).find( ls => {
            return oldScreenPresenter.localStreams[ls].label === "screen";
          });
          let currScreenStream = remotePeerStreams[oldScreenPresenter.id][currScreenStreamId];
          webrtcManager.disconnectRemoteMedia(currScreenStream,oldScreenPresenter.id);
          delete remotePeerStreams[oldScreenPresenter.id][currScreenStreamId];
          setRemotePeerStreams({
            ...remotePeerStreams
          });
        }




    }

    if(streamLabel !== "camera" && roomUsers[peerId].mainPresenter){
      if(currentSection !== "screen"){
        goToScreen(roomUsers[peerId])
      }
      
    }

  }

  const onRemoteStreamRemoved = (peerId, streamObj) => {

    delete remotePeerStreams[peerId][streamObj.id];
    setRemotePeerStreams({
      ...remotePeerStreams
    });
  }

  const onRoomManagerError = error => {
    console.error("Error on room Manager", { error: error });
  }

  const sendLeaveRequest = () => {
    let body = {
      roomId: props.userData.roomId,
      userId: props.userData.peerId
    }

    fetch("/videocall/api/session/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

  }

  const requestPeerConnections = async (assignedSFUPeer, webrtcManager) => {
    try {

      if (roomUsers && Object.keys(roomUsers).length > 0) {

        let sfuIds = Object.keys(roomUsers).filter(r => {
          if (roomUsers[r].sfu && r !== props.userData.peerId
            && r !== assignedSFUPeer.id) {
            return true;
          }
          return false;
        });

        Object.keys(roomUsers).forEach(p => {

          sfuIds.forEach(s => {
            if (!roomUsers[s].currConnectedPeers) {
              roomUsers[s].currConnectedPeers = [];
            }
            if (roomUsers[p].assignedSFU === s && roomUsers[s].currConnectedPeers.indexOf(p) === -1) {
              roomUsers[s].currConnectedPeers.push(p);
            }

          });


        });





        let targetPeers = [];

        sfuIds.forEach(e => {
          webrtcManager.updatePeerLocalStreams(e, roomUsers[e].localStreams);
          targetPeers.push(roomUsers[e]);
        });

        await webrtcManager.startWebRTCConnections(assignedSFUPeer, targetPeers);
        return true;

      } else {
        return false;
      }

    } catch (err) {
      console.error(err);
    }

  }

  const onClonedStreamsUpdated = (peerId, clonedStreams) => {

    roomUsers[peerId].clonedStreams = clonedStreams;
    setRoomUsers({
      ...roomUsers
    });
  }

  const handleBeforeUnloadEvent = e => {
    if(e.preventDefault && !leavingRef.current){
      e.preventDefault();
    }
    sendLeaveRequest();
  }

  useEffect(() => {

    setPeerId(props.userData.peerId);
    setIsOwner(props.userData.isOwner);
    setIsPresenter(props.userData.isPresenter);

    let users = props.roomManager.getUsers();

    let userData = users[props.userData.peerId];

    setIsMainPresenter(users[props.userData.peerId].mainPresenter);
    let testUsers = {}



    users = {
      ...users,
      ...testUsers
    }

    setRoomUsers(users);

    setRoomManager(props.roomManager);


    let rtcPeerConnFactory = new RTCPeerConnectionFactory();
    let rtcIceCandidateFactory = new RTCIceCandidateFactory();

    let wrtcManager = new WebRTCManager(props.userData.peerId, props.userData.roomId, rtcPeerConnFactory,
      rtcIceCandidateFactory, props.wsSocket, {
      'iceServers': config.getIceServers()
    }, {});

    wrtcManager.constraints = {
      preferredVideoCodecs: ["video/VP8"]
    }

    wrtcManager.sfu = userData.sfu;
    wrtcManager.sfuOrder = userData.sfuOrder;

    wrtcManager.setEventCallbacks({
      "onRemoteTrack": onRemoteTrack,
      "onRemoteStreamRemoved": onRemoteStreamRemoved,
      "onClonedStreamsUpdated": onClonedStreamsUpdated,
      "onStreamLoaded":onStreamLoaded
    });


    if(props.localCamera){
      wrtcManager.addLocalMedia(props.localCamera.getStream(), "camera");
    }
   
    Object.keys(users).forEach(u => {

      wrtcManager.updatePeerSFUOrder(users[u].id, users[u].sfuOrder);
      if(u.mainPresenter){
        wrtcManager.updateMainPresenter(users[u].id);
      }
      
      if(u.owner){
        wrtcManager.updateOwner(users[u].id);
      }
      
    });

    setWebRTCManager(wrtcManager);

    wrtcManager.listenToWebRTCMessages();

    props.roomManager.requestTargetSFU(props.userData.peerId, props.userData.roomId);









    window.addEventListener("beforeunload",handleBeforeUnloadEvent);
  

    let scr = new Screen(window.navigator);
    setScreen(scr);

    return () => {
      window.removeEventListener("beforeunload",handleBeforeUnloadEvent);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const readConnectionLevel = () => {
      if (!navigator.onLine) {
        setConnectionLevel(1);
        return;
      }

      const peerCount = Object.keys(roomUsers || {}).length;
      if (peerCount <= 1) {
        setConnectionLevel(4);
        return;
      }

      const remotePeers = webrtcManager ? Object.values(webrtcManager.remotePeers || {}) : [];
      const states = remotePeers
        .map(peer => peer.peerConn && (peer.peerConn.connectionState || peer.peerConn.iceConnectionState))
        .filter(Boolean);

      if (states.length === 0) {
        setConnectionLevel(3);
        return;
      }

      if (states.some(state => state === "connected" || state === "completed")) {
        setConnectionLevel(4);
      } else if (states.some(state => state === "connecting" || state === "new")) {
        setConnectionLevel(3);
      } else if (states.some(state => state === "disconnected")) {
        setConnectionLevel(2);
      } else {
        setConnectionLevel(1);
      }
    };

    readConnectionLevel();
    const interval = window.setInterval(readConnectionLevel, 2000);
    window.addEventListener("online", readConnectionLevel);
    window.addEventListener("offline", readConnectionLevel);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", readConnectionLevel);
      window.removeEventListener("offline", readConnectionLevel);
    };
  }, [webrtcManager, roomUsers]);

  const leaveRoom = async e => {

    leavingRef.current = true;
    try {
      webrtcManager.closeAllPCs();
    } catch (error) {
      console.error("leaveRoom: closeAllPCs failed", error);
    }
    window.location.assign("/");

  }

  const addLocalStream = (streamObj, label) => {
    webrtcManager.addLocalMedia(streamObj, label);
  }

  const removeLocalStream = (streamObj) => {
    webrtcManager.removeMediaFromPCs(streamObj);

  }

  const requestPresentation = () => {
    setPresentationRequested(true);
    roomUsers[props.userData.peerId].presentationRequested = true;
    setRoomUsers({
      ...roomUsers
    });

    roomManager.requestPresentation(props.userData.peerId, props.userData.roomId);
  }

  const cancelPresentation = () => {
    roomManager.cancelPresentation(props.userData.roomId, props.userData.peerId);
    roomUsers[props.userData.peerId].presentationRequested = false;
    setPresentationRequested(false);
    setIsPresenter(false);
    removeConnectedSimplePeers(roomUsers);

  }

  const removePresentation = target => {
    roomManager.removePresentation(props.userData.roomId, props.userData.peerId, target);
    if (roomUsers[target]) {
      roomUsers[target] = {
        ...roomUsers[target]
      }
      roomUsers[target].presentationRequested = false;
      roomUsers[target].presenter = false;
      setRoomUsers({
        ...roomUsers
      });

    }
  }

  const grantPresentation = reqPeerId => {
    roomManager.grantPresentation(props.userData.roomId, props.userData.peerId, reqPeerId);
    if (roomUsers[reqPeerId]) {
      roomUsers[reqPeerId] = {
        ...roomUsers[reqPeerId]
      }
      roomUsers[reqPeerId].presentationRequested = false;
      roomUsers[reqPeerId].presenter = true;
      setRoomUsers({
        ...roomUsers
      });
    }

  }

  const sendMessage = (roomId, userId, target, message) => {
    roomManager.sendMessage(props.userData.roomId, userId, target, message);
  }

  const toggleSideBox = sideBoxState => {

    if (sideBoxState.section === "chat") {
      setNewMessages(false);
    }
    setSideBoxState(sideBoxState);
  }

  const openConnectionSheet = () => {
    setOptionsOpen(false);
    setInviteOpen(false);
    toggleSideBox({ opened: false, section: "" });
    setConnectionOpen(true);
  }

  useEffect(() => {
    let sizes = {
      owner: getPlayerSize("owner", smScreen, mdScreen, lgScreen),
      presenter: getPlayerSize("presenter", smScreen, mdScreen, lgScreen),
      spectator: getPlayerSize("spectator", smScreen, mdScreen, lgScreen),
    }

    setPlayerSizes(sizes);

  }, [smScreen, mdScreen, lgScreen]);


  const toggleScreen = async () => {
    if (screen.getStream()) {
      removeLocalStream(screen.getStream());
      screen.stop();
    } else {
      await screen.start();
      addLocalStream(screen.getStream(), "screen");
    }

  }

  const backToMainSection = (stream) => {
      if(stream){
        

  
        let screenStream = stream;
        if(screenStream&&!props.userData.sfu){
          webrtcManager.disconnectRemoteMedia(screenStream,selectedScreenPresenter.id);
        }
        
        if(!props.userData.sfu&&selectedScreenPresenter){
          delete remotePeerStreams[selectedScreenPresenter.id][stream.id];
       
          setRemotePeerStreams({
            ...remotePeerStreams
          });

          setOldScreenPresenter(null);
        }

      }

      


    setCurrentSection("main");
    setSelectedScreenPresenter(null);
  }

  const goToScreen = peer => {

   
    if(!props.userData.sfu){

      if(selectedScreenPresenter){
        setOldScreenPresenter({
          ...selectedScreenPresenter
        });
      }
      
      

      let screenStreamId = Object.keys(peer.localStreams).find( ls => {
        return peer.localStreams[ls].label === "screen";
      });
      webrtcManager.requestPeerStream(peer.id,screenStreamId);
    }
    setSelectedScreenPresenter(peer);
    setCurrentSection("screen");


  }

  const cameraStateChanged = enabled => {
    roomUsers[props.userData.peerId].camera = enabled;
    setRoomUsers({
      ...roomUsers
    });
    roomManager.sendCameraState(props.userData.roomId, props.userData.peerId, enabled);
  }

  const micStateChanged = enabled => {
    roomUsers[props.userData.peerId].mic = enabled;
    setRoomUsers({
      ...roomUsers
    });
    roomManager.sendMicState(props.userData.roomId, props.userData.peerId, enabled);
  }

  const toggleLocalCamera = async () => {
    const cam = props.localCamera;
    if (!cam) {
      return;
    }
    if (!cam.getStream()) {
      await cam.start();
    } else if (cam.isVideoEnabled()) {
      cam.disableVideo();
    } else {
      cam.enableVideo();
    }
    const enabled = cam.isVideoEnabled();
    setLocalCameraOn(enabled);
    cameraStateChanged(enabled);
  }

  const toggleLocalMic = () => {
    const cam = props.localCamera;
    if (!cam) {
      return;
    }
    if (cam.isAudioEnabled()) {
      cam.mute();
    } else {
      cam.unmute();
    }
    const enabled = cam.isAudioEnabled();
    setLocalMicOn(enabled);
    micStateChanged(enabled);
  }

  const createSubRoom = (roomName, roomMax, roomType) => {
    roomManager.createSubRoom(props.userData.roomId, roomName, roomMax, roomType);
  }

  const toogleCreateNewSubRoom = () => {
    setCreateSubRooState(!createSubRooState);
    toggleSideBox({ section: "subrooms", opened: true });
  }









  if (!mdScreen) {
    const participantCount = Object.keys(roomUsers).length;
    const roomUrl = window.location.href;

    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={mobileTheme}>
          <CssBaseline />
          <div className={classes.mobilePage}>
            <header className={classes.mobileHeader}>
              {/* TODO(Juan): the real room name will come from the backend. */}
              <div className={classes.mobileHeaderLeft}>
                <p className={classes.mobileTitle}>[PLACEHOLDER]</p>
                <button
                  type="button"
                  className={classes.mobileMarkButton}
                  onClick={openConnectionSheet}
                  aria-label="Ver estado de conexión"
                >
                  <ConnectionHexes className={classes.mobileMark} level={connectionLevel} />
                </button>
              </div>
              <div className={classes.mobileHeaderRight}>
                <button
                  type="button"
                  className={classes.mobileCount}
                  onClick={() => {
                    setOptionsOpen(false);
                    setInviteOpen(false);
                    setConnectionOpen(false);
                    toggleSideBox({ opened: true, section: "participants" });
                  }}
                  aria-label="Ver participantes"
                >
                  <PersonOutlined fontSize="small" />
                  {participantCount}
                </button>
                <button
                  type="button"
                  className={classes.mobileInvite}
                  onClick={() => {
                    toggleSideBox({ opened: false, section: "" });
                    setOptionsOpen(false);
                    setInviteOpen(true);
                  }}
                  aria-label="Invitar a alguien"
                >
                  <PersonAddOutlined />
                </button>
              </div>
            </header>

            <main
              className={classes.mobileMain}
              onClick={event => {
                if (event.target === event.currentTarget) {
                  openConnectionSheet();
                }
              }}
            >
              {currentSection === "screen" && selectedScreenPresenter ? (
                <ScreenView
                  userData={props.userData}
                  roomUsers={roomUsers}
                  goToScreen={goToScreen}
                  playerSizes={playerSizes}
                  remotePeerStreams={remotePeerStreams}
                  onLeaveScreenView={backToMainSection}
                  presenterPlayerSize={playerSizes["presenter"] * 0.5}
                  label={selectedScreenPresenter.userName}
                  presenterData={selectedScreenPresenter}
                  localCamera={props.localCamera}
                  presenterStreams={(remotePeerStreams && remotePeerStreams[selectedScreenPresenter.id])}
                />
              ) : participantCount <= 1 ? (
                <div
                  className={classes.mobileSelf}
                  onClick={event => {
                    if (event.target === event.currentTarget) {
                      openConnectionSheet();
                    }
                  }}
                >
                  <MediaPlayerWidget
                    nomedia={!localCameraOn}
                    isCameraEnable={localCameraOn}
                    avatar={props.userData.avatar}
                    background={isPresenter ? "primary" : "secondary"}
                    volume={0}
                    label={props.userData.userName || null}
                    playerSize={250}
                    stream={props.localCamera && props.localCamera.getStream()}
                  />
                </div>
              ) : (
                <MobileRoomGrid
                  userData={props.userData}
                  roomUsers={roomUsers}
                  remotePeerStreams={remotePeerStreams}
                  localCamera={props.localCamera}
                  goToScreen={goToScreen}
                  grantPresentation={grantPresentation}
                  removePresentation={removePresentation}
                  onBackgroundClick={openConnectionSheet}
                />
              )}
            </main>

            <MobileRoomBar
              cameraOn={localCameraOn}
              micOn={localMicOn}
              optionsOpen={optionsOpen}
              onToggleCamera={toggleLocalCamera}
              onToggleMic={toggleLocalMic}
              onOpenOptions={() => {
                toggleSideBox({ opened: false, section: "" });
                setOptionsOpen(open => !open);
              }}
              onOpenPeople={() => {
                setOptionsOpen(false);
                toggleSideBox({ opened: true, section: "participants" });
              }}
              onOpenChat={() => {
                setOptionsOpen(false);
                toggleSideBox({ opened: true, section: "chat" });
              }}
              canShareScreen={isPresenter}
              presentationRequested={presentationRequested}
              onToggleScreen={toggleScreen}
              onTogglePresentation={presentationRequested ? cancelPresentation : requestPresentation}
              onLeave={leaveRoom}
            />

            <MobileParticipantsSheet
              open={sideBoxState.opened && sideBoxState.section === "participants"}
              onClose={() => toggleSideBox({ opened: false, section: "" })}
              roomUsers={roomUsers}
              userData={props.userData}
            />

            {sideBoxState.opened && sideBoxState.section === "chat" ? (
              <>
                <div
                  className={classes.mobileSideOverlay}
                  onMouseDown={() => toggleSideBox({ opened: false, section: "" })}
                />
                <div className={classes.mobileSideSheet}>
                  <div className={classes.mobileSideHead}>
                    <p className={classes.mobileSideTitle}>Chat</p>
                    <button
                      type="button"
                      className={classes.mobileClose}
                      onClick={() => toggleSideBox({ opened: false, section: "" })}
                      aria-label="Cerrar"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <SideBoxWidget
                    defaultSection="chat"
                    hideTabs
                    remotePeerStreams={remotePeerStreams}
                    sendMessage={sendMessage}
                    userData={props.userData}
                    removePresentation={removePresentation}
                    grantPresentation={grantPresentation}
                    roomUsers={roomUsers}
                    messages={messages}
                    createSubRoom={createSubRoom}
                    subRooms={subRooms}
                    toogleCreateNewSubRoom={toogleCreateNewSubRoom}
                    toggleSideBox={toggleSideBox}
                  />
                </div>
              </>
            ) : null}

            <RoomOptionsSheet
              open={optionsOpen}
              onClose={() => setOptionsOpen(false)}
              onInvite={() => {
                setOptionsOpen(false);
                setInviteOpen(true);
              }}
              roomUrl={roomUrl}
              cameraOn={localCameraOn}
              micOn={localMicOn}
              onToggleCamera={toggleLocalCamera}
              onToggleMic={toggleLocalMic}
            />

            <RoomInviteSheet
              open={inviteOpen}
              onClose={() => setInviteOpen(false)}
              roomUrl={roomUrl}
            />

            <ConnectionStatusSheet
              open={connectionOpen}
              onClose={() => setConnectionOpen(false)}
              userName={
                props.userData.userName ||
                (roomUsers[props.userData.peerId] && roomUsers[props.userData.peerId].userName) ||
                "Invitado"
              }
              isOwner={isOwner}
              capabilities={roomUsers[props.userData.peerId] && roomUsers[props.userData.peerId].capabilities}
            />
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme} >
        <CssBaseline />
        <div className={classes.mainBox}>
          <div className={classes.videoCallBox}>
            {createSubRooState && <CreateNewSubRoom toggleSideBox={toggleSideBox} toogleCreateNewSubRoom={toogleCreateNewSubRoom} createSubRoom={createSubRoom}></CreateNewSubRoom>}
            <div style={{
              display: "flex",
              flex: "2",
              width: "100%"
            }}>
              <div className={classes.roomPlayersBox}>

                {
                  !props.userData.isOwner && !isMainPresenter ?
                    (
                      <div className={classes.localMediaBox}>
                        <MediaPlayerWidget
                          nomedia={false}
                          isCameraEnable={props.localCamera ? props.localCamera.isVideoEnabled():false}
                          avatar={props.userData.avatar}
                          background={isPresenter ? "primary" : "secondary"}
                          volume={0} label={(props.userData && props.userData.userName) || props.userData.peerId}
                          playerSize={125} stream={props.localCamera && props.localCamera.getStream()} />

                      </div>
                    )
                    :
                    (
                      <div />
                    )
                }
                <div style={{
                  display: "flex",
                  flex: "2",
                  width: "100%",
                  position: "relative",
                  overflowY: "auto"
                }}>
                  <RoomGrid nomedia={false} userData={props.userData} roomUsers={roomUsers} playerSizes={playerSizes}
                    isMainPresenter={isMainPresenter} isOwner={isOwner} isPresenter={isPresenter}
                    localCamera={props.localCamera}
                    goToScreen={goToScreen} grantPresentation={grantPresentation}
                    remotePeerStreams={remotePeerStreams}
                    onPresentationRemoved={removePresentation} />
                </div>


              </div>

            </div>

          </div>

          <div style={{
            display: "flex",
            flex: "2",
            position: "absolute",
            top: "0",
            right: "0",
            left: "0",
            bottom: "4em",
            backgroundColor: theme.palette.background.default,
            zIndex: currentSection === "screen" ? "10" : "-2",
            flexDirection: "column"
          }}>
            {

              currentSection === "screen" ?
                (
                  <ScreenView
                    userData={props.userData}
                    roomUsers={roomUsers}
                    goToScreen={goToScreen}
                    playerSizes={playerSizes}
                    remotePeerStreams={remotePeerStreams}
                    onLeaveScreenView={backToMainSection}
                    presenterPlayerSize={playerSizes["presenter"] * 0.5}
                    label={selectedScreenPresenter.userName}
                    presenterData={selectedScreenPresenter}
                    localCamera={props.localCamera}
                    presenterStreams={(remotePeerStreams && remotePeerStreams[selectedScreenPresenter.id])}
                  />
                )
                :
                <div />
            }

          </div>

          <div style={{

            transition: "transform 0.3s ease-in-out",
            transform: sideBoxState.opened ? "translateX(0)" : "translateX(100%)",
            position: "absolute",
            display: sideBoxState.opened ? "flex" : "none",
            height: !xsScreen ? "90%" : "85%",
            minWidth: !xsScreen ? "24.5%" : "95%",
            right: "0",
            zIndex: "11",
            boxShadow: "0 0 3em rgba(0,0,0,0.8)"
          }} >

            <div className={classes.sideBox} >
              <SideBoxWidget
                defaultSection={sideBoxState.section}
                remotePeerStreams={remotePeerStreams}
                sendMessage={sendMessage} userData={props.userData}
                removePresentation={removePresentation}
                grantPresentation={grantPresentation}
                roomUsers={roomUsers} messages={messages}
                createSubRoom={createSubRoom} subRooms={subRooms}
                toogleCreateNewSubRoom={toogleCreateNewSubRoom}
                toggleSideBox={toggleSideBox}
              />
            </div>
          </div>

          <RoomActionsWidget presenter={isPresenter} owner={isOwner}
            presentationRequested={presentationRequested} toggleSideBox={toggleSideBox}
            camera={props.localCamera} onLeave={leaveRoom}
            screen={screen}
            newMessages={newMessages}
            toggleScreen={toggleScreen}
            requestPresentation={requestPresentation}
            cancelPresentation={cancelPresentation}
            onCameraStateChanged={cameraStateChanged}
            onMicStateChanged={micStateChanged}
          />

        </div>

      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default Room;