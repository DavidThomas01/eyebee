import React, { useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";

import MediaPlayerWidget from "../MediaPlayerWidget";
import RemotePeerWidget from "../RemotePeerWidget";

const HEX_WIDTH = Math.sqrt(3) / 2;

const useStyles = makeStyles(() => ({
    grid: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        padding: "8px",
    },
    canvas: {
        position: "relative",
        flex: "0 0 auto",
    },
    cell: {
        position: "absolute",
        transition: "left 180ms ease, top 180ms ease",
        "& > div": {
            width: "100%",
            height: "100%",
            padding: 0,
        },
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

const honeycombPositions = count => {
    const coordinates = [{ q: 0, r: 0 }];
    let ring = 1;

    while (coordinates.length < count) {
        const directions = [[-1, 1], [-1, 0], [0, -1], [1, -1], [1, 0], [0, 1]];
        let q = ring;
        let r = 0;

        for (let direction = 0; direction < directions.length; direction++) {
            const [dq, dr] = directions[direction];
            for (let step = 0; step < ring; step++) {
                coordinates.push({ q, r });
                q += dq;
                r += dr;
            }
        }

        ring++;
    }

    return coordinates.slice(0, count).map(({ q, r }) => ({
        x: HEX_WIDTH * (q + r / 2),
        y: 0.75 * r,
    }));
};

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
    const gridRef = useRef(null);
    const [containerSize, setContainerSize] = useState(() => ({
        width: window.innerWidth,
        height: window.innerHeight - 190,
    }));

    useEffect(() => {
        const element = gridRef.current;
        if (!element) {
            return undefined;
        }

        const measure = () => {
            setContainerSize({
                width: element.clientWidth,
                height: element.clientHeight,
            });
        };

        measure();

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(measure);
            observer.observe(element);
            return () => observer.disconnect();
        }

        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
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

    const positions = honeycombPositions(orderedPeers.length);
    const minX = Math.min(...positions.map(position => position.x));
    const maxX = Math.max(...positions.map(position => position.x));
    const minY = Math.min(...positions.map(position => position.y));
    const maxY = Math.max(...positions.map(position => position.y));
    const boxWidth = maxX - minX + HEX_WIDTH;
    const boxHeight = maxY - minY + 1;
    const availableWidth = Math.max(0, containerSize.width - 16);
    const availableHeight = Math.max(0, containerSize.height - 16);
    const sizeByWidth = (availableWidth - 8) / boxWidth;
    const sizeByHeight = (availableHeight - 8) / boxHeight;
    const playerSize = Math.max(48, Math.min(170, sizeByWidth, sizeByHeight));
    const cellWidth = HEX_WIDTH * playerSize + 8;
    const cellHeight = playerSize + 8;
    const canvasWidth = boxWidth * playerSize + 8;
    const canvasHeight = boxHeight * playerSize + 8;

    return (
        <div
            ref={gridRef}
            className={classes.grid}
            onClick={event => {
                if (event.target === event.currentTarget && onBackgroundClick) {
                    onBackgroundClick();
                }
            }}
        >
            <div
                className={classes.canvas}
                style={{ width: canvasWidth, height: canvasHeight }}
                onClick={event => {
                    if (event.target === event.currentTarget && onBackgroundClick) {
                        onBackgroundClick();
                    }
                }}
            >
                {orderedPeers.map((peer, index) => {
                    const isLocal = peer.id === localPeer.id;
                    const position = positions[index];

                    if (isLocal) {
                        const localStream = localCamera ? localCamera.getStream() : null;
                        const cameraOn = Boolean(localStream && localCamera.isVideoEnabled());

                        return (
                            <div
                                key={peer.id || "local"}
                                className={classes.cell}
                                style={{
                                    left: (position.x - minX) * playerSize,
                                    top: (position.y - minY) * playerSize,
                                    width: cellWidth,
                                    height: cellHeight,
                                }}
                            >
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
                        <div
                            key={peer.id}
                            className={classes.cell}
                            style={{
                                left: (position.x - minX) * playerSize,
                                top: (position.y - minY) * playerSize,
                                width: cellWidth,
                                height: cellHeight,
                            }}
                        >
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
        </div>
    );
};

export default MobileRoomGrid;
