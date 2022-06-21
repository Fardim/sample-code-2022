import { TestBed } from '@angular/core/testing';

import { TaskListFiltersService } from './task-list-filters.service';
import { TaskListService } from './task-list.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';
import { TaskListRow } from '@models/task-list/taskListRow';

describe('TaskListFiltersService', () => {
  let service: TaskListFiltersService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskListService, HttpClientModule, HttpClientTestingModule],

      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    service = TestBed.inject(TaskListFiltersService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getDynamicList()', () => {
    const filterRequest = {}
    service.getDynamicList(filterRequest).subscribe((response) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getFilterDynamicListsUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as TaskListRow[];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  })
});
