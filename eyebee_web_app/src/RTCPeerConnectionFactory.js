class RTCPeerConnectionFactory {
    createRTCPeerConnection(config){
        return new RTCPeerConnection(config);
    }
}

export default RTCPeerConnectionFactory;