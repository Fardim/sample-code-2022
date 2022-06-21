import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { COMMA, ENTER, M, SPACE } from '@angular/cdk/keycodes';
import { BlockElementTypes, TransientService } from 'mdo-ui-library';
import { packageName, packageIcon, packageChildDisplayName, packageChildId } from '../package.modal';
import { CoreService } from '@services/core/core.service';
import { forkJoin } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { DmsService } from '@services/dms/dms.service';
import { Utilities } from '@models/schema/utilities';
import { FILE_NAME_SEPARATOR } from '@modules/chat/_common/chat';

@Component({
  selector: 'pros-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit {
  isShowSideNav: boolean = true;
  dragItem: any;
  selectedNodeItem = [];
  dragging: boolean = false;
  expandTimeout: any;
  expandDelay: number = 1000;
  validateDrop: boolean = false;
  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  tagsList = ['Role', 'Dataset', 'Flow', 'Form', 'Dashboard', 'Schemas', 'Scenario and interface'];
  inpFrmCtrl: FormControl = new FormControl();
  attachments = [];
  disabled = false;
  name: string = '';
  description: string = '';
  tags = [];
  images = [];
  whatsNew: string = '';
  documentationLink: string = '';
  treedata = [];
  toggleStatus;
  uuid: any;
  packageId: any;

  constructor(
    private router: Router,
    private transienteService: TransientService,
    private coreService: CoreService,
    private activateRoute: ActivatedRoute,
    private dmsService: DmsService,
    private utilityService: Utilities
  ) {}

  ngOnInit(): void {
    this.getPackageNode();
    this.activateRoute.queryParams.subscribe((res) => {
      if (res?.packageId) {
        this.packageId = res?.packageId;
        this.getPackageDetail(res?.packageId);
      }
    });
  }

  /*
   * return package name according to key
   */
  getPackageName(key) {
    return packageName[key];
  }

  /*
   * return package child name according to parent key
   */
  getPackageChildName(key) {
    return packageChildDisplayName[key];
  }

  /*
   * return packageId according to key
   */
  getPackageChildId(key) {
    return packageChildId[key];
  }

  /*
   * return package icon according to key
   */
  getIcon(key) {
    return packageIcon[key];
  }

  /*
   * remove a section
   */
  removeSection(key) {
    const index = this.selectedNodeItem.findIndex((e) => e?.key === key);
    this.selectedNodeItem.splice(index, 1);
  }

  /*
   * get package detail a section
   * @params packageId
   */
  getPackageDetail(packageId) {
    this.coreService.getPackageDetail(packageId, 'en').subscribe((res) => {
      this.patchValue(res);
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  /*
   * patch the package info in the properties pannel
   * @params package detail
   */
  patchValue(packageDetail) {
    this.uuid = packageDetail?.uuid;
    this.name = packageDetail?.name;
    this.description = packageDetail?.description;
    this.tags = packageDetail?.tags;
    this.whatsNew = packageDetail?.whatsNew;
    this.documentationLink = packageDetail?.documentationLink;
    packageDetail?.metaData.forEach((e) => {
      e?.data.forEach((el) => {
        this.dragItem = { key: e?.key, data: el };
        this.drop();
      });
    });
  }

  /*
   * get all package component
   */
  getPackageNode() {
    const req1 = this.coreService.getAllDataSets();
    const req2 = this.coreService.getAllRoles();
    const req3 = this.coreService.getAllFlows();
    const req4 = this.coreService.getAllForms();
    forkJoin([req1, req2, req3, req4]).subscribe((res) => {
      this.transformDataSetsObjectTOTreeNode(res[0]);
      this.transformRolesObjectTOTreeNode(res[1]?.listPage?.content);
      this.transformFlowsObjectTOTreeNode(res[2]);
      this.transformFormsObjectTOTreeNode(res[3]?.response);
    },
    err => {
      this.transienteService.open(err?.message);
    });
  }

  /*
   * make Form package component
   */
  transformFormsObjectTOTreeNode(object) {
    let tempObj = {
      key: 'formInfo',
      data: []
    };

    object.forEach((ele) => {
      tempObj.data.push({
        formId: ele?.layoutId?.toString(),
        formDesc: ele?.description
      });
    });
    this.treedata.push(tempObj);
  }

  /*
   * make Flow package component
   */
  transformFlowsObjectTOTreeNode(object) {
    let tempObj = {
      key: 'flowInfo',
      data: []
    };

    object.forEach((ele) => {
      tempObj.data.push({
        flowId: ele?.id?.toString(),
        flowDesc: ele?.name
      });
    });
    this.treedata.push(tempObj);
  }

  /*
   * make Roles package component
   */
  transformRolesObjectTOTreeNode(object) {
    let tempObj = {
      key: 'rolesInfo',
      data: []
    };

    object.forEach((ele) => {
      tempObj.data.push({
        roleId: ele?.roleId?.toString(),
        roleDesc: ele?.description
      });
    });
    this.treedata.push(tempObj);
  }

  /*
   * make dataset package component
   */
  transformDataSetsObjectTOTreeNode(object) {
    let tempObj = {
      key: 'datasetInfo',
      data: []
    };

    object.forEach((ele) => {
      tempObj.data.push({
        datasetId: ele?.moduleId?.toString(),
        datasetDesc: ele?.moduleDescriptionRequestDTO?.description
      });
    });
    this.treedata.push(tempObj);
  }

  /*
   * trigger when select is change
   */
  selected(event) {
    this.tags.push(event.option.value);
  }

  /*
   * reset input control value
   */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  /*
   * remove tags
   */
  remove(tag) {
    const index = this.tags.indexOf(tag);
    this.tags.splice(index, 1);
  }

  /*
   * trigger when toggle is change
   */
  toggleChange($event) {
    if ($event) {
      this.toggleStatus = 'PUBLISHED';
    } else {
      this.toggleStatus = 'DRAFT';
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  discard() {
    this.transienteService.confirm(
      {
        data: { label: 'Are you sure you want to discard the changes performed?' },
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      },
      (response) => {
        if (response === 'yes') {
          this.router.navigate([{ outlets: { sb: `sb/settings/packages` } }]);
        }
      }
    );
  }

  toggleSideNav() {
    this.isShowSideNav = !this.isShowSideNav;
  }

  drop(event?: CdkDragDrop<string[]>): any {
    let index = this.selectedNodeItem.findIndex((e) => e?.key === this.dragItem?.key);
    if (index > -1) {
      this.selectedNodeItem.forEach((e, i) => {
        if (e?.key === this.dragItem?.key) {
          const index = this.selectedNodeItem[i]['data'].findIndex(
            (el) =>
              el.data[this.getPackageChildId(el?.key)] === this.dragItem.data[this.getPackageChildId(this.dragItem.key)]
          );
          if (index === -1) this.selectedNodeItem[i]['data'].push(this.dragItem);
          else this.transienteService.open('already added');
          return;
        }
      });
    } else {
      this.selectedNodeItem.push({
        key: this.dragItem?.key,
        data: [this.dragItem]
      });
    }
  }

  /*
   * delete package component
   */
  deleteNode(event) {
    this.selectedNodeItem.forEach((e) => {
      if (e?.key === event?.key) {
        e?.data.splice(
          e?.data?.findIndex(
            (el) => el.data[this.getPackageChildId(el?.key)] === event?.data[this.getPackageChildId(event?.key)]
          ),
          1
        );
      }
    });
  }

  dragStart(): void {
    this.dragging = true;
  }

  dragEnd(node, key): void {
    this.dragItem = {};
    this.dragItem = { key, data: node };
    this.dragging = false;
  }

  // dragHover(node): void {}

  dragHoverEnd(): void {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  uploadAttachments(attachments: File[]): void {
    if (!attachments) {
      return;
    }
    for (const attachment of attachments) {
      const sno = this.utilityService.generate_UUID();
      this.attachments.push({
        block: {
          type: BlockElementTypes.IMAGE,
          url: `${FILE_NAME_SEPARATOR}${attachment.name}`,
          fileName: attachment.name,
          sno
        },
        status: 'uploading',
        uploadProgress: 0
      });

      this.dmsService.uploadFile(attachment).subscribe(
        (resp) => {
          this.updateUploadStatus(sno, 'uploaded', resp);
        },
        (error) => {
          this.transienteService.open(`Error:: ${error.message}`);
          this.updateUploadStatus(sno, 'error');
        }
      );
    }
  }

  /**
   * update each file's upload status
   * @param sno passed sno to be updated
   * @param status status to be updated
   */
  updateUploadStatus(sno: string, status: 'uploaded' | 'uploading' | 'error', updatedSnos: string = '') {
    this.attachments = this.attachments.map((attachment) => {
      if (attachment.block.sno === sno) {
        attachment.status = status;
        attachment.block.sno = updatedSnos;
        attachment.block.url = `${updatedSnos}${attachment.block.url}`;
      }

      return attachment;
    });
  }

  /**
   * get file icon based on file name
   * @param attachmentName attached file name added
   */
  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = 'assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = 'assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = 'assets/images/ext/pdf.svg';
        break;
      }
      case 'ppt': {
        attachmentIcon = 'assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = 'assets/images/ext/txt.svg';
        break;
      }
      case 'xls': {
        attachmentIcon = 'assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = 'assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = 'assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  /**
   * truncate attachment name after 25 chars
   * @param attachmentName attachment name
   * @returns truncated name
   */

  truncateAttachmentName(attachmentName: string) {
    if (attachmentName.length < 25) {
      return attachmentName;
    }

    const name = attachmentName.split('.');
    if (name.length > 1) {
      return name[0].substr(0, 25 - name[1].length).toString() + '...' + name[1];
    }
    return name[0].substr(0, 25);
  }

  removeAttachment(index): void {
    this.attachments.splice(index, 1);
  }

  /*
   * on save click
   */
  clickHandler(publishStatus) {
    if (this.name) {
      let metaData = [];
      this.selectedNodeItem.forEach((ele) => {
        ele?.data.forEach((node) => {
          if (metaData.findIndex((element) => element?.key === node?.key) === -1) {
            const obj = {
              key: node?.key,
              data: [node?.data]
            };
            metaData.push(obj);
          } else {
            metaData.forEach((eleNode, index) => {
              if (eleNode?.key === node?.key) {
                metaData[index].data.push(node?.data);
              }
            });
          }
        });
      });

      const payload = {
        status: 'DRAFT',
        uuid: this.uuid,
        packageId: this.packageId,
        name: this.name,
        whatsNew: this.whatsNew,
        tags: this.tags,
        images: this.attachments.map( e => {
          return e?.block?.sno;
        }),
        documentationLink: this.documentationLink,
        description: this.description,
        metaData
      };

      this.coreService.savePackage(payload).subscribe(
        (res) => {
          if (res) {
            if (publishStatus) {
              this.coreService.exportPackage(res?.response?.packageId).subscribe((res) => {
                if (res) {
                  this.transienteService.open('Package saved & published');
                  this.router.navigate([{ outlets: { sb: `sb/settings/packages` } }]);
                }
              });
            } else {
              this.router.navigate([{ outlets: { sb: `sb/settings/packages` } }]);
              this.transienteService.open('Package Saved');
            }
          }
        },
        (err) => {
          this.transienteService.open(err?.message);
        }
      );
    } else {
      this.transienteService.open('Package name required');
    }
  }

  openExistingPackage() {
    this.router.navigate(
      [{ outlets: { sb: `sb/settings/packages/new-packages`, outer: `outer/packages/created-package` } }],
      {
        queryParamsHandling: 'preserve'
      }
    );
  }
}
