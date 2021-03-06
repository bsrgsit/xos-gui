import './nav.scss';
import {IXosNavigationService, IXosNavigationRoute} from '../services/navigation';
import {IXosAuthService} from '../../datasources/rest/auth.rest';
import {IXosStyleConfig} from '../../../index';
import {IXosSidePanelService} from '../side-panel/side-panel.service';
import {IXosComponentInjectorService} from '../services/helpers/component-injector.helpers';

class NavCtrl {
  static $inject = ['$scope', '$state', 'XosNavigationService', 'AuthService', 'StyleConfig', 'XosSidePanel', 'XosComponentInjector'];
  public routes: IXosNavigationRoute[];
  public navSelected: string;
  public appName: string;
  public payoff: string;

  constructor(
    private $scope: ng.IScope,
    private $state: angular.ui.IStateService,
    private navigationService: IXosNavigationService,
    private authService: IXosAuthService,
    private StyleConfig: IXosStyleConfig,
    private XosSidePanel: IXosSidePanelService,
    private XosComponentInjector: IXosComponentInjectorService
  ) {
    this.routes = [];
    this.$scope.$watch(() => this.navigationService.query(), (routes) => {
      this.routes = routes;
    });
    this.appName = this.StyleConfig.projectName;
    this.payoff = this.StyleConfig.payoff;
  }

  activateRoute(route: IXosNavigationRoute) {
    if (this.navSelected === route.state) {
      delete this.navSelected;
      return;
    }
    this.navSelected = route.state;
  }

  includes(state: string): boolean {
    return this.$state.includes(state);
  }

  isSelected(navId: string, navSelected: string) {
    const activeRoute = this.$state.current.name;
    const separateRoutes = activeRoute.split('.');

    if (!navSelected) {
      navSelected = separateRoutes[1];
    }

    if (navId === navSelected) {
      return false;
    }
    else if (this.$state.current.name.indexOf(navId) === -1 && navId === navSelected ) {
      return false;
    }
    else {
      return true;
    }
  }

  // NOTE remove me
  togglePanel() {
    this.XosSidePanel.injectComponent('xosAlert', {config: {type: 'danger'}, show: true}, 'Sample message');
  }
  addToDashboard() {
    this.XosComponentInjector.injectComponent('#dashboard-component-container', 'xosAlert', {config: {type: 'danger'}, show: true}, 'Sample message', false);
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.$state.go('login');
      });
  }
}

export const xosNav: angular.IComponentOptions = {
  template: require('./nav.html'),
  controllerAs: 'vm',
  controller: NavCtrl
};
