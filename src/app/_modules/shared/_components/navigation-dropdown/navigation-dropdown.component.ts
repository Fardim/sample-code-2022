import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { SchemaListModuleList } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  selector: 'pros-navigation-dropdown',
  templateUrl: './navigation-dropdown.component.html',
  styleUrls: ['./navigation-dropdown.component.scss']
})
export class NavigationDropdownComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Reference to the search input component for schema
   */
  @ViewChild('searchInput') searchInput: SearchInputComponent;

  /**
   * After option selection change event should be emit
   */
  @Output() selectedModule = new EventEmitter();

  /**
   * After import option selection event should be emit
   */
  @Output() _importSchema = new EventEmitter();

  /**
   * Modules list to pre-populate
   */
  modulesList = [];

  /**
   * Filtered Modules list to pre-populate
   */
  filteredModulesList = [];

  /**
   * Schema list to pre-populate
   */
  schemaLists = [];

  /**
   * Filtered Schema list to pre-populate
   */
  filteredSchemaList = [];

  /**
   * save required data for upload-dataset
   */
  data: any = {};

  enteredItem = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  prevItemTrigger;

  subscriptios: Subscription[] = [];

  /**
   * all schemas
   */
  schemas: SchemaListModuleList[] = [];

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  /**
   * constructor of class
   * @param schemaListService Instance the Schema List service class
   */
  constructor(
    private schemaListService: SchemalistService,
    private schemaService: SchemaService
  ) { }

  ngOnDestroy(): void {
    this.subscriptios.forEach(s=> s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.value && changes.value.previousValue !== changes.value.currentValue) {
      this.selectedModule.emit(changes.value)
    }
  }

  /**
   * load pre loaded function
   */
  ngOnInit(): void {
    this.getObjectTypes();
  }

  /**
   * return all the modules with their schemas
   */
  getObjectTypes() {
    this.subscriptios.push(this.schemaService.getDatasetsAlongWithSchemas().subscribe(res=>{
      if(res.datasetsHttp !== undefined) {
        this.modulesList = res.datasetsHttp;
        this.filteredModulesList = res.datasetsHttp;
      }
      if(res.schemaHttp !== undefined) {
        this.schemas = res.schemaHttp;
      }
    }, err=>{console.error(`Exception : ${err.message}`)}));
  }

  /**
   * Open schemalist by using that objectId
   * @param objectId value selected oject
   */
  schemaList(objectId: string) {
    this.searchInput.clearSearch();
    const mm =  this.modulesList.find(f=> f.moduleId === objectId);
    const schms = this.schemas.filter(f=> f.moduleId === objectId)[0];
    if(mm) {
      this.data.objectid = mm.moduleId;
      this.data.objectdesc = mm.moduleDesc;
      this.schemaLists = schms ? schms.schemaLists : [];
      this.filteredSchemaList = schms ? schms.schemaLists : [];
    }
  }

  /**
   * set data of selected schemaId or for new schema
   * @param schema value when existing schema selected
   */
  selectschema(schema?) {
    this.data.schemaId = schema ? schema.schemaId : null;
    this.data.schemadesc = schema ? schema.schemaDescription : null;
    this.selectedModule.emit(this.data);
  }

  /**
   * save currently selected module id
   * @param moduleId module Id
   */
  selected(moduleId: string) {
    // closing before opening to handle the scenario when user hovers and changes the screen
    this.trigger.closeMenu();
    const elRef = new ElementRef(document.getElementById(`menuId_${moduleId}`));
    if(elRef?.nativeElement) {
      elRef.nativeElement.click();
    }
  }

  /**
   * filter modules based on searchTerm
   * @param searchTerm pass the search text
   */
  searchModule(searchTerm: string) {
    if (this.modulesList && this.modulesList.length > 0) {
      this.searchFilter(this.modulesList, searchTerm, 'moduleDesc')
      .subscribe((filteredresult) => {
        this.filteredModulesList = filteredresult;
      });
    }
  }

  /**
   * filter schemas based on searchTerm
   * @param searchTerm pass the search text
   */
  searchSchema(searchTerm: string) {
    if (this.schemaLists && this.schemaLists.length > 0) {
      this.searchFilter(this.schemaLists, searchTerm, 'schemaDescription')
      .subscribe((filteredresult) => {
        this.filteredSchemaList = filteredresult;
      });
    }
  }

  /**
   * Track items in a list while rendering
   * @param index pass the index of the item
   * @param itemId optionally pass the item id
   */
  schemaTrackBy(index: any, itemId: any) {
    return index;
  }

  /**
   * Track items in a list while rendering
   * @param index pass the index of the item
   * @param itemId optionally pass the item id
   */
  moduleTrackBy(index: any, itemId: any) {
    return index;
  }

  /**
   * should emit the selected data
   */
  emitSelection() {
    this.selectedModule.emit();
  }


  /**
   * Method to filter results from an object array
   * based on search string
   * @param values array of available values
   * @param searchTerm text to search
   * @param key property name to map the search string to
   */
  searchFilter(values: any[], searchTerm: string, key: string): Observable<any[]> {
    let returnValues = null;
    return new Observable((subscriber: Subscriber<any[]>) => {
      if (!values || values.length === 0 || !searchTerm) {
        returnValues = values;
      }
      if (key !== null && typeof key !== 'undefined') {
        returnValues = values.filter((val) => {
          return val && val[key]? val[key].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
            : false;
        });
      }
      subscriber.next(returnValues);
    })
  }

  /**
   * IMPORT SCHEMA VIA FILE OR Connekthub
   */
  importSchema(type?) {
    this._importSchema.emit({ type, moduleId: this.data?.objectid });
  }

  /**
   * IMPORT FILE
   */
  fileChange($event) {
    this._importSchema.emit({ moduleId: this.data?.objectid });
  }

  /**
   * function to open explorer to select file to upload
   */
   openExplorer() {
    document.getElementById('uploader').click();
  }
}
