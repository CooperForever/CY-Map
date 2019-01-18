var image = new ol.style.Circle({
      radius: 5,
      fill: null,
      stroke: new ol.style.Stroke({color: 'red', width: 1})
    });
var styles = {
      'Point': new ol.style.Style({
        image: image
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 2
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: image
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.1)'
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 120, 255, 0.8)',
          lineDash: [9],
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(120, 255, 120, 0.2)'
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    };
  	var styleFunction = function(type) {
  	
  		return styles[type];
    };
    var styleFunction2 = function(feature) {
    	//alert(JSON.stringify(feature.values_.NAME));
		var style = new ol.style.Style({
	           stroke: new ol.style.Stroke({
	                color: 'rgba(0, 0, 0, 1)',
	                lineDash: [4],
	                width: 3
	              }),
            fill: new ol.style.Fill({
         	   color: 'rgba(0, 255, 0, 0.6)'
            }),
            text:new ol.style.Text({
            	scale:1,
  				text:feature.values_.NAME,
  				font:'bold 16px serif',
  				fill: new ol.style.Fill({
  	         	   color: 'rgba(255, 0, 0, 1)'
  	            }),
  	          stroke: new ol.style.Stroke({
	                color: 'rgba(0, 0, 0, 1)',
	                //lineDash: [4],
	                width: 2
	              })
  			})
	    });
		return style;
};
/**
 * Create a new control with a map acting as an overview map for an other
 * defined map.
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.TocControlOptions=} opt_options TocControl options.
 * @api
 */
ol.control.TocControl = function(opt_options) {

  var options = opt_options ? opt_options : {};
  this.expendAll=true;
  if(options.expendAll!=undefined)
  {
	  this.expendAll=options.expendAll;
  }
  this.matrixIds_=[];
  this.layerTree_=null;
  this.treeId=options.treeId==undefined?"layerTree":options.treeId;
  
  
  
//  this.setting_=options.setting !== undefined ? options.setting : {};
  this.setting_={
			check: {
				autoCheckTrigger: true,
				enable: true,
				chkStyle: "checkbox",
				chkboxType: { "Y": "ps", "N": "ps"}
			},
			key: {
				name: "LAYERCNNAME"
			},
			data: {
				simpleData: {
					enable: true,
					idKey: "ID",
					pIdKey: "PARENTID",
					rootPId: null
				}
			},
			callback: {
				onCheck: function(event, treeId, treeNode) {
				    var treeObj = $.fn.zTree.getZTreeObj(treeId);
				    var map=treeObj.setting.data.map;
				    var checkedNodes = treeObj.getCheckedNodes(true);
				    
				    for(var m=0;m<checkedNodes.length;m++)
				    {
				    	var layer=null;
				    	var layers = map.getLayers().getArray();
				    	for(var i=0;i<layers.length;i++)
				    	{
//				    		alert(layers[i].get("id")+"   "+checkedNodes[m].ID);
				    		if(layers[i].get("id")==checkedNodes[m].ID)
				    		{
				    			layer=layers[i];
				    			break;
				    		}
				    	}
				    	
				    	if(layer!=null)
				    	{
				    		layer.setVisible(true);
				    	}
				    }
				    var uncheckedNodes = treeObj.getCheckedNodes(false);
				    for(var n=0;n<uncheckedNodes.length;n++)
				    {
				    	var layer=null;
				    	var layers = map.getLayers().getArray();
				    	for(var i=0;i<layers.length;i++)
				    	{
				    		if(layers[i].get("id")==uncheckedNodes[n].ID)
				    		{
				    			layer=layers[i];
				    			break;
				    		}
				    	}
				    	if(layer!=null)
				    	{
				    		layer.setVisible(false);
				    	}
				    }
//				    alert(treeNode.ID);
				    var groupname=treeNode.groupname;
				    if(groupname&&groupname!="")
				    {
				    	if(treeNode.checked)
				    	{
				    		var nodes=treeObj.getNodesByParam("groupname",groupname);
				    		for(var n=0;n<nodes.length;n++)
				    		{
				    			var node2=nodes[n];
				    			if(node2.ID!=treeNode.ID&&node2.checked)
				    			{
				    				treeObj.checkNode(node2, false, true,true);
				    			}
				    		}
				    	}
				    }
				}
			}
		};
  
  this.layerdata_=options.layerdata !== undefined ? options.layerdata : {};
  this.initialized_=false;

  /**
   * @type {boolean}
   * @private
   */
  this.collapsed_ = options.collapsed !== undefined ? options.collapsed : true;

  /**
   * @private
   * @type {boolean}
   */
  this.collapsible_ = options.collapsible !== undefined ?
      options.collapsible : true;

  if (!this.collapsible_) {
    this.collapsed_ = false;
  }

  var className = options.className !== undefined ? options.className : 'ol-toc';

  var tipLabel = options.tipLabel !== undefined ? options.tipLabel : '图层控制';

  var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '\u00AB';

  /**
   * @private
   * @type {Node}
   */
  this.collapseLabel_ = typeof collapseLabel === 'string' ?
      goog.dom.createDom('SPAN', {}, collapseLabel) :
      collapseLabel;

  var label = options.label !== undefined ? options.label : '\u00BB';

  /**
   * @private
   * @type {Node}
   */
  this.label_ = typeof label === 'string' ?goog.dom.createDom('SPAN', {}, label) : label;

  var activeLabel = (this.collapsible_ && !this.collapsed_) ?
      this.collapseLabel_ : this.label_;
  var button = goog.dom.createDom('DIV', {
    'type': 'DIV',
    'title': tipLabel
  }, activeLabel);
  button.className = 'ol-toc-toggle';
  ol.events.listen(button, ol.events.EventType.CLICK,
      this.handleClick_, this);
  var layerTree = goog.dom.createDom('ul',
	      "ztree");
  layerTree.id=this.treeId;
  
  var ovmapDiv = goog.dom.createDom('DIV',
	      "ol-toc-map", layerTree);



  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL +
      (this.collapsed_ && this.collapsible_ ? ' ol-toc-collapsed' : '') +
      (this.collapsible_ ? '' : ' ol-toc-uncollapsible');
  var element = goog.dom.createDom('DIV',
      cssClasses, ovmapDiv, button);

  var render = options.render ? options.render : ol.control.TocControl.render;

  goog.base(this, {
    element: element,
    render: render,
    target: options.target
  });
  
};
goog.inherits(ol.control.TocControl, ol.control.Control);


