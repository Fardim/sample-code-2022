import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EndpointWebsocketService } from '@services/_endpoints/endpoint-websocket.service';
import { EndpointsChatService } from '@services/_endpoints/endpoints-chat.service';

import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  // let endpointsServiceSpy: jasmine.SpyObj<EndpointsChatService>;
  // let endpointWebsocketServiceSpy: jasmine.SpyObj<EndpointWebsocketService>;
  // let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsChatService', ['getChatMentionList']);
    const endpointWebsocketSpy = jasmine.createSpyObj('EndpointWebsocketService', [
      'connectToWebsocket',
      'sendMessage',
      'retrieveMessages',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: EndpointsChatService, useValue: endpointSpy },
        { provide: EndpointWebsocketService, useValue: endpointWebsocketSpy },
      ],
    });
    service = TestBed.inject(ChatService);
    // endpointsServiceSpy = TestBed.inject(EndpointsChatService) as jasmine.SpyObj<EndpointsChatService>;
    // endpointWebsocketServiceSpy = TestBed.inject(EndpointWebsocketService) as jasmine.SpyObj<EndpointWebsocketService>;
    // httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // it('should sendmessage', () => {
  //   const url = '/send.message';
  //   const response: any = { success: true };
  //   const payload = {
  //     channelId: 'f2c36e7b-43aa-4170-a8a4-10cbda58bb12',
  //     msg: '',
  //     fromUserId: 'testadmin',
  //   };

  //   endpointWebsocketServiceSpy.sendMessage.and.returnValue(`${url}/${payload.channelId}`);

  //   service.sendMessage(payload).subscribe((modules) => {
  //     expect(modules).toEqual(response);
  //   });
  //   const mockRequest = httpTestingController.expectOne(`${url}`);
  //   expect(mockRequest.request.method).toEqual('POST');
  //   mockRequest.flush(response);
  //   httpTestingController.verify();
  // });

  // it('should getallmessages', () => {
  //   const url = '/messages';
  //   const response: any = [];
  //   const fetchSize = 20;
  //   const fetchCount = 0;

  //   endpointsServiceSpy.getAllMessages.and.returnValue(url);

  //   service.getAllMessages(fetchSize, fetchCount).subscribe((modules) => {
  //     expect(modules).toEqual(response);
  //   });
  //   const mockRequest = httpTestingController.expectOne(`${url}?fetchcount=${fetchCount}&fetchsize=${fetchSize}`);
  //   expect(mockRequest.request.method).toEqual('GET');
  //   mockRequest.flush(response);
  //   httpTestingController.verify();
  // });

  // it('should getMentionsList', () => {
  //   const url = '/getChatMentions';
  //   const response: any = [
  //     { id: 1, value: 'Shahnshah', initials: 'SH' },
  //     { id: 2, value: 'Sandeep', initials: 'SA' },
  //     { id: 3, value: 'Rahul', initials: 'RA' },
  //     { id: 4, value: 'Alex', initials: 'AL' },
  //   ];

  //   endpointsServiceSpy.getChatMentionList.and.returnValue(url);

  //   service.getMentionsList().subscribe((modules) => {
  //     expect(modules).toEqual(response);
  //   });
  //   const mockRequest = httpTestingController.expectOne(`${url}`);
  //   expect(mockRequest.request.method).toEqual('GET');
  //   mockRequest.flush(response);
  //   httpTestingController.verify();
  // });
});
