/**
 *@description plugin by openlayer 3.1.6
 *@author cooper
 *@version 0.0.1
 */
;
(function (_global, undefined) {
  var _global;
  var CYMap = {
    _map: {},
    _projection: "EPSG:4326",
    _projectionExtent: null,
    _target: "map",
    _resolutions: null,
    _initExtent: null,
    _proxyUrl: null,
    _matrixIds: null,
    _layersConf: [],
    _ovLayersConf: [],
    _option: null,
    // 初始化
    init: function (options) {
      this._resolutions = options.resolutions ? options.resolutions : this._resolutions;
      this._initExtent = options.initExtent ? options.initExtent : this._initExtent;
      this._proxyUrl = options.proxyUrl ? options.proxyUrl : this._proxyUrl;
      this._matrixIds = options.matrixIds ? options.matrixIds : this._matrixIds;
      this._layersConf = options.layersConf ? options.layersConf : this._layersConf;
      this._ovLayersConf = options.ovLayersConf ? options.ovLayersConf : this._ovLayersConf;
      this._target = options.target ? options.target : this._target;
      this._option = options || {};
      var map = new ol.Map({
        target: this._target,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          projection: this._projection,
          resolutions: this._resolutions,
          maxResolution: this._resolutions[0],
          minResolution: this._resolutions[this._resolutions.length - 1],

          zoom: 4
        })
      });
      this._map = map;
      this._map.getView().fit(this._initExtent, this._map.getSize());
    },
    /**
     *@description 返map对象
     *@param null
     *@return ol.map
     */
    getMap: function () {
      return this._map;
    },
    /**
     * 获取图层配置数据
     */
    getLayerConf: function () {
      return this._layersConf;
    },
    /**
     *@description 地图定位
     *@param x y level
     *@return 
     */
    centerAt: function (x, y, level) {
      var map = this._map;
      var maxLevel = map.getView().getResolution().length - 1;

      var pan = ol.animation.pan({
        duration: 500,
        source: /** @type {ol.Coordinate} */ (map.getView().getCenter())
      });
      map.beforeRender(pan);
      map.getView().setCenter([x, y]);
      if (level) {
        if (level < 0) {
          map.getView().setZoom(0);
        } else if (level > maxLevel) {
          map.getView().setZoom(maxLevel);
        } else {
          map.getView().setZoom(level);
        }
      }
    },
    /**
     *@description 添加缩放控件
     *@param id,className
     *@return 
     */
    addZoomControl: function (id, className) {
      var controls = this._map.getControls().getArray();
      for (var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control instanceof ol.control.Zoom) {
          return;
        }
      }
      var zoom = new ol.control.Zoom({
        className: className == undefined ? "ol-zoom" : className
      });
      zoom.set("id", id, true);
      this._map.addControl(zoom);
      return;
    },
    /**
     *@description 加载滑块控件
     *@param id,className
     *@return 
     */
    addZoomSliderControl: function (id, className) {
      var controls = this._map.getControls().getArray();
      for (var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control instanceof ol.control.ZoomSlider) {
          return;
        }
      }
      var zoomslider = new ol.control.ZoomSlider({
        className: className == undefined ? "ol-zoomslider" : className
      });
      zoomslider.set("id", id, true);
      this._map.addControl(zoomslider);
    },
    /**
     *@description 加载底部快捷工具
     * @param id, className
     *@return 
     */
    addQuickToolControl: function (id, className) {
      var controls = this._map.getControls().getArray();
      for (var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control instanceof ol.control.QuickToolControl) {
          var controlid = control.get("id");
          if (id == controlid) {
            return;
          }
        }
      }
      var quickToolControl = new ol.control.QuickToolControl({
        className: className,
        yyMap: this
      });
      quickToolControl.set("id", id, true);
      this._map.addControl(quickToolControl);
    },
    /**
     *@description 加载鼠标移动位置控件
     * @param id, className
     *@return 
     */
    addMousePositionControl: function (id, className) {
      var controls = this._map.getControls().getArray();
      for (var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control instanceof ol.control.MousePosition) {
          var controlid = control.get("id");
          if (id == controlid) {
            return;
          }
        }
      }
      var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: this._map.getView().getProjection(),
        className: className == undefined ? 'custom-mouse-position' : className
      });
      mousePositionControl.set("id", id, true);
      this._map.addControl(mousePositionControl);
    },
    /**
     * 添加图层控制树
     * @param id  唯一标识
     * @param layerTreeId ztree的id
     * @param className  CSS样式
     * @param layerdata  图层控制树的数据，采用的ztree控件
     * @param expendAll  是否展开所有的图层控制树节点
     * @param collapsed	 初始是否打开图层控制树
     */
    addTocControl: function (id, layerTreeId, className, layerdata, expendAll, collapsed) {
      var controls = this._map.getControls().getArray();
      for (var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control instanceof ol.control.TocControl) {
          var controlid = control.get("id");
          if (id == controlid) {
            return;
          }
        }
      }
      var tocControl = new ol.control.TocControl({
        treeId: layerTreeId,
        className: className,
        layerdata: layerdata,
        expendAll: expendAll,
        collapseLabel: '\u00BB',
        label: '\u00AB',
        collapsed: collapsed
      });
      tocControl.set("id", id, true);
      this._map.addControl(tocControl);
    }
  }
  // 最后将插件对象暴露给全局对象
  _global = (function () {
    return this || (0, eval)('this');
  }());
  !('plugin' in _global) && (_global.CYMap = CYMap);
}());