import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { WidgetService } from '@services/widgets/widget.service';
import { UserService } from '@services/user/userservice.service';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { isEqual } from 'lodash';
import { DisplayCriteria } from '@modules/report-v2/_models/widget';
import { GenericWidgetComponent } from '@modules/report-v2/builder/generic-widget/generic-widget.component';

export class TreeModel {
  nodeId: string;
  nodeDesc: string;
  child: Array<TreeModel>;
  checked: boolean;
  parent: string;
}

@Component({
  selector: 'pros-hierarchy-filter-v2',
  templateUrl: './hierarchy-filter.component.html',
  styleUrls: ['./hierarchy-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HierarchyFilter2Component extends GenericWidgetComponent implements OnInit, OnChanges {

  count = 0;
  /**
   * count of total childs for parent Node
   */
  totalChild = 0;

  nestedData: any = [];
  /**
   * Define an indiviual form control
   */
  @Input() control: FormControl = new FormControl('');
  /**
   * Getting placeholder from parent
   */
  @Input() placeholder: string;

  @Input() displayCriteria: string = DisplayCriteria.TEXT;

  @Input() isTableFilter = 'false';
  /**
   * To emit value change of input to parent
   */
  @Output() valueChange = new EventEmitter<object>();

  @Input() value: TreeModel[] = [];

  /**
   * store is enable global filter criteria
   */
  @Input() isEnableGlobalFilter: boolean;

  @Input() fieldId = '';
  topLocation = '';
  searchString = '';
  searchFunc = '';
  @Input() clearFilterClicked: boolean;

  @Input() isFilterWidget = 'false';
  @Input() isFilterSiderSheet = 'false';

  @Input() widgetId: number;
  @Input() isMenuClosed: boolean;

  /**
   * To store selected node
   */
  selectedNode: TreeModel[] = [];
  subscriptions: Subscription[] = [];

  /**
   * Constructor of the class
   * @param widgetService Injecting widgetService class
   */
  constructor(
    private widgetService: WidgetService,
    private userService: UserService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.clearFilterClicked && changes.clearFilterClicked.previousValue !== changes.clearFilterClicked.currentValue && changes.clearFilterClicked.previousValue !== undefined) {
      this.control.setValue('');
      this.getLocationData(this.topLocation, this.fieldId, this.searchString, this.searchFunc);
      this.selectedNode = [];
      this.valueChange.emit(this.selectedNode);
    }

    if (changes && changes.value && !isEqual(changes.value.previousValue, changes.value.currentValue) && changes.value.currentValue) {
      let isValueChange = false;
      if(changes.value.currentValue.length !== this.selectedNode.length) {
        isValueChange = true;
      } else if(changes.value.currentValue) {
        isValueChange = changes.value.currentValue.findIndex((item,index) => item.CODE !== this.selectedNode[index]?.nodeId) > -1 ? true : false;
      }
      if(isValueChange) {
        this.selectedNode = [];
        if (changes.value.currentValue && changes.value.currentValue.length) {
          changes.value.currentValue.forEach(item => {
            if (typeof (item) === 'string') {
              this.selectedNode.push(null);
            } else {
              const obj = {} as any;
              const objKey = ['nodeId', 'nodeDesc', 'child', 'checked', 'parent'];
              obj[objKey[0]] = item.CODE;
              obj[objKey[1]] = item.TEXT;
              obj[objKey[2]] = item.child ? item.child : null;
              obj[objKey[3]] = true;
              obj[objKey[4]] = item.parent ? item.parent : 'false';
              this.selectedNode.push(obj)
            }
          })
        }
        // if(this.isTableFilter === 'true'){
          this.getLocationData('', this.fieldId, '', '');
        // }
      }
    }

    if (changes && changes.isFilterWidget && changes.isFilterWidget.previousValue !== undefined && changes.isFilterWidget.previousValue !== changes.isFilterWidget.currentValue) {
      this.isFilterWidget = changes.isFilterWidget.currentValue;
    }

    if (changes && changes.isMenuClosed && changes.isMenuClosed.previousValue !== changes.isMenuClosed.currentValue && changes.isMenuClosed.previousValue !== undefined && !changes.isMenuClosed.currentValue) {
      this.control.setValue('');
    }

    if (changes && changes.displayCriteria && changes.displayCriteria.currentValue !== undefined && changes.displayCriteria.currentValue !== changes.displayCriteria.previousValue) {
      this.displayCriteria = changes.displayCriteria.currentValue;
    }
  }

  /***
   * ANGULAR HOOK
   */
  ngOnInit() {
    if (!this.control) {
      this.control = new FormControl();
    }
    if (this.isTableFilter === 'false') {
      this.getLocationData(this.topLocation, this.fieldId, this.searchString, this.searchFunc);
    }
    const searchControlSub = this.control.valueChanges.pipe(debounceTime(500)).subscribe(value => {
      this.getLocationData(this.topLocation, this.fieldId, value, this.searchFunc);
    });
    this.subscriptions.push(searchControlSub);
  }

  emitEvtFilterCriteria(event: any): void {
    throw new Error('Method not implemented.');
  }
  /**
   * function to get data of location
   * @param topLocation parentNodeId of node
   * @param fieldId fieldId
   * @param searchString string to be searched inside searchbar
   * @param searchFunc .
   */
  public getLocationData(topLocation, fieldId, searchString, searchFunc) {
    const getUserDetails = this.userService.getUserDetails().subscribe(user => {
      const getLocationHirerachy = this.widgetService.getLocationHirerachy(topLocation, '', searchString, searchFunc, user.plantCode).subscribe(data => {
        this.appendSelectedData(data);
        this.nestedData = data;
        if (this.isTableFilter === 'true' && this.selectedNode.length) {
          this.displayMultiselectedText();
        }
      });
      this.subscriptions.push(getLocationHirerachy);
    });
    this.subscriptions.push(getUserDetails);
  }

  /**
   * function to maintain checked/unchecked state..
   * @param element data on which we clicked..
   */
  clickedActive(element: TreeModel) {
    if (element) {
      element.checked = !element.checked;
      if (element.checked) {
        this.selectedNode.push({ ...element, parent: 'true' });
      } else {
        const index = this.selectedNode.findIndex(item => item.nodeId === element.nodeId);
        if (index > -1) {
          this.selectedNode.forEach(node => {
            node.parent = 'true';
          });
          this.selectedNode.splice(index, 1);
        }
      }
      if (element.child) {
        this.checkForChild(element.checked, element.child);
      }
      this.selectedNode.forEach(node => {
        if (node.child && node.child.length) {
          this.checkForSelectedParent(node.child);
        }
      });
      if (this.isTableFilter === 'false' && this.isFilterWidget === 'false') {
        this.applyFilter();
      }
    }
    else {
      if (this.isTableFilter === 'false' && this.isFilterWidget === 'false') {
        this.applyFilter();
      }
    }
  }

  /**
   * function to change the state of parent
   * @param childArray array contains child
   */
  checkForSelectedParent(childArray: any) {
    childArray.forEach(nodeChild => {
      const index = this.selectedNode.findIndex(item => item.nodeId === nodeChild.nodeId);
      if (index > -1) {
        this.selectedNode[index].parent = 'false';
      }
      if (nodeChild.child && nodeChild.child.length) {
        this.checkForSelectedParent(nodeChild.child);
      }
    })
  }

  /**
   * function to change the state of parent
   * @param childArray array of child nodes
   */
  checkForSelectedParent1(childArray: any) {
    childArray.forEach(item => {
      const ind = this.selectedNode.findIndex(node => node.nodeId === item.nodeId);
      if (ind > -1) {
        this.selectedNode[ind].parent = 'true';
      }
    });
  }

  /***
   * function to check for children
   * @param parentState checked state of parent .. true/false
   * @param childArray array contains the child nodes of parent
   */
  checkForChild(parentState: boolean, childArray: any) {
    childArray.forEach(child => {
      if (parentState === false) {
        child.checked = false;
        const index = this.selectedNode.findIndex(item => item.nodeId === child.nodeId);
        if (index > -1) {
          this.selectedNode.splice(index, 1);
        }
      } else {
        child.checked = true;
        child.parent = 'true';
        const index = this.selectedNode.findIndex(item => item.nodeId === child.nodeId);
        if (index === -1) {
          this.selectedNode.push(child);
        }
        else {
          this.selectedNode[index] = child;
        }
      }
      if (child.child) {
        this.checkForChild(child.checked, child.child);
      }
    })
  }

  /**
   * Loops recursively through data finding the amount of checked children
   */
  getCheckedAmount(data: TreeModel) {
    this.count = 0; // resetting count
    this.totalChild = 0;
    this.loopData(data.child);
    /** compare the count of selected child node and total child node of particulart parent node */
    if (this.count > 0 && this.count !== this.totalChild) {
      if (data.checked) {
        data.checked = false;
      }
      const index = this.selectedNode.findIndex(item => item.nodeId === data.nodeId);
      if (index > -1) {
        if (this.selectedNode[index].child && this.selectedNode[index].child.length) {
          this.checkForSelectedParent1(this.selectedNode[index].child);
        }
        this.selectedNode.splice(index, 1);
        if (this.isTableFilter === 'false' && this.isFilterWidget === 'false') {
          this.applyFilter();
        }
      }
      return true;
    } else if (this.count > 0) {
      /** executes when parent node is not selected but it all child node is selected */
      if (!data.checked) {
        data.checked = true;
        data.parent = 'true';
        if (!this.selectedNode.includes(data)) {
          this.selectedNode.push(data);
          if (data.child && data.child.length) {
            this.checkForSelectedParent(data.child);
          }
          if (this.isTableFilter === 'false' && this.isFilterWidget === 'false') {
            this.applyFilter();
          }
        }
      }
      return false;
    } else {
      const index = this.selectedNode.findIndex(item => item.nodeId === data.nodeId);
      if (index > -1) {
        if (this.selectedNode[index].child && this.selectedNode[index].child.length) {
          this.checkForSelectedParent1(this.selectedNode[index].child);
        }
        this.selectedNode.splice(index, 1);
        data.checked = false;
        if (this.isTableFilter === 'false' && this.isFilterWidget === 'false') {
          this.applyFilter();
        }
      }
    }
  }

  /**
   * Used by getCheckedAmount()
   */
  loopData(data) {
    data.forEach(d => {
      this.totalChild += 1;
      if (d.checked) {
        this.count += 1;
      }
      if (d.child && d.child.length > 0) {
        this.loopData(d.child);
      }
    });
  }

  appendSelectedData(data) {
    data.forEach(prnt => {
      const isPreViusSelected = this.selectedNode.filter(fill => (fill.nodeId === prnt.nodeId));
      if (isPreViusSelected.length > 0) {
        prnt.checked = true;
      } else {
        prnt.checked = false;
      }
      if (prnt.child) {
        this.childselected(prnt.child);
      }
    });
  }

  childselected(child) {
    if (child && child.length > 0) {
      child.forEach(p => {
        const isPreViusSelected = this.selectedNode.filter(fill => (fill.nodeId === p.nodeId));
        if (isPreViusSelected.length > 0) {
          p.checked = true;
        } else {
          p.checked = false;
        }
        if (p.child) {
          this.childselected(p.child);
        }
      });
    }
  }

  applyFilter() {
    if (this.isTableFilter === 'true' && this.selectedNode.length) {
      this.displayMultiselectedText();
    }
    const selectedData = this.getSelectedData();
    let response = {};
    if(this.isFilterSiderSheet === 'true' || this.isFilterWidget === 'true'){
      response = selectedData;
    } else {
      response = {
        formFieldId: this.fieldId,
        value: selectedData
      }
    }
    this.valueChange.emit(response);
  }

  /**
   * display the selected text
   */
  displayMultiselectedText() {
    const inputWrapper = document.getElementById(this.fieldId);
    const textWrapper = document.getElementById('input-' + this.fieldId);
    textWrapper.innerHTML = '';
    const selectedValues = [];
    let additionalLength = 0;
    let selectedParentCount = 0;
    this.selectedNode.forEach(item => {
      if (item.parent === 'true') {
        selectedParentCount++;
        const value = item.nodeDesc;
        const code = item.nodeId;
        const previousText = textWrapper.innerHTML;
        if (inputWrapper.offsetWidth - textWrapper.offsetWidth > 50) {
          if (this.displayCriteria === DisplayCriteria.CODE) {
            textWrapper.innerHTML = textWrapper.innerHTML + code + ';';
          } else if (this.displayCriteria === DisplayCriteria.CODE_TEXT) {
            textWrapper.innerHTML = textWrapper.innerHTML + code + '-' + value + ';'
          } else {
            textWrapper.innerHTML = textWrapper.innerHTML + value + ';';
          }
          selectedValues.push(value);
        }
        if (inputWrapper.offsetWidth - textWrapper.offsetWidth < 0) {
          textWrapper.innerHTML = previousText;
          selectedValues.pop();
        }
      }
    })
    additionalLength = selectedParentCount - selectedValues.length;
    const additionalCount = document.getElementById('additional-' + this.fieldId);
    if (additionalCount) {
      additionalCount.innerHTML = '';
    }
    if (additionalLength) {
      additionalCount.innerHTML = ' +' + additionalLength;
    }
  }

  getSelectedData() {
    const selectedDataList = []
    this.selectedNode.forEach(el => {
      const data = { CODE: el.nodeId, TEXT: el.nodeDesc, child: el.child, checked: el.checked, parent: el.parent };
      selectedDataList.push(data);
    })
    return selectedDataList;
  }

  onFocus() {
    this.control.setValue('');
    this.getLocationData('', '', '', '');
  }

  /**
   * @param option value
   * @returns returns the string to display on check box label
   */
   getLabel(option) {
    if (this.displayCriteria === 'CODE_TEXT') {
      return option.nodeId + '-' + option.nodeDesc;
    } else if (this.displayCriteria === 'CODE') {
      return option.nodeId;
    } else {
      return option.nodeDesc;
    }
  }

}
