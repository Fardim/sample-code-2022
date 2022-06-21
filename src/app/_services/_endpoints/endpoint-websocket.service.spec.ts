import { TestBed } from '@angular/core/testing';

import { EndpointWebsocketService } from './endpoint-websocket.service';

describe('EndpointWebsocketService', () => {
  let service: EndpointWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndpointWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should sendMessage', () => {
  //   expect(service.sendMessage({ channelId: 'f2c36e7b-43aa-4170-a8a4-10cbda58bb12' })).toContain(
  //     `/send.message/f2c36e7b-43aa-4170-a8a4-10cbda58bb12`
  //   );
  // });

  // it('should retrieveMessages', () => {
  //   expect(service.retrieveMessages('f2c36e7b-43aa-4170-a8a4-10cbda58bb12')).toContain(`/getMessages/f2c36e7b-43aa-4170-a8a4-10cbda58bb12`);
  // });

  // it('should connectToWebsocket', () => {
  //   expect(service.connectToWebsocket).toContain('/mdo-websocket/info');
  // });

  // it('should getCreateChannel', () => {
  //   expect(service.connectToWebsocket).toContain('/getChannelId');
  // });

  // it('should jwtLogin', () => {
  //   expect(service.connectToWebsocket).toContain('/jwtLogin');
  // });
});
