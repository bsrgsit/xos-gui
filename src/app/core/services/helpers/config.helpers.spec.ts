import * as angular from 'angular';
import 'angular-mocks';
import 'angular-ui-router';

import {IXosConfigHelpersService, ConfigHelpers, IXosModelDefsField} from './config.helpers';
import {IXosModeldef} from '../../../datasources/rest/modeldefs.rest';
import {IXosTableCfg} from '../../table/table';
import {IXosFormInput, IXosFormCfg} from '../../form/form';
import {BehaviorSubject} from 'rxjs';

let service: IXosConfigHelpersService;

const model: IXosModeldef = {
  name: 'Test',
  app: 'test',
  fields: [
    {
      type: 'number',
      name: 'id',
      validators: []
    },
    {
      type: 'string',
      name: 'name',
      validators: [
        {
          bool_value: true,
          name: 'required'
        }
      ]
    },
    {
      type: 'string',
      name: 'something',
      validators: [
        {
          int_value: 30,
          name: 'maxlength'
        }
      ]
    },
    {
      type: 'number',
      name: 'else',
      validators: [
        {
          int_value: 20,
          name: 'min'
        },
        {
          int_value: 40,
          name: 'max'
        }
      ]
    },
    {
      type: 'date',
      name: 'updated',
      validators: []
    },
  ]
};

