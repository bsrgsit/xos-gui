import * as angular from 'angular';
import 'angular-mocks';
import {xosLoader} from './loader';

let loaded = true;

const MockConfig = {
  lastVisitedUrl: '/test'
};

const MockDiscover = {
  areModelsLoaded: () => loaded,
  discover: null
};

const MockOnboarder = {
  onboard: null
};

describe('The XosLoader component', () => {
  beforeEach(() => {
    angular
      .module('loader', [])
      .value('XosConfig', MockConfig)
      .value('XosModelDiscoverer', MockDiscover)
      .value('XosOnboarder', MockOnboarder)
      .component('xosLoader', xosLoader);
    angular.mock.module('loader');
  });

  let scope, element, isolatedScope, rootScope, compile, timeout, location;
  const compileElement = () => {

    if (!scope) {
      scope = rootScope.$new();
    }

    element = angular.element('<xos-loader></xos-loader>');
    compile(element)(scope);
    scope.$digest();
    isolatedScope = element.isolateScope().vm;
  };

  beforeEach(inject(function ($q: ng.IQService, $compile: ng.ICompileService, $rootScope: ng.IScope, $timeout: ng.ITimeoutService, $location: ng.ILocationService) {
    compile = $compile;
    rootScope = $rootScope;
    timeout = $timeout;
    location = $location;
    spyOn(location, 'path');

    MockDiscover.discover = jasmine.createSpy('discover')
      .and.callFake(() => {
        const d = $q.defer();
        d.resolve(true);
        return d.promise;
      });

    MockOnboarder.onboard = jasmine.createSpy('onboard')
      .and.callFake(() => {
        const d = $q.defer();
        d.resolve();
        return d.promise;
      });
  }));

  describe('when models are already loaded', () => {

    beforeEach(() => {
      compileElement();
      spyOn(isolatedScope, 'moveOnTo');
      isolatedScope.run();
      timeout.flush();
    });

    it('should redirect to the last visited page', (done) => {
      window.setTimeout(() => {
        expect(isolatedScope.moveOnTo).toHaveBeenCalledWith('/test');
        expect(location.path).toHaveBeenCalledWith('/test');
        done();
      }, 600);
    });
  });

  describe('when the last visited page is "loader"', () => {

    beforeEach(() => {
      MockConfig.lastVisitedUrl = '/loader';
      compileElement();
      spyOn(isolatedScope, 'moveOnTo');
      isolatedScope.run();
    });

    it('should redirect to the "dashboard" page', (done) => {
      window.setTimeout(() => {
        expect(isolatedScope.moveOnTo).toHaveBeenCalledWith('/loader');
        expect(location.path).toHaveBeenCalledWith('/dashboard');
        done();
      }, 600);
    });
  });

  describe('when models are not loaded', () => {

    beforeEach(() => {
      loaded = false;
      compileElement();
      spyOn(isolatedScope, 'moveOnTo');
    });

    it('should call XosModelDiscoverer.discover', () => {
      expect(MockDiscover.discover).toHaveBeenCalled();
    });
  });

});
