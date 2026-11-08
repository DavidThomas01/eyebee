import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";

import MobileDeviceDetector from "./MobileDeviceDetector";

import queryString from "query-string";

import socketIOClient from "socket.io-client";
import SocketIOProvider from "./SocketIOProvider";
import RoomManager from "./Room/RoomManager";

import JoinRoomView from "./JoinRoomView";
import Room from "./Room/Room";
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import TestStreamWidget from "./TestStreamWidget";
import crypto from 'crypto-js';
import config from './config';

const theme = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#000",
        },
        primary: {
            main: "#F29F39",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#fafafa",
            contrastText: "#8E8E8E"
        },
        action: {
            backgroundColor: "#aaaaaa",
            selected: "#2D2D2D"
        },
        lighterBg: {
            main: "#292929"
        }
    },
    actionBtn: {
        backgroundColor: "#212121",
        margin: "0.5em",
    },
    defaultIcon: {
        fontSize: "1.5em"
    },
    typography: {
        fontSize: "0.9em"
    }
}));


const useStyles = makeStyles(theme => ({

    mainBox: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        flexDirection: "column",
        width: "100%",
        color: "#424242",
        flex: "2"
    }
}));

const VideoConference = () => {

    const classes = useStyles();
    const { roomId } = useParams(); // Gets roomId from URL
    const location = useLocation();
    const [currentSection, setCurrentSection] = useState("joinRoom");

    const [userData, setUserData] = useState({});

    const [camera, setCamera] = useState(null);

    const [wsSocket, setWSSocket] = useState(null);

    const [roomManager, setRoomManager] = useState(null);

    const [testDisabled, setTestDisabled] = useState(true);

    const [canvasEl, setCanvasEl] = useState(null);

    const [textOnly, setTextOnly] = useState(true);

    const [showPeerTestStats, setShowPeerTestStats] = useState(false);

    const [joining, setJoining] = useState(false);

    const [joinParticipantCount, setJoinParticipantCount] = useState(null);

    const joinStartedAt = useRef(0);
    const joinRevealTimer = useRef(null);

    const onUserJoined = useCallback((users) => {
        setJoinParticipantCount(users ? Object.keys(users).length : null);

        if (!joinStartedAt.current) {
            setCurrentSection("room");
            return;
        }

        const elapsed = Date.now() - joinStartedAt.current;
        const remaining = Math.max(0, 700 - elapsed);

        window.clearTimeout(joinRevealTimer.current);
        joinRevealTimer.current = window.setTimeout(() => {
            joinStartedAt.current = 0;
            setCurrentSection("room");
            setJoining(false);
        }, remaining);
    }, []);

    useEffect(() => () => window.clearTimeout(joinRevealTimer.current), []);

    const startJoin = () => {
        joinStartedAt.current = Date.now();
        setJoinParticipantCount(null);
        setJoining(true);
    };

    const cancelJoin = () => {
        window.clearTimeout(joinRevealTimer.current);
        joinStartedAt.current = 0;
        setJoining(false);
    };

    const onError = data => {
        console.error("Could not join the room", { data });
    }

    useEffect(() => {
        let jsonQS ;
        let jsonQS2 = queryString.parse(location.search);
       
        if(jsonQS2.p){
            let p = jsonQS2.p.replace(/ /g, "+");
            const params = crypto.AES.decrypt(p, "human hive eyebee").toString(crypto.enc.Utf8);
            jsonQS = queryString.parse(params);
            if (jsonQS2.create !== undefined) {
                jsonQS.create = jsonQS2.create;
            }
        }else {
            jsonQS =jsonQS2;
        }

        setTestDisabled(jsonQS && jsonQS.testDisabled === "true");

        if (jsonQS2.create !== undefined) {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("create");
            window.history.replaceState(window.history.state, "", cleanUrl.toString());
        }

        userData.roomId = roomId;

        userData.smallRoom = jsonQS.largeRoom === "false" || !jsonQS.largeRoom;
        userData.isOwner = jsonQS.owner === "true";
        userData.isPresenter = jsonQS.presenter === "true";
        userData.sfu = jsonQS.sfu === "true";
        userData.create = jsonQS.create === "1" || jsonQS.create === "true";
        userData.name = jsonQS.peer_id;
        userData.testStream = jsonQS.test_stream;
        if(jsonQS.testDisabled === "true"){
            userData.forcedScores = {};
            if(userData.sfu){
                //fake very high score sfu peer
               
                userData.forcedScores.cpu = 0.01;
                userData.forcedScores.upload = 160;
                userData.forcedScores.download = 600;
            }else{
                //custom test values 
                userData.forcedScores.cpu = parseFloat(jsonQS.cpu);
                userData.forcedScores.upload = parseInt(jsonQS.upload);
                userData.forcedScores.download = parseInt(jsonQS.download);
            }
        }
        
        setShowPeerTestStats(jsonQS.show_test_stats === "true");
        
        userData.maxRelay = parseInt(jsonQS.max_relay);

        let mobDetector = new MobileDeviceDetector();

        userData.isMobileDevice = mobDetector.isMobile();

        if(userData.testStream === "test"){
            setTextOnly(true);
        }else{
            setTextOnly(false);
        }

        if (!jsonQS.peer_id) {

            let generatedPeerId = null;

            if (jsonQS.owner === "true") {
                generatedPeerId = "moderador-" + Math.trunc(Math.random() * 1000);
            } else if (jsonQS.presenter === "true") {
                generatedPeerId = "presentador-" + Math.trunc(Math.random() * 1000);
            } else {
                generatedPeerId = "espectador-" + Math.trunc(Math.random() * 1000);
            }

            userData.peerId = generatedPeerId;

        } else {
            userData.peerId = jsonQS.peer_id;
        }

        setUserData({
            ...userData
        })


        let sIOProv = new SocketIOProvider(socketIOClient);
        let endpoint = config.socketEndpoint;

        let socket = sIOProv.createClient(endpoint, {
            path: "/videocall/socket.io",
            transports: ['websocket'],
            query: {
                room_id: userData.roomId,
                peer_id: userData.peerId,
            }
        });

        setWSSocket(socket);

        let roomManager = new RoomManager(socket,
            {}
        );

        roomManager.init();

        setRoomManager(roomManager);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (roomManager) {
            roomManager.addRoomEventCallbacks({
                "onJoined": onUserJoined,
                "onError": onError
            });
        }

    }, [roomManager, onUserJoined]);

    const joinRoom = (userName, cameraStreams, testResults, avatar) => {

        let prom = new Promise((resolve,reject) => {
            let udata = {
                ...userData
            }
            udata.userName = userName;
            udata.camera = cameraStreams.camera;
            udata.mic = cameraStreams.mic;
            udata.capabilities = {};
            udata.avatar = avatar;
            if (testResults) {
                Object.keys(testResults).forEach(e => {
                    udata.capabilities[e] = {
                        name: testResults[e].name,
                        value: testResults[e].value
                    }
                });
            } else {
                const scores = udata.forcedScores || { cpu: 1, upload: 100, download: 500 };
                udata.capabilities = {
                    CPU: { name: "CPU", value: scores.cpu },
                    connectionType: { name: "Connection", value: "STUN" },
                    upload: { name: "Upload", value: scores.upload },
                    download: { name: "Download", value: scores.download }
                };
            }
    
            setUserData(udata);
            roomManager.join(udata.roomId, udata.peerId, {
                capabilities: udata.capabilities,
                owner: udata.isOwner,
                smallRoom: udata.smallRoom,
                isMobileDevice:udata.isMobileDevice,
                presenter: udata.isPresenter,
                userName: userName,
                camera: udata.camera,
                mic: udata.mic,
                sfu: udata.sfu,
                avatar: avatar,
                maxRelay: udata.maxRelay
            },response => {
                if(response.result === "error"){
                    reject(response);
                }else{
                    resolve(response);   
                }

            });
        });
        return prom;
        

    }

    const setupCamera = camera => {
        setCamera(camera);
    }

    const canvasCreated = canvasEl => {
        setCanvasEl(canvasEl);
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>

                <div className={classes.mainBox}>
                    <p style={{
                        color:"white"
                    }}>{textOnly}</p>
                    <TestStreamWidget source={userData.testStream} textOnly={textOnly} text={userData.userName} onCanvasElement={canvasCreated} />

                    {currentSection === "joinRoom" ?
                        (
                            <JoinRoomView showPeerTestStats={showPeerTestStats} testCanvasEl={canvasEl} testDisabled={testDisabled} roomManager={roomManager} userData={userData} joinRoom={joinRoom} onCamera={setupCamera} joining={joining} onJoinStart={startJoin} onJoinCancel={cancelJoin} joinParticipantCount={joinParticipantCount} />

                        )
                        :
                        <div />

                    }

                    {currentSection === "room" ?
                        (
                            <Room userData={userData} roomManager={roomManager}
                                wsSocket={wsSocket} localCamera={camera} />
                        )
                        :
                        <div />

                    }


                </div>

            </ThemeProvider>
        </StyledEngineProvider>
    );

}



export default VideoConference;