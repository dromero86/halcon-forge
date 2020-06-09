webix.protoUI({
  name: "rating",
  $cssName:"text",
  defaults:{
    scale: 5,
    icon: "fa fa-star"
  },
  $init:function(){
    this.on_click.webix_rating_point = function(e, id, target){
      if(!this.config.readonly)
        this.setValue(target.getAttribute("data-value"))
    }
  },
  $renderInput: function(config, div_start, id){
    var value = parseInt(config.value||0), scale = config.scale;
    id = id||webix.uid();
    div_start = '<input type="hidden" id="'+id+'" value="'+value+'" />';
    for(var i=0; i<scale; i++){
      div_start += '<span class="webix_icon webix_rating_point '+config.icon
      if(value>i){
        div_start += ' webix_rating_selected'
      }
      div_start += '" style="line-height:'+config.cheight+'px;"';
      div_start += ' data-value="'+(i+1)+'"></span>';
    }
    return webix.ui.text.prototype.$renderInput.apply(this, [config,div_start,id]);
  },
  $renderIcon: function(){
    return "";
  },
  $setValue:function(value){
    //this.config.value = value||0;
    this.refresh();
  },
  $getValue: function(){
    return this.config.value||0;
  }
}, webix.ui.text);