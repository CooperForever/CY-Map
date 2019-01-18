/**
 * @enum {string}
 */
ol.control.QuickToolControlProperty = {
	UNITS: 'units'
};


ol.control.QuickToolControlPath = {
	curPath: "themes/default/images/mouse/",
	imgPath: "themes/default/images/maptool/"
};

ol.control.QuickToolControlHistory = {
	MAXSIZE: 10,
	ISSAVEHISTORY: true,
	CURRENTINDEX: 0,
	HISTORYARR: new Array()
};
//放大缩小
ol.control.QuickToolControlFdSx = {
	map: null,
	dragBox: null,
	dragBoxCondition_: 0 //等于1放大，等于2缩小  ,等于0不操作
};
//测量
ol.control.QuickToolControlMeasure = {
	measureActive: false,
	source: null,
	measureLayer: null,
	WGS84SPHERE: new ol.Sphere(6378137),
	SKETCH: null,
	HELPTOOLTIPELEMENT: null,
	HELPTOOLTIP: null,
	MEASURETOOLTIPELEMENT: null,
	MEASURETOOLTIP: null,
	CONTINUEPOLYGONMSG: '单击继续画面，双击结束',
	CONTINUELINEMSG: '单击继续画线，双击结束',
	DRAW: null,
	LISTENER: null,
	GEODESIC: true,
	ISAREA: true //true测面积，false测长度
};


/**
 * @classdesc
 * A control displaying rough x-axis distances, calculated for the center of the
 * viewport.
 * No scale line will be shown when the x-axis distance cannot be calculated in
 * the view projection (e.g. at or beyond the poles in EPSG:4326).
 * By default the scale line will show in the bottom left portion of the map,
 * but this can be changed by using the css selector `.ol-scale-line`.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.ScaleLineOptions=} opt_options Scale line options.
 * @api stable
 */
ol.control.QuickToolControl = function (opt_options) {

	var options = opt_options ? opt_options : {};

	var className = options.className !== undefined && options.className !== null ? options.className : 'ol-quick-tool';

	this.isListenPointerMove_ = false;

	this.initalCenter_ = null;
	this.initalExtent_ = null;

	/**
	 * @private
	 * @type {Element}
	 */
	this.element_ = document.createElement('DIV');
	this.element_.className = className + ' ' + ol.css.CLASS_UNSELECTABLE;

	this.qtElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "全图"
	});
	this.qtElement_.src = ol.control.QuickToolControlPath.imgPath + "qt.png";
	this.element_.appendChild(this.qtElement_);
	ol.events.listen(this.qtElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleQtClick_.bind(this));

	this.hstElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "后一视图"
	});
	this.hstElement_.src = ol.control.QuickToolControlPath.imgPath + "ht.png";
	this.element_.appendChild(this.hstElement_);
	ol.events.listen(this.hstElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleHtClick_.bind(this));

	this.qstElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "前一视图"
	});
	this.qstElement_.src = ol.control.QuickToolControlPath.imgPath + "qj.png";
	this.element_.appendChild(this.qstElement_);
	ol.events.listen(this.qstElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleQjClick_.bind(this));



	this.pyElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "平移"
	});
	this.pyElement_.src = ol.control.QuickToolControlPath.imgPath + "my.png";
	this.element_.appendChild(this.pyElement_);
	ol.events.listen(this.pyElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handlePyClick_.bind(this));

	this.fdElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "放大"
	});
	this.fdElement_.src = ol.control.QuickToolControlPath.imgPath + "fd.png";
	this.element_.appendChild(this.fdElement_);
	ol.events.listen(this.fdElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleFdClick_.bind(this));

	this.sxElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "缩小"
	});
	this.sxElement_.src = ol.control.QuickToolControlPath.imgPath + "sx.png";
	this.element_.appendChild(this.sxElement_);
	ol.events.listen(this.sxElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleSxClick_.bind(this));

	this.cjElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "测距"
	});
	this.cjElement_.src = ol.control.QuickToolControlPath.imgPath + "cj.png";
	this.element_.appendChild(this.cjElement_);
	ol.events.listen(this.cjElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleCjClick_.bind(this));

	this.cmElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "测面积"
	});
	this.cmElement_.src = ol.control.QuickToolControlPath.imgPath + "cm.png";
	this.element_.appendChild(this.cmElement_);
	ol.events.listen(this.cmElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleCmClick_.bind(this));

	this.qcElement_ = goog.dom.createDom("IMG", {
		'class': className + "-item",
		'type': 'img',
		'title': "清除"
	});
	this.qcElement_.src = ol.control.QuickToolControlPath.imgPath + "qc.png";
	this.element_.appendChild(this.qcElement_);
	ol.events.listen(this.qcElement_, ol.events.EventType.CLICK,
		ol.control.QuickToolControl.prototype.handleQcClick_.bind(this));



	/**
	 * @private
	 * @type {?olx.ViewState}
	 */
	this.viewState_ = null;

	/**
	 * @private
	 * @type {number}
	 */
	this.minWidth_ = options.minWidth !== undefined ? options.minWidth : 64;

	/**
	 * @private
	 * @type {boolean}
	 */
	this.renderedVisible_ = false;

	/**
	 * @private
	 * @type {number|undefined}
	 */
	this.renderedWidth_ = undefined;

	/**
	 * @private
	 * @type {string}
	 */
	this.renderedHTML_ = '';

	var render = options.render ? options.render : ol.control.QuickToolControl.render;

	goog.base(this, {
		element: this.element_,
		render: render,
		target: options.target
	});

};
goog.inherits(ol.control.QuickToolControl, ol.control.Control);
/**
 * 
 * @param curName
 * @param tag  是否为系统自带鼠标样式，true为自带样式，false为外部cur文件
 */
