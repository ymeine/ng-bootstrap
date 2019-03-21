import {
  AnimatedProperty,
} from '../model';

import {
  IProperty,
  BasePropertySpec,
} from '../property/model';



export interface PropertiesMapSpec {
  properties: {[key in AnimatedProperty]: BasePropertySpec<any>};
  update: () => void;
  animationDuration: number;
}

export type PropertiesMapStore = {
  [key in AnimatedProperty]: IProperty<any>;
};

export type PropertiesMapUpdatePayload = Partial<{
  [key in AnimatedProperty]: any;
}>;
