import { Board } from 'src/types';

export const boards: Board[] = [
  {
    name: 'Pokemon gen. 1',
    value: 'pokemon-gen1',
  }, {
    name: 'Pokemon gen. 2 (not fully working yet)',
    value: 'pokemon-gen2',
  },
];

export const maxPlayers = 10;

export default {
  boards,
  maxPlayers,
}