import { NgbdTypeaheadOverviewSectionIntroductionComponent } from './introduction';
import { NgbdTypeaheadOverviewSectionContractComponent } from './observable-contract';
import { NgbdTypeaheadOverviewSectionUserInteractionComponent } from './user-interaction';
import { NgbdTypeaheadOverviewSectionDisplayCustomizationComponent } from './display-customization';


export * from './introduction';
export * from './observable-contract';
export * from './user-interaction';
export * from './display-customization';

export const SECTIONS = [
  NgbdTypeaheadOverviewSectionIntroductionComponent,
  NgbdTypeaheadOverviewSectionContractComponent,
  NgbdTypeaheadOverviewSectionUserInteractionComponent,
  NgbdTypeaheadOverviewSectionDisplayCustomizationComponent,
];

export const SECTIONS_MAP = {
  'introduction': 'Introduction',
  'observable-contract': 'The Observable contract',
  'user-interaction': 'User interaction',
  'display-customization': 'Customize the display',
};
