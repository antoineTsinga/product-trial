import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ScreenWidth } from "../crud-item-options/screen-width.model";

@Injectable({
  providedIn: "root",
})
export class ScreenWidthService {
  private screenWidth$ = new BehaviorSubject<ScreenWidth>(
    this.getScreenWidth()
  );

  constructor() {
    fromEvent(window, "resize")
      .pipe(
        map(() => this.getScreenWidth()),
        startWith(this.getScreenWidth())
      )
      .subscribe((width) => this.screenWidth$.next(width));
  }

  get screenWidth() {
    return this.screenWidth$.asObservable();
  }

  private getScreenWidth(): ScreenWidth {
    const width = window.innerWidth;

    if (width < 768) {
      return ScreenWidth.small;
    } else if (width < 1024) {
      return ScreenWidth.medium;
    } else {
      return ScreenWidth.large;
    }
  }
}
