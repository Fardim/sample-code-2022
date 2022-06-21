import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassComponent } from './class.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RuleService } from '@services/rule/rule.service';
import { of, throwError } from 'rxjs';

describe('ClassComponent', () => {
  let component: ClassComponent;
  let fixture: ComponentFixture<ClassComponent>;
  let ruleService: RuleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    const setVarsSpy = spyOn(component, 'getClassDetails');
    component.class = {
      classType: {
        classType: '',
        className: 'Test',
        description: '',
        classes: [],
        allowMultipleclass: false,
        enableSync: false,
        nountype: false,
        system: '',
        tenantId: '',
        allowHierachy: false,
        allowMultidataset: false,
        isNountype: false,
        uuid: '',
        classTypeId: '',
        relatedDatasets: [
          { id: '1' }
        ],
      },
      colloquialNames: [],
      validFrom: '0',
      classLabels: [],
      classes: [],
      code: '',
      codeLong: '',
      description: '',
      imageUrl: [],
      inheritAttributes: false,
      isCodePartOfDesc: false,
      isModPartOfDesc: false,
      isNoun: false,
      mod: '',
      modLong: '',
      parentUuid: '',
      referenceCode: '',
      referenceType: '',
      sapClass: '',
      tenantId: '',
      uuid: '',
    }
    component.classId = 'e8b48c9b-f2ab-4fc2-a16f-589089e10fef';
    component.ngOnInit();
    expect(setVarsSpy).toHaveBeenCalled();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('getClassDetails()', () => {
    spyOn(component, 'getClassDetails').and.callThrough();
    spyOn(ruleService, 'getClassDetails').and.returnValue(of({ success: true }));
    component.getClassDetails('e8b48c9b-f2ab-4fc2-a16f-589089e10fef');
    expect(component.getClassDetails).toHaveBeenCalled();
  });

  it('getClassDetails(), should throw error', () => {
    spyOn(component, 'getClassDetails').and.callThrough();
    spyOn(ruleService, 'getClassDetails').and.returnValue(of(throwError({ message: 'error' })));
    component.getClassDetails('');
    expect(component.showSkeleton).toBeFalse();
    expect(component.submitError.status).toBeTrue();
    expect(component.getClassDetails).toHaveBeenCalled();
  });
});
