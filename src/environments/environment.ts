// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 * analyticsUrl for analytics microservices ..
 * apiurl for classic mdo
 * coreUrl for core apis from microservices ..
 * syncUrl for sync / job related  from microservices ..
 * authUrl for authentication from microservices ...
 * mapApi temporary token for map api (needs to be changed down the road)
 *
 * Note : use only in development mode ... not required on environment.prod.ts ..
 */

export const environment = {
  production: false,
  analyticsUrl: 'http://localhost:8081',
  apiurl: 'https://fuse-qa.masterdataonline.com',
  listurl: 'https://dev.masterdataonline.com',
  coreUrl: 'http://localhost:8084',
  syncUrl: 'http://localhost:8085',
  // authUrl: 'http://localhost:8080',
  authUrl: 'https://fuse-int.masterdataonline.com',
  ckhLibUrl: 'https://dataplay.connekthub.com/api/v1.0',
  notifUrl: 'https://dev.masterdataonline.com',
  dmsUrl: 'https://dev-play.masterdataonline.com',
  droolsUrl: 'https://secure-drools-dev.apps.rosa-sg.3xbl.p1.openshiftapps.com/business-central/kie-wb.jsp',
  mapApi: 'AIzaSyCZwC6__h0zkiQq-ZBXVCOBTVztrDcjAQg'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
