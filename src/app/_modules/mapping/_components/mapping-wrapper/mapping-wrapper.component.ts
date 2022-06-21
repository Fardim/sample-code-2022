import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MappedSource,
  Mapping,
  MappingRequestBody, MappingUpdatedPromiseResponse, MdoField,
  MdoFieldlistItem,
  MdoMappings, MessageTypes, SegmentMappings
} from '@models/mapping';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { merge } from 'lodash';
import { TransientService } from 'mdo-ui-library';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import MappingUtility from '../../_common/utility-methods';
import { ActivatedRoute, Params, Router } from '@angular/router';

declare let LeaderLine: any;

export interface LineUpdateOptions {
  line: any;
  viewBoundary: any;
  id: string;
  className?: {
    top: string;
    bottom: string;
  }
}

export interface ViewBoundary {
  isWithinTopBoundary: boolean;
  isWithinBottomBoundary: boolean;
}

@Component({
  selector: 'pros-mapping-wrapper',
  templateUrl: './mapping-wrapper.component.html',
  styleUrls: ['./mapping-wrapper.component.scss'],
})
export class MappingWrapperComponent extends MappingUtility implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('sourceContainer') sourceContainer: ElementRef;

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
  @Input()
  sourceFields: MdoField[] = [];

  @Input()
  targetFields: SegmentMappings[] = [];

  /**
   * loader for source fields
   */
  @Input()
  mappingSourceLoader = false;

  @Input()
  mappingTargetLoader = false;

  @Input()
  sourceTitle = '';

  @Input()
  targetTitle = '';

  @Input()
  messageTypes: MessageTypes;

  @Input()
  isResponseType: boolean;

  @Input()
  showExpandButton: boolean;

  /**
   * Filter controls for the source and target fields
   */
  filteredSourceFields: Observable<MdoField[]>;
  filteredTargetFields: Observable<SegmentMappings[]>;

  /**
   * Mapping subscriber that keeps track of addition and deletion in the mapping list
   */
  mapping: BehaviorSubject<Mapping[]> = new BehaviorSubject([]);

  /**
   * To hold the current temporary mapping until it gets added to the main mapping list
   */
  currentMapping: Mapping = {
    source: {
      fieldId: '',
      description: '',
      data: null,
    },
    target: {
      uuid: '',
      description: '',
    },
    line: null,
  };

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  @Input() existingMapping: Mapping[] = [];
  @Input() reloadMappingData: boolean;
  @Input() mappingFilter = 'all';
  @Input() debounceInterval = 900;

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

  tempLine: any;
  droppedOnTarget = false;
  sourceMenuToggle = true;
  targetMenuToggle = true;
  hasTranslationRuleSection = false;
  @Output() infoMessage: EventEmitter<string> = new EventEmitter(null);
  @Output() expandMap: EventEmitter<boolean> = new EventEmitter(false);
  @Output() updateTargetMapping: EventEmitter<MappingRequestBody> = new EventEmitter(null);
  mouseMoveSubscriber: BehaviorSubject<MouseEvent> = new BehaviorSubject(null);
  movementSubscriber: Subscription;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseMoveSubscriber.next(event);
  }
  constructor(
    private scrollDispatcher: ScrollDispatcher,
    private sharedService: SharedServiceService,
    private activatedRoute: ActivatedRoute,
    private transientService: TransientService,
    private router: Router) {
    super();
  }

  ngAfterViewInit() {
    this.scrollDispatcher.scrolled().subscribe(() => {
      this.onScroll(null);
    });
  }

  getMappingsFromMdoMappings(mdoMappings: MdoMappings[]): Mapping[] {
    const mappings: Mapping[] = [];

    mdoMappings.forEach((field) => {
      if (field.mdoFieldId) {
        mappings.push({
          source: {
            fieldId: field.mdoFieldId,
            description: field.mdoFieldDesc,
          },
          target: {
            uuid: field.uuid,
            description: field.segmentName,
          },
        });
      }
    });

    return mappings;
  }

  /**
   * Angular on init hook
   * Subscribing to the mapping changes as well as initializing
   * the mapping filter control here
   */
  ngOnInit(): void {
    // this.mapping.subscribe(() => {
    // this.drawSavedMappings(true);
    // });

    this.initializeSourceAndTargetFilters();
    this.pageScroll();
    this.hasTransformationSection();
  }

  initializeSourceAndTargetFilters() {
    this.removeAllMappingLines();
    this.initializeSourceSearchControl();
    this.initializeTargetSearchControl();
    this.mappingList = merge([], [...this.existingMapping]);
  }

  /**
   * will check scrolling behavior of parent component
   */
  pageScroll() {
    this.sharedService.getMappingPositionOnScroll().subscribe(response => {
      if (response) {
        const isLineVisible = this.mappingList.some(data => data.line);
        if (isLineVisible) {
          this.hideShowAllMappingLines(true);
        }
      } else if (!response && this.mappingList.length) {
        this.hideShowAllMappingLines(false);
      }
    })
  }

  /**
   * will check transaction section open or not
   */
  hasTransformationSection() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.hasTranslationRuleSection = (params?.hasTranslationRuleSection === 'true' || this.router.url.includes('business-rule'));
    });
  }

  /**
   * Initialize the search filter controls
   */
  initializeSourceSearchControl() {
    this.filteredSourceFields = this.sourceControl.valueChanges.pipe(
      debounceTime(this.debounceInterval),
      startWith(''),
      tap((value) => {
        if (value) {
          this.removeAllMappingLines();
        }
      }),
      map((value) => this.filterSource(value, this.sourceFields))
    );
  }

  /**
   * Initialize the search filter controls
   */
  initializeTargetSearchControl() {
    this.filteredTargetFields = this.targetControl.valueChanges.pipe(
      debounceTime(this.debounceInterval),
      startWith(''),
      tap((value) => {
        if (value) {
          this.removeAllMappingLines();
        }
      }),
      map((value) => this.filterTarget(value, this.filterMappingByType(this.isResponseType, this.targetFields)))
    );
  }

  filterMappingByType(isResponseType: boolean, segmentMappings: SegmentMappings[]) {
    if (isResponseType === null) {
      return segmentMappings;
    }

    if (isResponseType) {
      return segmentMappings.filter((mapping) => this.messageTypes.messageTypesForResponse.indexOf(mapping.messageType) > -1) || [];
    } else {
      return segmentMappings.filter((mapping) => this.messageTypes?.messageTypesForRequest.indexOf(mapping.messageType) > -1) || [];
    }
  }

  /**
   * Get the mapping lists current value
   */
  get mappingList(): Mapping[] {
    return this.mapping.getValue();
  }

  /**
   * Update the mapping lists
   */
  set mappingList(updatedMapping: Mapping[]) {
    this.mapping.next(updatedMapping);
  }

  /**
   * Selects the source field
   * If a mapping exists, show the mapping relation
   * If mapping doesnt exist, create a mapping by clicking on the target field
   * @param field pass the field Object
   */
  selectSourceField(field: MdoFieldlistItem) {
    this.handleMappingError();
    this.currentMapping.source = {
      fieldId: field.fieldId,
      description: field.description,
      data: field,
    };
    this.enableLineDraw(field.fieldId);
  }

  /**
   * method to handle event when drag is released
   */
  dragReleased() {
    if (this.droppedOnTarget) {
      this.droppedOnTarget = false;
    } else {
      this.disableLineDraw();
      this.resetCurrentMapping();
    }
  }

  /**
   * Selects the target field
   * If a source is selected it maps the sleected target with it
   * @param field pass the field Object
   */
  selectTargetField(field: MdoMappings) {
    if (this.currentMapping?.source?.fieldId && this.fieldHasMapping(field.uuid, false)) {
      this.bannerText = 'The target field you selected has already been mapped';
      this.handleMappingError(this.bannerText);
      this.resetCurrentMapping();
      return;
    }

    if (!this.currentMapping.source.fieldId) {
      return;
    }

    /**
     * will remove applied constant type transformation rule if mapping applied on target field on confirmation
     */
    if (this.hasTranslationRuleSection && field?.translation?.transalationIds?.length) {
      this.transientService.confirm(
        {
          data: { dialogTitle: 'Alert', label: `Linked Constant Type transformation rule will get removed from the target field. Please confirm to continue.` },
          disableClose: true,
          autoFocus: false,
          width: '600px',
          panelClass: 'create-master-panel',
        },
        (response) => {
          if (response === 'yes') {
            field.translation = null;
            this.sharedService.setTargetFieldSelected({type: 'mapping-applied', fieldValue: field});
            this.currentMappingTargetValue(field);
          }
        }
      );
      return;
    }
    this.currentMappingTargetValue(field);
  }

  currentMappingTargetValue(field: MdoMappings) {
    this.currentMapping.target = { description: field.segmentName, uuid: field.uuid,
      ...(field?.fieldId && {data: {
        fieldId: field.fieldId,
        description: field.description,
        fldCtrl: field,
      }})};
    this.addMapping(this.currentMapping);
  }

  disableLineDraw() {
    if (this.movementSubscriber) {
      this.movementSubscriber.unsubscribe();
    }
    if (this.tempLine) {
      try {
        this.tempLine?.remove();
      } catch (error) {
        console.error('Line draw already disabled');
      }
    }
    const lineElement = document.getElementById('temp-line');
    if (lineElement) {
      lineElement.remove();
    }
  }

  enableLineDraw(fieldId: string) {
    this.removeAllMappingLines();
    const element = document.getElementById(fieldId);
    if (element) {
      const body = document.getElementById('mapping-area');
      const dynamicElement = document.createElement('div');
      dynamicElement.setAttribute('id', 'temp-line');

      dynamicElement.style.width = '0px';
      dynamicElement.style.height = '0px';
      dynamicElement.id = 'dynamic-element';
      dynamicElement.style.visibility = 'hidden';
      dynamicElement.style.position = 'fixed';

      body.appendChild(dynamicElement);

      if (LeaderLine) {
        this.tempLine = new LeaderLine(element, dynamicElement);
        this.tempLine.setOptions(this.lineOptions);
        this.movementSubscriber = this.mouseMoveSubscriber.subscribe((event: MouseEvent) => {
          dynamicElement.style.top = `${event.clientY}px`;
          dynamicElement.style.left = `${event.clientX}px`;
          this.tempLine.position();
        });
      }
    }
  }

  /**
   * Shows the mapped targets with a connecting line
   * @param fieldId pass the field id to display that particular relation
   */
  showMappedTargets(fieldId: string) {
    this.removeAllMappingLines();

    if (this.fieldHasMapping(fieldId)) {
      // Find the first mapped target to scroll to when the source is selected
      this.scrollToTargetField(this.mappingList, fieldId);
      this.drawSavedMappings(true, fieldId);
      this.refreshMappingPosition();
    }
  }

  /**
   * Refreshes the position of the mapping lines
   */
  refreshMappingPosition() {
    this.mappingList.forEach((item) => {
      this.refreshPosition(item);
    });
  }

  /**
   * Check is a selected field has existing mapping
   * @param id pass the unique id
   * @returns boolean
   */
  fieldHasMapping(id: string, source = true): boolean {
    let exists: Mapping;

    if (source) {
      exists = this.existingMapping.find((savedMap) => savedMap.source.fieldId === id);
    } else {
      exists = this.existingMapping.find((savedMap) => savedMap.target.uuid === id);
    }

    return !!exists;
  }

  /**
   * Checks is the source is selected
   * @param fieldId pass the field id
   * @returns boolean
   */
  isSourceSelected(fieldId: string): boolean {
    return this.currentMapping.source.fieldId === fieldId;
  }

  /**
   * Adds mapping to the mapping list
   * @param mapping pass a mapping object
   */
  addMapping(mapping: Mapping) {
    if (mapping.source.fieldId && mapping.target.uuid) {
      const exists = this.mappingList.find(
        (savedMap) => savedMap.source.fieldId === mapping.source.fieldId && savedMap.target.uuid === mapping.target.uuid
      );

      if (!exists) {
        this.mappingList = merge([], [...this.mappingList, mapping]);
        this.existingMapping = merge([], [...this.mappingList]);
      }

      // populate mdofieldId and mdofield desc in target mappings while adding a new mapping
      this.targetFields = this.updateTargetFields(mapping);

      // emit the change to the parent component
      this.updateMapping(this.targetFields);
      this.disableLineDraw();

      setTimeout(() => {
        this.showMappedTargets(mapping.source.fieldId);
        this.refreshMappingPosition();
        this.currentMapping = {
          source: {
            fieldId: '',
            description: '',
          },
          target: {
            description: '',
            uuid: '',
          },
        };
      }, 100);
    } else {
      this.disableLineDraw();
    }
  }

  resetCurrentMapping() {
    this.currentMapping = {
      source: { fieldId: '', description: '' },
      target: { uuid: '', description: '' },
      line: null,
    };
  }

  /**
   * find source field by field id recursively
   * @param fieldId field Id
   * @param fields list of fields
   * @returns MdoFieldlistItem
   */
  findSourceField(fieldId: string, fields: any[]): MdoFieldlistItem {
    if (fields.length) {
      const field = fields.find((fieldItem) => fieldItem?.fieldId === fieldId);
      if (field) {
        return field;
      } else {
        const childFields = fields.map((fieldItem) => {
          if (fieldItem?.childFields?.length) {
            return this.findSourceField(fieldId, childFields);
          }
        });
      }
    }
  }

  /**
   * find grid field parent by field id recursively
   * @param fieldId field Id
   * @param fields list of fields
   * @returns MdoFieldlistItem
   */
  findGridFieldsParent(fieldId: string, fields: MdoField[]): MdoFieldlistItem {
    let gridFieldParent = null;
    if (fields.length) {
      fields.forEach((fieldItem: MdoField) => {
        if (fieldItem?.fieldlist.length) {
          fieldItem.fieldlist.forEach((field: MdoFieldlistItem) => {
            if (!!this.hasMatchingGridField(fieldId, field.childfields) && !gridFieldParent) {
              gridFieldParent = field;
            }
          });
        }
      });
    }

    return gridFieldParent;
  }

  /**
   * Check if the child field has a matching grid field
   * @param fieldId field Id
   * @param childFields list of child fields
   * @returns MdoFieldlistItem
   */
  hasMatchingGridField(fieldId: string, childFields: MdoFieldlistItem[]): MdoFieldlistItem {
    return childFields.find((field: MdoFieldlistItem) => {
      return field.fieldId === fieldId;
    });
  }

  /**
   * Get the mapped field object
   * @param targetUuid pass the target field id
   * @returns MappedData | null
   */
  getMappedField(targetUuid: string): MappedSource | null {
    const existingMapping = this.existingMapping;
    const mapped = existingMapping.find((mapping) => mapping.target.uuid === targetUuid);
    return mapped ? mapped.source : null;
  }

  applyMappingFilter(filterOption: string) {
    this.removeAllMappingLines();
    if (['all', 'mapped', 'unmapped', 'transformed'].indexOf(filterOption) > -1) {
      this.filteredSourceFields = of([]);
      this.filteredTargetFields = of([]);
      setTimeout(() => {
        if (filterOption === 'all') {
          this.initializeSourceAndTargetFilters();
        } else {
          this.filteredSourceFields = of(this.filterSourceFields(filterOption, [...this.sourceFields], this.existingMapping));
          this.filteredTargetFields = of(this.filterTargetFields(filterOption, [...this.targetFields], this.existingMapping));
        }
      }, 100);
    } else {
      console.error('Invalid filter option, valid options are all, mapped, unmapped, transformed');
    }
  }

  onTabChange() {
    this.removeAllMappingLines();
  }

  ngOnDestroy(): void {
    this.removeAllMappingLines();
  }

  drop(event: any) {
    console.log('event', event);
  }

  trackSource(index: number, item: MdoField) {
    return item.structureid;
  }

  trackTarget(index: number, item: SegmentMappings) {
    return item.uuid;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mappingSourceLoader?.currentValue !== undefined) {
      this.mappingSourceLoader = changes.mappingSourceLoader.currentValue;
    }

    if (changes.mappingTargetLoader?.currentValue !== undefined) {
      this.mappingTargetLoader = changes.mappingTargetLoader.currentValue;
    }

    if (changes.messageTypes?.currentValue && changes.messageTypes?.currentValue.length) {
      this.messageTypes = changes.messageTypes.currentValue;
    }

    if (changes.isResponseType?.currentValue !== undefined && changes.isResponseType?.currentValue !== changes.isResponseType?.previousValue) {
      this.isResponseType = changes.isResponseType.currentValue;
      this.removeAllMappingLines();
      this.initializeTargetSearchControl();
    }

    if (changes.targetFields?.currentValue?.length !== undefined) {
      this.targetFields = changes.targetFields.currentValue;
      this.initializeSourceAndTargetFilters();
    }

    if (changes.mappingFilter?.currentValue) {
      this.mappingFilter = changes.mappingFilter.currentValue;
      this.applyMappingFilter(this.mappingFilter);
    }

    if (changes.existingMapping?.currentValue) {
      this.existingMapping = [...changes.existingMapping.currentValue];
      this.mappingList = merge([], [...changes.existingMapping.currentValue]);
    }

    if (changes.reloadMappingData?.previousValue !== changes.reloadMappingData?.currentValue) {
      this.reloadMappingData = changes.reloadMappingData.currentValue;
      if (this.reloadMappingData) {
        this.clearMappings();
      }
    }

    if (changes?.targetTitle?.currentValue) {
      this.targetTitle = changes.targetTitle.currentValue;
    }
  }

  handleMappingError(errorText: string = '') {
    if (errorText) {
      this.disableLineDraw();
    }
    this.infoMessage.emit(errorText);
  }

  /*************************** LOGIC FOR MAPPING LINE START**************************** */

  /**
   * scrolls the first target into view
   * @param mappingList pas sthe mapped list
   * @param sourceFieldId pass the source field id
   */
  scrollToTargetField(mappingList: Mapping[], sourceFieldId: string) {
    mappingList.forEach((mapping, mappingIndex) => {
      if (mapping.source.fieldId === sourceFieldId && mappingIndex === 0) {
        const el = document.getElementById(mapping.target.uuid);
        if (el) {
          el.scrollIntoView(true);
        }
      }
    });
  }

  /**
   * checks whether a field is visible in the DOM
   * @param elementId Pass the element id
   * @returns Object with top and bottom visibility values
   */
  isInViewport(elementId: string): ViewBoundary {
    const elementTopOffset = 226;
    const elementBottomOffset = this.sourceContainer.nativeElement.offsetHeight + elementTopOffset - 80;

    const element: HTMLElement = document.getElementById(elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const isWithinTopBoundary = rect.top - elementTopOffset > 0;
      const isWithinBottomBoundary = rect.bottom - elementBottomOffset <= 48;

      return {
        isWithinTopBoundary,
        isWithinBottomBoundary,
      };
    } else {
      return {
        isWithinTopBoundary: false,
        isWithinBottomBoundary: false,
      };
    }
  }

  /**
   * To refresh the position based on the field's
   * visibility in the visible area
   * @param mapping Pass the mapping Object
   */
  refreshPosition(mapping: Mapping) {
    // Update the position of remove button.
    let sourceEl = document.getElementById(mapping.source.fieldId);
    let targetEl = document.getElementById(mapping.target.uuid);

    if (mapping.line && mapping.line.start) {
      const { line } = this.isWithinBoundary({
        line: mapping.line.start,
        viewBoundary: this.isInViewport(mapping.source.fieldId),
        id: mapping.source.fieldId,
        className: {
          bottom: 'bottom-reference-source',
          top: 'top-reference-source',
        }
      });

      if (line) {
        mapping.line.start = line;
        sourceEl = line;
        mapping.line.position();
      }
    }

    if (mapping.line && mapping.line.end) {
      const { line } = this.isWithinBoundary({
        line: mapping.line.end,
        viewBoundary: this.isInViewport(mapping.target.uuid),
        id: mapping.target.uuid,
        className: {
          bottom: 'bottom-reference',
          top: 'top-reference',
        }
      });

      if (line) {
        mapping.line.end = line;
        targetEl = line;
        mapping.line.position();
      }
    }

    this.updateRemoveMappingButtonPosition(sourceEl, targetEl);
  }

  /**
   * Decide whether a given field is inside boundary and
   * update the connecting line accordingly
   * @param options LineUpdateOptions
   * @returns Element { line }
   */
  isWithinBoundary(options: LineUpdateOptions): any {
    const { line, viewBoundary, id, className } = options;
    let updatedLine = line;
    if (viewBoundary && viewBoundary?.isWithinBottomBoundary && viewBoundary?.isWithinTopBoundary) {
      updatedLine = document.getElementById(id);

      if (viewBoundary && !viewBoundary?.isWithinTopBoundary && viewBoundary?.isWithinBottomBoundary) {
        updatedLine = document.getElementById(className.top);
      }

      if (viewBoundary && viewBoundary?.isWithinTopBoundary && !viewBoundary?.isWithinBottomBoundary) {
        updatedLine = document.getElementById(className.bottom);
      }
    }

    if (viewBoundary && !viewBoundary?.isWithinTopBoundary && viewBoundary?.isWithinBottomBoundary) {
      updatedLine = document.getElementById(className.top);
    }

    if (viewBoundary && viewBoundary?.isWithinTopBoundary && !viewBoundary?.isWithinBottomBoundary) {
      updatedLine = document.getElementById(className.bottom);
    }

    return { line: updatedLine };
  }

  /**
   * Refreshed the connecting lines position when scrolling the
   * source or the target fields
   * @param event any
   */
  onScroll(event: any): void {
    if (this.mappingList?.length) {
      this.mappingList.forEach((mapItem: Mapping) => {
        this.refreshPosition(mapItem);
      });
    }
  }

  /**
   * Draw a connecting line between fields
   * @param mapping pass the mapping to display the relation
   * @returns void
   */
  drawLine(mapping: Mapping): void {
    if (!mapping.source.fieldId || !mapping.target.uuid) {
      return;
    }

    const sourceElement = document.getElementById(mapping.source.fieldId);
    let targetElement = document.getElementById(mapping.target.uuid);

    const withinView = this.isInViewport(mapping.target.uuid);
    if (withinView && !withinView.isWithinTopBoundary && withinView.isWithinBottomBoundary) {
      targetElement = document.getElementById('top-reference');
    }
    if (withinView && withinView.isWithinTopBoundary && !withinView.isWithinBottomBoundary) {
      targetElement = document.getElementById('bottom-reference');
    }

    console.log('sourceElement', sourceElement);
    console.log('targetElement', targetElement);

    if (sourceElement && targetElement) {
      const draw = new LeaderLine(sourceElement, targetElement, {
        endPlugOutline: false,
        animOptions: { duration: 3000, timing: 'linear' },
      });
      draw.setOptions(this.lineOptions);
      this.createRemoveMappingButton(sourceElement, targetElement, { sourceId: mapping.source.fieldId, targetId: mapping.target.uuid });
      const existingMappingIndex = this.mappingList.findIndex(
        (savedMap) => savedMap.source.fieldId === mapping.source.fieldId && savedMap.target.uuid === mapping.target.uuid
      );

      const tempList = [...this.mappingList];
      tempList[existingMappingIndex].line = draw;
      this.mappingList = tempList;
    }
  }

  /**
   * create a remove mapping button for each mapping line
   * @param sourceElement HTMLelement as source
   * @param targetElement HTMLelement as target
   */
  createRemoveMappingButton(sourceElement: HTMLElement, targetElement: HTMLElement, options: any): void {
    const center = this.findCenterByStartEndCoordinates(this.findCenter(sourceElement), this.findCenter(targetElement));
    // create a div dynamically and position it using x,y coordinates
    const div = document.createElement('div');
    div.id = `${sourceElement.id}__+__${targetElement.id}`;
    div.attributes.setNamedItem(document.createAttribute(`data-source-id`));
    div.attributes.setNamedItem(document.createAttribute(`data-target-id`));

    div.setAttribute('data-source-id', options?.sourceId);
    div.setAttribute('data-target-id', options?.targetId);

    div.classList.add('remove-mapping-button');
    div.style.left = `${center.x - 16}px`;
    div.style.top = `${center.y - 16}px`;
    div.innerHTML = '<i class="mdo-icons delete-mapping-icon">trash-alt</i>';
    div.addEventListener('click', () => {
      this.removeMapping(div);
    });
    document.body.appendChild(div);
  }

  /**
   * update the remove mapping button position
   * @param sourceElement HTMLelement as source
   * @param targetElement HTMLelement as target
   */
  updateRemoveMappingButtonPosition(sourceElement: HTMLElement, targetElement: HTMLElement) {
    if (sourceElement?.id && targetElement?.id) {
      const sourceId = sourceElement.id;
      const targetId = targetElement.id;
      const center = this.findCenterByStartEndCoordinates(this.findCenter(sourceElement), this.findCenter(targetElement));
      const element = document.getElementById(`${sourceId}__+__${targetId}`);

      if (element) {
        element.style.left = `${center.x - 16}px`;
        element.style.top = `${center.y - 16}px`;
      }
    }
  }

  removeMapping(div: HTMLElement) {
    let ids = div.id.split('__+__');

    if (div.attributes.getNamedItem('data-source-id') && div.attributes.getNamedItem('data-source-id')) {
      ids = [div.attributes.getNamedItem('data-source-id').value, div.attributes.getNamedItem('data-target-id').value];
    }

    div.remove();
    this.resetCurrentMapping();
    this.mappingList = this.mappingList.filter((curMap) => {
      if (curMap.source.fieldId === ids[0] && curMap.target.uuid === ids[1]) {
        curMap.line?.remove();
        return false;
      }

      return true;
    });
    this.existingMapping = merge([], [...this.mappingList]);
    this.targetFields = this.updateTargetFields({
      source: {
        description: '',
        fieldId: '',
      },
      target: {
        description: null,
        uuid: ids[1],
        ...(this.hasTranslationRuleSection && {removeTranslationRule: true})
      },
    });
    this.updateMapping(this.targetFields);
  }

  /**
   * draws all the saved mappings at once
   */
  drawSavedMappings(drawAllMappings: boolean = false, filterBySource = '') {
    if (drawAllMappings) {
      this.mappingList.forEach((mapItem: Mapping) => {
        if (filterBySource) {
          if (mapItem.source.fieldId === filterBySource) {
            this.redrawMappingLines(mapItem);
          }
        } else {
          this.redrawMappingLines(mapItem);
        }
      });
    } else {
      this.redrawMappingLines(this.currentMapping);
    }
  }

  redrawMappingLines(mapItem: Mapping) {
    if (!mapItem.source.fieldId || !mapItem.target.uuid) {
      return;
    }

    if (mapItem?.line) {
      mapItem.line?.remove();
      mapItem.line = null;
    }

    this.drawLine(mapItem);
  }

  updateTargetFields(mapping: Mapping, segmentList = this.targetFields) {
    if (segmentList?.length) {
      return segmentList.map((field: SegmentMappings) => {
        this.findAndUpdateTargetFields(mapping, field?.mdoMappings).then((res: MappingUpdatedPromiseResponse) => {
          field.mdoMappings = res.updatedMdoMappings;
          if (res.isUpdated) {
            field = this.updateTargetStructureData(mapping, field);
          }
        });

        field.segmentMappings = this.updateTargetFields(mapping, field?.segmentMappings);

        return field;
      });
    }

    return [];
  }

  updateTargetStructureData(mapping: Mapping, field: SegmentMappings): SegmentMappings {
    const mappingData: MdoFieldlistItem = mapping.source.data;
    if (mappingData?.structureId) {
      field.mdoStructure = mappingData.structureId;
    }

    // In case of mapping attribute data from description block
    if(mappingData?.structureId === 'attrs') {
      field.field = mappingData?.fieldId;
    }

    // In case of mapping grid fields
    if (mappingData?.isGridColumn) {
      const source: MdoFieldlistItem = this.findGridFieldsParent(mappingData.fieldId, this.sourceFields);
      if (source) {
        field.field = source.fieldId;
      }
    }

    return field;
  }

  // find and update the target fields
  findAndUpdateTargetFields(mapping: Mapping, mdoMappings: MdoMappings[]): Promise<MappingUpdatedPromiseResponse> {
    return new Promise((resolve) => {
      let updatedMdoMappings = [];
      let isUpdated = false;
      if (mdoMappings?.length) {
        updatedMdoMappings = mdoMappings.map((mdoMapping: MdoMappings) => {
          if (mdoMapping.uuid === mapping.target.uuid) {
            mdoMapping.mdoFieldId = mapping.source.fieldId;
            mdoMapping.mdoFieldDesc = mapping.source.description;
            if (mapping?.target?.removeTranslationRule && mdoMapping?.translation?.transalationIds?.length) {
              mdoMapping.translation = null;
            }
            isUpdated = true;
            return mdoMapping;
          }

          return mdoMapping;
        });
      }

      resolve({
        isUpdated,
        updatedMdoMappings,
      });
    });
  }

  updateMapping(targetFields: SegmentMappings[]) {
    this.updateTargetMapping.emit({
      wsdlDetails: null,
      segmentMappings: targetFields,
      mappingList: this.mappingList
    });
  }

  clearMappings() {
    this.removeAllMappingLines();
    this.existingMapping = [];
    this.mappingList = [];
  }

  /**
   * removes all the mapping lines in one go
   */
  removeAllMappingLines() {
    this.mappingList.forEach((mapItem: Mapping) => {
      if (mapItem?.line) {
        try {
          mapItem.line?.remove();
        } catch (error) {
          console.error('{ error }: Line already removed');
        }
        mapItem.line = null;
      }
    });

    document.querySelectorAll('.remove-mapping-button').forEach((element: HTMLElement) => {
      element?.remove();
    });
  }

  /**
   * will hide and show line based on scroll
   */
  hideShowAllMappingLines(isHideLine: boolean) {
    this.mappingList.forEach((mapItem: Mapping) => {
      if (mapItem?.line) {
        try {
          isHideLine ? mapItem.line?.hide() : mapItem.line?.show();
        } catch (error) {
          console.error('{ error }: Line already hidden');
        }
      }
    });

    document.querySelectorAll('.remove-mapping-button').forEach((element: HTMLElement) => {
      if (element) {
        element.style.display = isHideLine ? 'none' : 'flex';
      }
    });
  }

  /*************************** LOGIC FOR MAPPING LINE END  **************************** */

  expand() {
    this.expandMap.emit(true);
  }
}
