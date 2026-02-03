import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

export const cache = {
  base: (store: any) => {
    return {
      stores: [
        new Keyv({
          store,
        }),
      ],
    };
  },
  REDIS: (envs: { [k: string]: any }) => {
    return cache.base(
      new KeyvRedis(envs.REDIS_URL || 'redis://localhost:6379/0'),
    );
  },
  LOCAL: (envs: { [k: string]: any }) => {
    return cache.base(new Keyv());
  },
};
