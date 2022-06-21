import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SchemaTabHistory } from '@models/schema/schema';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-diw-view-tabs',
  templateUrl: './diw-view-tabs.component.html',
  styleUrls: ['./diw-view-tabs.component.scss']
})
export class DiwViewTabsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  /**
   * Tabs details
   */
  @Input()
  tabs: SchemaTabHistory[] = [];

  /**
   * Store all subscriptions
   */
  subscriptions: Subscription[] = [];

  /**
   * Activated tab id ...
   */
  @Input()
  activeTab: string;

  /**
   * Emiiter for open the specific tab ...
   */
  @Output()
  openTab: EventEmitter<string> = new EventEmitter(null);


  possiableTabs = 10;

  activeTabDetails;
  showLoader = false;

  constructor(
    private schemaService: SchemaService,
    private transientService: TransientService
  ) { }

  ngAfterViewInit(): void {
    this.calcPossiableTabs();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(f=>{
      f.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.activeTab && changes.activeTab.currentValue !== changes.activeTab.previousValue && !changes.activeTab.isFirstChange()) {
      this.activeTab = changes.activeTab.currentValue;

      // manage tab call
      this.manageTabs(this.activeTab);
    }

    // if(changes && changes.tabs && changes.tabs.currentValue !== changes.tabs.previousValue) {
    //   this.tabs = changes.tabs.currentValue;
    // }
  }

  ngOnInit(): void {
    this.getTabs();

    this.schemaService.getActiveTabDetails().subscribe((val) => {
      if (val) {
        this.activeTabDetails = val;
      }
    });
  }

  public get showTabs() {
    if (this.tabs.length === 1 && this.tabs[0].schemaId === '0') {
      return false;
    }

    return true;
  }

  calcPossiableTabs() {
    const cWidth = document.getElementsByClassName('root')[0].clientWidth;
    this.possiableTabs = Math.round((cWidth / 170));
  }


  getTabs() {
    this.showLoader = true;
    const sub = this.schemaService.getSchemaTabHistory().pipe(finalize(() => this.showLoader = false)).subscribe(rs=>{
      this.tabs = rs || [];
      // calculate the tabs
      this.calcPossiableTabs();
      console.log(this.tabs);
    }, err=> console.error(`Exceptions :${err}`));

    this.subscriptions.push(sub);
  }


  manageTabs(tabId?: string) {
    if(this.tabs.find(f=> f.schemaId === tabId)){
      return;
    }
    let rTabs = Array.from(this.tabs);
    // if(rTabs.length === 0 && !this.tabs.find(f=> f.schemaId === '0')) {
    //   rTabs.push({schemaId:'0'} as SchemaTabHistory);
    // }

    const newTab = { schemaId: tabId } as SchemaTabHistory;
    if (this.activeTabDetails?.schemaId === tabId) {
      newTab.moduleDesc = this.activeTabDetails?.moduleDesc || 'Untitled';
      newTab.schemaDesc = this.activeTabDetails?.schemaDescription || tabId;
    }
    rTabs.splice(1,0, newTab);
    rTabs = rTabs.splice(0,9);
    // save into the DB
    this.saveTabIntoDb(rTabs);
  }

  /**
   * Save the tabs
   * @param tabs tabs that will be saved into backend ...
   */
  saveTabIntoDb(tabs: SchemaTabHistory[]) {
    // set the tab order based on array element position
    tabs.forEach((t,idx)=>{
      t.tabOrder = idx;
    });
    this.subscriptions.push(this.schemaService.saveSchemaTabHistory(tabs).subscribe(r=>{
      this.tabs = r;
      console.log(this.tabs);
    }, err=> console.error(`Exception : ${err}`)));
  }


  /**
   * Send parent to change the view based on selected this ...
   * @param $event selected index number
   */
  changeTab(idx: number) {
    if(idx === 0) {
      this.openTab.emit('0');
    } else {
      this.openTab.emit(this.tabs[idx].schemaId);
    }

  }

  /**
   * Get the selected index from tabs...
   */
  get selectedIndex() {
    return this.tabs && this.tabs.indexOf(this.tabs.find(f=> f.schemaId === this.activeTab));
  }

  /**
   * Get the tab description ...
   * @param tab current tab details ...
   * @returns will return the schemaDesc and moduleDesc combination
   */
  tabDescription(tab: SchemaTabHistory) {
    return `${tab.schemaDesc || tab.schemaId || 'Untitled'}(${tab.moduleDesc || tab.moduleId || 'Untitled'})`;
  }

  /**
   * Add the tab into view port ...
   * @param tab the tab which will going to add on view port ...
   */
  addTabToViewPort(tab: SchemaTabHistory) {
    const array = Array.from(this.tabs);
    const idx = array.findIndex(f => f.schemaId === tab.schemaId);
    array.splice(idx,1);
    const lastTabIdx = this.possiableTabs -2 ;
    array.splice(lastTabIdx, 0 , tab);
    // call to save into DB
    this.saveTabIntoDb(array);
    // set the selected tab
    this.changeTab(array.findIndex(f=> f.schemaId === tab.schemaId));
  }

  /**
   * Remove the tab from viewport
   * @param tab the tab which are going to remove from viewport ...
   */
  removeTab(tab: SchemaTabHistory) {
    if (tab.schemaId === '0') {
      return;
    }
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: `Are you sure you want close this "${tab.schemaDesc}(${tab.moduleDesc})" tab?` },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if('yes' === response) {
          const arrays = Array.from(this.tabs);
          const idx = arrays.findIndex(f=> f.schemaId === tab.schemaId);
          arrays.splice(idx,1);
          this.saveTabIntoDb(arrays);
        }
      }
    );
  }


  /**
   * Show the close icon ..
   * @param element the where we need the add the close icon
   */
  showClose(element: any) {
    try{
      element.target.children[1].style.display = '';
      element.target.children[2].style.display = '';
    }catch(e){console.error(`Error : ${e}`)}
  }

  /**
   * Method to hide the close icon once user mouse leave
   * @param element the element which need to hide on mouse leave
   */
  hideClose(element: any) {
    try{
      element.target.children[1].style.display = 'none';
      element.target.children[2].style.display = 'none';
    }catch(e){console.error(`Error : ${e}`)}
  }



}