ol.control.QuickToolControl.prototype.changeMouseStyle = function (curName, tag) {
	var map = this.getMap();
	var p = null;
	if (tag) {
		p = curName;
	} else {
		p = "url('" + ol.control.QuickToolControlPath.curPath + curName + "'),default";
	}

	$(map.getTargetElement()).find(".ol-viewport>canvas").css("cursor", p);
};

/**
 * @const
 * @type {Array.<number>}
 */
ol.control.QuickToolControl.LEADING_DIGITS = [1, 2, 5];
//全图
ol.control.QuickToolControl.prototype.handleQtClick_ = function (event) {
	event.preventDefault();
	var map = this.getMap();
	var view = map.getView();
	view.setResolution(view.maxResolution_);
	view.setCenter(this.initalCenter_);
};
//后退
ol.control.QuickToolControl.prototype.handleHtClick_ = function (event) {
	event.preventDefault();
	var map = this.getMap();
	var view = map.getView();
	ol.control.QuickToolControlHistory.ISSAVEHISTORY = false;
	var i = ol.control.QuickToolControlHistory.CURRENTINDEX - 1;
	if (i >= 0) {
		var obj = ol.control.QuickToolControlHistory.HISTORYARR[i];
		view.setResolution(obj.resolution);
		view.setCenter(obj.center);
		ol.control.QuickToolControlHistory.CURRENTINDEX = ol.control.QuickToolControlHistory.CURRENTINDEX - 1;
	}
};
//前进
ol.control.QuickToolControl.prototype.handleQjClick_ = function (event) {
	event.preventDefault();
	var map = this.getMap();
	var view = map.getView();
	ol.control.QuickToolControlHistory.ISSAVEHISTORY = false;
	var i = ol.control.QuickToolControlHistory.CURRENTINDEX + 1;
	if (i < ol.control.QuickToolControlHistory.HISTORYARR.length) {
		var obj = ol.control.QuickToolControlHistory.HISTORYARR[i];
		view.setResolution(obj.resolution);
		view.setCenter(obj.center);
		ol.control.QuickToolControlHistory.CURRENTINDEX += 1;
	}
};
//平移
ol.control.QuickToolControl.prototype.handlePyClick_ = function (event) {
	//拉框放大缩小取消
	this.removeSF();
	//测量面积距离取消
	this.removeCL();
	if (ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.classList.add('hidden');
	}
	//改变鼠标样式
	this.changeMouseStyle("pan.cur", false);
};


