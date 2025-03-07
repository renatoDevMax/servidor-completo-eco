import { clientesSchema } from '../modules/bd-schemas/clienteModel';
import mongoose from 'mongoose';
import { DATABASE_CONFIG } from '../config/database.config';

// Create the model instance outside the function

const dataConectClientes = async () => {
  const conn = await mongoose
    .createConnection(DATABASE_CONFIG.uri, DATABASE_CONFIG.options)
    .asPromise();
  await conn.model('clientesEco', clientesSchema, 'clientesEco');
  console.log('Conectado ao Banco de Dados: clientesEco.');
  return conn;
};

export const fechandoBanco = async () => {
  await mongoose.disconnect();
};

export default dataConectClientes;
