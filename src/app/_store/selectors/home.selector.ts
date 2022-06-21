import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Home, NavToggle } from '../models/home.model';

export const getHomeState = createFeatureSelector<Home>('home');
export const getNavToggle = createSelector(getHomeState, (home: Home) => home.navToggle);
export const getIsPrimarySidebarOpen = createSelector(getNavToggle, (navToggle: NavToggle) => navToggle.isPrimarySidebarOpen);
export const getIsSecondaryNavbarOpen = createSelector(getNavToggle, (navToggle: NavToggle) => navToggle.isSecondarySidebarOpen);
