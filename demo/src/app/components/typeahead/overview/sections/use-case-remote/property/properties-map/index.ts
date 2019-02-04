import {
  AnimatedProperty,
} from '../model';

import {
  IProperty,
  Property,
} from '../property';

import {
  PropertiesMapStore,
  PropertiesMapSpec,
  PropertiesMapUpdatePayload,
} from './model';

export * from './model';



export class PropertiesMap {
  private _properties: PropertiesMapStore;
  private _animationDuration: number;
  private _update: () => void;

  constructor({properties: propertiesSpecs, update, animationDuration}: PropertiesMapSpec) {
    this._update = update;
    this._animationDuration = animationDuration;

    const properties = {};
    for (const [key, partialSpec] of Object.entries(propertiesSpecs)) {
      const name = key as AnimatedProperty;
      properties[name] = new Property(Object.assign({name}, partialSpec));
    }
    this._properties = properties as PropertiesMapStore;
  }

  update(updateMap: PropertiesMapUpdatePayload) {
    const animatedProperties: IProperty<any>[] = [];
    for (const [key, value] of Object.entries(updateMap)) {
      const property = this._properties[key as AnimatedProperty];
      property.setValue(value);
      if (property.animated) {
        animatedProperties.push(property);
      }
    }
    this._update();

    setTimeout(() => {
      animatedProperties.forEach(property => property.animated = false);
      this._update();
    }, this._animationDuration);
  }

  reset() {
    for (const property of Object.values(this._properties)) {
      property.reset();
    }
    this._update();
  }

  get(name: AnimatedProperty): IProperty<any> {
    return this._properties[name];
  }
}
