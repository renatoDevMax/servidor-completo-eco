import { ConnectOptions } from 'mongoose';

export const DATABASE_CONFIG = {
  uri: 'mongodb+srv://renatomaximianojr:renatomax1972@clusterrenato.asbtntk.mongodb.net/ecoClean?retryWrites=true&w=majority&appName=clusterRenato',
  options: {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    },
  } as ConnectOptions,
};
