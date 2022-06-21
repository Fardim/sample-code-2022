import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FileItemComponent } from './file-item.component';

describe('FileItemComponent', () => {
  let component: FileItemComponent;
  let fixture: ComponentFixture<FileItemComponent>;

  const storeMock = {
    select: jasmine.createSpy().and.returnValue(of({
      messages: [],
      connected: false,
      loadingState: 'loading',
      errorText: '',
      channelId: 'e6e3d836-00b1-489e-a642-0395377ce276'
    })),
    dispatch: jasmine.createSpy(),
    pipe: jasmine.createSpy().and.returnValue((of({
      messages: [],
      connected: true,
      loadingState: 'loaded',
      errorText: '',
      channelId: 'e6e3d836-00b1-489e-a642-0395377ce276'
    })))
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileItemComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAttachmentIcon(), should set Attachment icon for doc file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.doc');
    expect(attachmentUrl).toEqual('./assets/images/ext/doc.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for docx file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.docx');
    expect(attachmentUrl).toEqual('./assets/images/ext/doc.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for jpg file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.jpg');
    expect(attachmentUrl).toEqual('./assets/images/ext/img.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for png file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.png');
    expect(attachmentUrl).toEqual('./assets/images/ext/img.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for jpeg file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.jpeg');
    expect(attachmentUrl).toEqual('./assets/images/ext/img.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for pdf file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.pdf');
    expect(attachmentUrl).toEqual('./assets/images/ext/pdf.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for ppt file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.ppt');
    expect(attachmentUrl).toEqual('./assets/images/ext/ppt.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for txt file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.txt');
    expect(attachmentUrl).toEqual('./assets/images/ext/txt.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for xls file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.xls');
    expect(attachmentUrl).toEqual('./assets/images/ext/xls.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for zip file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc.zip');
    expect(attachmentUrl).toEqual('./assets/images/ext/zip.svg');
  });

  it('getAttachmentIcon(), should set Attachment icon for no file', () => {
    const attachmentUrl = component.getAttachmentIcon('abc');
    expect(attachmentUrl).toEqual('./assets/images/ext/none.svg');
  });
});