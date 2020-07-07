import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators/rabbitmq-subscribe.decorator";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {Message} from "amqplib";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService {
    constructor(@repository(CategoryRepository) private repo: CategoryRepository) {
    }

    @rabbitmqSubscribe({
        exchange: 'amq.topic',
        queue: 'micro-catalog/sync-videos/category',
        routingKey: 'model.category.*'
    })
    async handler({data, message}: {data: any, message: Message}) {
        const action = message.fields.routingKey.split('.')[2];

        switch (action) {
            case 'created':
                await this.repo.create(data);
                break;
            case 'updated':
                await this.repo.updateById(data.id, data);
                break;
            case 'deleted':
                await this.repo.deleteById(data.id);
                break;
        }
    }
}
