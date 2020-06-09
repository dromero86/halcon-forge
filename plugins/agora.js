;var agora = {   
    test     : false,
    server_id: 0,
    video    : { source : "", allow : false, profile: '720p_3' },
    audio    : { source : "", allow : false },
    channel  : { name   : "", key   : null  },
    platform : { install:  false, allow : false }, 
    client   : { live   :   null, stream: null , id: null },
    view     : { local: "agora_local", remote:"agora_remote" },
    close: function(){
    },
 
    check_api: function()
    {
        try
        {
            agora.platform.install = (AgoraRTC != undefined) ? true : false;
            agora.platform.allow   = AgoraRTC.checkSystemRequirements() ? true : false;
        }
        catch(e)
        { 
            app.log(["check_api", e]);
        }
        return (agora.platform.install && agora.platform.allow);
    },
    check_video: function(onSuccess, onFailure){
        navigator.mediaDevices.getUserMedia({video: true})
        .then(function(stream) 
        {
            agora.video.allow = true;
            onSuccess(stream);
        })
        .catch(function(e){
            onFailure({message:"User denied", response: e }); 
        });
    },
    check_audio: function(onSuccess, onFailure){
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream) 
        {
            agora.audio.allow = true;
            onSuccess(stream);
        })
        .catch(function(e){
            onFailure({message:"User denied", response: e }); 
        });
    },   
    check_permissions: function(onSuccess, onFailure)
    {    
        try
        {
            if(AgoraRTC != undefined)
                agora.platform.install = true;
        }
        catch(ex)
        { 
            onFailure({message:"AGORA SDK not found", response:ex});
            return;
        }
        agora.platform.allow = AgoraRTC.checkSystemRequirements() ? true : false;
 
        if (navigator.mediaDevices.getUserMedia) 
        {       
            navigator.mediaDevices.getUserMedia({video: true})
            .then(function(stream) 
            {
                agora.video.allow = true;
                onSuccess(stream);
            })
            .catch(function(e){
                onFailure({message:"User denied", response: e }); 
            });
            navigator.mediaDevices.getUserMedia({audio: true})
            .then(function(stream) 
            {
                agora.audio.allow = true;
            })
            .catch(function(error) 
            {
                app.log(["Audio not allowed", error]);
            });
        }
        else
        {
            onFailure({message:"Browser non compatible"}); 
        }
    },
 
    _publish_onFailure : function (err) 
    {
        app.log(["Publish local stream error: " + err]);
    },
    _publish_onSuccess : function (evt) 
    {
        app.log(["Publish local stream successfully", evt]);
    },
    _stream_onSuccess : function() 
    {
        app.log(["getUserMedia successfully"]);
        agora.client.stream.play(agora.view.local);
        agora.client.live.publish( agora.client.stream, agora._publish_onFailure );
        agora.client.live.on('stream-published', agora._publish_onSuccess);
    },
    _stream_onFailure: function (err) 
    {
        app.log(["getUserMedia failed", err]);
    },
    _stream_onAllowed : function() 
    {
        app.log(["accessAllowed"]);
    },
    _stream_onDenied : function() 
    {
        app.log(["accessDenied"]);
    },
    _join_onSuccess : function(uid) 
    {
        agora.client.id = uid;
        app.log(["User " + agora.client.id + " join channel successfully"]);
 
        agora.client.stream = AgoraRTC.createStream
        ({
            streamID     : agora.client.id, 
            audio        : agora.audio.allow, 
            cameraId     : agora.video.source, 
            microphoneId : agora.audio.source, 
            video        : true, 
            screen       : false
        });
        agora.client.stream.setVideoProfile(agora.video.profile); 
        agora.client.stream.on("accessAllowed", agora._stream_onAllowed); 
        agora.client.stream.on("accessDenied" , agora._stream_onDenied );
        agora.client.stream.init( agora._stream_onSuccess, agora._stream_onFailure );
      
    },
    _join_onFailure : function(err)
    {
        app.log(["Join channel failed", err]);   
    },
    _init_onSuccess : function () 
    {
        agora.client.live.on('error'            , agora._client_onError            );
        agora.client.live.on('stream-added'     , agora._client_onStreamAdded      );
        agora.client.live.on('stream-subscribed', agora._client_onStreamSubscribed );
        agora.client.live.on('stream-removed'   , agora._client_onStreamRemoved    );
        agora.client.live.on('peer-leave'       , agora._client_onPeerLeave        );
        app.log(["AgoraRTC client initialized", this, agora]);
        app.log(["ChannelKey", agora.channel.key, "ChannelName", agora.channel.name]);
        agora.client.live.join(agora.channel.key, agora.channel.name, null, agora._join_onSuccess , agora._join_onFailure);
    },
    _init_onFailure : function(err)
    {
        app.log(["AgoraRTC client init failed", err]);  
    },
    _renew_onSuccess: function()
    {
        app.log("Renew channel key successfully");
    },
    _renew_onFailure: function(err)
    {
        app.log(["Renew channel key failed: ", err]);
    },
    _client_onError: function(err) 
    {
        app.log(["Got error msg:", err.reason]);
        
        if (err.reason === 'DYNAMIC_KEY_TIMEOUT') 
        {
            agora.client.live.renewChannelKey(agora.channel.key, agora._renew_onSuccess, agora._renew_onFailure );
        }
    },
    _subscribe_onError: function (err) 
    {
        app.log(["Subscribe stream failed", err]);
    },
    _client_onStreamAdded: function (evt) 
    {
        var stream = evt.stream;
        app.log("New stream added: " + stream.getId());
        app.log(["Subscribe ", stream]);
        agora.client.live.subscribe(stream, agora._subscribe_onError);
    },
    _client_onStreamSubscribed: function (evt) 
    {
        var stream = evt.stream;
        app.log("Subscribe remote stream successfully: " + stream.getId());
  
        stream.play(agora.view.remote);  
        try{
            document.querySelector(".video-call .calling").remove();
        }
        catch(e){
            
        }
        
    },
    _client_onStreamRemoved: function (evt) 
    {
        var stream = evt.stream;
        stream.stop(); 
        app.log("Remote stream is removed " + stream.getId());
    },
    _client_onPeerLeave: function (evt) 
    {
 
        var stream = evt.stream;
        if (stream) 
        {
            stream.stop(); 
            app.log(evt.uid + " leaved from this channel");

            app.log(["agora close", agora.close);
            agora.close();
        }
        else
        {
            app.log(["non stream leaved from this channel", stream]);
        }
    },
    startBroadcast : function()
    {  
        
        app.log(["startBroadcast in ", usr.agora_id]);
        agora.client.live = AgoraRTC.createClient({mode: 'live'});
        agora.client.live.init(usr.agora_id, agora._init_onSuccess, agora._init_onFailure);
 
    },
    _client_onLeaveSuccess: function () 
    {
        app.log("Leavel channel successfully");
    },
    _client_onLeaveFailure: function (err) 
    {
        app.log("Leave channel failed");
    },
    disconnect: function() 
    { 
        agora.client.live.leave(agora._client_onLeaveSuccess, agora._client_onLeaveFailure);
    }, 
    getDevices: function(fn)
    {
        AgoraRTC.getDevices(fn);
    }
 
};  