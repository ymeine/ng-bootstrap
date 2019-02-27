import { NgModule } from '@angular/core';

import { NgbdSharedModule } from '../../shared';
import { ComponentWrapper } from '../../shared/component-wrapper/component-wrapper.component';
import { NgbdComponentsSharedModule, NgbdDemoList } from '../shared';
import { NgbdApiPage } from '../shared/api-page/api.component';
import { NgbdExamplesPage } from '../shared/examples-page/examples.component';
import { NgbdTypeaheadBasic } from './demos/basic/typeahead-basic';
import { NgbdTypeaheadConfig } from './demos/config/typeahead-config';
import { NgbdTypeaheadFocus } from './demos/focus/typeahead-focus';
import { NgbdTypeaheadFormat } from './demos/format/typeahead-format';
import { NgbdTypeaheadHttp } from './demos/http/typeahead-http';
import { NgbdTypeaheadTemplate } from './demos/template/typeahead-template';
import { SECTIONS_MAP as OVERVIEW_SECTIONS_MAP, NgbdTypeaheadOverviewComponent } from './overview';
import { SECTIONS as OVERVIEW_SECTIONS } from './overview/sections';

const DEMO_DIRECTIVES = [
  NgbdTypeaheadFormat,
  NgbdTypeaheadHttp,
  NgbdTypeaheadBasic,
  NgbdTypeaheadFocus,
  NgbdTypeaheadTemplate,
  NgbdTypeaheadConfig,
  NgbdTypeaheadOverviewComponent,
  ...OVERVIEW_SECTIONS,
];

const DEMOS = {
  basic: {
    title: 'Simple Typeahead',
    type: NgbdTypeaheadBasic,
    code: require('!!raw-loader!./demos/basic/typeahead-basic'),
    markup: require('!!raw-loader!./demos/basic/typeahead-basic.html')
  },
  focus: {
    title: 'Open on focus',
    type: NgbdTypeaheadFocus,
    code: require('!!raw-loader!./demos/focus/typeahead-focus'),
    markup: require('!!raw-loader!./demos/focus/typeahead-focus.html')
  },
  format: {
    title: 'Formatted results',
    type: NgbdTypeaheadFormat,
    code: require('!!raw-loader!./demos/format/typeahead-format'),
    markup: require('!!raw-loader!./demos/format/typeahead-format.html')
  },
  http: {
    title: 'Wikipedia search',
    type: NgbdTypeaheadHttp,
    code: require('!!raw-loader!./demos/http/typeahead-http'),
    markup: require('!!raw-loader!./demos/http/typeahead-http.html')
  },
  template: {
    title: 'Template for results',
    type: NgbdTypeaheadTemplate,
    code: require('!!raw-loader!./demos/template/typeahead-template'),
    markup: require('!!raw-loader!./demos/template/typeahead-template.html')
  },
  config: {
    title: 'Global configuration of typeaheads',
    type: NgbdTypeaheadConfig,
    code: require('!!raw-loader!./demos/config/typeahead-config'),
    markup: require('!!raw-loader!./demos/config/typeahead-config.html')
  }
};

export const ROUTES = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  {
    path: '',
    component: ComponentWrapper,
    data: { OVERVIEW_SECTIONS_MAP },
    children: [
      { path: 'overview', component: NgbdTypeaheadOverviewComponent },
      { path: 'examples', component: NgbdExamplesPage },
      { path: 'api', component: NgbdApiPage }
    ]
  }
];

@NgModule({
  imports: [
    NgbdSharedModule,
    NgbdComponentsSharedModule
  ],
  declarations: DEMO_DIRECTIVES,
  entryComponents: DEMO_DIRECTIVES
})
export class NgbdTypeaheadModule {
  constructor(demoList: NgbdDemoList) {
    demoList.register('typeahead', DEMOS, OVERVIEW_SECTIONS_MAP);
  }
}
