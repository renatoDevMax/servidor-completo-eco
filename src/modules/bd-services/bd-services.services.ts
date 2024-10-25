import { Injectable } from '@nestjs/common';
import dataConectEntregas from '../../dataBase/conectandoEntregas';
import dataConnectUsuarios from '../../dataBase/conectUsers';
import { entregasTipo } from '../../types/entregasTypes';
import { usuarioTipo } from '../../types/userTypes';
import dataConectClientes from 'src/dataBase/conectandoClientes';
import { clientesTipo } from 'src/types/clientesType';

@Injectable()
export class BdServicesService {
  async autenticandoUsuario(dados: { userName: string; senha: string }) {
    const conexaoUsuarios = await dataConnectUsuarios();
    const modeloUsuarios = conexaoUsuarios.model('usuarios');
    const usuarioEncontrado = (await modeloUsuarios.findOne({
      userName: dados.userName,
      senha: dados.senha,
    })) as usuarioTipo;
    console.log(usuarioEncontrado.userName + ' foi autenticado com Sucesso!');
    const todosUsuarios = (await modeloUsuarios.find()) as usuarioTipo[];
    return { usuarioLogado: usuarioEncontrado, todosUsuarios: todosUsuarios };
  }

  async todosUsuariosBd() {
    const conexaoUsuarios = await dataConnectUsuarios();
    const modeloUsuarios = conexaoUsuarios.model('usuarios');
    const allUsers = await modeloUsuarios.find();
    console.log('Pegando todos usuários do banco de dados.');
    return allUsers;
  }

  async atualizandoUsuarios(usuarioUppdate: usuarioTipo) {
    const conexaoUsuarios = await dataConnectUsuarios();
    const modeloUsuarios = conexaoUsuarios.model('usuarios');
    const userEntregaBD = await modeloUsuarios.updateOne(
      { userName: usuarioUppdate.userName },
      { $set: usuarioUppdate },
    );
    console.log(
      'Status da atualização da coordenada do usuário: ' +
        userEntregaBD.acknowledged,
    );
  }

  dataDeHoje() {
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;
    const anoHoje = hoje.getFullYear();
    return [diaHoje, mesHoje, anoHoje];
  }

  async entregasDoDia() {
    const dataHoje = this.dataDeHoje();
    const conexaoEntregas = await dataConectEntregas();
    const modeloEntregas = conexaoEntregas.model('entregas');
    const todasEntregas = await modeloEntregas.find({ dia: dataHoje });
    console.log('Pegando todas entregas do Banco de Dados.');
    return todasEntregas;
  }

  async criandoEntrega(entrega: entregasTipo) {
    const connEntrega = await dataConectEntregas();
    const modelEntrega = connEntrega.model('entregas');

    const entregaGerada = new modelEntrega(entrega);
    await entregaGerada.save().then(() => {
      console.log('salvo com sucesso!');
    });
    const dataHoje = this.dataDeHoje();
    const todasEntregas = await modelEntrega.find({
      dia: dataHoje,
    });
    console.log('Retornando as entregas do dia.');
    return todasEntregas;
  }

  async atualziandoEntregas(entregaUpdate: entregasTipo) {
    console.log(entregaUpdate);
    const dataHoje = this.dataDeHoje();
    const connEntrega = await dataConectEntregas();
    const modelEntrega = connEntrega.model('entregas');
    const userEntregaBD = await modelEntrega.updateOne(
      { id: entregaUpdate.id },
      { $set: entregaUpdate },
    );
    console.log(
      userEntregaBD.matchedCount === 0
        ? 'Nenhum documento encontrado com esse ID.'
        : userEntregaBD.modifiedCount === 0
          ? 'Nenhuma modificação foi feita.'
          : 'Documento atualizado com sucesso.',
    );
    const minhasEntregas = await modelEntrega.find({ dia: dataHoje });
    return minhasEntregas;
  }

  async deletarEntrega(entregaDelete: entregasTipo) {
    const dataHoje = this.dataDeHoje();
    console.log(entregaDelete);
    const connEntrega = await dataConectEntregas();
    const modelEntrega = connEntrega.model('entregas');
    const entregaGerada = new modelEntrega(entregaDelete);
    const retornoDel = await modelEntrega.deleteOne({ id: entregaDelete.id });

    if (retornoDel.deletedCount === 0) {
      console.log('Entrega não encontrada');
    }

    const minhasEntregas = await modelEntrega.find({
      dia: dataHoje,
    });

    return minhasEntregas;
  }

  async meusClientes() {
    const connClientes = await dataConectClientes();
    const modelClientes = connClientes.model('clientesEco');
    console.log('Clientes solicitados do banco de dados');
    const todosClientes = await modelClientes.find({});
    return todosClientes;
  }

  async todasEntregasRelatorio() {
    const connEntrega = await dataConectEntregas();
    const modelEntrega = connEntrega.model('entregas');
    console.log('Entregas solicitadas do banco de dados para relatorio');
    const entregasRelatorio = await modelEntrega.find({});
    return entregasRelatorio;
  }

  async criandoCliente(cliente: clientesTipo) {
    const connClientes = await dataConectClientes();
    const modelClientes = connClientes.model('clientesEco');

    const clienteGerado = new modelClientes(cliente);
    await clienteGerado.save().then(() => {
      console.log('salvo com sucesso!');
    });
    const todosClientes = await modelClientes.find({});
    console.log('Pegando todos os Clientes do Banco de Dados.');
    return todosClientes;
  }

  async atualizandoCliente(cliente: clientesTipo) {
    console.log(cliente);
    const connClientes = await dataConectClientes();
    const modelClientes = connClientes.model('clientesEco');
    const clienteGerado = new modelClientes(cliente);
    const userCliente = await clienteGerado.updateOne(
      { id: cliente.id }, // Encontra o documento pelo ID
      {
        $set: cliente,
      },
    );
    if (userCliente.matchedCount === 0) {
      console.log('Nenhum documento encontrado com esse ID.');
    } else if (userCliente.modifiedCount === 0) {
      console.log('Nenhuma modificação foi feita.');
    } else {
      console.log('Documento atualizado com sucesso.');
    }

    const todosClientes = await modelClientes.find({});
    console.log('Pegando todos os Clientes do Banco de Dados.');
    return todosClientes;
  }

  async deletandoCliente(cliente: clientesTipo) {
    console.log(cliente);
    const connClientes = await dataConectClientes();
    const modelClientes = connClientes.model('clientesEco');
    const clienteGerado = new modelClientes(cliente);
    const retornoDel = await clienteGerado.deleteOne({ id: cliente.id });

    if (retornoDel.deletedCount === 0) {
      console.log('Entrega não encontrada');
    }

    const todosClientes = await modelClientes.find({});
    console.log('Pegando todos os Clientes do Banco de Dados.');

    return todosClientes;
  }

  async todosUsuariosBanco() {
    /*** Estabelecer conexão com o banco de dados de usuários. */
    const conexaoUsuarios = await dataConnectUsuarios();
    const modeloUsuarios = conexaoUsuarios.model('usuarios');
    /*** Fazer a busca pelo usuário no banco de dados. */
    const allUsers = await modeloUsuarios.find({});
    console.log('Pegando todos usuários do banco de dados.');
    return allUsers;
  }
}