//ol.control.TocControl.prototype.setMap = function(map) {
//	goog.base(this, 'setMap',map);
//};
//ol.control.TocControl.prototype.getMap = function(map) {
//	return this.map_;
//};
/**
 * Update the overview map element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.TocControl}
 * @api
 */
ol.control.TocControl.render = function(mapEvent) {
//	goog.base(this, 'render',mapEvent);
	var map=this.getMap();
	if(!this.initialized_)
	{
		for(var i=this.layerdata_.length-1;i>=0;i--)
		{
			var node=this.layerdata_[i];
			this.layerdata_[i].checked=parseFloat(node.VISIBLE)>0?true:false;
		}
		this.layerTree_ = $.fn.zTree.init($("#"+this.treeId), this.setting_, this.layerdata_);
		this.layerTree_.setting.data.map=map;
		for(var i=0;i< map.getView().getResolutions().length;i++)
		{
			this.matrixIds_[i] = i+1;
		}
		for(var i=this.layerdata_.length-1;i>=0;i--)
		{
			var node=this.layerdata_[i];
			if(node.LAYERTYPE=="group"||node.LAYERTYPE==""||node.LAYERTYPE==undefined)//添加图层分组
			{
				this.layerdata_[i].open=this.expendAll;
			}else{//添加图层
				if(node.SERVERTYPE=="TDT")//添加天地图的数据
				{
					var img=new ol.layer.Tile({
						id:node.ID,
					    opacity: parseFloat(node.OPACITY),
					    visible:parseFloat(node.VISIBLE)>0?true:false,
					    source: new ol.source.WMTS({
//					      attributions: [attribution],
//					      url: 'http://t1.tianditu.cn/img_c/wmts/',
					      url: node.URL.replace(/LAYERTYPE/,node.LAYERTYPE),
					      layer: node.TYPENAME,
					      tileGrid: new ol.tilegrid.WMTS({
						        origin: [node.ORIGINX,node.ORIGINY],
						        resolutions: map.getView().getResolutions(),
						        matrixIds: this.matrixIds_,
						        tileSize: parseInt(node.TILEWIDTH)
						      }),
					      matrixSet: node.MATRIXSET,
					      format: node.FORMAT,
					      wrapX:false,
					      projection: node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION,
					      style: 'default'
					    })
					});
					ol.events.listen(img, "change:visible",this.changeTreeState_, this);
					map.addLayer(img);
				}else if(node.SERVERTYPE=="googleMap"){
					var googleMap = new ol.layer.Tile({  
						id:node.ID,
						layer: node.TYPENAME,
						opacity: parseFloat(node.OPACITY),
					    visible:parseFloat(node.VISIBLE)>0?true:false,
					    		  source: new ol.source.XYZ({
						                urls: ['http://mt0.google.cn/vt/lyrs=y@177000000&,highlight:0x35f05296e7142cb9:0xb9625620af0fa98a@1|style:maps&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&src=app',
						                       'http://mt1.google.cn/vt/lyrs=y@177000000&,highlight:0x35f05296e7142cb9:0xb9625620af0fa98a@1|style:maps&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&src=app',
						                       'http://mt2.google.cn/vt/lyrs=y@177000000&,highlight:0x35f05296e7142cb9:0xb9625620af0fa98a@1|style:maps&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&src=app',
						                       'http://mt3.google.cn/vt/lyrs=y@177000000&,highlight:0x35f05296e7142cb9:0xb9625620af0fa98a@1|style:maps&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&src=app'],
						                       
						            })				                  
		                });
					ol.events.listen(googleMap, "change:visible",this.changeTreeState_, this);
					map.addLayer(googleMap);
				}else if(node.SERVERTYPE=='binMap'){

					var bingMap = new ol.layer.Tile({  
						id:node.ID,
						layer: node.TYPENAME,
						opacity: 1,
					    visible:parseFloat(node.VISIBLE)>0?true:false,
					    		source: new ol.source.BingMaps({
				                    culture: "zh-cn",
				                    key: 'AkjzA7OhS4MIBjutL21bkAop7dc41HSE0CNTR5c6HJy8JKc7U9U9RveWJrylD3XJ',  
				                    imagerySet: 'Aerial',
				                    style: 'default',
				                    projection:node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION
				                })
		                  
		                });
		             
					ol.events.listen(bingMap, "change:visible",this.changeTreeState_, this);
					map.addLayer(bingMap);
				}else if(node.SERVERTYPE=="arcgis")//添加acgisRest的数据
				{
						var arcgisRestLayer=new ol.layer.Tile({
							  id:node.ID,
							  opacity: parseFloat(node.OPACITY),
							  preload: Infinity,
							  visible:parseFloat(node.VISIBLE)>0?true:false,
//						      extent: [75.187202,18.505363,134.27904,52.968872],
						      source: new ol.source.TileArcGISRest({    
					                url:'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'  
					            }),
						    });			 
						ol.events.listen(arcgisRestLayer, "change:visible",this.changeTreeState_, this);
						map.addLayer(arcgisRestLayer);
				}
				else if(node.SERVERTYPE=="geoserver")//添加geoerver的数据
				{
					if("wms"==node.LAYERTYPE.toLowerCase())
					{
						var wmslayer=new ol.layer.Image({
							  id:node.ID,
							  opacity: parseFloat(node.OPACITY),
							  visible:parseFloat(node.VISIBLE)>0?true:false,
//						      extent: [75.187202,18.505363,134.27904,52.968872],
						      source: new ol.source.ImageWMS({
						      projection: node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION,
						      url: node.URL,
						      wrapX:false,
						      params: {
						    	  		SERVICE:node.SERVICE,
						    	  		TRANSPARENT:"true"==node.TRANSPARENT.toLowerCase()?true:false,
						    	  		REQUEST:node.REQUEST,
						    	  		VERSION:node.VERSION,
						    	  		LAYERS: node.TYPENAME,
						    	  		STYLE:node.STYLE	    	  		
						    	  	  },
						      serverType: node.SERVERTYPE
						    })
						 });
						ol.events.listen(wmslayer, "change:visible",this.changeTreeState_, this);
						map.addLayer(wmslayer);
					}
				}else if(node.SERVERTYPE=="mapserver")//添加ArcGIS Server的数据
				{
					if("imagearcgisrest"==node.LAYERTYPE.toLowerCase()){
						var layer = new ol.layer.Image({
										id:node.ID,
										opacity: parseFloat(node.OPACITY),
										visible:parseFloat(node.VISIBLE)>0?true:false,
						                source: new ol.source.ImageArcGISRest({
						                  projection: node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION,
						                  resolutions: map.getView().getResolutions(),
						                  ratio: 1,
						                  wrapX:false,
						                  params:{
						                	  		TRANSPARENT:"true"==node.TRANSPARENT.toLowerCase()?true:false,
						                	  		DPI:96,
						                	  		LAYERS:node.TYPENAME==""||node.TYPENAME==undefined?"":node.TYPENAME
						                	  	 },
						                  url: node.URL
						                })
					 	              });
						ol.events.listen(layer, "change:visible",this.changeTreeState_, this);
						map.addLayer(layer);
					}
				}else if(node.SERVERTYPE=="arcgistiles"){
					var layer1 =	new ol.layer.Tile({
						  id:node.ID,
						  name:node.name,
						  
						  url:node.URL,
						  opacity: parseFloat(node.OPACITY),
					      source: new ol.source.TileImage({
//					        attributions: [attribution],
					    	url:node.URL,
					        tileUrlFunction: function(tileCoord, pixelRatio, projection) {
//					          var urlTemplate = 'http://services.arcgisonline.com/arcgis/rest/services/' +
//					                            'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}';
//					        	                 http://127.0.0.1:6080/arcgis/rest/services/test/test/MapServer/tile/0/9/13
//					          var urlTemplate =	'http://127.0.0.1:6080/arcgis/rest/services/test/test/MapServer/tile/{z}/{y}/{x}';
//					          alert(JSON.stringify(this.getProperties()));
//					          var urlTemplate =	this.get("url");
//					          var urlTemplate =	"http://localhost:6080/arcgis/rest/services/yss/test01_1/MapServer/tile/{z}/{y}/{x}";
//					          alert(urlTemplate);
					          
//					        	alert("AA"+this.getUrls()[0]);
					        	var urlTemplate =this.getUrls()[0];
					        	var z = tileCoord[0];
					          var x = tileCoord[1];
					          var y = -tileCoord[2] - 1;
					          // wrap the world on the X axis
					          var n = Math.pow(2, z + 1); // 2 tiles at z=0
//					          x = x % n;
//					          if (x * n < 0) {
//					            // x and n differ in sign so add n to wrap the result
//					            // to the correct sign
//					            x = x + n;
//					          }
					          return urlTemplate.replace('{z}', z.toString())
					              .replace('{y}', y.toString())
					              .replace('{x}', x.toString());
					        },
					        projection: node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION,
					        wrapX:false,
					        tileGrid: new ol.tilegrid.TileGrid({
					          origin: [node.ORIGINX,node.ORIGINY],
//					          origin: [-180,90],
					          resolutions: map.getView().getResolutions(),
					          tileSize: node.TILEWIDTH
					        })
					      })
					    });
					layer=layer1;
//					alert(JSON.stringify(layer1.get('url')));
					map.addLayer(layer);
				}else if(node.SERVERTYPE=="myarcgistiles"){
						var layer =	new ol.layer.Tile({
							  id:node.ID,
							  name:node.name,
							  opacity:  parseFloat(node.OPACITY),
						      source: new ol.source.TileImage({
				//		        attributions: [attribution],
						    	url:node.URL,
						        tileUrlFunction: function(tileCoord, pixelRatio, projection) {
				//		          var urlTemplate = 'http://services.arcgisonline.com/arcgis/rest/services/' +
				//		                            'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}';
				//		        	                 http://127.0.0.1:6080/arcgis/rest/services/test/test/MapServer/tile/0/9/13
				//		          var urlTemplate =	'http://127.0.0.1:6080/arcgis/rest/services/test/test/MapServer/tile/{z}/{y}/{x}';
	//					          var urlTemplate =	"http://localhost/arcgistiles/yss_test01_5/Layers/_alllayers/{z}/{y}/{x}.png";
						          var urlTemplate =this.getUrls()[0];
						          var z = tileCoord[0];
						          var x = tileCoord[1];
						          var y = -tileCoord[2] - 1;
				//		          alert(JSON.stringify(tileCoord));
				//		          alert("z="+z+", x="+x+", y="+y);
						          // wrap the world on the X axis
						          var n = Math.pow(2, z + 1); // 2 tiles at z=0
				//		          x = x % n;
				//		          if (x * n < 0) {
				//		            // x and n differ in sign so add n to wrap the result
				//		            // to the correct sign
				//		            x = x + n;
				//		          }
				//		          if(z<0)
				//		          {
				//		        	  z=0;
				//		          }
						          var L="";
						          if(z.toString().length>1)
								  {
										L="L"+z;
								  }else
								  {
									    L="L0"+z;
								  }
				//		          if(y<0)
				//		          {
				//		        	  y=0;
				//		          }
						          var R=y.toString(16);
								  if(R.length<8)
								  {
										var oNum=8-R.length;
										for(var i=0;i<oNum;i++)
										{
											R="0"+R;
										}
								  }
								  R="R"+R;
				//				  if(x<0)
				//				  {
				//					  x=0;
				//				  }
								  var C=x.toString(16);
								  if(C.length<8)
								  {
										var oNum=8-C.length;
										for(var i=0;i<oNum;i++)
										{
											C="0"+C;
										}
								  }
								  C="C"+C;
						          return urlTemplate.replace('{z}', L)
						              .replace('{y}', R)
						              .replace('{x}', C);
						        },
						        projection: node.PROJECTTION==null||node.PROJECTTION==""||node.PROJECTTION==undefined?map.getView().getProjection().getCode():node.PROJECTTION,
								wrapX:false,
						        tileGrid: new ol.tilegrid.TileGrid({
						        	origin: [node.ORIGINX,node.ORIGINY],
	//						          origin: [-180,90],
							        resolutions: map.getView().getResolutions(),
							        tileSize: node.TILEWIDTH
						        })
						      })
						    });
					map.addLayer(layer);
				}else if(node.SERVERTYPE=="geojson"){//添加GeoJSON的数据
					 var GeoJsonLayer = new ol.layer.Vector({
						id : node.ID,
						opacity : parseFloat(node.OPACITY),
						visible : parseFloat(node.VISIBLE) > 0 ? true : false,
						title : 'add Layer',
						source : new ol.source.Vector({
							projection : 'EPSG:4326',
							url : node.URL,
							format : new ol.format.GeoJSON()					
						        }),
						style:styleFunction(node.FORMAT)
					});
					 ol.events.listen(GeoJsonLayer, "change:visible",this.changeTreeState_, this);
					 map.addLayer(GeoJsonLayer);
//					 GeoJsonLayer.setStyle(new ol.style.Style({
//						        stroke: new ol.style.Stroke({
//						            color: 'green',
//						            width: 2
//						          })
//						        }));
					
				}else if(node.SERVERTYPE=="qgis"){//添加QGIS的数据
					
						
				}else{
					alert(node.SERVERTYPE+"的地图数据以后扩展.....");
				}
			}
		}
		
//		var initChecedNodes = this.layerTree_.getCheckedNodes(true);
		this.initialized_=true;
		
		for(var i=this.layerdata_.length-1;i>=0;i--)
		{
			var node=this.layerdata_[i];
			if(parseFloat(node.VISIBLE)>0)
			{
				var node2 = this.layerTree_.getNodeByParam("ID",node.ID);
				this.layerTree_.checkNode(node2, true, true,true);
			}
		}
		if(this.expendAll)
		{
			this.layerTree_.expandAll(true);
		}
//		var node = this.layerTree_.getNodeByTId("9");
//		this.layerTree_.checkNode(node, true, true);
//		alert("map object:"+this.getMap().getRevision());
//		alert("map:"+JSON.stringify(this.getMap().getSize()));
	}
};
ol.control.TocControl.prototype.changeTreeState_ = function(event,opt_type) {
	var visible=event.target.get("visible");
	var nodeid=event.target.get("id");
	var node = this.layerTree_.getNodeByParam("ID",nodeid);
//	this.checkNode(node, visible, false,false);
	this.layerTree_.checkNode(node, visible, false,false);
};

