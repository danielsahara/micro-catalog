import {Context} from '@loopback/context'
import {Server} from "@loopback/core";
import {Channel, connect, Connection, Replies} from 'amqplib';
import {CategoryRepository} from "../repositories";
import {repository} from "@loopback/repository";
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Replies.AssertExchange;
import {Category} from "../models";

export class RabbitmqServer extends Context implements Server{
    private _listening: boolean;
    conn: Connection;

    constructor(@repository(CategoryRepository)  private categoryRepo: CategoryRepository) {
        super();
        console.log(this.categoryRepo);
    }

    async start(): Promise<void> {
        this.conn = await connect({
            hostname: 'rabbitmq',
            username: 'admin',
            password: 'admin',
        })
        console.log('starting')
        this._listening = true;
        this.boot();
    }

    async boot(){
        const channel: Channel = await this.conn.createChannel();
        const queue: AssertQueue = await channel.assertQueue('micro-catalog/sync-videos');
        const exchange: AssertExchange = await channel.assertExchange('amq.topic', 'topic');

        await channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

        // const result = channel.sendToQueue('first-queue', Buffer.from('hello world'))
        // await channel.publish('amq.direct', 'minha-routing-key', Buffer.from('publicado por routing key'));

        channel.consume(queue.queue, (message) => {
            if (!message){
                return;
            }
            const data = JSON.parse(message?.content.toString());
            const [model, event] = message.fields.routingKey.split('.').slice(1);
            this.sync({model, event, data});
        });
        // console.log(result);
    }

    async sync({model, event, data}: {model: string, event: string, data: Category}){
        if (model === 'category'){
            switch (event) {
                case 'created':
                    await this.categoryRepo.create({
                        ...data,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                    break;

            }
        }
    }

    async stop(): Promise<void> {
        await this.conn.close();
        this._listening = false;
    }

    get listening(): boolean{
        return this._listening
    }

}