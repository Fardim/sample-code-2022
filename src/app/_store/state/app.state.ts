import { Daxe } from '@store/models/daxe.model';
import { Home } from '../models/home.model';

export interface AppState {
  home: Home;
  daxe: Daxe;
}
