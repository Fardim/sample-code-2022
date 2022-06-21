
import { IntgService } from './../../../../../_services/intg/intg.service';
import { SapwsService } from './../../../../../_services/sapws/sapws.service';
import { ConnectorService } from './../services/connector.service';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';

// declare var LeaderLine: any;

@Component({
  selector: 'pros-sap-mapping-fields',
  templateUrl: './sap-mapping-fields.component.html',
  styleUrls: ['./sap-mapping-fields.component.scss'],
})
export class SapMappingFieldsComponent implements OnInit, AfterViewInit {
  @ViewChild('sourceContainer') sourceContainer: ElementRef;

  @ViewChild('drawer') drawer: MatDrawer;

  /**
   * Source and target search controls
   */
  sourceControl: FormControl = new FormControl('');
  targetControl: FormControl = new FormControl('');

  /**
   * banner text for showing info to the user
   */
  bannerText: string;

  /**
   * Source and Target fields for the list
   */
  // sourceFields: FieldCategory[] = SOURCE_FIELD;
  // targetFields: FieldCategory[] = TARGET_FIELD;

  /**
   * Filter controls for the source and target fields
   */
  // filteredSourceFields: Observable<FieldCategory[]>;
  // filteredTargetFields: Observable<FieldCategory[]>;

  /**
   * Mapping subscriber that keeps track of addition and deletion in the mapping list
   */
  // mapping: BehaviorSubject<Mapping[]> = new BehaviorSubject([]);

  /**
   * To hold the current temporary mapping until it gets added to the main mapping list
   */
  // currentMapping: Mapping = {
  //   source: { id: '', name: '' },
  //   target: { id: '', name: '' },
  // };

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  // existingMapping: Mapping[] = [
  //   {
  //     source: { id: 'source_one', name: 'source_one' },
  //     target: { id: 'target_id_eight', name: 'target_id_eight' },
  //     line: null,
  //   },
  //   {
  //     source: { id: 'source_one', name: 'source_one' },
  //     target: { id: 'target_three', name: 'target_three' },
  //     line: null,
  //   },
  //   {
  //     source: { id: 'source_two', name: 'source_two' },
  //     target: { id: 'target_four', name: 'target_four' },
  //     line: null,
  //   },
  //   {
  //     source: { id: 'source_four', name: 'source_four' },
  //     target: { id: 'target_eight', name: 'target_eight' },
  //     line: null,
  //   },
  // ];

  lineOptions = {
    dashed: false,
    color: '#339AF0',
    size: 1,
    path: 'straight',
    startPlug: 'disc',
    endPlug: 'arrow1',
    startPlugSize: 3,
    endPlugSize: 3,
    startPlugOutline: 1,
    endPlugOutline: 1,
  };

  // dataset option and formcontrol
  datasetSourceOptions = [
    { label: 'New Dataset', value: 'NEW_DATASET' },
    { label: 'Existing Dataset', value: 'EXISTING_DATASET' },
  ];
  datasetSourceOptionControl: FormControl = new FormControl('EXISTING_DATASET');

  datasetOptions = ['Dataset 1', 'Dataset 2', 'Dataset 3'];

  tempLine: any;
  sourceMenuToggle = true;
  targetMenuToggle = true;
  mouseMoveSubscriber: BehaviorSubject<MouseEvent> = new BehaviorSubject(null);
  movementSubscriber: Subscription;

