import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ImportInterfaceDetailsRequest } from '@models/mapping';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { ConnectionService } from '@services/connection/connection.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { TransientService } from 'mdo-ui-library';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { RecordExpandedViewComponent } from '../record-expanded-view/record-expanded-view.component';
import { ExampleFlatNode, TreeNode, TREE_DATA } from './../../models/package-hierarchy.model';

@Component({
  selector: 'pros-cpi-standard-package',
  templateUrl: './cpi-standard-package.component.html',
  styleUrls: ['./cpi-standard-package.component.scss'],
})
export class CpiStandardPackageComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ExampleFlatNode, TreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNode, ExampleFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ExampleFlatNode | null = null;
  treeFlattener;
  treeControl;

  dataSource;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<ExampleFlatNode>(true /* multiple */);

  standardPackageForm: FormGroup = null;

  stdPackageId = '';
  errorText: string = '';
  formSubmitted: boolean = false;

  constructor(
    public connectorService: ConnectorService,
    public connectionService: ConnectionService,
    private fb: FormBuilder,
    private globalDialog: GlobaldialogService,
    private sapwsService: SapwsService,
    private ckhService: ConnekthubService,
    private transient: TransientService
  ) {
    this.treeFlattener = new MatTreeFlattener(this._transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = TREE_DATA;
  }

  private _transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.id === node.id ? existingNode : new ExampleFlatNode();
    flatNode.name = node.name;
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  getLevel = (node: ExampleFlatNode) => node.level;

  isExpandable = (node: ExampleFlatNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] => node.children;

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  hasNoContent = (_: number, _nodeData: ExampleFlatNode) => _nodeData.name === '';

  ngOnInit(): void {
    this.createStandardPackageForm();
  }

  createStandardPackageForm() {
    this.standardPackageForm = this.fb.group({
      dateCreated: ['', [ Validators.required ]],
      dateModified: ['', [ Validators.required ]],
      hierarchy: ['', []],
      recordNumber: ['', [ Validators.required, this.noWhitespaceValidator ]],
      syncData: [false, []],
      updateDataInSystem: [false, []],
    });

    this.standardPackageForm.statusChanges.subscribe((status) => {
      if(this.formSubmitted) {
        this.setError(status === 'INVALID'? 'Please enter a valid record number': '');
      }
    });
  }

  setCreateDate(event) {}

  setModifiedDate(event) {}

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ExampleFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ExampleFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ExampleFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ExampleFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: ExampleFlatNode): void {
    let parent: ExampleFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  openExpandedRecordView() {
    const dialogRef = this.globalDialog.openCustomDialog(RecordExpandedViewComponent, {
      width: '545px',
      data: {
        title: 'Record number-Expansion view',
        recordNumbers: this.standardPackageForm?.controls.recordNumber.value,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.standardPackageForm.controls.recordNumber.setValue(result);
    });
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: ExampleFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: ExampleFlatNode): ExampleFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /**
   * Create the import interface body by getting the package file from ConnektHub
   * and the required data from the form.
   * Finnaly call the import interface api and import the interface details.
   */
  import() {
    this.formSubmitted = true;
    const formData = this.standardPackageForm.value;

    // create the Import interface request body
    const body: ImportInterfaceDetailsRequest = {
      connection: {
        connectionId: this.sapwsService.tableMapping?.connectionId,
        hostName:  this.sapwsService.tableMapping?.url,
        noOfInterface: 0,
        password: this.sapwsService.tableMapping?.password,
        status: 'COMPLETED',
        user: this.sapwsService.tableMapping?.username,
      },
      dataScope: {
        dateCreated: moment(formData?.dateCreated).format('YYYY-MM-DD'),
        dateModified: moment(formData?.dateModified).format('YYYY-MM-DD'),
        hierarchy: '',
        recordNumbers: !!formData.recordNumber? formData.recordNumber.split(',') : [],
        syncData: !!formData?.syncData,
        updateDataInSystem: !!formData?.updateDataInSystem,
      },
    };

    // update the form validity one last time before calling the api
    this.standardPackageForm.updateValueAndValidity();

    if(this.standardPackageForm.valid) {
      if(this.sapwsService.tableMapping?.standardPkg) {
        const packageId = this.sapwsService.tableMapping?.standardPkg?.id;
        this.standardPackageForm.disable();
        this.getPackageFile(packageId).subscribe((data: string) => {
          const file = new File([new Blob([data], {type: '.json'})], packageId +'.json');
          this.importInterfaceDetails(file, body).subscribe((response: any) => {
            this.standardPackageForm.enable();
            if(response.acknowledge) {
             this.transient.open('Import Successful!', 'Close');
             this.onCancelClick();
            } else {
              this.setError('Error while importing interface details');
            }
          }, err => {
            this.standardPackageForm.enable();
          });
        }, (err: Error) => {
          this.standardPackageForm.enable();
        });
      }
      console.log(formData);
      console.log(body);
    } else {
      this.setError('Please fill all the required fields');
    }
  }

  /**
   * make an API request for importing interface details
   * @param file - file to be uploaded
   * @param payload - payload to be sent
   * @returns - observable of response
   */
  importInterfaceDetails(file:File, payload: ImportInterfaceDetailsRequest): Observable<any> {
    return new Observable((observer) => {
      this.sapwsService.importInterfaceDetails(file, payload).subscribe((data) => {
        console.log(data);
        observer.next(data);
      }, err => {
        console.log(err);
        this.setError('Error while importing interface details');
        observer.error('Error while importing interface details');
      });
    });
  }

  /**
   * get selected package file from connektHub
   * @param id  package Id
   * @returns selected package file
   */
  getPackageFile(id: string) {
    return new Observable((observer) => {
      this.ckhService.getPackageFile(id).subscribe((res) => {
        observer.next(res);
        observer.complete();
      }, (err: Error) => {
        console.error(err);
        observer.error('Error while getting package file');
        this.setError('Error while getting package file');
        observer.complete();
      });
    })
  }

  get isValidRecordNumber(): boolean {
    return (this.standardPackageForm?.controls.recordNumber.invalid && this.standardPackageForm?.controls.recordNumber.touched);
  }

  /**
   * Custom validator for handling whitespaces
   * @param control - control to be validated
   * @returns - null if control is valid else {whitespace: true}
   */
  noWhitespaceValidator(control: FormControl) {
    const isWhitespacePresent = (control.value || '').trim().length === 0;
    const isValid = !isWhitespacePresent;
    return isValid ? null : { whitespace: true };
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null });
  }

  /**
   * Set error message
   * @param text - error message
   */
  private setError(text?: string) {
    this.errorText = text;
  }
}
