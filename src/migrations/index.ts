import * as migration_20260517_122629_add_board_posts from './20260517_122629_add_board_posts';
import * as migration_20260718_120000_add_comment_author_image from './20260718_120000_add_comment_author_image';

export const migrations = [
  {
    up: migration_20260517_122629_add_board_posts.up,
    down: migration_20260517_122629_add_board_posts.down,
    name: '20260517_122629_add_board_posts',
  },
  {
    up: migration_20260718_120000_add_comment_author_image.up,
    down: migration_20260718_120000_add_comment_author_image.down,
    name: '20260718_120000_add_comment_author_image',
  },
];
