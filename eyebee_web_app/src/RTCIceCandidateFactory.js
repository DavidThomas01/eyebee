class RTCIceCandidateFactory {
    create(candidate){
        return new RTCIceCandidate(candidate);
    }
}

export default RTCIceCandidateFactory;