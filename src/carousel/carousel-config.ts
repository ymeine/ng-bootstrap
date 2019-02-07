import {Injectable} from '@angular/core';

/**
 * Configuration service for the NgbCarousel component.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the carousels used in the application.
 */
@Injectable({providedIn: 'root'})
export class NgbCarouselConfig {
  enableAnimation = true;
  interval = 5000;
  wrap = true;
  keyboard = true;
  pauseOnHover = true;
  showNavigationArrows = true;
  showNavigationIndicators = true;
}
