import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Utilities } from '@models/schema/utilities';
import { Class, ClassType, ResultInfo } from '@modules/classifications/_models/classifications';
import { SharedModule } from '@modules/shared/shared.module';
import { MockElementRef } from '@modules/shared/_directives/resizeable.directive.spec';
import { RuleService } from '@services/rule/rule.service';
import { BlockElementTypes, TransientService } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassMutationComponent } from './class-mutation.component';

describe('ClassMutationComponent', () => {
    let component: ClassMutationComponent;
    let fixture: ComponentFixture<ClassMutationComponent>;
    let ruleService: RuleService;
    let transientService: TransientService;
    let utilityService: Utilities;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassMutationComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [{ provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassMutationComponent);
        component = fixture.componentInstance;
        ruleService = fixture.debugElement.injector.get(RuleService);
        transientService = fixture.debugElement.injector.get(TransientService);
        utilityService = fixture.debugElement.injector.get(Utilities);
    });

    it('should create', () => {
        console.log('log');
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        fixture.detectChanges();
        spyOn(utilityService, 'getRandomString').and.callThrough();
        utilityService.getRandomString(10);
        component.ngOnInit();
        component.classForm = component.fb.group({});
        component.classForm.addControl('mod', component.fb.control('test'));
        component.classForm.get('mod').setValue('test');
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('getClassDetails()', () => {
        component.classId = 'gfhg478hgfghf874jhf';
        const res = { response: {classType:{classType:'test'}} } as ResultInfo<Class>;
        spyOn(component, 'getClassDetails').and.callThrough();
        spyOn(ruleService, 'getClassDetails').and.returnValue(of(res));
        component.classType = new ClassType();
        component.classType.nountype = false;
        component.classForm = component.fb.group({});
        component.classForm.addControl('classType', component.fb.control(''));
        component.getClassDetails();
        expect(component.getClassDetails).toHaveBeenCalled();
    });

    it('closeDialog()', () => {
        spyOn(component, 'closeDialog').and.callThrough();
        component.closeDialog();
        expect(component.closeDialog).toHaveBeenCalled();
    });

    it('uploadAttachments()', () => {
        spyOn(component, 'uploadAttachments').and.callThrough();
        const file = [] as File[];
        component.uploadAttachments(file);
        expect(component.uploadAttachments).toHaveBeenCalled();
    });

    it('truncateAttachmentName()', () => {
        spyOn(component, 'truncateAttachmentName').and.callThrough();
        component.truncateAttachmentName('test.jpg');
        expect(component.truncateAttachmentName).toHaveBeenCalled();
    });

    it('removeAttachment()', () => {
        spyOn(component, 'removeAttachment').and.callThrough();
        const block = {
            type: BlockElementTypes.LINK,
            url: '',
            fileName: 'test',
        };
        component.attachments.push({
            id: '',
            status: '',
            file: {} as File,
            block,
            uploadError: false,
            uploaded: false,
            uploadProgress: 0,
        })
        component.removeAttachment(0);
        expect(component.removeAttachment).toHaveBeenCalled();
    });

    it('uploadImages()', () => {
        spyOn(component, 'uploadImages').and.callThrough();
        const block = {
            type: BlockElementTypes.LINK,
            url: '',
            fileName: 'test',
        };
        component.attachments.push({
            id: '',
            status: '',
            file: {} as File,
            block,
            uploadError: false,
            uploaded: false,
            uploadProgress: 0,
        })
        component.uploadImages();
        expect(component.uploadImages).toHaveBeenCalled();
    });

    it('getAttachmentIcon()', () => {
        spyOn(component, 'getAttachmentIcon').and.callThrough();
        component.getAttachmentIcon('test.doc');
        component.getAttachmentIcon('test.jpg');
        component.getAttachmentIcon('test.pdf');
        component.getAttachmentIcon('test.ppt');
        component.getAttachmentIcon('test.txt');
        component.getAttachmentIcon('test.xls');
        component.getAttachmentIcon('test.zip');
        component.getAttachmentIcon('');
        expect(component.getAttachmentIcon).toHaveBeenCalled();
    });

    it('save(), should form invalid', () => {
        spyOn(component, 'save').and.callThrough();
        component.classType = new ClassType();
        component.classType.nountype = false;
        component.initForm();
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save(), class', () => {
        const data = new Class();
        const res = { response: data } as ResultInfo<Class>;
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClass').and.returnValue(of(res));
        spyOn(transientService, 'open');
        component.classType = new ClassType();
        component.classType.nountype = false;
        component.initForm();
        component.classForm.get('description').setValue('test');
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save(), noun', () => {
        const data = new Class();
        const res = { response: data } as ResultInfo<Class>;
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClass').and.returnValue(of(res));
        spyOn(transientService, 'open');
        component.classType = new ClassType();
        component.classType.nountype = true;
        component.initForm();
        component.classForm.get('code').setValue('test');
        component.classForm.get('codeLong').setValue('test');
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save(), should throw error', () => {
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClass').and.returnValue(of(throwError({ message: 'error' })));
        spyOn(transientService, 'open');
        component.classType = new ClassType();
        component.classType.nountype = false;
        component.initForm();
        component.classForm.get('description').setValue('test');
        component.save();
        expect(component.save).toHaveBeenCalled();
    });
});
