import {Context, inject} from '@loopback/context'
import {Application, CoreBindings, Server} from "@loopback/core";
import {Channel, ConfirmChannel, Options, Replies} from 'amqplib';
import {CategoryRepository} from "../repositories";
import {repository} from "@loopback/repository";
import {Category} from "../models";
import {RabbitmqBindings} from "../keys";
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';
import {MetadataInspector} from '@loopback/metadata';
import {RABBITMQ_SUBSCRIBE_DECORATOR, RabbitmqSubscribeMetadata} from "../decorators/rabbitmq-subscribe.decorator";
import {CategorySyncService} from "../services";
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Replies.AssertExchange;

// ack - reconhecida
// nack - rejeitada
// unacked - esperando reconhecimento ou rejeicao

export interface RabbitmqConfig {
    uri: string;
    connOptions?: AmqpConnectionManagerOptions;
    exchanges?: {name: string, type: string, options?: Options.AssertExchange}[];
}
export class RabbitmqServer extends Context implements Server{
    private _listening: boolean;
    private _conn: AmqpConnectionManager;
    private _channelManager: ChannelWrapper;
    channel: Channel;

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
        @repository(CategoryRepository)  private categoryRepo: CategoryRepository,
        @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig
    ) {
        super(app);
        console.log(config);
    }

    async start(): Promise<void> {
        this._conn = connect([this.config.uri], this.config.connOptions);
        this._channelManager = this.conn.createChannel();
        this._channelManager.on('connect', () => {
            this._listening = true;
            console.log('Successfully connected a rabbimq channel')
        });
        this._channelManager.on('error', (err, {name}) => {
            this._listening = false;
            console.log(`Failed to setup rabbitmq channel - name: ${name} | error: ${err.message}`)
        });
        await this.setupExchanges();

        const service = this.getSync<CategorySyncService>('services.CategorySyncService');
        const metadata = MetadataInspector.getAllMethodMetadata<RabbitmqSubscribeMetadata>(
            RABBITMQ_SUBSCRIBE_DECORATOR, service
        );
        console.log(metadata);
        // this.boot();
    }

    private async setupExchanges(){
        return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
            if (!this.config.exchanges){
             return;
            }
            await Promise.all(this.config.exchanges.map((exchange) =>(
                channel.assertExchange(exchange.name, exchange.type, exchange.options)
            )))
        })
    }

    async boot(){
        // @ts-ignore
        this.channel = await this.conn.createChannel();
        const queue: AssertQueue = await this.channel.assertQueue('micro-catalog/sync-videos');
        const exchange: AssertExchange = await this.channel.assertExchange('amq.topic', 'topic');

        await this.channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

        // const result = this.channel.sendToQueue('first-queue', Buffer.from('hello world'))
        // await this.channel.publish('amq.direct', 'minha-routing-key', Buffer.from('publicado por routing key'));

        this.channel.consume(queue.queue, (message) => {
            if (!message){
                return;
            }
            const data = JSON.parse(message?.content.toString());
            const [model, event] = message.fields.routingKey.split('.').slice(1);
            this.sync({model, event, data})
                .then(() => this.channel.ack(message))
                .catch((error) => {
                    console.log(error)
                    this.channel.reject(message, false)
                });
        });
        // console.log(result);
    }

    async sync({model, event, data}: {model: string, event: string, data: Category}){
        if (model === 'category'){
            switch (event) {
                case 'created':
                    await this.categoryRepo.create({
                        ...data,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                    break;
                case 'updated':
                    await this.categoryRepo.updateById(data.id, data);
                    break;
                case 'deleted':
                    await this.categoryRepo.deleteById(data.id);
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

    get conn(): AmqpConnectionManager{
        return this._conn;
    }

    get channelManager(): ChannelWrapper{
        return this._channelManager;
    }
}