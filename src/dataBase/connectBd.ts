import mongoose, { ConnectOptions, Connection } from 'mongoose';
import { entregaSchema } from '../modules/bd-schemas/entregaModels';
import { DATABASE_CONFIG } from '../config/database.config';

let conn: Connection | null = null;

const connectToDatabase = async (): Promise<Connection> => {
  if (!conn) {
    try {
      await mongoose.connect(DATABASE_CONFIG.uri, DATABASE_CONFIG.options);
      conn = mongoose.connection;
      console.log('Conectado ao Banco de Dados.');
    } catch (error) {
      console.error('Erro ao conectar ao Banco de Dados:', error);
      throw new Error('Falha na conexão com o banco de dados');
    }
  }
  return conn;
};

export { connectToDatabase };
