import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionAttachmentComponent } from './transaction-attachment.component';

describe('TransactionAttachmentComponent', () => {
  let component: TransactionAttachmentComponent;
  let fixture: ComponentFixture<TransactionAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionAttachmentComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fileChange(), should attach a file', async() =>{
    component.fileChange('');
    expect(component.dataSource.length).toEqual(0);
    expect(component.errorMsg).toEqual('Unable to complete upload: (Select a file)');

    const fileList = [{name: 'first.pdf'}];
    component.fileChange(fileList);
    expect(component.dataSource.length).toEqual(1);
    expect(component.attachments.length).toEqual(1);
  });

  it('removeSelectedFile(), should remove a file', async() => {
    component.dataSource = [{name:'first.pdf',extension:'pdf',docid:'1'}];
    component.attachments = [{name: 'first.pdf'}];
    component.removeSelectedFile(component.dataSource[0]);
    expect(component.dataSource.length).toEqual(0);
    expect(component.attachments.length).toEqual(0);
  });
});
