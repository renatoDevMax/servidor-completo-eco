import { Injectable } from '@nestjs/common';
import dataConectEntregas from '../../dataBase/conectandoEntregas';
import dataConnectUsuarios from '../../dataBase/conectUsers';
import { entregasTipo } from '../../types/entregasTypes';
import { usuarioTipo } from '../../types/userTypes';

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

  async todasEntregasBancoDados() {
    const conexaoEntregas = await dataConectEntregas();
    const modeloEntregas = conexaoEntregas.model('entregas');
    const todasEntregas = await modeloEntregas.find({});
    console.log('Pegando todas entregas do Banco de Dados.');
    return todasEntregas;
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
    console.log('Pegando todas entregas do Banco de Dados.');
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
}
