import { TestBed, async } from '@angular/core/testing';

import { SharedServiceService } from './shared-service.service';


describe('SharedServiceService', () => {
  let service: SharedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getChooseColumnData(), set choose data', async(()=>{
    service.getChooseColumnData().subscribe(data=>{
      expect(data).toEqual(null);
    });
  }));

  it('setChooseColumnData(), set data ', async(()=>{
    const mockData = {hdvs:{MATL_TYPE:{fieldId:'MATL_TYPE'}}};
    service.setChooseColumnData({hdvs:{MATL_TYPE:{fieldId:'MATL_TYPE'}}});
    service.getChooseColumnData().subscribe(data=>{
      expect(data).toEqual(mockData);
    });
  }));

  it('getFilterCriteriaData(), set choose data', async(()=>{
    service.getFilterCriteriaData().subscribe(data=>{
      expect(data).toEqual(null);
    });
  }));

  it('setFilterCriteriaData(), set data ', async(()=>{
    const mockData = [{fieldId:'MATL_TYPE', widgetType: 'FILTER'}];
    service.setFilterCriteriaData([{fieldId:'MATL_TYPE', widgetType: 'FILTER'}]);
    service.getFilterCriteriaData().subscribe(data=>{
      expect(data).toEqual(mockData);
    });
  }));
});