describe('The ConfigHelpers service', () => {

  beforeEach(() => {
    angular
      .module('test', ['toastr'])
      .service('ConfigHelpers', ConfigHelpers)
      .value('AuthService', {
        getUser: () => {
          return {id: 1};
        }
      })
      .value('XosModelStore', {

      })
      .value('$state', {
        get: () => {
          return [
            {
              name: 'xos.core.tests',
              data: {model: 'Test'}
            },
            {
              name: 'xos.core.slices',
              data: {model: 'Slices'}
            }
          ];
        }
      });
    angular.mock.module('test');
  });

  beforeEach(angular.mock.inject((
    ConfigHelpers: IXosConfigHelpersService,
  ) => {
    service = ConfigHelpers;
  }));

  describe('The pluralize function', () => {
    it('should pluralize string', () => {
      expect(service.pluralize('test')).toEqual('tests');
      expect(service.pluralize('test', 1)).toEqual('test');
      expect(service.pluralize('xos')).toEqual('xoses');
      expect(service.pluralize('slice')).toEqual('slices');
      expect(service.pluralize('Slice', 1)).toEqual('Slice');
    });

    it('should preprend count to string', () => {
      expect(service.pluralize('test', 6, true)).toEqual('6 tests');
      expect(service.pluralize('test', 1, true)).toEqual('1 test');
    });
  });

  describe('the label formatter', () => {
    it('should format a camel case string', () => {
      expect(service.toLabel('camelCase')).toEqual('Camel case');
    });

    it('should format a snake case string', () => {
      expect(service.toLabel('snake_case')).toEqual('Snake case');
    });

    it('should format a kebab case string', () => {
      expect(service.toLabel('kebab-case')).toEqual('Kebab case');
    });

    it('should set plural', () => {
      expect(service.toLabel('kebab-case', true)).toEqual('Kebab cases');
    });

    it('should format an array of strings', () => {
      let strings: string[] = ['camelCase', 'snake_case', 'kebab-case'];
      let labels = ['Camel case', 'Snake case', 'Kebab case'];
      expect(service.toLabels(strings)).toEqual(labels);
    });

    it('should set plural on an array of strings', () => {
      let strings: string[] = ['camelCase', 'snake_case', 'kebab-case'];
      let labels = ['Camel cases', 'Snake cases', 'Kebab cases'];
      expect(service.toLabels(strings, true)).toEqual(labels);
    });
  });

  describe('the navigation methods', () => {
    describe('stateFromCoreModels', () => {

      let state: ng.ui.IStateService;

      beforeEach(angular.mock.inject(($state) => {
        state = $state;
      }));

      it('should return the state for a given model', () => {
        expect(service.stateFromCoreModel('Test')).toBe('xos.core.tests');
      });

      it('should return the state with params for a given model', () => {
        expect(service.stateWithParams('Test', {id: 1})).toBe('xos.core.tests({id: 1})');
      });
    });
  });

  describe('the modelFieldsToColumnsCfg method', () => {
    it('should return an array of columns', () => {
      const cols = service.modelFieldsToColumnsCfg({fields: model.fields, name: 'testUrl', app: 'test'});
      expect(cols[0].label).toBe('Id');
      expect(cols[0].prop).toBe('id');
      expect(cols[0].link).toBeDefined();

      expect(cols[1].label).toBe('Name');
      expect(cols[1].prop).toBe('name');
      expect(cols[1].link).toBeDefined();

      expect(cols[2].label).toBe('Something');
      expect(cols[2].prop).toBe('something');
      expect(cols[2].link).not.toBeDefined();

      expect(cols[3].label).toBe('Else');
      expect(cols[3].prop).toBe('else');
      expect(cols[3].link).not.toBeDefined();

      expect(cols[4]).not.toBeDefined();
    });
  });

  describe('the modelToTableCfg method', () => {
    it('should return a table config', () => {
      const cfg: IXosTableCfg = service.modelToTableCfg(model, 'testUrl/:id?');
      expect(cfg.columns).toBeDefined();
      expect(cfg.filter).toBe('fulltext');
      expect(cfg.order).toEqual({field: 'id', reverse: false});
      expect(cfg.actions.length).toBe(1);
    });
  });

  describe('the modelFieldToInputConfig', () => {
    it('should return an array of inputs', () => {
      const inputs: IXosFormInput[] = service.modelFieldToInputCfg(model.fields);
      expect(inputs[0].name).toBe('id');
      expect(inputs[0].type).toBe('number');
      expect(inputs[0].label).toBe('Id');

      expect(inputs[1].name).toBe('name');
      expect(inputs[1].type).toBe('string');
      expect(inputs[1].label).toBe('Name');
      expect(inputs[1].validators.required).toBe(true);

      expect(inputs[2].name).toBe('something');
      expect(inputs[2].type).toBe('string');
      expect(inputs[2].label).toBe('Something');
      expect(inputs[2].validators.maxlength).toBe(30);

      expect(inputs[3].name).toBe('else');
      expect(inputs[3].type).toBe('number');
      expect(inputs[3].label).toBe('Else');
      expect(inputs[3].validators.min).toBe(20);
      expect(inputs[3].validators.max).toBe(40);
    });
  });

  describe('the modelToFormCfg method', () => {
    it('should return a form config', () => {
      const config: IXosFormCfg = service.modelToFormCfg(model);
      expect(config.formName).toBe('TestForm');
      expect(config.actions.length).toBe(1);
      expect(config.actions[0].label).toBe('Save');
      expect(config.actions[0].class).toBe('success');
      expect(config.actions[0].icon).toBe('ok');
      expect(config.actions[0].cb).toBeDefined();
      expect(config.inputs.length).toBe(4);
    });
  });

  describe('the private methods', () => {
    let modelStoreMock, toastr, auth, stateMock;

    beforeEach(angular.mock.inject((_toastr_, AuthService) => {
      modelStoreMock = {
        query: () => {
          const subject = new BehaviorSubject([
            {id: 1, humanReadableName: 'test'},
            {id: 2, humanReadableName: 'second'}
          ]);
          return subject.asObservable();
        }
      };
      toastr = _toastr_;
      auth = AuthService;
      stateMock = {
        get: ''
      };
    }));

    const field: IXosModelDefsField = {
      name: 'test',
      type: 'number',
      relation: {
        model: 'Test',
        type: 'many_to_one'
      }
    };

    describe('the populateRelated method', () => {
      const item = {
        test: 2
      };
      it('should add the formatted data to the column definition', () => {
        service = new ConfigHelpers(stateMock, toastr, modelStoreMock);
        service['populateRelated'](item, item.test, field);
        expect(item['test-formatted']).toBe('second');
      });
    });

    describe('the populateSelectField', () => {

      const input: IXosFormInput = {
        name: 'test',
        label: 'Test',
        type: 'select',
        validators: {}
      };

      it('should add the available choice to the select', () => {
        service = new ConfigHelpers(stateMock, toastr, modelStoreMock);
        service['populateSelectField'](field, input);
        expect(input.options).toEqual([
          {id: 1, label: 'test'},
          {id: 2, label: 'second'}
        ]);
      });
    });
  });
});