//拉框放大缩小的条件函数
ol.control.QuickToolControl.dragBoxConditionFun_ = function (evt) {
	if (ol.control.QuickToolControlFdSx.dragBoxCondition_ == 1 || ol.control.QuickToolControlFdSx.dragBoxCondition_ == 2) //等于1放大，等于2缩小  
	{
		return true;
	} else {
		return false;
	}
};
ol.control.QuickToolControl.addSFDragBox = function (tag) {
	ol.control.QuickToolControlFdSx.dragBox = new ol.interaction.DragBox({
		condition: ol.control.QuickToolControl.dragBoxConditionFun_,
		className: "ol-dragbox-custom"
	});
	ol.control.QuickToolControlFdSx.map.addInteraction(ol.control.QuickToolControlFdSx.dragBox);
	ol.control.QuickToolControlFdSx.dragBox.on('boxend', function () {
		//      var info = [];
		var extent = this.getGeometry().getExtent();
		if (tag == 1) //放大
		{
			var map = this.getMap();
			var view = map.getView();
			view.fit(extent, map.getSize());
		} else if (tag == 2) //缩小
		{
			var map = this.getMap();
			var view = map.getView();

			var bottomLeft = ol.extent.getBottomLeft(extent);
			var topRight = ol.extent.getTopRight(extent);
			var height = topRight[1] - bottomLeft[1];
			var widht = topRight[0] - bottomLeft[0];

			var currentExtent = view.calculateExtent(map.getSize());
			var bottomLeft2 = ol.extent.getBottomLeft(currentExtent);
			var topRight2 = ol.extent.getTopRight(currentExtent);
			var height2 = topRight2[1] - bottomLeft2[1];
			var widht2 = topRight2[0] - bottomLeft2[0];

			var scale1 = height2 / height;
			var scale2 = widht2 / widht;

			var scale = Math.min(scale1, scale2);

			//      	var res = view.constrainResolution(view.getResolution(), scale, 0);
			var size = map.getSize();
			size = [size[0] * scale / 2, size[1] * scale / 2];
			var extext2 = view.calculateExtent(size);
			view.fit(extext2, map.getSize());
			view.setCenter(ol.extent.getCenter(extent));
		} else {

		}
	});
};
//取消缩放
ol.control.QuickToolControl.prototype.removeSF = function () {
	ol.control.QuickToolControlFdSx.dragBoxCondition_ = 0;
	if (ol.control.QuickToolControlFdSx.dragBox) {
		ol.control.QuickToolControlFdSx.map.removeInteraction(ol.control.QuickToolControlFdSx.dragBox);
		ol.control.QuickToolControlFdSx.dragBox = null;
	}
};
//放大
ol.control.QuickToolControl.prototype.handleFdClick_ = function (event) {
	event.preventDefault();
	//	view.fit([117,39,118,40],map.getSize());
	//移除测量功能
	this.removeCL();
	if (ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.classList.add('hidden');
	}
	//添加放大功能
	this.removeSF();
	ol.control.QuickToolControlFdSx.dragBoxCondition_ = 1;
	ol.control.QuickToolControl.addSFDragBox(ol.control.QuickToolControlFdSx.dragBoxCondition_);

	//改变鼠标样式
	this.changeMouseStyle("zoom_in.cur", false);
};
//缩小
ol.control.QuickToolControl.prototype.handleSxClick_ = function (event) {
	event.preventDefault();
	//移除测量功能
	this.removeCL();
	if (ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.classList.add('hidden');
	}
	//添加缩小功能
	this.removeSF();
	ol.control.QuickToolControlFdSx.dragBoxCondition_ = 2;
	ol.control.QuickToolControl.addSFDragBox(ol.control.QuickToolControlFdSx.dragBoxCondition_);
	//改变鼠标样式
	this.changeMouseStyle("zoom_out.cur", false);
};
ol.control.QuickToolControl.formatLength = function (line) {
	var length;
	if (ol.control.QuickToolControlMeasure.GEODESIC) {
		var coordinates = line.getCoordinates();
		length = 0;
		//      parent.debugInfo(JSON.stringify(coordinates));
		var sourceProj = ol.control.QuickToolControlMeasure.MAP.getView().getProjection();
		for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
			var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
			var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
			length += ol.control.QuickToolControlMeasure.WGS84SPHERE.haversineDistance(c1, c2);
		}
	} else {
		length = Math.round(line.getLength() * 100) / 100;
	}
	var output;
	if (length > 100) {
		output = (Math.round(length / 1000 * 100) / 100) +
			' ' + 'km';
	} else {
		output = (Math.round(length * 100) / 100) +
			' ' + 'm';
	}
	return output;
};
ol.control.QuickToolControl.formatArea = function (polygon) {
	var area = 0;
	var length = 0;
	if (ol.control.QuickToolControlMeasure.GEODESIC) {
		var sourceProj = ol.control.QuickToolControlMeasure.MAP.getView().getProjection();
		var geom = /** @type {ol.geom.Polygon} */ (polygon.clone().transform(
			sourceProj, 'EPSG:4326'));
		var coordinates = geom.getLinearRing(0).getCoordinates();
		//      alert(JSON.stringify(coordinates));
		area = Math.abs(ol.control.QuickToolControlMeasure.WGS84SPHERE.geodesicArea(coordinates));
		var coordinates2 = new ol.Collection(coordinates);
		if (coordinates2.getLength() > 2) {
			coordinates2.push(coordinates[0]);
		}
		var coordinates3 = coordinates2.getArray();


		for (var i = 0, ii = coordinates3.length - 1; i < ii; ++i) {
			var c1 = ol.proj.transform(coordinates3[i], sourceProj, 'EPSG:4326');
			var c2 = ol.proj.transform(coordinates3[i + 1], sourceProj, 'EPSG:4326');
			length += ol.control.QuickToolControlMeasure.WGS84SPHERE.haversineDistance(c1, c2);
		}
	} else {
		area = polygon.getArea();
		var linerRing = polygon.getLinearRings()[0];
		var coordinates = linerRing.getCoordinates();
		var coordinates2 = new ol.Collection(coordinates);
		if (coordinates2.getLength() > 2) {
			coordinates2.push(coordinates[0]);
		}
		var coordinates3 = coordinates2.getArray();
		var lineString = new ol.geom.LineString(coordinates3, "XY");
		length = lineString.getLength();
	}
	var output;
	if (area > 10000) {
		output = "面积:" + (Math.round(area / 1000000 * 100) / 100) +
			' ' + 'km<sup>2</sup>';
	} else {
		output = "面积:" + (Math.round(area * 100) / 100) +
			' ' + 'm<sup>2</sup>';
	}
	if (length > 100) {
		output += " 周长:" + (Math.round(length / 1000 * 100) / 100) +
			' ' + 'km';
	} else {
		output += " 周长:" + (Math.round(length * 100) / 100) +
			' ' + 'm';
	}
	return output;
	//    return "预警区域";
};
/**
 * Return the units to use in the scale line.
 * @return {ol.control.ScaleLineUnits|undefined} The units to use in the scale
 *     line.
 * @observable
 * @api stable
 */
