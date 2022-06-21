import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-manage-chat-collaborators',
  templateUrl: './manage-chat-collaborators.component.html',
  styleUrls: ['./manage-chat-collaborators.component.scss']
})
export class ManageChatCollaboratorsComponent implements OnInit {
  collaborators: any[] = [
    {
      name: 'John Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
    {
      name: 'Nancy Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
    {
      name: 'John Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
    {
      name: 'Nancy Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
    {
      name: 'John Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
    {
      name: 'Nancy Doe',
      image: 'https://via.placeholder.com/150',
      role: 'View',
    },
  ];

  constructor(private dialogRef: MatDialogRef<ManageChatCollaboratorsComponent>, @Inject(MAT_DIALOG_DATA) data: any ) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }
}
