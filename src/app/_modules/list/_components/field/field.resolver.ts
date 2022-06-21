import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { CoreService } from '@services/core/core.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Structure } from './hierarchy-service/hierarchy.service';

@Injectable({ providedIn: 'root' })
export class FieldResolver implements Resolve<any> {
  constructor(private coreService: CoreService, @Inject(LOCALE_ID) public locale: string) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return forkJoin({
        objectTypeDetails: this.getObjectTypeDetails(route.paramMap.get('moduleId')),
        allStructures: this.getAllStructures(route.paramMap.get('moduleId'), this.locale),
        moduleId: of(route.paramMap.get('moduleId'))
    });
  }

  /**
   * get current module details
   */
  getObjectTypeDetails = (moduleId: string): Observable<any[] | ObjectType> => {
    return this.coreService
    .getEditObjectTypeDetails(moduleId)
    .pipe(catchError(() => of(null)));
  }

  /**
   * Get all available structures for a module
   * @param moduleId pass the module Id
   * @param locale pass the locale
   * @returns Structure[]
   */
  getAllStructures = (moduleId: string, locale = this.locale): Observable<Structure[]> => {
    return this.coreService.getAllStructures(moduleId, locale, 0, 50)
    .pipe(catchError(() => of(null)));
  }
}
