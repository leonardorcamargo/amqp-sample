import amqplib, { Connection, Channel, ConsumeMessage } from 'amqplib';

interface Route {
  queue: string;
  routingKey: string;
  onRoute: <T>(content: T, msg: ConsumeMessage) => Promise<any>;
}

interface BindQueue {
  queue: string;
  exchange: string;
  routingKey: string;
}

class Amqp {
  private url: string;
  private static connection: Connection;
  private static channel: Channel;
  private static isInitialized: boolean = false;
  private static queues = new Set<string>([]);
  private static exchanges = new Set<string>([]);
  private routes = new Set<Route>([]);
  private queuesToBind = new Set<BindQueue>([]);

  constructor(url = process.env.AMQP_URL || 'amqp://localhost') {
    this.url = url;
  }

  private terminate(msg: any) {
    console.error(msg);
    process.exit(1);
  }

  private async addQueue(queue: string): Promise<void> {
    try {
      await Amqp.channel.assertQueue(queue, { durable: true });
      Amqp.queues.add(queue);
    } catch (err) {
      this.terminate(err);
    }
  }

  private async addExchange(exchange: string): Promise<void> {
    try {
      await Amqp.channel.assertExchange(exchange, 'topic', {
        durable: true,
      });
      Amqp.exchanges.add(exchange);
    } catch (err) {
      this.terminate(err);
    }
  }

  private async connect(): Promise<this> {
    Amqp.connection = await amqplib.connect(this.url);
    Amqp.connection
      .on('close', () => this.terminate('Amqp connection closed'))
      .on('error', err => this.terminate(err))
      .on('blocked', reason => this.terminate(reason));

    Amqp.channel = await Amqp.connection.createChannel();
    await Amqp.channel.prefetch(1);
    Amqp.channel
      .on('error', err => this.terminate(err))
      .on('close', () => this.terminate('Amqp channel closed'));
    console.log('[x] Connect on amqp');
    return this;
  }

  private async bindQueues(): Promise<void> {
    const binds = Array.from(this.queuesToBind);
    for (const bind of binds) {
      if (!Amqp.queues.has(bind.queue)) await this.addQueue(bind.queue);
      if (!Amqp.exchanges.has(bind.exchange))
        await this.addExchange(bind.exchange);
      await Amqp.channel.bindQueue(bind.queue, bind.exchange, bind.routingKey);
    }
  }

  private async configConsumers(): Promise<void> {
    const routes = Array.from(this.routes);
    const queues = routes.reduce((acc, cur) => {
      if (!acc.includes(cur.queue)) acc.push(cur.queue);
      return acc;
    }, [] as string[]);
    for (const queue of queues) {
      await Amqp.channel.consume(
        queue,
        async msg => {
          if (msg) {
            const route = routes.find(
              route => route.routingKey === msg.fields.routingKey,
            );
            if (route) {
              const msgData = JSON.parse(msg.content.toString());
              await route.onRoute(msgData, msg);
            }
            Amqp.channel.ack(msg);
            console.log('[x] Received %s', msg?.content.toString());
          }
        },
        {
          noAck: false,
        },
      );
    }
  }

  public async initialize(): Promise<this> {
    if (Amqp.isInitialized) return this;
    try {
      await this.connect();
      await this.bindQueues();
      await this.configConsumers();
      Amqp.isInitialized = true;
      return this;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  public bindQueue(exchange: string, queue: string, routingKey: string) {
    this.queuesToBind.add({ exchange, queue, routingKey });
  }

  public addRoute(route: Route) {
    this.routes.add(route);
  }

  public async publish(
    exchange: string,
    key: string,
    msg: Record<string, any>,
  ) {
    if (!Amqp.isInitialized) throw Error('Amqp not initialized!');
    if (!Amqp.exchanges.has(exchange)) await this.addExchange(exchange);
    Amqp.channel.publish(
      exchange,
      key,
      Buffer.from(JSON.stringify(msg, null, 2)),
      {
        persistent: true,
      },
    );
    console.log('[x] Sent %s', msg);
  }
}

export default Amqp;