ol.control.QuickToolControl.prototype.getUnits = function () {

};

ol.control.QuickToolControl.pointerMoveHandlerMeasure = function (evt) {
	//	  parent.debugInfo(JSON.stringify(evt.coordinate));
	if (evt.dragging) {
		return;
	}
	if (!ol.control.QuickToolControlMeasure.measureActive) {
		//		  alert(ol.control.QuickToolControlMeasure.measureActive);
		return;
	}
	/** @type {string} */
	var helpMsg = '';
	if (ol.control.QuickToolControlMeasure.ISAREA) {
		helpMsg = "单击开始测面积";
	} else {
		helpMsg = "单击开始测距离";
	}

	if (ol.control.QuickToolControlMeasure.SKETCH) {
		var geom = (ol.control.QuickToolControlMeasure.SKETCH.getGeometry());
		if (geom instanceof ol.geom.Polygon) {
			helpMsg = ol.control.QuickToolControlMeasure.CONTINUEPOLYGONMSG;
		} else if (geom instanceof ol.geom.LineString) {
			helpMsg = ol.control.QuickToolControlMeasure.CONTINUELINEMSG;
		}
	}

	ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.innerHTML = helpMsg;
	ol.control.QuickToolControlMeasure.HELPTOOLTIP.setPosition(evt.coordinate);
	ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.classList.remove('hidden');
};

