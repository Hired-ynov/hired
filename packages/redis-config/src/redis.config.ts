import KeyvRedis from '@keyv/redis';
import Keyv, { KeyvStoreAdapter } from 'keyv';

type CacheEnvs = Pick<NodeJS.ProcessEnv, 'REDIS_URL'>;

export const cache = {
  AUTO: (envs: CacheEnvs) => {
    if (!envs.REDIS_URL) {
      return cache.LOCAL();
    }

    return cache.REDIS(envs);
  },
  base: (store?: KeyvStoreAdapter) => {
    return {
      stores: [
        store
          ? new Keyv({
              store,
            })
          : new Keyv(),
      ],
    };
  },
  LOCAL: () => {
    return cache.base();
  },
  REDIS: (envs: NodeJS.ProcessEnv) => {
    return cache.base(
      new KeyvRedis(envs.REDIS_URL ?? 'redis://localhost:6379/0'),
    );
  },
};
