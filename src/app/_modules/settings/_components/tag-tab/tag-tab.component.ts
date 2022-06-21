import { UserProfileService } from './../../../../_services/user/user-profile.service';
import { GlobaldialogService } from './../../../../_services/globaldialog.service';
import { MergeTagDialogComponent } from './merge-tag-dialog/merge-tag-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Tag, TagsResponse, TagActionResponse } from './../../../../_models/userdetails';
import { take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TransientService } from 'mdo-ui-library';
import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'pros-tag-tab',
  templateUrl: './tag-tab.component.html',
  styleUrls: ['./tag-tab.component.scss'],
})
export class TagTabComponent implements OnInit {
  /**
   * default datatable page size
   */
  recordsPageSize = 15;

  /**
   * Hold total records count
   */
  totalCount = 0;

  /**
   * for table records paging
   */
  recordsPageIndex = 0;

  /**
   * will get tags by API call
   */
  tags: Tag[] = [];

  /**
   * When scolling down, stop multiple API CALL TILL THE existing call finish
   */
  infinteScrollLoading = false;

  /**
   * To identify that db has more tags. Once the API endpoint retuns empty tag, that means the db has no more data. it will be true. and on scroll down we will no more call backend
   */
  hasMoreData = true;

  /**
   * subject to emit search key from the lib-search library
   */
  searchFieldSub: Subject<string> = new Subject();

  /**
   * search text
   */
  fieldsSearchString = '';

  /**
   * for the checkbox of each row
   */
  selection = new SelectionModel<any>(true, []);

  constructor(
    private toasterService: TransientService,
    private userProfileService: UserProfileService,
    private matDialog: MatDialog,
    private globalDialogService: GlobaldialogService
  ) {}

  ngOnInit(): void {
    this.getTags();

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.fieldsSearchString = searchString || '';
      this.recordsPageIndex = 0;
      this.tags = [];
      this.getTags();
    });
  }

  /**
   * Call the 2 API, one with searchString and another without search string. gets the tags, if tags returned empty array flat the hasMoreData to false so that no more api call hits
   */
  getTags() {
    let subscription: Observable<TagsResponse>;
    if (this.fieldsSearchString) {
      subscription = this.userProfileService.searchTags(this.recordsPageIndex, this.recordsPageSize, this.fieldsSearchString).pipe(take(1));
    } else {
      subscription = this.userProfileService.getAllTags(this.recordsPageIndex, this.recordsPageSize).pipe(take(1));
    }
    subscription.subscribe((resp: TagsResponse) => {
      if (resp.tags.length > 0) {
        this.hasMoreData = true;
        this.tags.push(...resp.tags);
      } else {
        this.hasMoreData = false;
      }
      this.infinteScrollLoading = false;
    });
  }

  /**
   * On scroll down getTags is called to load more tags, with the flag infinteScrollLoading to true so that multiple call cannot hit
   */
  scroll(loadMore: boolean) {
    if (!this.infinteScrollLoading && this.hasMoreData) {
      if (loadMore) {
        this.recordsPageIndex++;
      } else {
        this.recordsPageIndex = 0;
      }
      this.infinteScrollLoading = true;
      this.getTags();
    } else {
      return null;
    }
  }

  /**
   * deletes tags with api call by the tagIds. After delete set the pageIndex = 0 and reload the table data
   */
  deleteTag(tags: Tag[]) {
    const tagIds = tags.map((d) => d.id);
    this.userProfileService
      .deleteByTagId(tagIds)
      .pipe(take(1))
      .subscribe((resp: TagActionResponse) => {
        if (resp.acknowledge) {
          this.toasterService.open('Tag deleted successfully.', 'ok', {
            duration: 2000,
          });
          this.tags = [];
          this.selection.clear();
          this.recordsPageIndex = 0;
          this.getTags();
        } else {
          this.toasterService.open('Delete Failed.', 'ok', {
            duration: 2000,
          });
        }
      });
  }

  /**
   * Can delete indiviaual or all selected tag, first will call a confirmation dialog, on 'yes' call the deleteTag method to delete
   */
  deleteSelectedTags(tag?: Tag) {
    this.globalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete ?` }, (response) => {
      if (response === 'yes') {
        this.deleteTag(tag ? [tag] : this.selection.selected);
      } else {
        return null;
      }
    });
  }

  /**
   * Add a row at the top of the table to Add a new tag with id= '' . But the table should not contain an existing New tag with id =''
   */
  addNewTag() {
    const oneNewExist = this.tags.find((d) => d.id === '');
    if (!oneNewExist) {
      this.tags.unshift({
        id: '',
        description: 'New Tag',
        usage: 0,
        edit: true,
      });
    } else {
      this.toasterService.open('One New Tag Exist in the table.', 'ok', {
        duration: 2000,
      });
    }
  }

  /**
   * Call the SaveUpdateTag endpoint to update or save a new tag
   */
  updateTagName(desc: any, tag: Tag) {
    if (desc) {
      const obj: Tag = {
        id: tag.id,
        description: desc,
      };
      this.userProfileService
        .saveUpdateTag(obj)
        .pipe(take(1))
        .subscribe((resp: TagActionResponse) => {
          if (resp.acknowledge) {
            const exist = this.tags.find((d) => d.id === resp.tagId);
            this.tags = this.tags.map((d) => {
              if (exist && d.id === resp.tagId) {
                d.description = desc;
              } else if (d.id === '') {
                d.id = resp.tagId;
                d.description = desc;
              }
              return d;
            });
          } else {
            this.toasterService.open('Tag update/add Failed.', 'ok', {
              duration: 2000,
            });
          }
        });
    } else {
      return null;
    }
  }

  /**
   * open a dialog with the selected tags to merge with a new name. when the result is true -- the merge was successfull, reload the table with pageIndex=0
   */
  mergeTags() {
    const dialogRef = this.matDialog.open(MergeTagDialogComponent, {
      width: '736px',
      autoFocus: false,
      data: {
        tags: this.selection.selected,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        this.tags = [];
        this.selection.clear();
        this.recordsPageIndex = 0;
        this.getTags();
      } else {
        return null;
      }
    });
  }

  /**
   *
   * @returns true if all the checkbox is selected
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tags.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.tags.forEach((row) => this.selection.select(row));
  }

  /**
   * Trackby of the tags
   */
  tagName(index, item) {
    return item.description;
  }
}
