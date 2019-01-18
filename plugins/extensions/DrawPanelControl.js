
goog.provide('ol.control.DrawPanel');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol');
goog.require('ol.Collection');
goog.require('ol.Map');
goog.require('ol.MapEventType');
goog.require('ol.Object');
goog.require('ol.ObjectEventType');
goog.require('ol.Overlay');
goog.require('ol.OverlayPositioning');
goog.require('ol.View');
goog.require('ol.ViewProperty');
goog.require('ol.control.Control');
goog.require('ol.coordinate');
goog.require('ol.css');
goog.require('ol.extent');


/**
 * Create a new control with a map acting as an overview map for an other
 * defined map.
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.DrawPanelOptions=} opt_options DrawPanel options.
 * @api
 */
ol.control.DrawPanel = function(opt_options) {

  var options = opt_options ? opt_options : {};

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

  var className = options.className !== undefined ? options.className : 'ol-overviewmap';

  var tipLabel = options.tipLabel !== undefined ? options.tipLabel : '鹰眼';

//  var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '\u00AB';
//  var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '';

  var collapseLabel="";
  /**
   * @private
   * @type {Node}
   */
  this.collapseLabel_ = typeof collapseLabel === 'string' ?
      goog.dom.createDom('SPAN', {}, collapseLabel) :
      collapseLabel;

//  var label = options.label !== undefined ? options.label : '\u00BB';
//    var label = options.label !== undefined ? options.label : '';
    var label="";

  /**
   * @private
   * @type {Node}
   */
  this.label_ = typeof label === 'string' ?
      goog.dom.createDom('SPAN', {}, label) :
      label;

  var activeLabel = (this.collapsible_ && !this.collapsed_) ?
      this.collapseLabel_ : this.label_;
  var button = goog.dom.createDom('DIV', {
    'type': 'div',
    'title': tipLabel
  }, activeLabel);
  button.className = 'ol-overviewmap-button';
  ol.events.listen(button, ol.events.EventType.CLICK,
      this.handleClick_, this);

  var ovmapDiv = document.createElement('DIV');
  ovmapDiv.className = 'ol-overviewmap-map';

  /**
   * @type {ol.Map}
   * @private
   */
  this.ovmap_ = new ol.Map({
    controls: new ol.Collection(),
    interactions: new ol.Collection(),
    target: ovmapDiv,
    view: options.view
  });
  var ovmap = this.ovmap_;

  if (options.layers) {
    options.layers.forEach(
        /**
       * @param {ol.layer.Layer} layer Layer.
       */
        function(layer) {
          ovmap.addLayer(layer);
        }, this);
  }

  var box = document.createElement('DIV');
  box.className = 'ol-overviewmap-box';
  box.style.boxSizing = 'border-box';

  /**
   * @type {ol.Overlay}
   * @private
   */
  this.boxOverlay_ = new ol.Overlay({
    position: [0, 0],
    positioning: ol.OverlayPositioning.BOTTOM_LEFT,
    element: box
  });
  this.ovmap_.addOverlay(this.boxOverlay_);

  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL +
      (this.collapsed_ && this.collapsible_ ? ' ol-collapsed' : '') +
      (this.collapsible_ ? '' : ' ol-uncollapsible');
  var element = goog.dom.createDom('DIV',
      cssClasses, ovmapDiv, button);

  var render = options.render ? options.render : ol.control.DrawPanel.render;

  goog.base(this, {
    element: element,
    render: render,
    target: options.target
  });
};
goog.inherits(ol.control.DrawPanel, ol.control.Control);


/**
 * @inheritDoc
 * @api
 */
ol.control.DrawPanel.prototype.setMap = function(map) {
  var oldMap = this.getMap();
  if (map === oldMap) {
    return;
  }
  if (oldMap) {
    var oldView = oldMap.getView();
    if (oldView) {
      this.unbindView_(oldView);
    }
  }
  goog.base(this, 'setMap', map);

  if (map) {
    this.listenerKeys.push(ol.events.listen(
        map, ol.ObjectEventType.PROPERTYCHANGE,
        this.handleMapPropertyChange_, this));

    // TODO: to really support map switching, this would need to be reworked
    if (this.ovmap_.getLayers().getLength() === 0) {
      this.ovmap_.setLayerGroup(map.getLayerGroup());
    }

    var view = map.getView();
    if (view) {
      this.bindView_(view);
      if (view.isDef()) {
        this.ovmap_.updateSize();
        this.resetExtent_();
      }
    }
  }
};



ol.control.DrawPanel.prototype.handleMapPropertyChange_ = function(event) {
  
};



ol.control.DrawPanel.prototype.bindView_ = function(view) {
  
};



ol.control.DrawPanel.prototype.unbindView_ = function(view) {

};



ol.control.DrawPanel.prototype.handleRotationChanged_ = function() {
  
};

ol.control.DrawPanel.render = function(mapEvent) {
  
};


ol.control.DrawPanel.prototype.validateExtent_ = function() {
  
};



ol.control.DrawPanel.prototype.resetExtent_ = function() {
  
};



ol.control.DrawPanel.prototype.recenter_ = function() {
  
};


ol.control.DrawPanel.prototype.updateBox_ = function() {
  
};



ol.control.DrawPanel.prototype.calculateCoordinateRotate_ = function(rotation, coordinate) {

};


ol.control.DrawPanel.prototype.handleClick_ = function(event) {
  event.preventDefault();
  
};



ol.control.DrawPanel.prototype.handleToggle_ = function() {
  
};


ol.control.DrawPanel.prototype.getCollapsible = function() {
  
};



ol.control.DrawPanel.prototype.setCollapsible = function(collapsible) {
  
};


ol.control.DrawPanel.prototype.setCollapsed = function(collapsed) {
  
};



ol.control.DrawPanel.prototype.getCollapsed = function() {
  
};



ol.control.DrawPanel.prototype.getDrawPanel = function() {

};