// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

/// Load modules for testing individually
// const adminModule = require.context('./app/_modules/admin', true, /\.spec\.ts$/);
// adminModule.keys().map(adminModule);

// const baseModule = require.context('./app/_modules/base', true, /\.spec\.ts$/)
// baseModule.keys().map(baseModule);

// const homeModule = require.context('./app/_modules/home', true, /\.spec\.ts$/);
// homeModule.keys().map(homeModule);

// const msteams = require.context('./app/_modules/msteams', true, /\.spec\.ts$/);
// msteams.keys().map(msteams);

// const report = require.context('./app/_modules/report', true, /\.spec\.ts$/);
// report.keys().map(report);

// const schemaModule = require.context('./app/_modules/schema', true, /\.spec\.ts$/);
// schemaModule.keys().map(schemaModule);

// const sharedModule = require.context('./app/_modules/shared', true, /\.spec\.ts$/);
// sharedModule.keys().map(sharedModule);

// const _services = require.context('./app/_services', true, /\.spec\.ts$/);
// _services.keys().map(_services);


// // Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// // And load the modules.
context.keys().map(context);
