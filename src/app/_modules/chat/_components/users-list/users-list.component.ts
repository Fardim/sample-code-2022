import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

export interface UsersList {
  inChannel: any[];
  outsideChannel: any[];
  defaultOptions: any[];
}

export enum UserSelectionOption {
  IN_CHANNEL = 'inChannel',
  OUTSIDE_CHANNEL = 'outsideChannel',
  DEFAULT = 'default',
}

@Component({
  selector: 'pros-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit, OnChanges {
  /**
   * hold the users recieved from the parent component
   */
  @Input() users: UsersList;

  /**
   * event emitter to emit the selected user data back to the parent component
   */
  @Output() userSelected = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}

  /**
   * detect changes and update the users
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users?.currentValue) {
      this.users = changes.users.currentValue;
    }
  }

  /**
   * emit the selected user data back to the parent component
   * @param selected Selected user's data
   * @param option UserSelectionOption
   */
  select(selected: any, option: UserSelectionOption) {
    this.userSelected.emit({
      selected,
      option,
    });
  }
}
