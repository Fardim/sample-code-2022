import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserInfo } from '@models/teams';
import { ManageChatCollaboratorsComponent } from '../manage-chat-collaborators/manage-chat-collaborators.component';

@Component({
  selector: 'pros-chat-members',
  templateUrl: './chat-members.component.html',
  styleUrls: ['./chat-members.component.scss']
})
export class ChatMembersComponent implements OnInit, OnChanges {


  @Input()
  users: UserInfo;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    console.log(this.users);
  }

  openManageCollaboratorsDialog() {
    const options: MatDialogConfig = {
      data: {},
      width: '545px',
      height: '431px',
      panelClass: 'medium-dialog-container'
    }
    this.dialog.open(ManageChatCollaboratorsComponent, {...options}).afterClosed().subscribe(() => {

    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users?.currentValue) {
      console.log(changes.users.currentValue);
      this.users = changes.users.currentValue;
    }
  }
}