ol.control.TocControl.prototype.checkNode = function(node, visible,checkTypeFlag,callbackFlag) {
	if(visible)
	{
		this.layerTree_.checkNode(node, visible, checkTypeFlag,callbackFlag);
		var parent = node.getParentNode();
		if(parent!=null)
		{
			this.checkNode(parent, visible, checkTypeFlag,callbackFlag);
		}
	}else{
		var groupname=node.groupname;
		if(groupname&&groupname!="")
		{
			this.layerTree_.checkNode(node, visible, checkTypeFlag,callbackFlag);
		}else{
			this.layerTree_.checkNode(node, visible, checkTypeFlag,callbackFlag);
		}
		
	}
};
/**
 * @param {Event} event The event to handle
 * @private
 */
ol.control.TocControl.prototype.handleClick_ = function(event) {
  event.preventDefault();
  this.handleToggle_();
};
//
//
/**
 * @private
 */
ol.control.TocControl.prototype.handleToggle_ = function() {
  this.element.classList.toggle('ol-toc-collapsed');
  this.element.classList.toggle('ol-toc-uncollapsed');
  if (this.collapsed_) {
    goog.dom.replaceNode(this.collapseLabel_, this.label_);
  } else {
    goog.dom.replaceNode(this.label_, this.collapseLabel_);
  }
  this.collapsed_ = !this.collapsed_;

  // manage overview map if it had not been rendered before and control
  // is expanded
  var ovmap = this.ovmap_;
  if (!this.collapsed_ ) {
//    ovmap.updateSize();
//    this.resetExtent_();
    ol.events.listenOnce(ovmap, ol.MapEventType.POSTRENDER,
        function(event) {
//          this.updateBox_();
        },
        this);
  }
};
//
//
/**
 * Return `true` if the overview map is collapsible, `false` otherwise.
 * @return {boolean} True if the widget is collapsible.
 * @api stable
 */
