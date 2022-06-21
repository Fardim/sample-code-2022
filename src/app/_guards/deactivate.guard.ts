import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { BuilderComponent } from '@modules/report-v2/builder/builder.component';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<BuilderComponent> {
  /**
   * Function to check from state
   * @param component Component
   * @param route Route
   * @param state State
   */
  canDeactivate(
    component: BuilderComponent,
    route: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    // goto canDeactivate fn of component if going to other view route after from new report page, only handling navigation to view route , primary navigation routing handled in their component

    if (component && !component.deleteFromNavBar && !nextState.url.includes(`home/report/edit/${component.reportId}/new`)) {
      component.deleteFromNavBar = false;
      return component && component.canDeactivate();
    } else {
      component.deleteFromNavBar = false;
      return true;
    }
  }
}
