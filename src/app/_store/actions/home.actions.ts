import { createAction, props } from '@ngrx/store';

export const togglePrimarySidebar = createAction('[Home] Toggle Primary Sidebar', props<{ isOpen: boolean }>());

export const toggleSecondarySidebar = createAction('[Home] Toggle Secondary Sidebar', props<{ isOpen: boolean }>());