ol.control.QuickToolControl.createMeasureHelpTooltip = function () {
	if (ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.parentNode.removeChild(ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT);
	}
	ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT = document.createElement('div');
	ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.className = 'quicktool-tooltip hidden';
	ol.control.QuickToolControlMeasure.HELPTOOLTIP = new ol.Overlay({
		element: ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT,
		offset: [15, 0],
		positioning: 'center-left'
	});
	ol.control.QuickToolControlMeasure.MAP.addOverlay(ol.control.QuickToolControlMeasure.HELPTOOLTIP);
};


/**
 * Creates a new measure tooltip
 */
ol.control.QuickToolControl.createMeasureTooltip = function () {
	if (ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT.parentNode.removeChild(ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT);
	}
	ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT = document.createElement('div');
	ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT.className = 'quicktool-tooltip quicktool-tooltip-measure';
	ol.control.QuickToolControlMeasure.MEASURETOOLTIP = new ol.Overlay({
		element: ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT,
		offset: [0, -15],
		positioning: 'bottom-center'
	});
	ol.control.QuickToolControlMeasure.MAP.addOverlay(ol.control.QuickToolControlMeasure.MEASURETOOLTIP);
};
ol.control.QuickToolControl.viewportMouseOut = function () {
	if (ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT) {
		ol.control.QuickToolControlMeasure.HELPTOOLTIPELEMENT.classList.add('hidden');
		//ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT.classList.add('hidden');
	}
};
ol.control.QuickToolControl.prototype.addMeasure = function () {
	if (!ol.control.QuickToolControlMeasure.source) {
		ol.control.QuickToolControlMeasure.source = new ol.source.Vector({
			wrapX: false
		});
		ol.control.QuickToolControlMeasure.measureLayer = new ol.layer.Vector({
			id: "measureLayer",
			source: ol.control.QuickToolControlMeasure.source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(150, 0, 0, 0.4)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc33',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33'
					})
				})
			})
		});
		this.getMap().addLayer(ol.control.QuickToolControlMeasure.measureLayer);
		this.getMap().on('pointermove', ol.control.QuickToolControl.pointerMoveHandlerMeasure);
	}
	if (ol.control.QuickToolControlMeasure.DRAW) {
		this.getMap().removeInteraction(ol.control.QuickToolControlMeasure.DRAW);
		ol.control.QuickToolControlMeasure.DRAW = null;
	}
	ol.control.QuickToolControlMeasure.DRAW = new ol.interaction.Draw({
		source: ol.control.QuickToolControlMeasure.source,
		wrapX: false,
		type: /** @type {ol.geom.GeometryType} */ ol.control.QuickToolControlMeasure.ISAREA ? "Polygon" : "LineString",
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: 'rgba(255, 0, 0, 1)',
				lineDash: [5, 10],
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 5,
				stroke: new ol.style.Stroke({
					color: 'rgba(0, 0, 0, 0)'
				}),
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0)'
				})
			})
		})
	});
	ol.control.QuickToolControlMeasure.MAP.addInteraction(ol.control.QuickToolControlMeasure.DRAW);

	ol.control.QuickToolControl.createMeasureTooltip();
	ol.control.QuickToolControl.createMeasureHelpTooltip();


	ol.control.QuickToolControlMeasure.DRAW.on('drawstart',
		function (evt) {
			// set sketch
			ol.control.QuickToolControlMeasure.SKETCH = evt.feature;

			/** @type {ol.Coordinate|undefined} */
			var tooltipCoord = evt.coordinate;

			ol.control.QuickToolControlMeasure.LISTENER = ol.control.QuickToolControlMeasure.SKETCH.getGeometry().on('change', function (evt) {
				var geom = evt.target;
				var output = null;
				if (geom instanceof ol.geom.Polygon) {
					output = ol.control.QuickToolControl.formatArea(geom);
					tooltipCoord = geom.getInteriorPoint().getCoordinates();
				} else if (geom instanceof ol.geom.LineString) {
					output = ol.control.QuickToolControl.formatLength(geom);
					tooltipCoord = geom.getLastCoordinate();
				}
				ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT.innerHTML = output;
				ol.control.QuickToolControlMeasure.MEASURETOOLTIP.setPosition(tooltipCoord);
			});
		}, this);

	ol.control.QuickToolControlMeasure.DRAW.on('drawend',
		function () {
			ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT.className = 'quicktool-tooltip quicktool-tooltip-static';
			ol.control.QuickToolControlMeasure.MEASURETOOLTIP.setOffset([0, -7]);
			// unset sketch
			ol.control.QuickToolControlMeasure.SKETCH = null;
			// unset tooltip so that a new one can be created
			ol.control.QuickToolControlMeasure.MEASURETOOLTIPELEMENT = null;
			ol.control.QuickToolControl.createMeasureTooltip();
			ol.Observable.unByKey(ol.control.QuickToolControlMeasure.LISTENER);
		}, this);
};
//取消测量功能
ol.control.QuickToolControl.prototype.removeCL = function () {
	ol.control.QuickToolControlMeasure.measureActive = false;
	if (ol.control.QuickToolControlMeasure.DRAW) {
		ol.control.QuickToolControlMeasure.MAP.removeInteraction(ol.control.QuickToolControlMeasure.DRAW);
		ol.control.QuickToolControlMeasure.DRAW = null;
		this.getMap().getViewport().removeEventListener('mouseout', ol.control.QuickToolControl.viewportMouseOut);
	}

};
//测距
ol.control.QuickToolControl.prototype.handleCjClick_ = function (event) {
	event.preventDefault();
	//取消拉框放大缩小
	this.removeSF();
	//添加测量距离
	this.removeCL();
	ol.control.QuickToolControlMeasure.measureActive = true;
	ol.control.QuickToolControlMeasure.ISAREA = false;
	this.addMeasure();
	//改变鼠标样式
	this.changeMouseStyle("measure-cj.cur", false);
};
//测面积
ol.control.QuickToolControl.prototype.handleCmClick_ = function (event) {
	event.preventDefault();
	//取消拉框放大缩小
	this.removeSF();
	//添加测量面积
	this.removeCL();
	ol.control.QuickToolControlMeasure.measureActive = true;
	ol.control.QuickToolControlMeasure.ISAREA = true;
	this.addMeasure();
	//改变鼠标样式
	this.changeMouseStyle("measure-cm.cur", false);
};
//清除
ol.control.QuickToolControl.prototype.handleQcClick_ = function (event) {
	event.preventDefault();
	//清除测量图层
	if (ol.control.QuickToolControlMeasure.measureLayer) {
		event.preventDefault();
		//取消拉框放大缩小
		this.removeSF();
		//添加测量距离
		this.removeCL();
		ol.control.QuickToolControlMeasure.measureLayer.getSource().clear();
		$(".quicktool-tooltip-static").parent().remove();
		$(".quicktool-tooltip").parent().remove();
		this.changeMouseStyle("default", true);
	}
	$("#clearFeaturesTool").click();
};
/**
 * Update the QuickToolControl element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.QuickToolControl}
 * @api
 */
