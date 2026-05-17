import * as migration_20260517_122629_add_board_posts from './20260517_122629_add_board_posts';

export const migrations = [
  {
    up: migration_20260517_122629_add_board_posts.up,
    down: migration_20260517_122629_add_board_posts.down,
    name: '20260517_122629_add_board_posts'
  },
];
