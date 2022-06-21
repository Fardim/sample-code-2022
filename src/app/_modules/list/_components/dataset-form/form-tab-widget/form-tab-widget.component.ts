import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldControlType, FormTab, widgetGridTabFields } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { Utilities } from '@models/schema/utilities';
import { DmsService } from '@services/dms/dms.service';
import { TransientService } from 'mdo-ui-library';
import { finalize } from 'rxjs/operators';
import { picklistValues } from '../edit-dataset-form/edit-dataset-form.component';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'pros-form-tab-widget',
  templateUrl: './form-tab-widget.component.html',
  styleUrls: ['./form-tab-widget.component.scss']
})
export class FormTabWidgetComponent implements OnInit, OnChanges {
  @Input() tabFields: any = {};
  @Input() tabsList: FormTab[] = [];
  @Input() parentTabIndex: number;
  @Input() moduleId: string;
  @Input() isChildField: boolean = false;
  @Input() parentFieldId: string = '';
  // @Input() tabid: string = null;
  @Input() isLast = false;
  @Output() deleteFormWidget: EventEmitter<any> = new EventEmitter(null);
  @Output() addFormSection: EventEmitter<any> = new EventEmitter();
  @Output() moveFieldToSection: EventEmitter<any> = new EventEmitter();
  @Output() widgetClicked: EventEmitter<any> = new EventEmitter();
  picklistValues = picklistValues
  expendItemId = [];
  uploading = false;
  uploadError = false;
  editorId: any;
  htmlEditorControl: any;


