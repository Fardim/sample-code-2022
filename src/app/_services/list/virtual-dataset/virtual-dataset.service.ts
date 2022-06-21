import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VirtualDatasetDetails } from '@models/list-page/virtual-dataset/virtual-dataset';
import { GroupDetails } from '@models/schema/duplicacy';
import { DatasetTableColumn } from '@modules/list/_components/table-columns/table-columns.component';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VirtualDatasetService {
  private selectedStepData: BehaviorSubject<GroupDetails> = new BehaviorSubject(null);
  leftColumns: DatasetTableColumn[] = [];
  rightColumns: DatasetTableColumn[] = [];
  constructor(
    private http: HttpClient,
    private endpointCoreService: EndpointsCoreService,
  ) { }

  public setselectedStepData(data:GroupDetails) {
    this.selectedStepData.next(data);
  }

  public getselectedStepData(): Observable<any> {
    return this.selectedStepData.asObservable();
  }


  /**
   * API to get virtual dataset details
   * @param vdId ID of the virtual dataset
   */
  public getVirtualDatasetDetailsByVdId(vdId = ''): Observable<any> {
    return this.http.get<any>(this.endpointCoreService.getVirtualDatasetDetailsByVdIdUrl(vdId));
  }

  /**
   * API to delete virtual dataset
   * @param vdId ID of the virtual dataset
   */
  deleteVirtualDataset(vdId: string): Observable<any> {
    return this.http.delete(this.endpointCoreService.getDeleteVirtualDatasetUrl(vdId));
  }

  /**
   * API to delete virtual dataset
   * @param vd info of Virtual dataset details
   */
  saveUpdateVirtualDataSet(vd: VirtualDatasetDetails) {
    return this.http.post(this.endpointCoreService.saveUpdateVirtualDataSet(), vd);
  }

}
