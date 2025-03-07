import { entregaSchema } from '../modules/bd-schemas/entregaModels';
import mongoose from 'mongoose';
import { DATABASE_CONFIG } from '../config/database.config';

// Create the model instance outside the function

const dataConectEntregas = async () => {
  const conn = await mongoose
    .createConnection(DATABASE_CONFIG.uri, DATABASE_CONFIG.options)
    .asPromise();
  await conn.model('entregas', entregaSchema, 'entregaschemas');
  console.log('Conectado ao Banco de Dados: Entregas.');
  return conn;
};

export const fechandoBanco = async () => {
  await mongoose.disconnect();
};

export default dataConectEntregas;
