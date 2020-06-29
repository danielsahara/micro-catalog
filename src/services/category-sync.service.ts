import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators/rabbitmq-subscribe.decorator";

@bind({scope: BindingScope.TRANSIENT})
export class CategorySyncService {
  constructor(/* Add @inject to inject parameters */) {}

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'x',
    routingKey: 'model.category.*'
  })

  handler(){
    // this.repository.create();
  }
}
