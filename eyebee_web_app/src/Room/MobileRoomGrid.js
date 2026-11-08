import React, { useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";

import MediaPlayerWidget from "../MediaPlayerWidget";
import RemotePeerWidget from "../RemotePeerWidget";

const useStyles = makeStyles(() => ({
    grid: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        gap: "10px",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        padding: "8px",
    },
    cell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
    },
}));

const getPeerStreamsByLabel = (roomUsers, remotePeerStreams, peerId) => {
    const streams = {};

    if (!roomUsers || !roomUsers[peerId] || !remotePeerStreams || !remotePeerStreams[peerId]) {
        return streams;
    }

    const localStreamRefs = roomUsers[peerId].localStreams || {};

    Object.keys(localStreamRefs).forEach(streamId => {
        const remoteStream = remotePeerStreams[peerId][streamId];
        if (remoteStream) {
            streams[localStreamRefs[streamId].label] = remoteStream;
            return;
        }

        const userIds = Object.keys(roomUsers);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            const clonedStreams = roomUsers[userId].clonedStreams;
            const clonedStream = clonedStreams && clonedStreams[peerId] && clonedStreams[peerId][streamId];
            if (clonedStream && clonedStream.clonedStreamIds) {
                streams[localStreamRefs[streamId].label] = remotePeerStreams[peerId][clonedStream.clonedStreamIds[0]];
                break;
            }
        }
    });

    return streams;
};

const roleRank = peer => (peer.owner ? 0 : peer.presenter ? 1 : 2);

const MobileRoomGrid = ({
    userData,
    roomUsers,
    remotePeerStreams,
    localCamera,
    goToScreen,
    grantPresentation,
    removePresentation,
    onBackgroundClick,
}) => {
    const classes = useStyles();
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const peers = Object.values(roomUsers || {}).filter(Boolean);
    const localPeer = (roomUsers && roomUsers[userData.peerId]) || {
        id: userData.peerId,
        userName: userData.userName,
        avatar: userData.avatar,
        owner: userData.isOwner,
        presenter: userData.isPresenter,
    };
    const orderedPeers = [
        localPeer,
        ...peers
            .filter(peer => peer.id !== localPeer.id)
            .sort((a, b) => roleRank(a) - roleRank(b) || String(a.userName || "").localeCompare(String(b.userName || ""), "es", { numeric: true })),
    ];

    const columns = orderedPeers.length <= 6 ? 2 : 3;
    const maxSize = Math.floor((viewportWidth - 40 - 10 * (columns - 1) - 24 * columns) / (0.866 * columns));
    const playerSize = Math.max(64, Math.min(columns === 2 ? 160 : 100, maxSize));
    const cellWidth = Math.ceil(playerSize * 0.866 + 24);
    const cellHeight = Math.ceil(playerSize + 24);

    return (
        <div
            className={classes.grid}
            onClick={event => {
                if (event.target === event.currentTarget && onBackgroundClick) {
                    onBackgroundClick();
                }
            }}
        >
            {orderedPeers.map(peer => {
                const isLocal = peer.id === localPeer.id;

                if (isLocal) {
                    const localStream = localCamera ? localCamera.getStream() : null;
                    const cameraOn = Boolean(localStream && localCamera.isVideoEnabled());

                    return (
                        <div key={peer.id || "local"} className={classes.cell} style={{ width: cellWidth, height: cellHeight }}>
                            <MediaPlayerWidget
                                nomedia={!cameraOn}
                                isCameraEnable={cameraOn}
                                avatar={peer.avatar || userData.avatar}
                                background={peer.presenter ? "primary" : "secondary"}
                                volume={0}
                                label={peer.userName || userData.userName || "Invitado"}
                                playerSize={playerSize}
                                stream={localStream}
                            />
                        </div>
                    );
                }

                const streams = getPeerStreamsByLabel(roomUsers, remotePeerStreams, peer.id);
                const cameraStream = streams && streams["camera"];
                const hasScreen = Boolean(peer.localStreams && Object.keys(peer.localStreams).some(id => peer.localStreams[id].label === "screen"));
                const openScreen = () => {
                    if (hasScreen && goToScreen) {
                        goToScreen(peer);
                    }
                };

                return (
                    <div key={peer.id} className={classes.cell} style={{ width: cellWidth, height: cellHeight }}>
                        <RemotePeerWidget
                            compact
                            nomedia={!cameraStream}
                            showScreenIcon={hasScreen}
                            isCameraEnable={Boolean(cameraStream)}
                            avatar={peer.avatar}
                            playerSize={playerSize}
                            label={peer.userName || "Invitado"}
                            presentationRequested={peer.presentationRequested}
                            presentationGranted={peer.presentationGranted}
                            onPresentationGranted={grantPresentation}
                            onPresentationRemoved={removePresentation}
                            localOwner={userData.isOwner}
                            localStreams={peer.localStreams}
                            streams={streams}
                            peerId={peer.id}
                            owner={peer.owner}
                            presenter={peer.presenter}
                            goToScreen={openScreen}
                            clickable={hasScreen}
                            onClick={openScreen}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default MobileRoomGrid;
