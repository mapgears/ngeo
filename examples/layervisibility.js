goog.provide('app.layervisibility');

goog.require('ngeo.DecorateLayer');
/** @suppress {extraRequire} */
goog.require('ngeo.mapDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');
goog.require('ol.source.TileWMS');


/** @type {!angular.Module} **/
app.module = angular.module('app', ['ngeo']);


/**
 * @param {ngeo.DecorateLayer} ngeoDecorateLayer Decorate layer service.
 * @constructor
 * @ngInject
 */
app.MainController = function(ngeoDecorateLayer) {

  /**
   * @type {ol.layer.Tile}
   * @export
   */
  this.layer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: 'http://demo.opengeo.org/geoserver/wms',
      params: {'LAYERS': 'topp:states'},
      serverType: 'geoserver',
      extent: [-13884991, 2870341, -7455066, 6338219]
    })
  });

  const wmsLayer = this.layer;
  ngeoDecorateLayer(wmsLayer);

  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      wmsLayer
    ],
    view: new ol.View({
      center: [-10997148, 4569099],
      zoom: 4
    })
  });
};


app.module.controller('MainController', app.MainController);
