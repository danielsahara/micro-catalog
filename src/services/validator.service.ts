import {bind, BindingScope} from '@loopback/core';
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {getModelSchemaRef, validateRequestBody} from "@loopback/rest";

@bind({scope: BindingScope.SINGLETON})
export class ValidatorService {
    constructor(@repository(CategoryRepository) private repo: CategoryRepository) {
        super();
    }

    async validate({data, entityClass}): Promise<boolean> {
        const modelSchema = getModelSchemaRef(entityClass);

        validateRequestBody({value: data, schema: modelSchema});

    }
}
