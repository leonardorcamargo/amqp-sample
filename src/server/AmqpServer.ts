import Amqp from '../common/amqp';

class AmqpServer {
  private amqp: Amqp;

  constructor() {
    this.amqp = new Amqp();

    this.amqp.bindQueue('teste', 'teste', 'teste.*');

    this.amqp.addRoute({
      queue: 'teste',
      routingKey: 'teste.log',
      onRoute: async msg => {
        console.log('Chegou msg');
      },
    });
  }

  public async start(): Promise<Amqp> {
    return this.amqp.initialize();
  }
}

export default AmqpServer;
