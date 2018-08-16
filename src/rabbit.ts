/* tslint:disable: no-console */
import * as amqplib from "amqplib";

import { IEvent, IHandler, IService } from ".";

export class RabbitQueue implements IService {
  protected queue: IEvent[];
  protected connection: {
    rabbit: amqplib.Connection;
    channel: amqplib.Channel;
  };
  private subscribers: Array<{
    topics: string[];
    handler: IHandler;
  }>;

  constructor() {
    this.queue = [];
    this.subscribers = [];
  }

  public async connect(endpoint: string) {
    // connect to actual queue
    // this.connection = { address: endpoint };
    const rabbit = await amqplib.connect(endpoint); // default rabbit is amqp://localhost:5672
    const channel = await rabbit.createChannel();
    this.connection = {
      channel,
      rabbit
    };

    console.log("conn: connected to rabbit! (probably)");
  }

  public getEvents(topics: string[], since: any) {
    throw new Error("not implemented");
    const events = this.queue.filter(evt => topics.includes(evt.meta.type));
    return events;
  }

  public subscribe(topics: string[], handler: IHandler) {
    topics.forEach(topic => {
      if (this.connection.channel && this.connection.channel.assertQueue) {
        this.connection.channel.assertQueue(topic).then((ok: any) => {
          console.log(`${topic} queue created`, ok);
          this.connection.channel.consume(topic, msg => {
            const event = {
              data: msg.content.toJSON().data,
              meta: {
                createdAt: new Date(),
                type: topic
              }
            };
            handler.receive(event, this.publish.bind(this));
          });
        });
      }
    });
  }

  public publish(event: IEvent) {
    console.log("service publishing", event);
    if (this.connection.channel && this.connection.channel.assertQueue) {
      const topic = event.meta.type;
      this.connection.channel.assertQueue(topic).then(() => {
        this.connection.channel.sendToQueue(
          topic,
          Buffer.from(JSON.stringify(event))
        );
      });
    }
  }
}
