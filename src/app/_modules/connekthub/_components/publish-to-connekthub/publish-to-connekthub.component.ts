import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { UserService } from '@services/user/userservice.service';
import { WidgetService } from '@services/widgets/widget.service';
import { Subscription, throwError } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';
import { Package, PackageType, PublishPackage } from '@modules/connekthub/_models';
import { CoreService } from '@services/core/core.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { SchemaService } from '@services/home/schema.service';

@Component({
  selector: 'pros-publish-to-connekthub',
  templateUrl: './publish-to-connekthub.component.html',
  styleUrls: ['./publish-to-connekthub.component.scss']
})
export class PublishToConnekthubComponent implements OnInit, OnDestroy {
  screen: 'AUTHORISE' | 'LOGIN' | 'CONFIG' | 'EXISTING_PACKAGE' | 'UPLOAD_ERROR';
  form: FormGroup;
  newPackage: boolean;
  tags: string[] = [];
  uploadPackage: Package;
  packages: Package[];
  errorMsg: string;
  packageSelected: Package;
  origin: string;
  subscriptions: Subscription[] = [];
  parentData: PublishPackage;
  packageOptions = [
    { label: 'New package', value: true },
    { label: 'Existing package', value: false }
  ];

  constructor(
    public dialogRef: MatDialogRef<PublishToConnekthubComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private fb: FormBuilder,
    private connekthubService: ConnekthubService,
    private widgetService: WidgetService,
    private userService: UserService,
    private coreService: CoreService,
    private sapwsService: SapwsService,
    @Inject(LOCALE_ID) public locale: string,
    private schemaService: SchemaService
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.parentData = data;
    this.form = this.fb.group({
      name: [this.parentData.name, Validators.required],
      brief: [this.parentData.brief || '', Validators.required],
      whatsNew: ['', Validators.required],
      imageUrls: this.fb.array([this.fb.control('')]),
      videoUrls: this.fb.array([this.fb.control('')]),
      docUrls: this.fb.array([this.fb.control('')]),
    });
    this.newPackage = true;
    this.searchPackages();
  }

