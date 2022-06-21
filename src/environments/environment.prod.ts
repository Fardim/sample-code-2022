export const environment = {
  production: true,
  apiurl: location.origin,
  dataPlalyUri: 'https://dataplay.connekthub.com/api/v1.0',
  dmsUrl: 'https://dev-play.masterdataonline.com',
  mapApi: 'AIzaSyCZwC6__h0zkiQq-ZBXVCOBTVztrDcjAQg',
  ws: 'https://fuse-qa.masterdataonline.com',
  ckhLibUrl: (window as any).__pros_env.ckhLibUrl || 'url not found !',
  authUrl: (window as any).__pros_env.authUrl || 'url not found !',
  droolsUrl: (window as any).__pros_env.droolsUrl || 'url not found !'
};