ol.control.QuickToolControl.render = function (mapEvent) {
	if (!this.isListenPointerMove_) {
		var map = this.getMap();
		var mapElement = map.getTargetElement();
		$(mapElement).find('.ol-quick-tool>.ol-quick-tool-item').tooltip({
			delay: {
				"show": 50,
				"hide": 50
			},
			placement: 'top'
		});

		this.initalExtent_ = map.getView().calculateExtent(map.getSize());
		//		this.historyArr_.push(this.initalExtent_);
		this.initalCenter_ = [(this.initalExtent_[0] + this.initalExtent_[2]) / 2, (this.initalExtent_[1] + this.initalExtent_[3]) / 2];
		//		alert(ol.control.QuickToolControlHistory.CURRENTINDEX);
		ol.control.QuickToolControlHistory.HISTORYARR.push({
			resolution: map.getView().getResolution(),
			center: this.initalCenter_
		});
		$(mapElement).find(".ol-viewport").bind("mouseout", function () {
			var objarr = $(mapElement).find('.ol-quick-tool img');
			for (var i = 0; i < objarr.length; i++) {
				$(objarr[i]).css("width", 32);
				$(objarr[i]).css("height", 32);
			}
		});
		map.on('pointermove', function (evt) {
			//			var pixel = this.getEventPixel(evt.originalEvent);
			//			var pixel = this.getPixelFromCoordinate(evt.coordinate);
			var i = 0;
			var pixel = evt.pixel;
			var iMax = 48;
			var mapElement = evt.map.getTargetElement();
			//			if((parseInt($(".ol-viewport>canvas").css("height"))-pixel[1])>55)
			if ((parseInt($(mapElement).find(".ol-viewport>canvas").css("height")) - pixel[1]) > 55) {
				return;
			}

			//			alert(JSON.stringify(pixel));
			//			var oEvent=ev||event;
			var oDiv = $(mapElement).find('.ol-quick-tool');
			//			oDiv.className="apple-tool-bar";
			var aImg = $(mapElement).find('.ol-quick-tool>.ol-quick-tool-item');
			//			alert(aImg.length);
			var d = 0;
			//			parent.debugInfo(parseInt($(".map>.ol-viewport>canvas").css("height"))+"----"+obj.height+"----"+oDiv.offsetBottom+"----"+pixel[1]+"----"+obj.offsetHeight/2);
			function getDistance(obj) {
				//				parent.debugInfo(parseInt($(".map>.ol-viewport>canvas").css("height"))+"----"+obj.height+"----"+oDiv.offsetBottom+"----"+pixel[1]+"----"+obj.offsetHeight/2);
				return Math.sqrt(
					Math.pow(obj.offsetLeft - pixel[0] + obj.offsetWidth / 2, 2) +
					Math.pow(parseInt($(mapElement).find(".ol-viewport>canvas").css("height")) - obj.height - 5 - pixel[1] + obj.offsetHeight / 2, 2)
				);
			}
			for (i = 0; i < aImg.length; i++) {
				d = getDistance(aImg[i]);
				d = Math.min(d, iMax);
				var width = ((iMax - d) / iMax) * 32 + 32;
				var height = ((iMax - d) / iMax) * 32 + 32;
				$(aImg[i]).css("width", width);
				$(aImg[i]).css("height", height);
			}
		});
		//		var view = map.getView();
		map.on('moveend', function (evt) {
			if (ol.control.QuickToolControlHistory.ISSAVEHISTORY) {
				if (ol.control.QuickToolControlHistory.HISTORYARR.length >= ol.control.QuickToolControlHistory.MAXSIZE) {
					ol.control.QuickToolControlHistory.HISTORYARR.shift();
				}
				ol.control.QuickToolControlHistory.HISTORYARR.push({
					resolution: this.getView().getResolution(),
					center: this.getView().getCenter()
				});
				ol.control.QuickToolControlHistory.CURRENTINDEX = ol.control.QuickToolControlHistory.HISTORYARR.length - 1;
			}
			ol.control.QuickToolControlHistory.ISSAVEHISTORY = true;
		});

		//拉框放大缩小
		ol.control.QuickToolControlFdSx.map = this.getMap();
		//测量距离面积
		ol.control.QuickToolControlMeasure.MAP = this.getMap();
		this.isListenPointerMove_ = true;
	}

};