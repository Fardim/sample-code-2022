import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectType } from '@models/core/coreModel';
import { NumberSettingCount } from '@modules/transaction/model/transaction';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { edit_submenu, _submenus } from '../../../home/_components/secondary-navbar/secondary-navbar.constants';
import { CoreCrudService } from '../../../../_services/core-crud/core-crud.service';
@Component({
  selector: 'pros-data-list-object-setting',
  templateUrl: './data-list-object-setting.component.html',
  styleUrls: ['./data-list-object-setting.component.scss']
})
export class DataListObjectSettingComponent implements OnInit, OnDestroy {

  // added dummy data for sub menus
  setting_submenus = _submenus.map(d=> Object.assign({}, d));
  edit_submenus = edit_submenu.map(d=> Object.assign({},d));

  /**
   * hold current module id
   */
   moduleId: string;

  /**
   * Hold current module details
   */
  objectType: ObjectType = { objectdesc: '', objectInfo: '', objectid: 0 };

  /**
   * Keep all loading states in one place
   */
  dataLoaders = {
    loadObjectTypeDetails: false,
  }

  subscriptionsList: Subscription[] = [];

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,
    private coreCrudService: CoreCrudService,
    private ruleService: RuleService,
  ) { }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.activatedRouter.params.subscribe((params) => {
      this.moduleId = params.moduleId;
    });
    this.getObjectTypeDetails();
    this.updateDatasetFormCount();

    this.coreCrudService.getNumberSettingChange.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      if (res && res.id) {
        const count = this.objectType.submenus.find((x) => x.id === 'number-settings').count;
        if (res.action === 'delete' && count > 0) {
          this.updateNumberSettingsCount(count - 1);
        } else if (res.action === 'add') {
          this.updateNumberSettingsCount(count + 1);
        }
      }
    });

    this.coreService.updateDatasetRuleCountSubject$.pipe(takeUntil(this.unsubscribeAll$)).subscribe(count => {
      if (count !=null) {
        this.objectType.submenus = this.objectType.submenus.map(s=> {
          if(s.id === 'business-rule') {
            s.count = count;
          }
          return s;
        });
      }
    });
  }

  /**
   * get current module details
   */
   getObjectTypeDetails() {
     this.dataLoaders.loadObjectTypeDetails = true;
    const sub = this.coreService.getObjectTypeDetails(this.moduleId, this.locale).subscribe(
      (response: any) => {
        this.dataLoaders.loadObjectTypeDetails = false;
        this.objectType.objectid = response.moduleid;
        this.objectType.objectdesc = response.description;
        this.objectType.objectInfo = response?.information[this.locale];
        this.addObjectSubmenu();
        this.redirectToInitialTab();
      },
      (error) => {
        this.dataLoaders.loadObjectTypeDetails = false;
        console.error(`Error : ${error.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  updateDatasetFormCount() {
    const sub = this.coreService.updateDatasetFormCountSubject$.subscribe(response => {
      if (response) {
        this.getFormObjectCount();
      }
    })
    this.subscriptionsList.push(sub);
  }

  addObjectSubmenu() {
    this.objectType.submenus = this.setting_submenus.map(d=> Object.assign({}, d));
    this.getFormObjectCount();
  }

  redirectToInitialTab() {
    this.router.navigate([{ outlets: { sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}` } }], {
      queryParamsHandling: 'preserve',
    });
  }

  getFormObjectCount() {
    this.coreService.getFormsCount(this.moduleId.toString()).pipe(take(1)).subscribe(resp => {
      this.updateSubmenuCount(resp, 'forms');
    });
    this.ruleService.getBusinessRulesCount(this.moduleId).pipe(take(1)).subscribe(resp => {
      this.updateSubmenuCount({count: resp}, 'business-rule');
    });
    this.coreCrudService.getNumberSettingCount(this.moduleId).pipe(take(1)).subscribe((res: NumberSettingCount) => {
      this.updateSubmenuCount(res, 'number-settings');
    });
  }

  updateNumberSettingsCount(count: number) {
    this.objectType.submenus = this.objectType.submenus.map(s=> {
      if(s.id === 'number-settings') {
        s.count = count || 0;
      }
      return s;
    });
  }

  updateSubmenuCount(resp: {count: number}, submenuId: string) {
    this.objectType.submenus = this.objectType.submenus.map(s=> {
      if(s.id === submenuId) {
        s.count = resp.count || 0;
      }
      return s;
    });
  }

  /**
   * Function to close settings side sheet
   */
   close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  ngOnDestroy(): void {
    this.subscriptionsList.forEach((subs) => subs.unsubscribe());
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
