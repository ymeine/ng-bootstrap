import { NgbdTypeaheadOverviewSectionIntroductionComponent } from './introduction';
import { NgbdTypeaheadOverviewSectionUseCaseBasicComponent } from './use-case-basic';
import { NgbdTypeaheadOverviewSectionUseCaseEventsComponent } from './use-case-events';
import { NgbdTypeaheadOverviewSectionUseCaseRemoteComponent } from './use-case-remote';
import { NgbdTypeaheadOverviewSectionDisplayCustomizationComponent } from './display-customization';


export * from './introduction';
export * from './use-case-basic';
export * from './use-case-events';
export * from './use-case-remote';
export * from './display-customization';

export const SECTIONS = [
  NgbdTypeaheadOverviewSectionIntroductionComponent,
  NgbdTypeaheadOverviewSectionUseCaseBasicComponent,
  NgbdTypeaheadOverviewSectionUseCaseEventsComponent,
  NgbdTypeaheadOverviewSectionUseCaseRemoteComponent,
  NgbdTypeaheadOverviewSectionDisplayCustomizationComponent,
];

export const SECTIONS_MAP = {
  'introduction': 'Introduction',
  'use-case-basic': 'Use case: basic usage',
  'use-case-events': 'Use case: open on focus & other events',
  'use-case-remote': 'Use case: remotely fetched results',
  'display-customization': 'Customize display',
  'operators': 'RxJS operators references',
};
