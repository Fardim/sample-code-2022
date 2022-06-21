import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportSidesheetComponent } from './import-sidesheet.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Package, PackageType } from '@modules/connekthub/_models';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';

describe('ImportSidesheetComponent', () => {
  let component: ImportSidesheetComponent;
  let fixture: ComponentFixture<ImportSidesheetComponent>;
  let connekthubService: ConnekthubService;
  let dialog: MatDialog;

  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open') };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportSidesheetComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, AppMaterialModuleForSpec, SharedModule],
      providers: [
        ConnekthubService,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportSidesheetComponent);
    component = fixture.componentInstance;
    connekthubService = fixture.debugElement.injector.get(ConnekthubService);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();

    component.packages = [
      {
        id: '1',
        name: 'Duplicate record and golden record identification test',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '2021-12-06T03:49:10.786+00:00',
        imageUrls: ['sss']
      },
      {
        id: '2',
        name: 'Duplicate record and golden record identification',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '2021-12-06T03:49:10.786+00:00',
      },
      {
        id: '3',
        name: 'Duplicate record and golden record identification',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '2021-12-06T03:49:10.786+00:00',
      },
    ] as Package[];
    component.importType = PackageType.DASHBOARD;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getPackagesAndUserImportLogs(), should get packages', async(() => {
    expect(component.loading).toBeTruthy();
    spyOn(connekthubService, 'getPackages').and.returnValue(of(component.packages));

    component.getPackagesAndUserImportLogs();
    fixture.detectChanges();
    expect(connekthubService.getPackages).toHaveBeenCalled();
  }));

  it('getPackage(), should get packages', async(() => {
    const mockResp = mockPackageFile;
    spyOn(connekthubService, 'getPackageFile').and.returnValue(of(JSON.stringify(mockResp)));
    const record = {id: 1, nae: 'test'} as any;

    component.importType = PackageType.DATASET;
    component.getPackage(record);
    fixture.detectChanges();
    expect(connekthubService.getPackageFile).toHaveBeenCalled();
  }));

  it('importPackage(), should import package file', async(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    spyOn(dialog, 'open').and.returnValues(dialogRefSpyObj);
    const file = component.blobToFile('test', 'test');
    expect(typeof(file)).toBe('object');

    component.importPackage(file, '1005', component.packages[0]);
    expect(dialog.open).toHaveBeenCalled();
  }));
});

export const mockPackageFile = {
  fingerprint:
    '57c9fb3750d199edd9b5e17a4a37b6ee84a4eef8a630f2e14ef1074acef814d38a92bded9a71ce18653e7f55103d41baf8e5b721cf062686bcd4ca719b693786',
  content: {
    description: 'Material master',
    usermodified: 'mdofuse@gmail.com',
    displayCriteria: 25,
    isSingleRecord: false,
    systemType: 'SYSTEM_TYPE_1',
    owner: 1,
    dataType: 1,
    persistent: 1,
    dataPrivacy: 1,
    dateModified: 1646398721320,
    type: 'STD',
    moduleId: 848040,
    fields: [
      {
        structureid: '1',
        description: null,
        fieldlist: [
          {
            fieldId: 'FLD_706624781',
            shortText: { en: { description: 'Material type', information: '' } },
            longtexts: { en: '' },
            dataType: 'CHAR',
            pickList: '1',
            maxChar: 4,
            isKeyField: false,
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            isDescription: false,
            textCase: 'UPPER',
            attachmentSize: '',
            fileTypes: '',
            isFutureDate: false,
            isPastDate: false,
            outputLen: null,
            structureId: '1',
            pickService: null,
            moduleId: 848040,
            parentField: '',
            isReference: false,
            isDefault: false,
            isHeirarchy: false,
            isWorkFlowCriteria: false,
            isNumSettingCriteria: true,
            isCheckList: false,
            isCompBased: false,
            dateModified: 1646398721442,
            decimalValue: '',
            isTransient: false,
            isSearchEngine: true,
            isPermission: false,
            isDraft: false,
            isPersisted: true,
            isRejection: false,
            isRequest: false,
            childfields: [],
            isSubGrid: false,
            isNoun: false,
            optionsLimit: 1,
            description: null,
            helpText: null,
            longText: null,
            language: null,
            refrules: [],
            refDatasetField: null,
            refDataset: null,
            refDatasetStatus: null,
          }
        ],
        strucDesc: 'Header Data',
        language: 'en',
        isHierarchy: null,
        parentStrucId: 0,
      }
    ],
    language: 'en',
  },
};