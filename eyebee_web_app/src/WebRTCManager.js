class WebRTCManager {

    constructor(peerId,sessionId,rtcPeerConnFactory,rtcIceCandidateFactory,signalingManager,rtcPeerConfig,eventCallbacks){
        this.peerId = peerId;
        this.turn = false;
        this.sessionId = sessionId;
        this.sfu = false;
        this.assignedSFU = null;
        this.rtcPeerConfig = rtcPeerConfig;
        this.rtcPeerConnFactory = rtcPeerConnFactory;
        this.rtcIceCandidateFactory = rtcIceCandidateFactory;
        this.localStreams = {};
        this.signalingManager = signalingManager;
        this.localMediaObjects = {};
        this.remoteMediaObjects = {};
        this.eventCallbacks = eventCallbacks;
        this.webrtcConnectionTest = null;
        this.remotePeers = {};
        this.constraints = null;
        this.assignedSFU = null;
        this.listening = false;
        this.clonedStreams = {};
    }

    setEventCallbacks(cbs){
        this.eventCallbacks = cbs;
    }

    setSFU(isSFU){
        this.sfu = isSFU;
    }

    addLocalMedia(streamObj,label){

        this.localMediaObjects[streamObj.id] = {
            stream:streamObj,
            label: label
        };

        this.signalingManager.emit("peer_media_changed",{
            sessionId: this.sessionId,
            from:this.peerId,
            type:"added",
            label:label,
            streamId:streamObj.id
        });

        let assignedSFUId = this.assignedSFU ? (this.assignedSFU.id ? this.assignedSFU.id : null) : null;

        if(assignedSFUId && this.remotePeers[assignedSFUId].peerConn){
            this.addMediaToPC(streamObj,this.remotePeers[assignedSFUId].peerConn);
        }
        
        return true;

    }

    addLocalStreamsToPC(localPeerId,assignedSFUId){

        let localStreams = Object.keys(this.localMediaObjects);

        let allStreams = [];
            
        localStreams.forEach(s => {
            allStreams.push(this.localMediaObjects[s].stream);
            
        });


        allStreams.forEach(async stream =>{

            stream.getTracks().forEach( t => {
                                

                let transceivers = this.remotePeers[assignedSFUId].peerConn.getTransceivers();

                let trackAlreadyAdded = transceivers.find(ts => {
                    return ts.sender && ts.sender.track && ts.sender.track.id === t.id;
                });


                if(!trackAlreadyAdded){


                    this.remotePeers[assignedSFUId].peerConn.addTransceiver(t,{
                        streams:[stream],
                        direction:"sendonly"
                    });

                        
                
                }

            });


        });


        return true;
    }

    addMediaToPC(streamObj,peerConn){

        streamObj.getTracks().forEach( t => {

            peerConn.addTransceiver(t,{
                streams:[streamObj],
                direction:"sendonly"
            });


                

        });


        return true;
    }

    removeMediaFromPCs(streamObj,keepLocalMedia,peerIds){
        let connectedPeers = peerIds ? peerIds : Object.keys(this.remotePeers);
        
        connectedPeers.forEach(pId =>{
            //We don't make a PC with every peer, just with the ones that are SFUs
            //so check if we have a peer connection with this peer first
            if(this.remotePeers[pId].peerConn){
                let transceivers = this.remotePeers[pId].peerConn.getTransceivers();
                transceivers.forEach( trs => {

                    streamObj.getTracks().forEach( t => {
                        let isSender = trs.sender && trs.sender.track && t.id === trs.sender.track.id;


                        if(isSender){

                            trs.stop();
                            
                        }


                        

                       
                    });

                    

                });

            }

            if(this.remotePeers[pId].remoteStreams && this.remotePeers[pId].remoteStreams.length > 0){
                let removedStream = this.remotePeers[pId].remoteStreams.find(rs => {
                    return rs.id === streamObj.id;
                })

                
                let removeIndex = this.remotePeers[pId].remoteStreams.indexOf(removedStream);
                
                if(removedStream && removeIndex > 0){
                    this.remotePeers[pId].remoteStreams.splice(removeIndex,1);
                }
                
            }
            
                
        });

       
        if(this.localMediaObjects[streamObj.id] && !keepLocalMedia){

            this.signalingManager.emit("peer_media_changed",{
                sessionId: this.sessionId,
                from:this.peerId,
                type:"deleted",
                label:this.localMediaObjects[streamObj.id].label,
                streamId:streamObj.id
            });

            delete this.localMediaObjects[streamObj.id];
            if(this.eventCallbacks["onLocalMediaRemoved"]){
                this.eventCallbacks["onLocalMediaRemoved"](streamObj.id);
            }
        }


    }

    removeSenderFromPCs(trackId){

        let connectedPeers = Object.keys(this.remotePeers);
        
        connectedPeers.forEach(pId =>{
            //We don't make a PC with every peer, just with the ones that are SFUs
            //so check if we have a peer connection with this peer first
            if(this.remotePeers[pId].peerConn){
                let transceivers = this.remotePeers[pId].peerConn.getTransceivers();

                transceivers.forEach( trs => {

                    
                    if(trs.sender && trs.sender.track && trackId === trs.sender.track.id){
                        this.remotePeers[pId].peerConn.removeTrack(trs.sender);
                        trs.stop();
                    }


                });
            }
                
        });

        
        return this.remotePeers;
    }


    removeTransceivers(peerId){

        let peer = this.remotePeers[peerId];
        if(peer.peerConn){
            let transceivers = peer.peerConn.getTransceivers();

            transceivers.forEach(tr => {
                tr.stop();
            });


        }else{
        }

        
        return this.remotePeers;
    }

    disconnectRemoteMedia(streamObj,originPeerId){

        if(!this.sfu){


            let sfuIds = Object.keys(this.remotePeers).filter( p => {
                return this.remotePeers[p].sfu
            });
            let peerConn = null;
            let transceivers = null;
            let streamTr = null;
            let tr = null;
            let streamTracks = streamObj.getVideoTracks().concat(streamObj.getAudioTracks());
            let strTrack = null;

            for (let i = 0; i < sfuIds.length; i++) {
               
                peerConn = this.remotePeers[sfuIds[i]].peerConn;
                streamTr = null;
                if(peerConn){
                    transceivers = peerConn.getTransceivers();

                    for (let x = 0; x < transceivers.length; x++) {
                        
                        tr = transceivers[x];
                        streamTr = null;
                        for (let y = 0; y < streamTracks.length; y++) {
                            strTrack = streamTracks[y];

                            if(tr.receiver && tr.receiver.track && tr.receiver.track.id === strTrack.id){
                                streamTr = tr;
                                break;
                            }
                        }
                        if(streamTr){
                            tr.stop();
                        }
                        

                    }

                    if(streamTr){
                        break;
                    }
                    


                }
            
                
            }

            if(this.remotePeers[originPeerId].remoteStreams && this.remotePeers[originPeerId].remoteStreams.length > 0){
                let removedStream = this.remotePeers[originPeerId].remoteStreams.find(rs => {
                    return rs.id === streamObj.id;
                })

                
                let removeIndex = this.remotePeers[originPeerId].remoteStreams.indexOf(removedStream);
                
                if(removedStream && removeIndex > 0){
                    this.remotePeers[originPeerId].remoteStreams.splice(removeIndex,1);

                    this.signalingManager.emit("peer_stream_removed",{
                        sessionId: this.sessionId,
                        from:this.peerId,
                        label:this.remotePeers[originPeerId].localStreams[streamObj.id].label,
                        originPeerId:originPeerId,
                        streamId:removedStream.id
                    });

                }
                
            }

        }

    }

    async makeOffer(remotePeerId){

        if(!this.remotePeers[remotePeerId]){
            return null;
        }

        try {
            this.remotePeers[remotePeerId].makingOffer = true;
            await this.remotePeers[remotePeerId].peerConn.setLocalDescription();
            this.remotePeers[remotePeerId].polite = true;
            
            this.signalingManager.emit("peer_webrtc_message",{
                from:this.peerId,
                isSFU:this.sfu,
                target: remotePeerId,
                type:"description",
                data:{
                    description:this.remotePeers[remotePeerId].peerConn.localDescription
                }
            });

        } catch(err) {
          console.error(err);
        } finally {
            this.remotePeers[remotePeerId].makingOffer = false;
        }
        return this.remotePeers[remotePeerId];
    }

    addStreamsToPC(streams,peerId){
        
        let newPC = false;
        streams.forEach(stream => {
            
            stream.getTracks().forEach( async t => {

                if(this.remotePeers[peerId]){  

                   
                    if(!this.remotePeers[peerId].peerConn){

                        this.createPeerConnection(peerId);
                        newPC = true;
                    }

                    let transceivers = this.remotePeers[peerId].peerConn.getTransceivers();

                    let trackAlreadyAdded = transceivers.find(ts => {
                        return ts.sender && ts.sender.track && ts.sender.track.id === t.id;
                    });
    
    
                    if(!trackAlreadyAdded){


                        this.remotePeers[peerId].peerConn.addTransceiver(t,{
                            streams:[stream],
                            direction:"sendonly"
                        });
    
                            
                       
                       
                    }else{

                        //trying to replace the existing track
                        try{
                            await trackAlreadyAdded.sender.replaceTrack(t,stream);
                        }catch(err){
                        }
                    }


                    if(newPC){
                        this.makeOffer(peerId).then(() => {
        
                        }).catch(err => {
                            console.error("addPeerStreamToPC --error making offer for this new PC",{peerId,err});
                        });
                    }

                }else{
                }

            });
        });

        return true;
    }

    getAllRemoteStreams(excludedPeerId){
        let allStreams = [];

        Object.keys(this.remotePeers).filter( p => {
            if(p !== excludedPeerId){
                return true;
            }
            return false;
        }).forEach(p => {

            if(this.remotePeers[p].remoteStreams){
                allStreams = allStreams.concat(this.remotePeers[p].remoteStreams);
            }

        });

        return allStreams;
    }

    addToPeerRemoteStreams(stream,peerId){

        if(!this.remotePeers[peerId]){
            return false;
        }

        if(!this.remotePeers[peerId].remoteStreams){
            this.remotePeers[peerId].remoteStreams = [];
        }

        let strFound = this.remotePeers[peerId].remoteStreams.filter(s => {
            if(s.id === stream.id){
                return true;
            }
            return false;
        });


        if(!strFound[0]){
            this.remotePeers[peerId].remoteStreams.push(stream);

            return true;

        }else{
           
            return false;
        }

    }

    async removePeerLocalStreamsReferences(peerId,streamId,resend){

        if(!this.remotePeers[peerId]){
                return null;
        }

        if(this.remotePeers[peerId].localStreams){

            if(this.remotePeers[peerId].remoteStreams && this.remotePeers[peerId].remoteStreams.length > 0){

                let peerLocalStreamIds = Object.keys(this.remotePeers[peerId].localStreams);
                if(streamId){
                    peerLocalStreamIds = peerLocalStreamIds.filter( plsid => {
                        return plsid === streamId;
                    });
                }
                
                peerLocalStreamIds.forEach(lsId => {


                    let localStream = this.remotePeers[peerId].remoteStreams.find( rs => {
                        return rs.id === lsId;
                    });

                    this.removeMediaFromPCs(localStream,true);
                    
                });

                this.remotePeers[peerId].remoteStreams = this.remotePeers[peerId].remoteStreams.filter( rs => {
                    return peerLocalStreamIds.indexOf(rs.id) === -1;
                });


                
                

            }else{
            }

            
            if(resend){
                await this.timeout(1000);


                this.requestPeerStream(peerId,streamId);
            }

            
        }else{
        }

        return this.remotePeers[peerId];

    }

    findPeerStreamId(peerId,streamId){


        let linkedStreamIds = [];
        let localStreamId = this.remotePeers[peerId].remoteStreams[streamId];
        if(localStreamId){
            linkedStreamIds.push(streamId);
           
        }
        

            //find also local clones of this streams
            let connectedPeerIds = Object.keys(this.remotePeers);
            for(let i=0; i < connectedPeerIds.length; i++){
                let pId = connectedPeerIds[i];

               
               
                let localClones = this.remotePeers[pId].locallyClonedStreams;

                if(localClones){
                    let originLocalClones = localClones[peerId];

                    if(originLocalClones[streamId]){
                        linkedStreamIds =  linkedStreamIds.concat(originLocalClones[streamId].clonedStreamIds);
                        
                    }

                }
                
            }

           return linkedStreamIds;

        
    }

    replaceTrackInPCs(track,stream){
        let peerIds = Object.keys(this.remotePeers);
        peerIds.forEach( async p => {
            let peerConn = this.remotePeers[p].peerConn;
            if(peerConn){
                let senders = peerConn.getSenders();
                if(senders && senders.length > 0){
                    let sender = senders.find(sender => {
                        return sender.track && sender.track.id === track.id;
                    });

                    if(sender){

                        try{
                            await sender.replaceTrack(track,stream);
                        }catch(err){
                        }
                    }
                    

                }   
                
                
            }
            
        });
    }

    createPeerConnection(peerId,includeLocalMedia){

        
        if(!this.remotePeers[peerId]){
            this.remotePeers[peerId] = {};
        }
        this.remotePeers[peerId].peerConn = new RTCPeerConnection(this.rtcPeerConfig);

        let allStreams = [];

        if(includeLocalMedia){
            let localStreams = Object.keys(this.localMediaObjects);
            
            localStreams.forEach(s => {
                allStreams.push(this.localMediaObjects[s].stream);
                
    
            });
        }

        this.addStreamsToPC(allStreams,peerId);

        this.remotePeers[peerId].peerConn.onicecandidate = ({candidate}) => {

            if (!candidate) {
                return;
            }

            this.signalingManager.emit("peer_webrtc_message",{
                from:this.peerId,
                isSFU:this.sfu,
                target: peerId,
                type:"ice_candidate",
                data:{
                    candidate:candidate
                }
            });
        };

        this.remotePeers[peerId].peerConn.ontrack = ({track, streams}) => {


            let assignedSFUId =  this.assignedSFU ?  ( this.assignedSFU.id ?  this.assignedSFU.id : null ) : null;
            
            let streamOriginPeerId = Object.keys(this.remotePeers).filter(p => {
                if(this.remotePeers[p].localStreams && this.remotePeers[p].localStreams[streams[0].id]){
                    return true;
                }
                return false;
            })[0];
            let originStreamId = null;

            //check if origin peer is found, maybe it was removed just before this event occurred 
            if(!streamOriginPeerId){

                let clonedPeerIds = this.remotePeers[peerId].clonedStreams ? Object.keys(this.remotePeers[peerId].clonedStreams) : [];
                let peerClonedStreamIds = null;
                let peerClonedStreamRef = null;
                for(let i=0; i< clonedPeerIds.length;i++){
                    peerClonedStreamIds = Object.keys(this.remotePeers[peerId].clonedStreams[clonedPeerIds[i]]);
                    
                    for(let x=0; x < peerClonedStreamIds.length; x++){
                        peerClonedStreamRef = this.remotePeers[peerId].clonedStreams[clonedPeerIds[i]][peerClonedStreamIds[x]];
                       
                        if(peerClonedStreamRef.clonedStreamIds.indexOf(streams[0].id) !== -1 ){
                            originStreamId = peerClonedStreamIds[x];
                            streamOriginPeerId = clonedPeerIds[i];
                            break;
                        }
                    }

                    if(streamOriginPeerId){
                        break;
                    }
                }
                
                if(!streamOriginPeerId){
                    return true;   
                }
                 
            }else{
                originStreamId = streams[0].id;
            }


            let added = this.addToPeerRemoteStreams(streams[0],streamOriginPeerId);  

            if(added){
                    
            }
            
            
            
            if(added && this.sfu && assignedSFUId){

                if(this.remotePeers[peerId].assignedSFU === this.peerId){
                }
              
            }

            if(added){
                let streamLabel = this.remotePeers[streamOriginPeerId].localStreams[originStreamId].label;
               
                this.signalingManager.emit("peer_stream_loaded",{
                    sessionId: this.sessionId,
                    senderPeerId: peerId,
                    streamLabel: streamLabel,
                    originPeerId:streamOriginPeerId,
                    originStreamId: originStreamId,
                    peerId:this.peerId,
                    streamId: streams[0].id
                });

                this.eventCallbacks["onStreamLoaded"](streamOriginPeerId,streams[0],streamLabel);

                
            }

           

            track.onunmute = () => {

                this.eventCallbacks["onRemoteTrack"](streamOriginPeerId,track,streams[0]);
                

            };

        };

        this.remotePeers[peerId].peerConn.oniceconnectionstatechange = () => {
            if (this.remotePeers[peerId] && this.remotePeers[peerId].peerConn.iceConnectionState === "failed") {
                console.error("ICE FAIL",{peer:this.remotePeers[peerId]});
                this.remotePeers[peerId].peerConn.restartIce();
            }
        };

        this.remotePeers[peerId].peerConn.onnegotiationneeded = async () => {
           
            await this.makeOffer(peerId);
        };

        this.remotePeers[peerId].peerConn.onconnectionstatechange = () => {
            if(this.remotePeers[peerId].peerConn.connectionState === "closed"){
                this.remotePeers[peerId].peerConn = null;
                delete this.remotePeers[peerId];
            }
           
        };

        return this.remotePeers[peerId].peerConn;

    }

    filterVideoCodecs(preferredCodecs){
        const {codecs} = RTCRtpSender.getCapabilities('video');
        
        let finalCodecList = [];
        codecs.forEach(codec => {

            if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
                return;
            }

            if(preferredCodecs.includes(codec.mimeType)){    
                finalCodecList.push(codec);
            }

        });
        let aux = [...finalCodecList];
        finalCodecList=[];
        preferredCodecs.forEach(e => {
            
          
            let filteredList = aux.filter(c => {
               
                return c.mimeType === e;
            });
            finalCodecList = finalCodecList.concat(filteredList);

        });

        return finalCodecList;
    }

    getPCToPeer(peerId){
        return this.remotePeers[peerId] ? this.remotePeers[peerId].peerConn : null;
    }


    addPeerStreamToPC(peerId, targetPeerId,loadedStreamId, targetLocalStreams) {

        if (this.remotePeers[peerId] ) {
            let newPC = false;
            if(!this.remotePeers[peerId].peerConn){

                this.createPeerConnection(peerId);
                newPC = true;
            }

            let targetRemoteStreams ;
            if(loadedStreamId){
                targetRemoteStreams = this.remotePeers[targetPeerId].remoteStreams.filter(rs => {
                    if(rs.id === loadedStreamId){
                        return true;
                    }
                    return false;
                });
            }else{
                targetRemoteStreams = this.remotePeers[targetPeerId].remoteStreams;
            }
           
            let allStreams = [];


            Object.keys(targetLocalStreams).forEach(s => {
                let str = targetRemoteStreams.filter(r => {
                    if (r.id === s) {
                        return true;
                    }
                    return false;
                });


                if(str && str[0]){


    
                   allStreams.push(str[0]);
                }
                

            });


            this.addStreamsToPC(allStreams, peerId);
            if(newPC){
                this.makeOffer(peerId).then(() => {

                }).catch(err => {
                    console.error("addPeerStreamToPC --error making offer for this new PC",{peerId,err});
                });
            }
        } else {
        }
    }

    listenToWebRTCMessages(){
        this.listening = true;
        this.signalingManager.on("peer_webrtc_message",async message => {

            let connectionData = null;

            if(this.remotePeers[message.from]){
                
                if(!this.remotePeers[message.from].peerConn){
                   
                    let sendLocalMedia = false;
                    if(!this.assignedSFU && message.isSFU ){
                        sendLocalMedia = true;
                        this.assignedSFU = message.from;
                        this.signalingManager.emit("set_target_sfu",{
                            userId:this.peerId,
                            selectedSFU: message.from
                        });
                    }

                    this.createPeerConnection(message.from,sendLocalMedia);
                }

                connectionData  = this.remotePeers[message.from];
            }else{
                this.remotePeers[message.from] = {};
                let sendLocalMedia = false;
                if(!this.assignedSFU  && message.isSFU ){
                    sendLocalMedia = true;
                    this.assignedSFU = message.from;
                    this.signalingManager.emit("set_target_sfu",{
                        userId:this.peerId,
                        selectedSFU: message.from
                    });
                }

                this.createPeerConnection(message.from,sendLocalMedia);
                connectionData = this.remotePeers[message.from];

            }


            

            if(message.type === "description"){

                const offerCollision = (message.data.description.type === "offer") &&
                (connectionData.makingOffer || connectionData.peerConn.signalingState !== "stable");


    
                connectionData.ignoreOffer = !connectionData.polite && offerCollision;
    
                if (connectionData.ignoreOffer) {
                    return;
                }

                await connectionData.peerConn.setRemoteDescription(message.data.description);

                if (message.data.description.type === "offer") {
                    await connectionData.peerConn.setLocalDescription();

                    let localSDP = connectionData.peerConn.localDescription;


                    this.signalingManager.emit("peer_webrtc_message",{
                        from:this.peerId,
                        isSFU:this.sfu,
                        target: message.from,
                        type:"description",
                        data:{
                            description:localSDP
                        }
                    });
                }

            }else if(message.type === "ice_candidate"){
                try {
                    await this.remotePeers[message.from].peerConn.addIceCandidate(new RTCIceCandidate(message.data.candidate));
                    } catch(err) {
                        console.error(err);
                    if (!connectionData.ignoreOffer) {
                        
                      throw err;
                    }
                }
                
            }

        });

        this.signalingManager.on("send_peer_stream",async message => {
            this.addPeerStreamToPC(message.peerId,message.target,message.loadedStreamId,message.targetLocalStreams);
        });


        this.signalingManager.on("request_stream",async message => {
            this.requestPeerStream(message.targetPeerId,message.targetStreamId);
        });

        this.signalingManager.on("peer_streams_remove_request",async message => {
            this.removePeerLocalStreamsReferences(message.peerId,message.streamId,message.resend);
        });

        this.signalingManager.on("remove_transceivers_request",async message => {
            this.removeTransceivers(message.peerId);
        });


    }

    timeout(millis) {
        let prom = new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve();
            },millis || 1000);
        });
        return prom;
    }

    updatePeerLocalStreams(peerId,localStreams){
        if(!this.remotePeers[peerId]){
            this.remotePeers[peerId] = {};
        }

        this.remotePeers[peerId].localStreams = localStreams;
    }

    updatePeerAssignedSFU(peerId,assignedSFU){
        if(this.remotePeers[peerId]){
            this.remotePeers[peerId].assignedSFU = assignedSFU;
        }
        
    }

    updatePeerSFUOrder(peerId,order){
        if(!this.remotePeers[peerId]){
            this.remotePeers[peerId] = {};
        }

        this.remotePeers[peerId].sfu = true;
        this.remotePeers[peerId].sfuOrder = order;
    }

    updateMainPresenter(peerId){
        if(!this.remotePeers[peerId]){
            this.remotePeers[peerId] = {};
        }

        this.remotePeers[peerId].mainPresenter = true;
    }

    updateOwner(peerId){
        if(!this.remotePeers[peerId]){
            this.remotePeers[peerId] = {};
        }

        this.remotePeers[peerId].owner = true;
    }


    async startWebRTCConnections(assignedSFUPeer,restOfSFUs,connConstraints){

        if(assignedSFUPeer && restOfSFUs){

            this.assignedSFU = assignedSFUPeer;

            this.createPeerConnection(assignedSFUPeer.id,  true);

            await this.makeOffer(assignedSFUPeer.id);

            for(let i=0; i< restOfSFUs.length; i++){
                this.createPeerConnection(restOfSFUs[i].id,  false);

                await this.makeOffer(restOfSFUs[i].id);

            }



        }





        



      
        return true;
    }


    async requestPeersStreams(peers,owner,presenter){

        let otherPeersIds = Object.keys(peers).filter(p => {
            
            if(p !== this.peerId && peers[p].assignedSFU !== this.peerId) return true;
            return false;
        });

        if(!presenter){
            otherPeersIds = otherPeersIds.filter(p => {
                return peers[p].presenter;
            })
        }
         


        if(otherPeersIds && otherPeersIds.length > 0){


            for (let i = 0; i < otherPeersIds.length; i++) {
                let p = otherPeersIds[i];
                
                if(!this.remotePeers[p]){
                    this.remotePeers[p] = {};
                }

                this.remotePeers[p].localStreams = peers[p].localStreams;
                this.remotePeers[p].mainPresenter = peers[p].mainPresenter;
                this.remotePeers[p].owner = peers[p].owner;



                if(peers[p].localStreams && Object.keys(peers[p].localStreams).length > 0){

                    let reqStreamIds = this.sfu ? Object.keys(peers[p].localStreams)  : Object.keys(peers[p].localStreams).filter( ls => {
                        return peers[p].localStreams[ls].label === "camera";
                    });
    

                    for (let x = 0; x < reqStreamIds.length; x++) {
                        let sId = reqStreamIds[x];

                        this.signalingManager.emit("peer_stream_requested",{
                            peerId: this.peerId,
                            sessionId: this.sessionId,
                            type:"send_peer_stream",
                            streamId: sId,
                            target: p
                        });

                        await this.timeout(1000);

                    }

                }

            }

        }

    }

    requestPeerStream(targetPeerId,reqStreamId){
        this.signalingManager.emit("peer_stream_requested",{
            peerId: this.peerId,
            sessionId: this.sessionId,
            type:"send_peer_stream",
            streamId: reqStreamId,
            target: targetPeerId
        });
    }

    async closePeerConnection(peer,closeTransceivers){
         let leavingPeer = this.remotePeers[peer.peerId];


            if(leavingPeer.peerConn){

                if(closeTransceivers){
                    let transceivers = leavingPeer.peerConn.getTransceivers();
                    transceivers.forEach(t => {
                        t.stop();
                    });
                }

                leavingPeer.peerConn.close();
            }

            this.remotePeers[peer.peerId].peerConn = null;
            delete this.remotePeers[peer.peerId];


        return peer.userId;

    }

    closeAllPCs() {
        let peerIds = Object.keys(this.remotePeers);

        peerIds.forEach(pId => {
            this.closePeerConnection({
                peerId:pId
            },true);
        });
    }

    async testNAT(){
        try{
            await this.webrtcConnectionTest.checkTurnOrStun({"url": "stun:stun.l.google.com:19302"});
            this.turn = false;
        }catch(err){
            console.error(err);
            this.turn = true;
        }

        return {
            turn: this.turn
        }
        
    }


}

export default WebRTCManager;