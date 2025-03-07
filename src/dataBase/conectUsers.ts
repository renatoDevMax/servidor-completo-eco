import { usuarioSchema } from '../modules/bd-schemas/usuarioModelo';
import mongoose from 'mongoose';
import { DATABASE_CONFIG } from '../config/database.config';

// Create the model instance outside the function

const dataConnectUsuarios = async () => {
  const conn = await mongoose
    .createConnection(DATABASE_CONFIG.uri, DATABASE_CONFIG.options)
    .asPromise();
  await conn.model('usuarios', usuarioSchema, 'usuariosSchema');
  console.log('Conectado ao Banco de Dados: Usuários.');
  return conn;
};

export const fechandoBanco = async () => {
  await mongoose.disconnect();
};

export default dataConnectUsuarios;
