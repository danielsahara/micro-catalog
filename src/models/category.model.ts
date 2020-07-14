import {Entity, model, property} from '@loopback/repository';
import {getModelSchemaRef} from "@loopback/rest";

@model()
export class Category extends Entity {

    @property({
        type: 'string',
        id: true,
        generated: false,
        required: true,
    })
    id: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            minLength: 1,
            maxLength: 255,
        }
    })
    name: string;

    @property({
        type: 'string',
        required: false,
        default: '',
    })
    description: string;

    @property({
        type: 'boolean',
        required: false,
        default: true
    })
    is_active: boolean

    @property({
        type: 'date',
        required: true,
    })
    created_at: string;//iso 8601 yyyy-mm-ddt00:00:00

    @property({
        type: 'date',
        required: true,
    })
    updated_at: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;

const schema = getModelSchemaRef(Category, {
    title: 'New Category',
    partial: true
})
console.dir(schema, {depth: 8})
