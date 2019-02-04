import {
  ObservableListeners,
} from '../observable/model';



export interface SearchOptions {
  term: string;
  delay?: number;
  fail?: boolean;
  listeners?: ObservableListeners<string[]>;
}
