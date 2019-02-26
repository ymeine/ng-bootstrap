import { NgbdTypeaheadOverviewSectionIntroductionComponent } from './introduction';
import { NgbdTypeaheadOverviewSectionContractComponent } from './observable-contract';
import { NgbdTypeaheadOverviewSectionDisplayCustomizationComponent } from './display-customization';


export * from './introduction';
export * from './observable-contract';
export * from './display-customization';

export const SECTIONS = [
  NgbdTypeaheadOverviewSectionIntroductionComponent,
  NgbdTypeaheadOverviewSectionContractComponent,
  NgbdTypeaheadOverviewSectionDisplayCustomizationComponent,
];

export const SECTIONS_MAP = {
  'introduction': 'Introduction',
  'observable-contract': 'The Observable contract',
  // 'user-interaction': 'User interaction',
  'display-customization': 'Customize the display',
};