  newReqPageNo = 0;
  newReqPageSize = 10;
  newReqtableName = '/1CN/CTXSAPD0001';
  username = 'sb-51b0f500-d936-4c09-9c20-6844effc3698!b2260|it-rt-cpi-non-production-bwvnkkkk!b80';
  password = 'a41e0637-d4a7-4aaa-ad4e-c8f5fc4928d2$jFyUTnpAvkXgXz7y1_yPpF6UuPIWYMLxC6c5S0W8Y4o=';
  newReqUrl = 'https://cpi-non-production-bwvnkkkk.it-cpi002-rt.cfapps.ap10.hana.ondemand.com/cxf/DE1/METADATA';
  systemURL: 'https://cpi-non-production-bwvnkkkk.it-cpi002-rt.cfapps.ap10.hana.ondemand.com/cxf/DE1/METADATA';

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseMoveSubscriber.next(event);
  }

  constructor(
    private router: Router,
    private ref: ChangeDetectorRef,
    public connectorService: ConnectorService,
    private sapwsService: SapwsService,
    private intgService: IntgService,
  ) {}
  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }
  // ngAfterViewInit(): void {
  //   this.toggleDrawerState(true);
  //   this.ref.detectChanges();
  // }

  /**
   * Angular on init hook
   * Subscribing to the mapping changes as well as initializing
   * the mapping filter control here
   */
  // ngOnInit(): void {
  //   // this.bannerText = 'The target field you selected has already been mapped';
  //   this.mapping.subscribe(() => {
  //     this.drawSavedMappings();
  //   });

  //   this.initializeSearchControl();
  //   this.getNewDatasetMappings();
  //   this.getMappingsByURL();
  //   this.getMdOMappings();
  // }

  // getNewDatasetMappings() {
  //   const dto: SapRequestDTO = {
  //     pageNo: this.newReqPageNo,
  //     pageSize: this.newReqPageSize,
  //     password: this.password,
  //     username: this.username,
  //     tableName: this.newReqtableName,
  //     url: this.newReqUrl,
  //   };
  //   this.sapwsService
  //     .getNewDatasetMappings(dto)
  //     .pipe(take(1))
  //     .subscribe((resp) => {
  //       console.log(resp);
  //     });
  // }

  // getMappingsByURL() {
  //   const dto: ConnectionDTO = {
  //     password: this.password,
  //     userName: this.username,
  //     systemURL: this.systemURL,
  //   }
  //   this.intgService.getMappingsByURL(dto).pipe(take(1)).subscribe(resp => {
  //     console.log('resp', resp);
  //   })
  // }

  // getMdOMappings() {
  //   this.intgService.getMdOMappings('154', 'en').pipe(take(1)).subscribe(resp => {
  //     console.log('resp1', resp);
  //   })
  // }

  /**
   * Initialize the search filter controls
   */
  // initializeSearchControl() {
  //   this.filteredSourceFields = this.sourceControl.valueChanges.pipe(
  //     startWith(''),
  //     map((value) => this.filter(value, this.sourceFields))
  //   );

  //   this.filteredTargetFields = this.targetControl.valueChanges.pipe(
  //     startWith(''),
  //     map((value) => this.filter(value, this.targetFields))
  //   );
  // }

  /**
   * search filter method to filter results based on search term
   * @param searchTerm search text
   * @param filterFrom array of items to filter from
   * @returns FieldCategory[]
   */
  // filter(searchTerm: string, filterFrom: FieldCategory[]): FieldCategory[] {
  //   const filterValue = searchTerm.toLowerCase();

  //   return filterFrom.filter((option) => {
  //     if (!filterValue) {
  //       return option;
  //     }
  //     if (option.category.toLowerCase().includes(filterValue) || option.childrens.some((child) => child.name.includes(filterValue))) {
  //       return option;
  //     }
  //   });
  // }

  /**
   * Get the mapping lists current value
   */
  // get mappingList(): Mapping[] {
  //   return this.mapping.getValue();
  // }

  /**
   * Update the mapping lists
   */
  // set mappingList(updatedMapping: Mapping[]) {
  //   this.mapping.next(updatedMapping);
  // }

  /**
   * Selects the source field
   * If a mapping exists, show the mapping relation
   * If mapping doesnt exist, create a mapping by clicking on the target field
   * @param field pass the field Object
   */
  // selectSourceField(field: FieldInfo) {
  //   this.currentMapping.source = field;
  //   this.addOrUpdateMapping(this.currentMapping);
  //   if (this.fieldHasMapping(field.id)) {
  //     this.showMappedTargets(field.id);
  //   } else {
  //     this.followMouseCursor(field.id);
  //   }
  // }

  /**
   * Selects the target field
   * If a source is selected it maps the sleected target with it
   * @param field pass the field Object
   */
  // selectTargetField(field: FieldInfo) {
  //   this.currentMapping.target = field;
  //   this.addOrUpdateMapping(this.currentMapping);
  //   if (this.movementSubscriber) {
  //     this.movementSubscriber.unsubscribe();
  //   }
  //   if (this.tempLine) {
  //     this.tempLine?.remove();
  //   }
  // }

  // followMouseCursor(fieldId: string) {
  //   this.removeAllMappingLines();
  //   const element = document.getElementById(fieldId);
  //   if (element) {
  //     const body = document.getElementById('mapping-area');
  //     const dynamicElement = document.createElement('div');

  //     dynamicElement.style.width = '0px';
  //     dynamicElement.style.height = '0px';
  //     dynamicElement.id = 'dynamic-element';
  //     dynamicElement.style.visibility = 'hidden';
  //     dynamicElement.style.position = 'fixed';

  //     body.appendChild(dynamicElement);

  //     if (LeaderLine) {
  //       this.tempLine = new LeaderLine(element, dynamicElement);
  //       this.tempLine.setOptions(this.lineOptions);
  //       this.movementSubscriber = this.mouseMoveSubscriber.subscribe((event: MouseEvent) => {
  //         dynamicElement.style.top = `${event.clientY}px`;
  //         dynamicElement.style.left = `${event.clientX}px`;
  //         this.tempLine.position();
  //       });
  //     }
  //   }
  // }

  /**
   * Shows the mapped targets with a connecting line
   * @param fieldId pass the field id to display that particular relation
   */
  // showMappedTargets(fieldId: string) {
  //   this.removeAllMappingLines();
  //   const existingMapping = this.existingMapping;
  //   this.mappingList = existingMapping.filter((mapping) => mapping.source.id === fieldId);
  //   // Find the first mapped target to scroll to when the source is selected
  //   this.scrollToTargetField(this.mappingList, fieldId);
  //   this.mappingList.forEach((item) => {
  //     this.refreshPosition(item);
  //   });
  // }

  /**
   * scrolls the first target into view
   * @param mappingList pas sthe mapped list
   * @param sourceFieldId pass the source field id
   */
  // scrollToTargetField(mappingList: Mapping[], sourceFieldId: string) {
  //   let mappedIndex = null;
  //   let targetIdx = null;
  //   mappingList.forEach((mapping, mappingIndex) => {
  //     if (mapping.source.id === sourceFieldId) {
  //       this.targetFields.forEach((fieldItem, index) => {
  //         if (fieldItem.childrens?.length) {
  //           const data = fieldItem.childrens.find((child) => child.id === mapping.target.id);
  //           if (data) {
  //             mappedIndex = mappedIndex && mappedIndex < index ? mappedIndex : index;
  //             targetIdx = mappingIndex;
  //           }
  //         }
  //       });
  //     }
  //   });

  //   if (targetIdx > -1) {
  //     const el = document.getElementById(this.mappingList[targetIdx]?.target.id);
  //     if (el) {
  //       el.scrollIntoView(true);
  //     }
  //   }
  // }

  /**
   * Check is a selected field has existing mapping
   * @param fieldId pass the field id
   * @returns boolean
   */
  // fieldHasMapping(fieldId: string): boolean {
  //   const exists = this.existingMapping.find((savedMap) => savedMap.source.id === fieldId);
  //   return !!exists;
  // }

  /**
   * Checks is the source is selected
   * @param fieldId pass the field id
   * @returns boolean
   */
  // isSourceSelected(fieldId: string): boolean {
  //   return this.currentMapping.source.id === fieldId;
  // }

  /**
   * Adds or updates(if the mapping exists)
   * @param mapping pass a mapping object
   */
  // addOrUpdateMapping(mapping: Mapping) {
  //   if (this.currentMapping.source.id && this.currentMapping.target.id) {
  //     const exists = this.mappingList.find(
  //       (savedMap) => savedMap.source.id === mapping.source.id && savedMap.target.id === mapping.target.id
  //     );

  //     if (!exists) {
  //       this.mappingList = [...this.mappingList, mapping];
  //       this.existingMapping.push(mapping);
  //       setTimeout(() => {
  //         this.selectSourceField(mapping.source);
  //       }, 0);
  //     }
  //     this.currentMapping = {
  //       source: { id: '', name: '' },
  //       target: { id: '', name: '' },
  //     };
  //   }
  // }

  /**
   * Draw a connecting line between fields
   * @param mapping pass the mapping to display the relation
   * @returns void
   */
  // drawLine(mapping: Mapping): void {
  //   if (!mapping.source.id || !mapping.target.id) {
  //     return;
  //   }

  //   const sourceElement = document.getElementById(mapping.source.id);
  //   const targetElement = document.getElementById(mapping.target.id);

  //   if (sourceElement && targetElement) {
  //     const draw = new LeaderLine(sourceElement, targetElement, {
  //       endPlugOutline: false,
  //       animOptions: { duration: 3000, timing: 'linear' },
  //     });
  //     draw.setOptions(this.lineOptions);

  //     const existingMappingIndex = this.mappingList.findIndex(
  //       (savedMap) => savedMap.source.id === mapping.source.id && savedMap.target.id === mapping.target.id
  //     );
  //     this.mappingList[existingMappingIndex].line = draw;
  //   }
  // }

  /**
   * draws all the saved mappings at once
   */
  // drawSavedMappings() {
  //   this.mappingList.forEach((mapItem: Mapping) => {
  //     if (mapItem?.line) {
  //       mapItem.line.remove();
  //       mapItem.line = null;
  //     }
  //     this.drawLine(mapItem);
  //   });
  // }

  /**
   * removes all the mapping lines in one go
   */
  // removeAllMappingLines() {
  //   this.mappingList.forEach((mapItem: Mapping) => {
  //     if (mapItem?.line) {
  //       mapItem.line?.remove();
  //       mapItem.line = null;
  //     }
  //   });
  // }

  /**
   * Get the mapped field object
   * @param targetFieldId pas sthe target field id
   * @returns FieldInfo | null
   */
  // getMappedField(targetFieldId: string): FieldInfo | null {
  //   const existingMapping = this.existingMapping;
  //   const mapped = existingMapping.find((mapping) => mapping.target.id === targetFieldId);
  //   return mapped ? mapped.source : null;
  // }

  /**
   * Refreshed the connecting lines position when scrolling the
   * source or the target fields
   * @param event any
   */
  // onScroll(event: any): void {
  //   if (this.mappingList?.length) {
  //     this.mappingList.forEach((mapItem: Mapping) => {
  //       this.refreshPosition(mapItem);
  //     });
  //   }
  // }

  /**
   * To refresh the position based on the field's
   * visibility in the visible area
   * @param mapping Pass the mapping Object
   */
  // refreshPosition(mapping: Mapping) {
  //   const withinView = this.isInViewport(mapping.target.id);
  //   if (mapping.line && mapping.line.end) {
  //     if (withinView.isWithinBottomBoundary && withinView.isWithinTopBoundary) {
  //       mapping.line.end = document.getElementById(mapping.target.id);
  //       mapping.line.position();
  //     }
  //     if (mapping.line?.end) {
  //       if (!withinView.isWithinTopBoundary && withinView.isWithinBottomBoundary) {
  //         mapping.line.end = document.getElementById('top-reference');
  //         mapping.line.position();
  //       }

  //       if (withinView.isWithinTopBoundary && !withinView.isWithinBottomBoundary) {
  //         mapping.line.end = document.getElementById('bottom-reference');
  //         mapping.line.position();
  //       }
  //     }
  //   }
  // }

  /**
   * checks whether a field is visible in the DOM
   * @param elementId Pass the element id
   * @returns Object with top and bottom visibility values
   */
  // isInViewport(elementId: string) {
  //   const elementTopOffset = 226;
  //   const elementBottomOffset = this.sourceContainer.nativeElement.offsetHeight + elementTopOffset;

  //   const element: HTMLElement = document.getElementById(elementId);
  //   if (element) {
  //     const rect = element.getBoundingClientRect();
  //     const isWithinTopBoundary = rect.top - elementTopOffset > 0;
  //     const isWithinBottomBoundary = rect.bottom - elementBottomOffset <= 48;

  //     return {
  //       isWithinTopBoundary,
  //       isWithinBottomBoundary,
  //     };
  //   }
  // }

  // toggleDrawerState(isOpen: boolean = false) {
  //   if (!this.drawer) {
  //     return;
  //   }

  //   isOpen ? this.drawer.open() : this.drawer.close();
  // }
}
