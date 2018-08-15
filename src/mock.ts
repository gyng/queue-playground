/* tslint:disable: no-console */

import { IEvent, IHandler, IService } from ".";

export class MockQueue implements IService {
  protected queue: IEvent[];
  protected connection: any;
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
    this.connection = { address: endpoint };
    console.log("conn: connected to", endpoint);
  }

  public getEvents(topics: string[], since: any) {
    const events = this.queue.filter(evt => topics.includes(evt.meta.type));
    return events;
  }

  public subscribe(topics: string[], handler: IHandler) {
    this.subscribers.push({
      handler,
      topics
    });
    console.log("service subscribers", this.subscribers);
  }

  public publish(event: IEvent) {
    console.log("service publishing", event);
    this.queue.push(event);
    this.subscribers
      .filter(subscriber => subscriber.topics.includes(event.meta.type))
      .forEach(subscriber => {
        subscriber.handler.receive(event, this.publish.bind(this));
      });
  }
}
