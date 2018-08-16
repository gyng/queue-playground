import { MockQueue } from "./mock";
import { RabbitQueue } from "./rabbit";

/* tslint:disable: no-console */

export type EventType = string;

export interface IEvent {
  // some meta can be handled by the queue
  data: any;
  meta: {
    // id: string;
    // ctx: string;
    createdAt: Date;
    type: string;
  };
}

const makeEvent = (type: string, data: any): IEvent => ({
  data,
  meta: {
    createdAt: new Date(),
    type
    // id: 0
  }
});

// stateful
export interface IHandler {
  tag: string;
  state: any;
  receive: (event: IEvent, publish: (event: IEvent) => void) => void;
  receiveMultiple: (events: IEvent[], publish: (event: IEvent) => void) => void;
}

export interface IService {
  connect(endpoint: string): Promise<void>;
  subscribe(topics: EventType[], handler: IHandler): void;
  publish(event: IEvent): void;
  getEvents(topics: EventType[], since: Date): IEvent[];
}


const makeHandler = (tag: string) => {
  const state = { timesCalled: 0 };

  const handler: IHandler = {
    receiveMultiple(events: IEvent[], publish: (event: IEvent) => void) {
      events.forEach((evt: IEvent) => this.receive(evt, publish));
    },
    receive(event, publish) {
      console.log(`handler ${this.tag}: received`, event);

      switch (event.meta.type) {
        case "forAll":
          this.state.timesCalled += 1;
        case "forA":
          if (this.tag === "a") {
            this.state.timesCalled += 1;
          }
          break;
        case "forB":
          if (this.tag === "b") {
            this.state.timesCalled += 1;
            publish(
              makeEvent("forAll", { text: `You said "${event.data.text}"!` })
            );
          }
          break;
        case "printCount":
          console.log(`${this.tag} called ${this.state.timesCalled} times`);
        default:
        // noop
      }
    },
    state,
    tag
  };
  return handler;
};

// const queue = new MockQueue();

// const mockA = makeHandler("a");
// const mockB = makeHandler("b");

// // mockA.connect("whatever");
// queue.subscribe(["forAll", "forA", "printCount"], mockA);
// queue.subscribe(["forAll", "forB", "printCount"], mockB);

// queue.publish(makeEvent("forAll", { text: "Hello, everyone!" }));
// queue.publish(makeEvent("forB", { text: "Hello, B!" }));
// queue.publish(makeEvent("forA", { text: "Hello, A!" }));

// queue.publish(makeEvent("printCount", {}));

// console.log("xxxxxx");
// console.log("b state", mockB.state);
// console.log("xxxxxx");

// const queue2 = new MockQueue();
// const replay = queue.getEvents(["forAll", "forB"], 0);
// const mockB2 = makeHandler("b");
// mockB2.receiveMultiple(replay, queue2.publish.bind(queue2));
// console.log("b from events", mockB2.state);

async function run() {
  const queue = new RabbitQueue();
  // await queue.connect("amqp://guest:guest@rmq:5672");
  await queue.connect("amqp://guest:guest@rabbit:5672");
}

run();
