import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskListService } from '@services/task-list.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-maintain-process',
  templateUrl: './maintain-process.component.html',
  styleUrls: ['./maintain-process.component.scss']
})
export class MaintainProcessComponent implements OnInit, OnDestroy {
  selectedActionOptions = [];
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  selectedEvents = [];
  isClose = true;
  actions = [{
    id: '1',
    name: 'Create'
  },
  { id: '2', name: 'Edit' },
  { id: '3', name: 'Summary' }];
  allActions = [{
    id: '1',
    name: 'Create'
  },
  { id: '2', name: 'Edit' },
  { id: '3', name: 'Summary' }];
  /* Example for Multiselect with Search */
  /*** number of chips to show as selected*/
  limit = 5;
  /**
   * FormControl for seraching  ...
   */
  searchActions: FormControl = new FormControl('');
  /**
   * Susbcriptions ..
   */
  subscriptions: Subscription[] = [];
  routeParam: any = {};
  /*** Reference to the input fields for mat-autocomplete */
  @ViewChild('optionInput') optionInput: ElementRef<HTMLInputElement>;
  constructor(private router: Router, private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private service: TaskListService,
    private transientService: TransientService) {

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.routeParam.flowId = params.id;
      this.routeParam.outlet = params.outlet;
      this.routeParam.datasetId = params.datasetId;
    });

    this.subscriptions.push(this.searchActions.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(searchString => {
      this.searchActionsList(searchString);
    }));
    this.getEventMapping();
  }
  getEventMapping() {
    if (!this.routeParam.flowId || !this.routeParam.datasetId) return;
    this.service.getAllEventsMapping(this.routeParam.flowId, this.routeParam.datasetId, 0, 5).subscribe((res: any) => {
      if (res) {
        const events = [];
        res.eventId.forEach(x => {
          if (x === '1') {
            // create event
            events.push(this.allActions[0]);
          }
          else if (x === '2') {
            // edit event
            events.push(this.allActions[1]);
          }
          else if (x === '3') {
            // edit event
            events.push(this.allActions[2]);
          }
        })
        // patch value in form
        this.selectedEvents = [...events];
        this.selectedActionOptions = [...events];
      }
    });
  }
  saveEvent() {
    if (!this.routeParam.datasetId) {
      this.transientService.open('Cannot save event(s) without reference dataset.', null, { duration: 2000, verticalPosition: 'bottom' });
      return;
    }
    const eventIDArr = this.selectedEvents.map(x => x.id);
    const request = {
      eventId: eventIDArr,
      flowId: this.routeParam.flowId
    }
    this.service.saveEventMapping(this.routeParam.datasetId, request).subscribe(res => {
      this.transientService.open(res?.message, null, { duration: 2000, verticalPosition: 'bottom' });
      this.close();
    })
  }
  searchActionsList(searchString: any) {
    if (!this.allActions.find((option) => option.name === searchString)) {
      this.actions = searchString ? this._filterActions(searchString) : this.allActions.slice();
    }
  }
  applyValues() {
    this.selectedEvents = [...this.selectedActionOptions];
    this.searchActions.patchValue('');
    this.isClose = true;
    this.trigger.closeMenu();
  }

  menuClose() {
    this.isClose = true;
  }

  menuOpen() {
    this.isClose = false;
    this.selectedActionOptions=[...this.selectedEvents];
  }
  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */

  _filterActions(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.allActions.filter((obj) => obj.name.toLowerCase().indexOf(filterValue) >= 0);
  }

  /** number of userDefinedValues and systemDefinedValues to select */
  hasLimit(): boolean {
    return this.actions.length > this.limit;
  }

  removeActionOptions(option: any): void {
    const index = this.selectedEvents.findIndex(obj => obj.id === option.id);

    if (index >= 0) {
      this.selectedEvents.splice(index, 1);
    }
    this.selectedActionOptions =[...this.selectedEvents];
  }

  close() {
    this.router.navigate([{ outlets: { [this.routeParam.outlet]: null } }], { queryParamsHandling: 'preserve' });
  }


  /*** method to add item to selected items for multisleect of parent dataset
   * @param event item
   */
  selectedActions(value: any, state: boolean): void {
    if (state && !this.selectedActionOptions.find((option) => option.id === value.id)) {
      this.selectedActionOptions.push(value);
    } else {
      this.selectedActionOptions.splice(this.selectedActionOptions.findIndex((option) => option.id === value.id), 1);
    }
  }
  isActionChecked(ckbox: any): boolean {
    return this.selectedActionOptions.some(s => s.id === ckbox.id)
  }
}
