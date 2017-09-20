import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/merge';

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
  'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

@Component({
  selector: 'ngbd-typeahead-basic',
  templateUrl: './typeahead-basic.html',
  styles: [`.form-control { width: 300px; }`]
})
export class NgbdTypeaheadBasic {
  public model: any;

  search = (text$: Observable<string>, focus$: Observable<string>) => {
    // text$
    // .map(term => {return {from: 'input', value: term}})
    // .merge(focus$.map(term => {return {from: 'focus', value: term}}))
    // .if()

    // const resultOnTerm$ = text$
    // .debounceTime(200)
    // .distinctUntilChanged()
    // .map(term => {return {from: 'input', value: term}});

    // const resultOnFocus$ = focus$
    // .map(term => {return {from: 'focus', value: term}});

    // const result$ = resultOnTerm$.merge(resultOnFocus$);

    const resultOnTerm$ = text$
    .debounceTime(200)
    .distinctUntilChanged()
    .map(term => {return {from: 'input', value: term}});

    const resultOnFocus$ = focus$
    .map(term => {return {from: 'focus', value: term}});

    const result$ = resultOnTerm$.merge(resultOnFocus$);

    return result$
    .map(payload => {
        const {from, value} = payload;

        if (from === 'focus' && (value == null || value.length === 0)) {
          return states;
        }

        if (value.length < 2) {
          return [];
        }

        return states.filter(v => v.toLowerCase().indexOf(value.toLowerCase()) > -1).slice(0, 10);
    });
  }
}
