import { Board } from 'src/types';

export const boards: Board[] = [
  {
    name: 'Pokemon gen. 1',
    value: 'pokemon-gen1',
  }, {
    name: 'Other',
    value: 'other',
  }
];

export const maxPlayers = 10;

export default {
  boards,
  maxPlayers,
}