webix.protoUI
({ 
    name    : 'chat',
    defaults:{  },
    $init: function(config) 
    { 
        /*
        //  LIST
        //  -------------------------
        //  max-width: 65% 
        //  MESSAGE-IN
        //  -------------------------
        //             max-width: 65% 
        //                MESSAGE-OUT
        // --------------------------
        // TEXTAREA
        */
        config.rows =
        [
            {
                id  : config.list_id,
                view: "list", 
                css : "chat-message",
                scroll:'y',
                type:
                {
                    templateStart: "<div webix_l_id='#id#' class='chat-message-box chat-message-#type# chat-read-#read#'>",
                    template     : "<div class='chat-message-pad'> <div class='chat-message-text'> <div class='chat-word'>#message#</div > <div class='chat-time'>#time#</div> </div> </div>",
                    templateEnd  : "</div>"
                }
            },
            {
                id         : config.textarea_id,
                height     : 60,
                css        : "chat-input",
                view       : "textarea",
                placeholder: "Escribe un mensaje aquí"
            }
        ];

         this.$ready.push(this.render);

    },      

    render: function()
    {
        var that = this;

        var _format = webix.Date.dateToStr("%d/%m/%Y %H:%i");

        setTimeout(function()
        {   
           
            var _i  = that.queryView({ view:"textarea" });
            var txt = _i.$view.firstChild.firstChild;
            /* 
            txt.onkeyup = function(key)
            {   
                if(key.code=="Enter")
                {
                    if(this.value.length > 0)
                    { 
                        that.callEvent("onChatEnterComment", [{ 
                            id     : +(new Date()),  
                            message: this.value   , 
                            time   : _format(new Date())
                        }, that]);  
                    }

                    txt.value     = "";
                    txt.innerHTML = "";
                }
            }; 
            */
           
            txt.addEventListener("keydown", function (key) {

                console.log("keydown", key);

                if(key.key=="Enter")
                {
                    if(this.value.length > 0)
                    { 
                        that.callEvent("onChatEnterComment", [{ 
                            id     : +(new Date()),  
                            message: this.value   , 
                            time   : _format(new Date()),
                            read      : 0,
                            read_time : false 
                        }, that]);  
                    }

                    txt.value     = "";
                    txt.innerHTML = "";
                }
            });

        }, 25);
    },

 
}, webix.ui.layout, webix.EventSystem); 