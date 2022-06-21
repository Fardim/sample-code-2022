import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DisplayCriteria } from '@modules/report-v2/_models/widget';
import { TreeModel } from '../hierarchy-filter.component';

@Component({
    selector: 'pros-menu-item',
    templateUrl: './menu-item.component.html',
    styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnChanges{

    @ViewChild('childMenu', { static: true }) public childMenu;
    /**
     * To store selected node
     */
    @Input() selectedNode: TreeModel[] = [];
    @Input() displayCriteria: string = DisplayCriteria.TEXT;
    /**
     * holds the menu item list value
     */
    @Input() nestedData: any = [];
    /**
     * To emit value change of input to parent
     */
    @Output() valueChange = new EventEmitter<object>();
    count = 0;
    /**
     * count of total childs for parent Node
     */
    totalChild = 0;

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes.displayCriteria && changes.displayCriteria.currentValue !== undefined && changes.displayCriteria.currentValue !== changes.displayCriteria.previousValue) {
            this.displayCriteria = changes.displayCriteria.currentValue;
        }
    }

    clickedActive(element) {
        this.valueChange.emit(element);
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
                this.valueChange.emit();
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
                    this.valueChange.emit();
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
                this.valueChange.emit();
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

    checkForSelectedParent1(childArray: any) {
        childArray.forEach(item => {
            const ind = this.selectedNode.findIndex(node => node.nodeId === item.nodeId);
            if (ind > -1) {
                this.selectedNode[ind].parent = 'true';
            }
        });
    }

    /**
     * @param option value
     * @returns returns the string to display on check box label
     */
    getLabel(option) {
        if (this.displayCriteria === 'CODE_TEXT') {
            return option.nodeId + '-' + option.nodeDesc
        } else if (this.displayCriteria === 'CODE') {
            return option.nodeId;
        } else {
            return option.nodeDesc;
        }
    }
}
