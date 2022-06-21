import { createReducer, on } from '@ngrx/store';
import { togglePrimarySidebar, toggleSecondarySidebar } from '../actions/home.actions';
import { Home } from '../models/home.model';

export const initialState: Readonly<Home> = getInitialState();

function getInitialState(): Readonly<Home> {
  const homeState = localStorage.getItem('mdo-home-state');
  if (homeState) {
    return JSON.parse(atob(homeState));
  } else
    return {
      navToggle: {
        isPrimarySidebarOpen: true,
        isSecondarySidebarOpen: true,
      },
    };
}

export const homeReducer = createReducer(
  initialState,
  on(togglePrimarySidebar, (state, { isOpen }) => {
    return { ...state, navToggle: { isPrimarySidebarOpen: isOpen, isSecondarySidebarOpen: state.navToggle.isSecondarySidebarOpen } };
  }),
  on(toggleSecondarySidebar, (state, { isOpen }) => {
    return { ...state, navToggle: { isPrimarySidebarOpen: state.navToggle.isPrimarySidebarOpen, isSecondarySidebarOpen: isOpen } };
  })
);
