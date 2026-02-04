import KeyvRedis from '@keyv/redis';
import Keyv, { KeyvStoreAdapter } from 'keyv';

export const cache = {
  base: (store: KeyvStoreAdapter | Keyv) => {
    return {
      stores: [
        new Keyv({
          store,
        }),
      ],
    };
  },
  REDIS: (envs: NodeJS.ProcessEnv) => {
    return cache.base(
      new KeyvRedis(envs.REDIS_URL || 'redis://localhost:6379/0'),
    );
  },
  LOCAL: (envs: NodeJS.ProcessEnv) => {
    return cache.base(new Keyv());
  },
};
