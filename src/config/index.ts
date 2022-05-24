import { Board } from 'src/types';

export const boards: Board[] = [
  {
    label: 'Pokemon gen. 1',
    value: 'pokemon-gen1',
  }, {
    label: 'Pokemon gen. 2',
    value: 'pokemon-gen2',
  }, {
    label: 'Pokemon gen. 3',
    value: 'pokemon-gen3',
  },
];

export const maxPlayers = 10;

export default {
  boards,
  maxPlayers,
}