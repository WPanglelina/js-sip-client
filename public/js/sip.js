var Sip = window.Sip ={
	ua: null,
	selfView:null,
	remoteView :null,
	peerconnection_config:null,

	init: function(configuration){
		ua = new JsSIP.UA(configuration);
    	this.UaEventHandlers(ua);
    	ua.start();
    	peerconnection_config = {
		    'iceServers': [{
		        'urls': ['stun:101.200.187.190:19302']
		    },
		    {
		        'urls': 'turn:101.200.187.190:19302',
		        'username': '700',
		        'credential': ' 700'
		    }]
		};
		selfView = document.getElementById('video-local');
		remoteView = document.getElementById('video-remote');
	},
	call: function(sipurl){
		var options = {
		    'eventHandlers': this.videoEventHandlers,
		    'mediaConstraints': {
		        'audio': true,
		        'video': true
		    },
		    'pcConfig': this.peerconnection_config
		};
		return ua.call(sipurl, options);
	},
	newcall: function(e){
		this.CallEventHandlers(e);
	},
	answer :function(call) {
    	call.answer({
	        pcConfig: this.peerconnection_config,
	        // TMP:
	        mediaConstraints: {
	            audio: true,
	            video: true
	        },
	        extraHeaders: ['X-Can-Renegotiate: ' + String(localCanRenegotiateRTC())],
	        rtcOfferConstraints: {
	            offerToReceiveAudio: 1,
	            offerToReceiveVideo: 1
	        },
	    });
	},
	UaEventHandlers: function(ua){
		var self = this;
		ua.on('connecting',function(e) {
        	console.info('connecting');
    	});

	    ua.on('connected',function(e) {
	        console.info('connected');
	    });

	    ua.on('disconnected',function(e) {
	        console.info('disconnected');
	    });

	    ua.on('newRTCSession',function(e) {
	        self.newcall(e);
	        console.info('newcall');
	    });

	    ua.on('newMessage',function(e) {
	        console.log(e)
	    });

	    ua.on('registered',function(e) {
	        console.info('registered');
	        alert('注册成功');
	    });

	    ua.on('unregistered',function(e) {
	        
	    });

	    ua.on('registrationFailed',function(e) {
	        alert('注册失败');
	    });
	},
	videoEventHandlers: {
		'progress': function(e) {
	        console.log('call is in progress');
	    },
	    'failed': function(e) {
	        console.log('call failed with cause');
	    },
	    'ended': function(e) {
	        console.log('call ended with cause');
	    },
	    'confirmed': function(e) {
	        var local_stream = session.connection.getLocalStreams()[0];

	        console.log('call confirmed');
	        selfView = JsSIP.rtcninja.attachMediaStream(selfView, local_stream);
	    },
	    'addstream': function(e) {
	        var stream = e.stream;
	        console.log('remote stream added');
	        remoteView = JsSIP.rtcninja.attachMediaStream(remoteView, stream);
	    }
	},
	CallEventHandlers :function(e) {
	    var request = e.request,
	    call = e.session;

	    if (call.direction === 'incoming') {
	        if (call.request.getHeader('X-Can-Renegotiate') === 'false') {
	            call.data.remoteCanRenegotiateRTC = false;
	        } else {
	            call.data.remoteCanRenegotiateRTC = true;
	        }
	        console.log('ding ding ding.....');

	        if(confirm("新的来电...")){
	          this.answer(call);
	        } else {
	           //挂断
	        }
	    }
	    call.on('connecting',function() {
	        console.log('call connecting');
	        // TMP
	        if (call.connection.getLocalStreams().length > 0) {
	            window.localStream = call.connection.getLocalStreams()[0];
	        }
	    });
	    // Progress
	    call.on('progress',function(e) {
	        console.log('call progress');
	    });
	    // Started
	    call.on('accepted', function(e) {
	        if (call.connection.getLocalStreams().length > 0) {
	            localStream = call.connection.getLocalStreams()[0];
	            selfView = JsSIP.rtcninja.attachMediaStream(selfView, localStream);
	            selfView.volume = 0;

	            // TMP
	            window.localStream = localStream;
	        }

	        if (e.originator === 'remote') {
	            if (e.response.getHeader('X-Can-Renegotiate') === 'false') {
	                call.data.remoteCanRenegotiateRTC = false;
	            } else {
	                call.data.remoteCanRenegotiateRTC = true;
	            }
	        }
	    });
	    call.on('addstream',function(e) {
	        console.log('call addstream');
	        remoteStream = e.stream;
	        remoteView = JsSIP.rtcninja.attachMediaStream(remoteView, remoteStream);
	    });
	    // Failed
	    call.on('failed',function(e) {
	        console.log('call failed');
	    });

	    // NewDTMF
	    //多音双频的信号
	    call.on('newDTMF',function(e) {
	        //GUI.playSound("sounds/dialpad/" + e.dtmf.tone + ".ogg");
	        console.log('call newDTMF');
	    });

	    call.on('hold',function(e) {
	        //GUI.playSound("sounds/dialpad/pound.ogg");
	        console.log('call hold');
	    });

	    call.on('unhold',function(e) {
	        //GUI.playSound("sounds/dialpad/pound.ogg");
	        console.log('call unhold');
	    });

	    // Ended
	    call.on('ended',function(e) {
	        console.log('call ended');
	    });

	    // received UPDATE
	    call.on('update',function(e) {
	        console.log('call update');
	        var request = e.request;

	        if (!request.body) {
	            return;
	        }

	        if (!localCanRenegotiateRTC() || !call.data.remoteCanRenegotiateRTC) {
	            console.warn('Tryit: UPDATE received, resetting PeerConnection');
	            call.connection.reset();
	            call.connection.addStream(localStream);
	        }
	    });

	    call.on('reinvite',function(e) {
	        console.log('call reinvite');
	    });
	    // received REFER
	    call.on('refer',function(e) {
	        console.error('accepting the refer');
	        e.accept(function(session, request) {
	            newcall({
	                originator: 'remote',
	                session: session,
	                request: session.request
	            });
	        },
	        {
	            mediaStream: localStream
	        });
	    });

	    // received INVITE replacing this session
	    call.on('replaces',function(e) {
	        console.error('accepting the replaces');
	        e.accept(function(session, request) {
	            newcall({
	                originator: 'local',
	                session: session,
	                request: session.request
	            });
	        });
	    });
	}
}

var localCanRenegotiateRTC = function() {
    return JsSIP.rtcninja.canRenegotiate;
};