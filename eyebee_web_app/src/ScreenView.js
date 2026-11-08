import React, { useEffect, useRef } from "react";

import { ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline, IconButton } from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import MediaPlayerWidget from "./MediaPlayerWidget";
import RemotePeerWidget from "./RemotePeerWidget";


const useStyles = makeStyles(theme => ({
    mainBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5em",
        flex: "3",
        borderRadius: "0.3em",
        height: "100%"
    },
    userList: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.9em",
        width: "100%",
        overflowX: "auto",
    }
}));

const ScreenView = (props) => {
    const theme = useTheme();
    const classes = useStyles();
    const videoEl = useRef();

    useEffect(() => {

        let presenterScreenStream = getPeerStreamsByLabel(props.roomUsers,props.remotePeerStreams,props.presenterData.id)["screen"];
        if (presenterScreenStream && (!videoEl.current.srcObject || videoEl.current.srcObject !== presenterScreenStream)) {
            videoEl.current.srcObject = presenterScreenStream;
        }



    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.presenterData,props.remotePeerStreams]);




          
            
         
    



    const getPeerStreamsByLabel = (roomUsers,remotePeerStreams,peerId) => {

        let streams = {};

        if(roomUsers && roomUsers[peerId] && remotePeerStreams[peerId]){
          let peerLocalStreamRefs = roomUsers[peerId].localStreams || {};
          
            
            Object.keys(peerLocalStreamRefs).forEach(ls => {
                let localStreamObj = remotePeerStreams[peerId][ls];

                if(localStreamObj){
                    streams[peerLocalStreamRefs[ls].label] =  localStreamObj;
                }else{
                    let userIds = Object.keys(roomUsers);
                    for(let i=0; i < userIds.length;i++){
                        let usrId = userIds[i];
                        if(roomUsers[usrId].clonedStreams && roomUsers[usrId].clonedStreams[peerId]){

                            let peerClonedStreamsRef = roomUsers[usrId].clonedStreams[peerId];

                            if(peerClonedStreamsRef && peerClonedStreamsRef[ls]){
                                let clonedStreamIds = roomUsers[usrId].clonedStreams[peerId][ls].clonedStreamIds;

                                if(clonedStreamIds){
                                
                                    streams[peerLocalStreamRefs[ls].label] = remotePeerStreams[peerId][clonedStreamIds[0]];
                                    break;
                                }
                            }else{


                                break;
                            }

                            
                        }
                        
                    }

                    if(!streams[peerLocalStreamRefs[ls].label]){
                    }

                    
                }

               


            });
         
        }else{
            
        }
    
        return streams;

    }

    const leaveScreenView = cond => {
        let localStreamIds = Object.keys(props.presenterData.localStreams || {});
        
        let localStreamId = localStreamIds.find( ls => {
            return props.presenterData.localStreams[ls].label === "screen";
        });

        let screenStream = props.presenterStreams[localStreamId];
        props.onLeaveScreenView(screenStream);
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} >
                <CssBaseline />
                <div className={classes.mainBox} >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%"
                    }}>
                        <div style={{
                            display: "flex"
                        }}>
                            <IconButton
                                variant="contained"
                                color="primary"
                                onClick={e => leaveScreenView(false)}
                                size="large">
                                <ArrowBackIos style={theme.defaultIcon} />
                            </IconButton>
                        </div>
                        <div style={{
                            display: "flex",
                            flex: "2",
                            justifyContent: "center"
                        }}>
                            <MediaPlayerWidget
                                isCameraEnable={true}
                                background="primary"
                                volume={0} label={props.userData.userName}
                                playerSize={props.presenterPlayerSize}
                                stream={props.localCamera ? props.localCamera.getStream() : null}
                            />
                        </div>

                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%"
                    }}>
                        
                        <div className={classes.userList}>
                            {

                                Object.keys(props.roomUsers)
                                    .sort((a, b) => { return props.roomUsers[a].presenter && !props.roomUsers[b].presenter ? -1 : 1 })
                                    .map((peerId, index) => {

                                        if (props.roomUsers[peerId].localStreams && Object.keys(props.roomUsers[peerId].localStreams).find( ls => { return props.roomUsers[peerId].localStreams[ls].label === "screen"  }))
                                            return (
                                                <RemotePeerWidget
                                                    key={peerId}
                                                    background={"primary"}
                                                    isCameraEnable={false}
                                                    avatar={props.roomUsers[peerId].avatar}
                                                    playerSize={70}
                                                    label={props.roomUsers[peerId].userName || peerId}
                                                    localOwner={false}
                                                    nomedia={true}
                                                    streams={null}
                                                    clickable={true}
                                                    onClick={e => props.goToScreen(props.roomUsers[peerId])}
                                                    localStreams={props.roomUsers[peerId].localStreams}
                                                    peerId={peerId} owner={props.roomUsers[peerId].owner}
                                                    presenter={props.roomUsers[peerId].presenter}
                                                    goToScreen={e => props.goToScreen(props.roomUsers[peerId])}
                                                />)
                                        return null;
                                    })
                            }
                        </div>
                    </div>
                    <div style={{
                        display: "flex",
                        flex: "auto",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center"
                    }} >
                        <video
                            style={{
                                width: "45%",
                                height: "auto",
                                backgroundColor: "black"
                            }} ref={videoEl} controls autoPlay />
                    </div>

                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default ScreenView;