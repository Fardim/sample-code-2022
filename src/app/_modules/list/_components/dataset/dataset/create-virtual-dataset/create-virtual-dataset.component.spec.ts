import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { CreateVirtualDatasetComponent } from './create-virtual-dataset.component';
import { of } from 'rxjs';
import { GroupDetails } from '@models/schema/duplicacy';

const step1: GroupDetails = {
  groupId: 'group1',
  groupName: 'Join 1',
  groupDescription: '',
  groupType: 'JOIN',
  order: 1,
  groupJoinDetail: [
    {
      sourceOne: '1005',
      sourceOneType: 'MODULE',
      sourceOneModule: '1005',
      sourceTwo: '4004',
      sourceTwoType: 'MODULE',
      sourceTwoModule: 'META_TT_KEYWORDSACCOUNT',
      joinMapping: [],
    }
  ],
};

const step2: GroupDetails = {
  groupId: 'group2',
  groupName: 'Join 2',
  groupDescription: '',
  groupType: 'JOIN',
  order: 1,
  groupJoinDetail: [
    {
      sourceOne: 'group1',
      sourceOneType: 'GROUP',
      sourceTwo: '1005',
      sourceTwoType: 'MODULE',
      sourceTwoModule: '1005',
      joinMapping: [],
    }
  ],
}

const virtualDatasetDetails = {
  vdId: '1',
  vdName: 'VD1',
  indexName: '1',
  tableName: '',
  tenantId: '0',
  userCreated: '',
  dateCreated: '',
  userModified: '',
  dateModified: '',
  vdDescription: 'VD desc',
  jobSchedulerId: '1',
  groupDetails: [
    step1,
    step2
  ],
  groupResult: [],
};

describe('CreateVirtualDatasetComponent', () => {
  let component: CreateVirtualDatasetComponent;
  let fixture: ComponentFixture<CreateVirtualDatasetComponent>;

  beforeEach(() => {
    const activatedRouteStub = () => ({ params: of({ id: '100' })});

    const virtualDatasetServiceStub = () => ({
      getVirtualDatasetDetailsByVdId: (id: string) => of({ data: virtualDatasetDetails }),
    });

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [CreateVirtualDatasetComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: activatedRouteStub },
        {
          provide: VirtualDatasetService,
          useFactory: virtualDatasetServiceStub
        }
      ]
    });
    fixture = TestBed.createComponent(CreateVirtualDatasetComponent);
    component = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`subscriptions has default value`, () => {
    expect(component.subscriptions).toEqual([]);
  });

  describe('ngOnInit', () => {
    it('should fetch virtual dataset', () => {
      spyOn(component, 'ngOnInit').and.callThrough();

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });
});
