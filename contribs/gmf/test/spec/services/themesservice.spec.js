/* global themes capabilities */
goog.require('gmf.Themes');
goog.require('gmf.ThemesEventType');
goog.require('gmf.test.data.themes');

describe('gmf.Themes', () => {
  let gmfThemes;
  let treeUrl;
  let $httpBackend;

  beforeEach(() => {
    inject(($injector) => {
      gmfThemes = $injector.get('gmfThemes');
      treeUrl = `${$injector.get('gmfTreeUrl')}?cache_version=0`;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', treeUrl).respond(themes);
    });
  });

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Get background layers', () => {
    const spy = jasmine.createSpy();
    gmfThemes.getBgLayers({}).then(spy);

    $httpBackend.expectGET(treeUrl);
    themes.background_layers.forEach((bgLayer) => {
      const response = bgLayer.name == 'map' ? capabilities.map :
          capabilities.asitvd;
      $httpBackend.when('GET', bgLayer.url).respond(response);
      $httpBackend.expectGET(bgLayer.url);
    });
    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    const response = spy.calls.mostRecent().args[0];
    expect(response.length).toBe(4);
    const responseFirstBgName = response[1].get('label');
    const firstBgName = themes.background_layers[0].name;
    expect(responseFirstBgName).toBe(firstBgName);
    expect(response[1].get('querySourceIds')).toBeDefined();
  });

  it('Returns hasEditableLayers', () => {
    const spy = jasmine.createSpy();
    gmfThemes.hasEditableLayers().then(spy);

    $httpBackend.expectGET(treeUrl);
    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    const response = spy.calls.mostRecent().args;
    expect(response[0]).toBe(true);
  });

  it('Emit change event', () => {
    const spy = jasmine.createSpy();
    const eventSpy = jasmine.createSpy();
    ol.events.listen(gmfThemes, gmf.ThemesEventType.CHANGE, eventSpy);

    gmfThemes.promise_.then(spy);

    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
  });

  it('Load themes', () => {
    const spy = jasmine.createSpy();
    gmfThemes.promise_.then(spy);

    $httpBackend.expectGET(treeUrl);
    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    const data = spy.calls.mostRecent().args[0];
    expect(Object.keys(data)[0]).toBe(Object.keys(themes)[0]);
  });

  it('Get themes object', () => {
    const spy = jasmine.createSpy();
    gmfThemes.getThemesObject().then(spy);

    $httpBackend.expectGET(treeUrl);
    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    const resultThemes = spy.calls.mostRecent().args[0];
    const dataFirstKey = Object.keys(resultThemes[0])[0];
    const themesThemesFirstKey = Object.keys(themes.themes[0])[0];
    expect(dataFirstKey).toBe(themesThemesFirstKey);
  });

  it('Get a theme object (find a specific theme)', () => {
    const themeName = 'Enseignement';
    const spy = jasmine.createSpy();
    gmfThemes.getThemeObject(themeName).then(spy);

    $httpBackend.expectGET(treeUrl);
    gmfThemes.loadThemes();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    const resultTheme = spy.calls.mostRecent().args[0];
    expect(resultTheme.name).toBe(themeName);
  });
});
