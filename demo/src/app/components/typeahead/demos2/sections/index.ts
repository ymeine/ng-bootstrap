import { COMPONENTS as BASIC_COMPONENTS } from './basic';
import { COMPONENTS as EVENTS_COMPONENTS } from './events';
import { NgbdTypeaheadDemos2RemoteComponent } from './remote';
import { COMPONENTS as DISPLAY_CUSTOMIZATION_COMPONENTS } from './display-customization';


export const COMPONENTS = [
  ...BASIC_COMPONENTS,
  ...EVENTS_COMPONENTS,
  NgbdTypeaheadDemos2RemoteComponent,
  ...DISPLAY_CUSTOMIZATION_COMPONENTS,
];

export const SECTIONS_LIST = [
  ['basic', 'Basic usage'],
  ['events', 'Open on focus & other events'],
  ['remote', 'Remotely fetched results'],
  ['display-customization', 'Customize display'],
];
