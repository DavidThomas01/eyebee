import React, { useEffect, useState } from "react";

import { ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline } from "@mui/material";
import RemotePeerWidget from "./RemotePeerWidget";
import MediaPlayerWidget from "./MediaPlayerWidget";

const useStyles = makeStyles(theme => ({
    mainBox: {
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        flex: "2",
        overflow: "hidden"
    },
    peerItem: {
        margin: "0.3em",
        transition: "transform 0.2s ease-in-out"
    }
}));

const RoomGrid = (props) => {
    const theme = useTheme();
    const classes = useStyles();
    const [rows, setRows] = useState([]);
    const [roomUsers, setRoomUsers] = useState({});

    useEffect(() => {
        if(props.roomUsers){
            let filteredRoomUsers = Object.keys(props.roomUsers).filter(u => {

                return props.userData.isPresenter ? true : ( props.roomUsers[u].presenter ? true: false);
            });

            let newRU = {};
            filteredRoomUsers.forEach(f => {
                newRU[f] = props.roomUsers[f];
            });

            setRoomUsers(newRU);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.roomUsers]);



    useEffect(() => {
        if (roomUsers && Object.keys(roomUsers).length > 0) {
            let rows = [];
            let prevRow = 0;
            for (let i = 1; i <= 6; i++) {
                let numItems = i * 6;
                rows.push(numItems + prevRow);
                prevRow = prevRow + numItems;
            }

            setRows(rows);
        }


    }, [roomUsers]);

    const calculateRadius = (originalPlayerSize) => {
        if (originalPlayerSize >= 106)
            return 1.11;
        if (originalPlayerSize < 106 && originalPlayerSize >= 83)
            return 1.15;
        if (originalPlayerSize < 83 && originalPlayerSize >= 59)
            return 1.21;
    }
    const calculatePosition = (index, originalPlayerSize) => {
        let minItems = 0;

        let row = 1;
        let radius = originalPlayerSize;

        for (let i = 0; i < rows.length; i++) {

            if ((index + 1) <= rows[i]) {
                row = i + 1;
                break;
            }
        }

        minItems = rows[row - 1];


        let offset = 30;
        let angle = ((index + 1) - minItems) * (360 / (6 * row));
        let finalAngle = angle - offset;

        let adjusted = true;

        radius = row * originalPlayerSize * calculateRadius(originalPlayerSize);
        if (row > 0) {

            let oddRow = row % 2 !== 0;

            adjusted = oddRow ? ((index + 1) - minItems) % row === 0 : ((index + 1) - minItems) % row === 0;

            radius = Math.ceil(adjusted ? radius : radius * 0.86);
        }

        let playerSize = originalPlayerSize;

        return {
            row: row,
            adjusted: adjusted,
            minItems: minItems,
            radius: radius,
            playerSize: playerSize,
            angle: angle,
            finalAngle: finalAngle
        }
    }

    const getPeerStreamsByLabel = (roomUsers, remotePeerStreams, peerId) => {

        let streams = {};

        if (roomUsers && roomUsers[peerId] && remotePeerStreams[peerId]) {
            let peerLocalStreamRefs = roomUsers[peerId].localStreams || {};


            Object.keys(peerLocalStreamRefs).forEach(ls => {
                let localStreamObj = remotePeerStreams[peerId][ls];

                if (localStreamObj) {
                    streams[peerLocalStreamRefs[ls].label] = localStreamObj;
                } else {
                    let userIds = Object.keys(roomUsers);
                    for (let i = 0; i < userIds.length; i++) {
                        let usrId = userIds[i];
                        if (roomUsers[usrId].clonedStreams && roomUsers[usrId].clonedStreams[peerId]) {

                            let peerClonedStreamsRef = roomUsers[usrId].clonedStreams[peerId];

                            if (peerClonedStreamsRef && peerClonedStreamsRef[ls]) {
                                let clonedStreamIds = roomUsers[usrId].clonedStreams[peerId][ls].clonedStreamIds;

                                if (clonedStreamIds) {

                                    streams[peerLocalStreamRefs[ls].label] = remotePeerStreams[peerId][clonedStreamIds[0]];
                                    break;
                                }
                            } else {


                                break;
                            }


                        }

                    }

                    if (!streams[peerLocalStreamRefs[ls].label]) {
                    }


                }

            });

        } else {

        }

        return streams;

    }














    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} >
                <CssBaseline />
                                {true ?
                    (

                        <div className={classes.mainBox} style={{
                        }} onClick={event => {
                            if (props.onBackgroundClick && event.target === event.currentTarget) {
                                props.onBackgroundClick();
                            }
                        }} >

                            {
                                props.isMainPresenter ?
                                    (
                                        <MediaPlayerWidget
                                            isCameraEnable={props.localCamera ? props.localCamera.isVideoEnabled():false}
                                            avatar={props.userData.avatar}
                                            background={props.isPresenter ? "primary" : "secondary"}
                                            volume={0} label={(props.userData && props.userData.userName) || props.userData.peerId}
                                            playerSize={props.playerSizes["presenter"]} stream={props.localCamera && props.localCamera.getStream()} />

                                    )
                                    :
                                    (
                                        <div />
                                    )
                            }


                            {
                                Object.keys(roomUsers).filter(e => { if (e.owner) { return e.presenter } else { return e !== props.userData.peerId } })
                                    .sort((a, b) => { return roomUsers[a].presenter && !roomUsers[b].presenter ? -1 : 1 })
                                    .map((peerId, index) => {


                                        if (roomUsers[peerId].mainPresenter) {
                                            return (
                                                <RemotePeerWidget
                                                    key={peerId}
                                                    nomedia={props.nomedia}
                                                    showScreenIcon={true}
                                                    isCameraEnable={roomUsers[peerId].camera}
                                                    avatar={roomUsers[peerId].avatar}
                                                    background={roomUsers[peerId].presenter ? "primary" : "secondary"}
                                                    playerSize={props.playerSizes["presenter"]}
                                                    label={roomUsers[peerId].userName || peerId}
                                                    presentationRequested={roomUsers[peerId].presentationRequested}
                                                    presentationGranted={roomUsers[peerId].presentationGranted}
                                                    onPresentationGranted={props.grantPresentation}
                                                    onPresentationRemoved={props.removePresentation}
                                                    localOwner={props.isOwner}
                                                    localStreams={roomUsers[peerId].localStreams}
                                                    streams={

                                                        getPeerStreamsByLabel(roomUsers, props.remotePeerStreams, peerId)







                                                    }
                                                    peerId={peerId} owner={roomUsers[peerId].owner}
                                                    presenter={roomUsers[peerId].presenter}
                                                    goToScreen={e => props.goToScreen(roomUsers[peerId])}
                                                />

                                            )
                                        } else {
                                            let pos = calculatePosition(index - 1, props.playerSizes["presenter"]);
                                            if (props.isMainPresenter) {
                                                pos = calculatePosition(index, props.playerSizes["presenter"]);
                                            }

                                            return (
                                                <div key={peerId} className={classes.peerItem}
                                                    style={{
                                                        position: roomUsers[peerId].owner ? "relative" : "absolute",
                                                        transform: !roomUsers[peerId].owner ? "rotate(" + pos.finalAngle + "deg) translate(" + (pos.radius) + "px) rotate(" + (-pos.finalAngle) + "deg) " : "none"

                                                    }}>

                                                    <RemotePeerWidget
                                                        nomedia={props.nomedia}
                                                        showScreenIcon={true}
                                                        isCameraEnable={roomUsers[peerId].camera}
                                                        avatar={roomUsers[peerId].avatar}
                                                        background={roomUsers[peerId].presenter ? "primary" : "secondary"}
                                                        playerSize={pos.playerSize}
                                                        label={roomUsers[peerId].userName || peerId}
                                                        presentationRequested={roomUsers[peerId].presentationRequested}
                                                        presentationGranted={roomUsers[peerId].presentationGranted}
                                                        onPresentationGranted={props.grantPresentation}
                                                        onPresentationRemoved={props.removePresentation}
                                                        localOwner={props.isOwner}
                                                        localStreams={roomUsers[peerId].localStreams}
                                                        streams={

                                                            getPeerStreamsByLabel(roomUsers, props.remotePeerStreams, peerId)

                                                        }
                                                        peerId={peerId} owner={roomUsers[peerId].owner}
                                                        presenter={roomUsers[peerId].presenter}
                                                        goToScreen={e => props.goToScreen(roomUsers[peerId])}
                                                    />

                                                </div>


                                            )

                                        }
                                    })
                            }

                        </div>
                    )
                    :
                    (
                        <div />
                    )
                }

            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default RoomGrid;