ol.control.TocControl.prototype.getCollapsible = function() {
  return this.collapsible_;
};
//
//
/**
 * Set whether the overview map should be collapsible.
 * @param {boolean} collapsible True if the widget is collapsible.
 * @api stable
 */
ol.control.TocControl.prototype.setCollapsible = function(collapsible) {
  if (this.collapsible_ === collapsible) {
    return;
  }
  this.collapsible_ = collapsible;
  this.element.classList.toggle('ol-toc-uncollapsible');
  if (!collapsible && this.collapsed_) {
    this.handleToggle_();
  }
};
//
//
/**
 * Collapse or expand the overview map according to the passed parameter. Will
 * not do anything if the overview map isn't collapsible or if the current
 * collapsed state is already the one requested.
 * @param {boolean} collapsed True if the widget is collapsed.
 * @api stable
 */
ol.control.TocControl.prototype.setCollapsed = function(collapsed) {
  if (!this.collapsible_ || this.collapsed_ === collapsed) {
    return;
  }
  this.handleToggle_();
};
//
//
/**
 * Determine if the overview map is collapsed.
 * @return {boolean} The overview map is collapsed.
 * @api stable
 */
ol.control.TocControl.prototype.getCollapsed = function() {
  return this.collapsed_;
};


/**
 * Return the overview map.
 * @return {ol.Map} Overview map.
 * @api
 */
ol.control.TocControl.prototype.getTocControl = function() {
  return this;
};
