/*global describe beforeEach inject  it expect themes spyOn */
/*eslint no-undef: "error"*/
goog.require('gmf.Permalink');
goog.require('gmf');
goog.require('ngeo.LayerHelper');
goog.require('ngeo.StateManager');
goog.require('ol.Map');
goog.require('ol.Collection');
goog.require('ol.layer.Group');


describe('Permalink service', function() {
  var PermalinkService, map, LayerHelper, firstLevelGroup, secondLevelGroup, dataGroup, StateManagerService, osmThemeNode;
  var $injector;

  beforeEach(inject(function(_$injector_) {

    $injector = _$injector_;
    StateManagerService = $injector.get('ngeoStateManager');
    PermalinkService = $injector.get('gmfPermalink');
    map = new ol.Map({layers : []});
    PermalinkService.setMap(map);
    PermalinkService.themes_ = themes['themes'];


    //create fake layerTree
    LayerHelper = $injector.get('ngeoLayerHelper');

    dataGroup = LayerHelper.getGroupFromMap(map, gmf.DATALAYERGROUP_NAME);
    firstLevelGroup = LayerHelper.createBasicGroup(new ol.Collection([
      LayerHelper.createBasicWMSLayer('', 'l_g1_1'),
      LayerHelper.createBasicWMSLayer('', 'l_g1_2')
    ]));

    secondLevelGroup = LayerHelper.createBasicGroup(new ol.Collection([
      LayerHelper.createBasicWMSLayer('', 'l_g2_1'),
      LayerHelper.createBasicWMSLayer('', 'l_g2_2')
    ]));

    firstLevelGroup.getLayers().insertAt(0, secondLevelGroup);
    dataGroup.getLayers().insertAt(0, firstLevelGroup);

    osmThemeNode = themes['themes'].filter(function(theme) {
      return theme.name === 'OSM';
    })[0];

  }));

  it('Should registerLayer/unregisterLayer recursively but not ol.layer.Group', function() {
    expect(PermalinkService).toBeDefined();
    expect(Object.keys(PermalinkService.listenerKeys_).length).toBe(0);

    PermalinkService.registerDataLayerGroup_(map);
    firstLevelGroup.getLayers().forEach(shouldHaveBeenRegistered);
    secondLevelGroup.getLayers().forEach(shouldHaveBeenRegistered);

    PermalinkService.unregisterLayer_(dataGroup);
    firstLevelGroup.getLayers().forEach(shouldHaveBeenUnRegistered);
    secondLevelGroup.getLayers().forEach(shouldHaveBeenUnRegistered);

    function shouldHaveBeenRegistered(layer) {
      var uid = goog.getUid(layer),
          listeners = PermalinkService.listenerKeys_[uid];
      if (layer instanceof ol.layer.Group) {
        expect(listeners).toBeUndefined();
      } else {
        expect(listeners).toBeDefined();
      }
    }

    function shouldHaveBeenUnRegistered(layer) {
      var uid = goog.getUid(layer),
          listeners = PermalinkService.listenerKeys_[uid];
      if (layer instanceof ol.layer.Group) {
        expect(listeners).toBeUndefined();
      } else {
        expect(PermalinkService.listenerKeys_[uid].ol.length).toBe(0);
        expect(PermalinkService.listenerKeys_[uid].goog.length).toBe(0);
      }
    }

  });

  it('Should register a layer with the previous state saved in loacalStorage. TESTING MIXED GROUP ONLY', function() {

    //delete non-mixed group from children
    osmThemeNode.children = osmThemeNode.children.filter(function(node) {
      return node.name === 'OSM function';
    });

    //only 1 theme for testing
    PermalinkService.themes_ = [osmThemeNode];

    //adding layer for each node to the map
    var fakeLayers = osmThemeNode.children[0].children.map(function(node) {
      var layer = new ol.layer.Layer({
        layerName : node.name,
        visible : true
      });
      dataGroup.getLayers().insertAt(0, layer);
      return layer;
    });

    //mocking getInitialValue to return always false (and not use localStorage)
    spyOn(StateManagerService, 'getInitialValue').and.returnValue(false);
    PermalinkService.registerDataLayerGroup_(map);
    expect(StateManagerService.getInitialValue).toHaveBeenCalled();
    fakeLayers.forEach(function(layer) {
      expect(layer.getVisible()).toBeFalsy();
    });
  });

});