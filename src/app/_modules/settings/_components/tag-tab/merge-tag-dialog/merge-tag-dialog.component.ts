import { UserProfileService } from './../../../../../_services/user/user-profile.service';
import { FormControl, Validators } from '@angular/forms';
import { TransientService } from 'mdo-ui-library';
import { take } from 'rxjs/operators';
import { Tag, MergeTagDTO, TagActionResponse } from './../../../../../_models/userdetails';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'pros-merge-tag-dialog',
  templateUrl: './merge-tag-dialog.component.html',
  styleUrls: ['./merge-tag-dialog.component.scss'],
})
export class MergeTagDialogComponent implements OnInit {
  /**
   * tags to be merged
   */
  tags: Tag[] = [];

  /**
   * formcontrol for the new tagname with validation
   */
  consolidatedTagName = new FormControl('', [Validators.required]);

  /**
   * banner for any message in the dialog
   */
  banner: any = {
    merge_tags_banner: $localize`:@@merge_tags_banner:The tag usage information will also be merged`,
    status: 'info',
  };

  constructor(
    public dialogRef: MatDialogRef<MergeTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private userProfileService: UserProfileService,
    private transientService: TransientService
  ) {}

  ngOnInit(): void {
    this.tags = this.dialogData.tags;
  }

  /**
   * will call api to merge multiple tags with their usage data. when successful closes the dialog, if error update the banner
   */
  mergeTags() {
    const mergeTagDto: MergeTagDTO = {
      tagDescription: this.consolidatedTagName.value,
      tagIds: this.tags.map((d) => d.id),
    };
    this.userProfileService
      .mergeTags(mergeTagDto)
      .pipe(take(1))
      .subscribe((resp: TagActionResponse) => {
        if (resp.acknowledge) {
          this.transientService.open($localize`:@@tag_merge_success:Tags merged Successfully`, 'ok', {
            duration: 2000,
          });
          this.closeDialog(true);
        } else {
          this.banner = {
            merge_tags_banner: $localize`:@@tag_merge_fail:Tags merge Failed`,
            status: 'error',
          };
        }
      });
  }

  /**
   * Closes the dialog
   */
  closeDialog(action: boolean) {
    this.dialogRef.close(action);
  }
}
