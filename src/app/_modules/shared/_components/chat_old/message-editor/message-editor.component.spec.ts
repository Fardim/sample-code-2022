import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserInfoListResponse } from '@models/teams';
import { UserProfileService } from '@services/user/user-profile.service';
import { DeltaParserService, EditorService } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MessageEditorComponent } from './message-editor.component';
import { of, throwError } from 'rxjs';

describe('MessageEditorComponent', () => {
  let component: MessageEditorComponent;
  let fixture: ComponentFixture<MessageEditorComponent>;
  let userProfileService: UserProfileService;
  let editorService: EditorService;
  let deltaParserService: DeltaParserService;

  const mockUserListResponse: UserInfoListResponse = {
    acknowledge: true,
    errorMsg: null,
    listPage: {
      content: [
        {
          userName: 'parth.rami@icliqsolution.com',
          fname: null,
          lname: null,
        },
        {
          userName: 'aa',
          fname: 'User2',
          lname: 'User2 lname',
        },
      ],
      pageable: {
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        offset: 0,
        pageNumber: 0,
        pageSize: 10,
        unpaged: false,
        paged: true,
      },
      totalPages: 1,
      last: true,
      totalElements: 2,
      number: 0,
      size: 10,
      sort: {
        unsorted: true,
        sorted: false,
        empty: true,
      },
      first: true,
      numberOfElements: 2,
      empty: false,
    },
  };

  const messageRes = {
    msg:
      {
        type: 'rich_text',
        elements:
          [
            {
              type: 'text',
              elements:
                [
                  {
                    type: 'text',
                    elements: null,
                    raw: null,
                    text: 'sfsadf3435\n',
                    style: null,
                    userId: null,
                    url: null,
                    name: null,
                    listIndent: 0,
                  },
                ],
              raw: null,
              text: null,
              style:
                {
                  bold: false,
                  italic: false,
                  strike: false,
                  code: false,
                  underline: false,
                  list: null,
                },
              userId: null,
              url: null,
              name: null,
              listIndent: 0,
            },
          ],
        raw: null,
        text: null,
        style: null,
        userId: null,
        url: null,
        name: null,
        listIndent: 0,
      }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessageEditorComponent],
      providers: [HttpClientTestingModule],
      imports: [AppMaterialModuleForSpec, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageEditorComponent);
    component = fixture.componentInstance;
    userProfileService = fixture.debugElement.injector.get(UserProfileService);
    editorService = fixture.debugElement.injector.get(EditorService);
    deltaParserService = fixture.debugElement.injector.get(DeltaParserService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should called ngOnInit', async () => {
    spyOn(component, 'getUserListForMentions');

    component.ngOnInit();
    expect(component.getUserListForMentions).toHaveBeenCalled();
  });

  it('ngOnInit(), should called ngOnInit', async () => {
    spyOn(component, 'getUserListForMentions');

    component.ngOnInit();
    expect(component.getUserListForMentions).toHaveBeenCalled();
  });

  it('getUserListForMentions, should get user-info list', () => {
    const userList = [
      {
        userName: 'parth.rami@icliqsolution.com',
        fname: null,
        lname: null,
      },
      {
        userName: 'aa',
        fname: 'User2',
        lname: 'User2 lname',
      },
    ];
    spyOn(component, 'setMentionList');
    spyOn(userProfileService, 'getUserInfoList').and.returnValues(
      of(mockUserListResponse),
      throwError({ message: 'Http failure response for https://dev.masterdataonline.com/profile/user-info-list: 500 OK' })
    );
    component.getUserListForMentions();
    expect(component.setMentionList).toHaveBeenCalledWith(userList);
  });

  it('setMentionList, should set data in mention user list', () => {
    const userData = [
      {
        userName: 'parth.rami@icliqsolution.com',
        fname: null,
        lname: null,
      },
    ];
    const mentionlist = [
      {
        id: 0,
        value: 'parth.rami@icliqsolution.com',
      },
    ];

    component.setMentionList(userData);
    expect(component.mentionList).toEqual(mentionlist);
  });

  it('initializeEditorInstance, should initiate the editor instance', () => {
    component.textEditorId = 'textareaEditor37e5ae5f62e44f35a8ec9879785a7f85';
    component.innerToolbarId = 'toolbar37e5ae5f62e44f35a8ec9879785a7f85';
    spyOn(editorService, 'initiate');
    component.initializeEditorInstance();
    expect(editorService.initiate).toHaveBeenCalled();
  });

  it('suggestPeople() should return an observable of suggested people called from mentions', async () => {
    spyOn(component, 'suggestPeople').and.returnValue(of('Alex'));
    component.suggestPeople('al');
    expect(component.suggestPeople).toBeTruthy();
  });

  it('clearInput(), should clear input box', async () => {
    const div = document.createElement('div');
    div.className = 'ql-editor';
    div.innerHTML = '<p><br></p>';
    document.body.appendChild(div);
    const collection = document.getElementsByClassName('ql-editor');
    component.clearInput();
    expect(collection.length).toBeGreaterThan(0);
    expect(collection[0].innerHTML).toBe('');
  });

  it('scrollToBottom, should emit scrollToBottomEmit', () => {
    spyOn(component.scrollToBottomEmit, 'emit');
    component.scrollToBottom();
    expect(component.scrollToBottomEmit.emit).toHaveBeenCalledWith(true);
  });

  it('ngOnDestroy()', async () => {
    const subscriptionSpy = spyOn(component.subscription, 'unsubscribe').and.callFake(() => null);
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });

  it('editorChangeEvent() on input event of text editor if added text show enter hint event', async () => {
    component.textareaEditor.nativeElement.innerText = 'Hello';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    component.editorChangeEvent();
    component.isMentionListOpen = false;
    expect(component.sendButtonDisable).toBe(false);
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    // expect(component.enterHint.nativeElement.style.display).toBe('block');
  });

  it('editorChangeEvent() on input event of text editor if added text length is zero', async () => {
    component.textareaEditor.nativeElement.innerText = '';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    component.editorChangeEvent();
    expect(component.sendButtonDisable).toBe(true);
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    // expect(component.enterHint.nativeElement.style.display).toBe('none');
    expect(component.lengthIndicator.nativeElement.style.display).toBe('none');
  });

  it('editorChangeEvent() on input event of text editor if added text less than 820 hide lengthIndicator', async () => {
    component.textareaEditor.nativeElement.innerText = 'test test test test test test test test';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
       component.isMentionListOpen = false;
    component.editorChangeEvent();
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    expect(component.lengthIndicator.nativeElement.style.display).toBe('none');
  });

  it('editorChangeEvent() on input event of text editor added text is greater than 820 characters', async () => {
    component.textareaEditor.nativeElement.innerText = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \'de Finibus Bonorum et Malorum\' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \'Lorem ipsum dolor sit amet..\', comes from a line in section 1.10.32.      The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \de Finibus Bonorum et Malorum\' by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    component.isMentionListOpen = false;
    component.editorChangeEvent();
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    expect(component.lengthIndicator.nativeElement.style.display).toBe('block');
  });

  it('editorChangeEvent() on input event of text editor if added text is greater than 1024 characters', async () => {
    component.textareaEditor.nativeElement.innerText = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \'de Finibus Bonorum et Malorum\' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \'Lorem ipsum dolor sit amet..\', comes from a line in section 1.10.32.      The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \de Finibus Bonorum et Malorum\' by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translate'
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    component.isMentionListOpen = false;
    component.editorChangeEvent();
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    expect(component.sendButtonDisable).toBe(true);
  });

  it('editorChangeEvent() on input event of text editor if added text is greater than 820 characters and less than 1024 characters', async () => {
    component.textareaEditor.nativeElement.innerText = 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \'de Finibus Bonorum et Malorum\' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \'Lorem ipsum dolor sit amet..\', comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    component.isMentionListOpen = false;
    component.editorChangeEvent();
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    expect(component.sendButtonDisable).toBe(false);
  });

  it('editorChangeEvent() on input event of text editor if added text is greater than 240', async () => {
    component.textareaEditor.nativeElement.innerText = 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ';
    const characterLength = component.textareaEditor.nativeElement.innerText.trim().length;
    spyOn(component,'scrollToBottom');
    component.editorChangeEvent();
    expect(component.currentLength.nativeElement.innerText).toBe(characterLength.toString());
    expect(component.scrollToBottom).toHaveBeenCalled();
  });

  it('sendMessage, should emit send Message emit', () => {
    component.textEditorId = 'textareaEditor37e5ae5f62e44f35a8ec9879785a7f85';
    component.innerToolbarId = 'toolbar37e5ae5f62e44f35a8ec9879785a7f85';
    const textArea = document.createElement('div');
    textArea.setAttribute('id','textareaEditor37e5ae5f62e44f35a8ec9879785a7f85');
    document.body.appendChild(textArea);

    const toolbar = document.createElement('div');
    toolbar.setAttribute('id','toolbar37e5ae5f62e44f35a8ec9879785a7f85');
    toolbar.setAttribute('className','inner-toolbar');
    document.body.appendChild(toolbar);

    component.initializeEditorInstance();
    editorService.setData([{insert:'test\n',type:'text',attributes:null,image:null}]);
    component.messageDetail = undefined;

    const messageDelta = deltaParserService.parse(editorService.getData().ops);
    const param = {
      messageDetail: component.messageDetail,
      messageDelta: messageDelta[0]
    };

    component.messageLength = 5;
    component.sendButtonDisable = false;
    spyOn(component.sendMessageEmit, 'emit');
    spyOn(component,'clearInput');
    component.sendMessage();
    expect(component.sendMessageEmit.emit).toHaveBeenCalledWith(param);
    expect(component.clearInput).toHaveBeenCalled();
  });

  it('initializeEditorInstance, should initialize editor instance and set message text in editor', () => {
    component.textEditorId = 'textareaEditor37e5ae5f62e44f35a8ec9879785a7f85';
    component.innerToolbarId = 'toolbar37e5ae5f62e44f35a8ec9879785a7f85';

    component.messageDetail = messageRes;
    component.componentName = 'message-list';

    spyOn(component.editorService, 'setData');
    spyOn(component.cd, 'detectChanges');
    spyOn(component,'clearInput');

    const messageText = deltaParserService.unparse([component.messageDetail.msg]);
    component.initializeEditorInstance();
    expect(component.clearInput).toHaveBeenCalled();
    expect(editorService.setData).toHaveBeenCalledWith(messageText.ops);
    expect(component.sendButtonDisable).toBe(false);
    expect(component.cd.detectChanges).toHaveBeenCalled();
  });
});
