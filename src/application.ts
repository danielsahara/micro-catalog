import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {RabbitmqServer} from "./servers/rabbitmq.server";
import {RestComponent, RestServer} from "@loopback/rest";
import {RestExplorerBindings} from "@loopback/rest-explorer";
import {RestExplorerComponent} from "./components/rest-explorer.component";
import {ValidatorsComponent} from "./components/validators.component";
import {ValidatorService} from "./services/validator.service";
import {Category, Genre} from "./models";

export {ApplicationConfig};

export class MicroCatalogApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    options.rest.sequence = MySequence;
    this.component(RestComponent);
    const restServer = this.getSync<RestServer>('servers.RestServer');
    restServer.static('/', path.join(__dirname, '../public'));

    // Set up default home page
    // this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);
    this.component(ValidatorsComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.server(RabbitmqServer);
  }

  async boot() {
    await super.boot();

    // const validator = this.getSync<ValidatorService>('services.ValidatorService');
    //
    // try {
    //   await validator.validate({
    //     data: {
    //       id: ['1-cat', '2-cat']
    //     },
    //     entityClass: Category
    //   })
    // } catch (e) {
    //   console.dir(e, {depth: 8})
    // }
    //
    // try {
    //   data: {
    //   }
    //   entityClass: Genre
    // } catch (e) {
    //   console.dir(e, {depth: 8})
    // }
  }
}