  ngOnInit(): void {
    const userSub = this.userService
      .getUserDetails()
      .pipe(distinctUntilChanged())
      .subscribe((user) => {
        this.origin = user.orgId;
      });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  close(successfully = false, returnId?: string) {
    this.dialogRef.close({
      successfully,
      returnId
    });
  }

  authorise() {
    this.screen = 'LOGIN';
  }

  configScreen() {
    this.screen = 'CONFIG';
  }

  existingPackageScreen() {
    this.screen = 'EXISTING_PACKAGE';
  }

  get imageUrls() {
    return this.form.get('imageUrls') as FormArray;
  }

  get videoUrls() {
    return this.form.get('videoUrls') as FormArray;
  }

  get docUrls() {
    return this.form.get('docUrls') as FormArray;
  }

  addItem(formArray: string) {
    this[formArray].push(this.fb.control(''));
  }

  removeItem(formArray: string, index: number) {
    this[formArray].removeAt(index);
  }

  publish() {
    if (this.form.invalid) {
      this.form.markAsDirty()
      return;
    }

    this.uploadPackage = this.form.value as Package;
    this.uploadPackage.name = this.uploadPackage.name.trim();
    this.uploadPackage.brief = this.uploadPackage.brief.trim();
    this.uploadPackage.whatsNew = this.uploadPackage?.whatsNew?.trim();
    this.uploadPackage.type = this.parentData.type;
    this.uploadPackage.contentId = `${this.parentData?.id}` || '';
    this.uploadPackage.tags = this.trimArray(this.tags);
    this.uploadPackage.origin = this.origin;
    this.uploadPackage.imgs = this.trimArray(this.uploadPackage?.imageUrls || []);
    this.uploadPackage.vdos = this.trimArray(this.uploadPackage?.videoUrls || []);
    this.uploadPackage.docs = this.trimArray(this.uploadPackage?.docUrls || []);
    delete this.uploadPackage.imageUrls;
    delete this.uploadPackage.videoUrls;
    delete this.uploadPackage.docUrls;

    if (this.newPackage) {
      switch (this.parentData.type) {
        case PackageType.DASHBOARD:
          this.widgetService.exportReport(String(this.parentData.id), this.uploadPackage.name).pipe(this.catchError()).subscribe(blob => {
            this.connekthubService.createPackage(this.uploadPackage, this.blobToFile(blob)).pipe(this.catchError()).subscribe(res => {
              if (res) {
                this.widgetService.updatepackageId(this.parentData.id as number, String(res)).pipe(this.catchError()).subscribe(report => {
                  this.close(true, String(res));
                });
              } else {
                this.close(true);
              }
            });
          });
          break;
        case PackageType.SAP_TRANSPORTS:
          this.sapwsService.exportInterfaceDetails(this.parentData.scenarioIds).pipe(this.catchError()).subscribe(blob => {
            this.connekthubService.createPackage(this.uploadPackage, this.blobToFile(JSON.stringify(blob))).pipe(this.catchError()).subscribe((res: Package) => {
              this.close(true);
            });
          });
          break;

        case PackageType.DATASET:
          this.subscriptions.push(this.coreService.exportSchema(this.parentData.id, this.locale).pipe(this.catchError()).subscribe(blob => {
            this.connekthubService.createPackage(this.uploadPackage, this.blobToFile(blob)).pipe(this.catchError()).subscribe(res => {
              if (res) {
                this.coreService.updatePackageId(String(this.parentData.id), String(res)).pipe(this.catchError()).subscribe(report => {
                  this.close(true, String(res));
                });
              } else {
                this.close(true);
              }
            });
          }));
          break;

        case PackageType.SCHEMA:
          this.subscriptions.push(this.schemaService.exportSchema(`${this.parentData.id}`).pipe(this.catchError()).subscribe(blob => {
            this.connekthubService.createPackage(this.uploadPackage, this.blobToFile(blob)).pipe(this.catchError()).subscribe(res => {
              if (res) {
                this.coreService.updateSchemaPackageId(String(this.parentData.id), String(res)).pipe(this.catchError()).subscribe(report => {
                  this.close(true, String(res));
                });
              } else {
                this.close(true);
              }
            });
          }));
          break;

        default:
          break;
      }
    } else {
      this.updatePackage();
    }
  }

  updatePackage() {
    if (!this.packageSelected) {
      return;
    }
    switch (this.parentData.type) {
      case PackageType.DASHBOARD:
        this.subscriptions.push(this.widgetService.exportReport(String(this.parentData.id), this.uploadPackage.name).pipe(this.catchError()).subscribe(blob => {
          this.connekthubService.updatePackage(this.packageSelected.id, this.uploadPackage, this.blobToFile(blob)).pipe(this.catchError()).subscribe(res => {
            if (res) {
              this.widgetService.updatepackageId(this.parentData.id as number, String(res)).pipe(this.catchError()).subscribe(report => {
                this.close(true, String(res));
              });
            } else {
              this.close(true);
            }
          });
        }));
        break;
      case PackageType.SAP_TRANSPORTS:
        this.subscriptions.push(this.sapwsService.exportInterfaceDetails(this.parentData.scenarioIds).pipe(this.catchError()).subscribe(blob => {
          this.connekthubService.updatePackage(this.packageSelected.id, this.uploadPackage, this.blobToFile(JSON.stringify(blob))).pipe(this.catchError()).subscribe((res: Package) => {
            this.close(true);
          });
        }));
        break;

      case PackageType.DATASET:
        this.subscriptions.push(this.coreService.exportSchema(this.parentData.id, this.locale).pipe(this.catchError()).subscribe(blob => {
          this.connekthubService.updatePackage(this.packageSelected.id, this.uploadPackage, this.blobToFile(blob)).pipe(this.catchError()).subscribe((res) => {
            if (res) {
              this.coreService.updatePackageId(String(this.parentData.id), String(res)).pipe(this.catchError()).subscribe(report => {
                this.close(true, String(res));
              });
            } else {
              this.close(true);
            }
          });
        }));
        break;

      default:
        break;
    }
  }

  private blobToFile(response: any) {
    const binaryData = [];
    binaryData.push(response);

    // Use this bottom code for testing only
    // const downloadLink = document.createElement('a');
    // downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: '.json' }));
    // downloadLink.setAttribute('download', this.uploadPackage.name + '.json');
    // document.body.appendChild(downloadLink);
    // downloadLink.click();

    return new File([new Blob(binaryData, { type: '.json' })], this.uploadPackage.name + '.json')
  }

  trimArray(array: string[]) {
    const newArray = [] as string[];
    array.forEach(value => {
      if (value) {
        newArray.push(value.trim());
      }
    })
    return newArray;
  }

  catchError() {
    return catchError(error => {
      if (error.status === 401) {
        this.screen = 'LOGIN';
        return;
      }
      this.screen = 'UPLOAD_ERROR';
      if (error.error && error.error.errorMsg) {
        this.errorMsg = `Unable to complete export: (${error.error.errorMsg})`;
      } else if (error.error && error.error.error) {
        this.errorMsg = `Unable to complete export: (${error.error.error})`;
      } else {
        this.errorMsg = `Unable to complete export: (network error)`;
      }
      return throwError(error);
    })
  }

  selectPackage(data: Package) {
    this.packageSelected = data;
  }

  setFormValue() {
    if (this.packageSelected) {
      this.form.setValue({
        name: this.packageSelected.name,
        brief: this.packageSelected.brief,
        whatsNew: this.packageSelected.whatsNew,
        imageUrls: [''],
        videoUrls: [''],
        docUrls: [''],
      });

      this.mapToControl(this.packageSelected.imageUrls, 'imageUrls');
      this.mapToControl(this.packageSelected.videoUrls, 'videoUrls');
      this.mapToControl(this.packageSelected.docUrls, 'docUrls');

      this.configScreen();
    }
  }

  mapToControl(array: string[], formArray: string) {
    if (array && array.length > 0) {
      this.removeItem(formArray, 0);
      array.forEach(value => {
        if (value) {
          this[formArray].push(this.fb.control(value));
        }
      });
    } else {
      this[formArray].push(this.fb.control(''))
    }
  }

  changeNewPackage(value: boolean) {
    this.newPackage = value;
    if (this.newPackage) {
      this.configScreen();
    } else {
      this.existingPackageScreen();
    }
  }

  searchPackages() {
    this.connekthubService.getPackages(this.parentData.type).subscribe(res => {
      this.packages = res;
      this.configScreen();
    }, err => {
      if (err.status === 401) {
        this.screen = 'AUTHORISE';
      }
    });
  }
}
