import { Board } from 'src/types';

export const boards: Board[] = [
  {
    name: 'Pokemon gen. 1',
    value: 'pokemon-gen1',
  }, {
    name: 'Pokemon gen. 2',
    value: 'pokemon-gen2',
  }, {
    name: 'Pokemon gen. 3',
    value: 'pokemon-gen3',
  },
];

export const maxPlayers = 10;

export default {
  boards,
  maxPlayers,
}