  constructor(private dmsService: DmsService,
    private transientService: TransientService,
    private coreService: CoreService,
    private utilityService: Utilities,
    @Inject(LOCALE_ID) public locale: string) {
      this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.tabFields?.fieldType !== 'TEXT' && this.tabFields?.fieldType !== 'IMAGE') {
      const pickList = this.tabFields?.pickList || (this.tabFields.metadata && this.tabFields.metadata[0]?.pickList);
      const datatype = this.tabFields?.dataType || (this.tabFields.metadata && this.tabFields.metadata[0]?.dataType);
      const find = this.picklistValues.filter(p => p?.pickList === pickList && p?.dataType === datatype);

      if (find.length) {
        this.tabFields.icon = find[0]?.icon || '';

        if((find[0].fieldType === FieldControlType.GRID) && this.tabFields.childs && this.tabFields.metadata) {
          this.addGridChildsPicklist(this.tabFields.childs,this.tabFields.metadata[0].grid);
        }

        if((find[0].fieldType === FieldControlType.GRID) && !this.tabFields.childs) {
          this.getGridChilds();
          this.setDefaultPermission(this.tabFields);
        }
      }
    }
    if (this.tabFields?.fieldType === 'TEXT') {
      this.htmlEditorControl = new FormControl(this.tabFields?.description);
      this.editorId = this.utilityService.getRandomString(12);
    }
  }

  addGridChildsPicklist(grids,metaDataGrids) {
    grids.forEach(grid => {
      metaDataGrids.forEach(element => {
        if(grid.fieldId === element.fieldId) {
          grid.pickList = element.pickList;
          grid.dataType = element.dataType;
          grid.description = element.description;

          if (grid.childs && grid.childs.length && element.grid.length) {
            this.addGridChildsPicklist(grid.childs,element.grid);
          }
        }
      });
    });
  }

  isExpendable(data: string) {
    const index = this.expendItemId.indexOf(data);
    if (index !== -1) {
      this.expendItemId.splice(index, 1);
    } else {
      this.expendItemId.push(data);
    }
  }

  delete(fieldId) {
    this.deleteFormWidget.emit({ fieldId });
  }

  isHidden(fields) {
    if (!fields?.isReadOnly) {
      fields.isHidden = !fields.isHidden;
    }
  }

  isReadOnly(fields) {
    if (!fields?.isHidden) {
      fields.isReadOnly = !fields.isReadOnly;
    }
  }

  addNewSection() {
    this.addFormSection.emit();
  }

  moveToSection(targetTabIndex: number) {
    this.moveFieldToSection.emit(targetTabIndex);
  }

  onFileDrop(event) {
    event.preventDefault();
    this.uploadFile(event.dataTransfer.files);
  }

  dragOver(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  dropChildField(event: CdkDragDrop<string[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  uploadFile(files: File[]): void {
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    this.tabFields.description = file.name;
    this.uploading = true;
    this.dmsService.uploadFile(file)
      .pipe(
        finalize(() => this.uploading = false)
      ).subscribe(resp => {
        if (resp) {
          this.tabFields.url = resp;
          this.tabFields.uploaded = true;
        }
      }, error => {
        this.uploadError = true;
        this.tabFields.description = '';
        this.transientService.open('Something went wrong while uploading file', null, { duration: 2000, verticalPosition: 'bottom' });
        console.error(`Error:: ${error.message}`);
      });
  }

  /**
   * get file icon based on file name
   */
  getAttachmentIcon() {
    const attachmentName = this.tabFields?.description || (this.tabFields?.metadata && this.tabFields?.metadata[0]?.description);
    if (!attachmentName) {
      console.error('Invalid attachment name!');
      return;
    }
    let attachmentIcon = '';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = '/assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = '/assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = '/assets/images/ext/pdf.svg';
        break;
      }
      case 'ppt': {
        attachmentIcon = '/assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = '/assets/images/ext/txt.svg';
        break;
      }
      case 'xls': {
        attachmentIcon = '/assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = '/assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = '/assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  get hasAttachment() {
    return this.tabFields.url || this.tabFields.description;
  }

  removeAttachment() {
    const fileSNO = this.tabFields.url;
    if (!fileSNO) {
      console.error('missing attachment sno !');
      return;
    }

    this.dmsService.deleteFile(fileSNO).subscribe(resp => {
      this.tabFields.url = '';
      this.tabFields.description = '';
      this.uploading = false;
      this.uploadError = false;
    }, error => {
      console.error('unable to delete attachment !');
    });
  }

  getGridChilds() {
    this.coreService.getFieldDetails(this.moduleId, this.tabFields.fieldId)
      .subscribe(resp => {
        const childs = this.addChildsFields(resp?.childfields);
        this.tabFields.childs = childs;
      }, error => {
        console.error(`Error:: ${error.message}`);
      });
  }

  addChildsFields(childFieldData) {
    return childFieldData.map(f => {
      const childMetadata = this.picklistValues.filter(p => p?.pickList === f.pickList && p?.dataType === f.dataType);
      const icon = childMetadata.length ? childMetadata[0].icon : 'text';
      return {
        fieldId: f.fieldId,
        description: f.shortText[this.locale].description,
        isHidden: false,
        isReadOnly: false,
        isMandatory: false,
        fieldType: 'FIELD',
        metaData: childMetadata,
        pickList: f.pickList,
        dataType: f.dataType,
        icon,
        ...((f.pickList === '15') && {childs: this.addChildsFields(f.childfields)}),
        ...((f.pickList === '15') && {permissions: this.setPermissionObject(f.fieldId)})
      }
    });
  }

  setDefaultPermission(tabFields: widgetGridTabFields) {
    if(!tabFields?.permissions) {
      tabFields.permissions = this.setPermissionObject(tabFields.fieldId);
    }
  }

  setPermissionObject(fieldId: string) {
    return {
      addRow: true,
      copyRow: true,
      editRow: true,
      export: true,
      gridId: fieldId,
      import: true,
      invisible: false,
      nonEditable: false,
      removeMultipleRow: true,
      removeRow: true,
      required: false,
      sequenceField: {fieldId: '', description: ''},
      sortOrder: "ASC",
    }
  }

  /**
   * Emit the seelected tab fields and persmission
   * based on the selected entity
   * @param tabFields - tab fields
   */
  onSelectField(tabFields: any) {
    // Added click event emitter to emit the event to parent component
    this.widgetClicked.emit(tabFields);
    if (tabFields.childs?.length) {
        this.coreService.updateFormGridPermissions.next({isChildField: this.isChildField, tabField: this.tabFields, parentTabIndex: this.parentTabIndex, ...((this.isChildField) && {parentFieldId: this.parentFieldId})});
    }
  }

  editorValueChange($event) {
    this.tabFields.description = $event.newValue;
  }

  get fieldType() {
    const pickList = this.tabFields?.pickList || (this.tabFields?.metadata && this.tabFields.metadata[0]?.pickList);
    const datatype = this.tabFields?.dataType || (this.tabFields?.metadata && this.tabFields.metadata[0]?.dataType);
    const find = this.picklistValues.filter(p => p?.pickList === pickList && p?.dataType === datatype);
    let fieldType = 'FIELD';
    if (find?.length) {
      if (find[0].fieldType === 'grid') {
        fieldType = 'table';
      } else if (find[0].fieldType === 'html') {
        fieldType = 'Rich text editor';
      } else {
        fieldType = find[0].fieldType;
      }
    }
    return fieldType;
  }
}
