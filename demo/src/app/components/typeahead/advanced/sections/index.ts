import { NgbdTypeaheadAdvancedIntroductionComponent } from './introduction';
import { NgbdTypeaheadAdvancedUseCaseBasicComponent } from './use-case-basic';
import { NgbdTypeaheadAdvancedUseCaseEventsComponent } from './use-case-events';
import { NgbdTypeaheadAdvancedUseCaseRemoteComponent } from './use-case-remote';
import { NgbdTypeaheadAdvancedDisplayCustomizationComponent } from './display-customization';

export const COMPONENTS = [
  NgbdTypeaheadAdvancedIntroductionComponent,
  NgbdTypeaheadAdvancedUseCaseBasicComponent,
  NgbdTypeaheadAdvancedUseCaseEventsComponent,
  NgbdTypeaheadAdvancedUseCaseRemoteComponent,
  NgbdTypeaheadAdvancedDisplayCustomizationComponent,
];

export const SECTIONS_LIST = [
  ['introduction', 'Introduction'],
  ['use-case-basic', 'Use case: basic usage'],
  ['use-case-events', 'Use case: open on focus & other events'],
  ['use-case-remote', 'Use case: remotely fetched results'],
  ['display-customization', 'Customize display'],
];
