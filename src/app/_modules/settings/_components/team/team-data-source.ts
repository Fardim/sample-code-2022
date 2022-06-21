import { MultiSortTableDataSource } from './../../../shared/_pros-multi-sort/multi-sort-data-source';
import { catchError, finalize } from 'rxjs/operators';
import { TeamService } from './../../../../_services/user/team.service';
import { TeamMember, UserListRequestDTO, TeamMemberResponse } from './../../../../_models/teams';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { UserProfileService } from '@services/user/user-profile.service';

export class TeamsDataSource extends MultiSortTableDataSource<TeamMember> implements DataSource<TeamMember> {
  private teamMemberDataSubject = new BehaviorSubject<TeamMember[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private totalCountSubject = new BehaviorSubject<number>(0);
  totalCount$ = this.totalCountSubject.asObservable();
  private totalData = 0;

  constructor(private profileService: UserProfileService) {
    super();
  }

  connect(collectionViewer?: CollectionViewer): Observable<TeamMember[]> {
    return this.teamMemberDataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.teamMemberDataSubject.complete();
    this.loadingSubject.complete();
  }

  /**
   * get table data
   * @param page pageNumber 0 based
   * @param size page size
   */
  public getData(userListRequestDTO: UserListRequestDTO) {
    this.loadingSubject.next(true);
    this.profileService
      .getTeamMembers(userListRequestDTO)
      .pipe(
        catchError((err) => {
          console.log(err);
          const emptyResponse = new TeamMemberResponse();
          return of(emptyResponse);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        (res) => {
          this.teamMemberDataSubject.next(this.docsTransformation(res));
          this.totalCountSubject.next(res.userList.totalElements);
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  docsTransformation(res: TeamMemberResponse): TeamMember[] {
    if (res && res.userList.content.length) {
      return [...res.userList.content];
    } else {
      return this.docValue();
    }
  }
  /**
   * Return length of doc ..
   */
  docLength(): number {
    return this.teamMemberDataSubject.getValue().length;
  }

  /**
   * Return all dcument that have on this subject
   */
  docValue() {
    return this.teamMemberDataSubject.getValue();
  }

  /**
   * reset data source
   */
  reset() {
    this.teamMemberDataSubject.next([]);
  }

  totalCount(): number {
    return this.totalData;
  }
}
