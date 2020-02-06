/**
 * Provides create, update- and delete-functions for facades.
 */
export abstract class WritableFacade<EntityType> {

    /**
     * Function that should be overwritten to provide insert-functionality
     * for the entities in the child-facade. If the function is not overwritten
     * than it returns undefined, which indicates that nothing was inserted.
     *
     * @param entity entity to insert
     */
    public async insert(entity: EntityType): Promise<EntityType> {
        return undefined;
    }

    /**
     * Function that should be overwritten to provide update-functionality
     * for the entities in the child-facade. If the function is not overwritten
     * that it returns 0, which indicates that nothing was updated.
     *
     * @param entity entity to update
     */
    public async update(entity: EntityType): Promise<number> {
        return 0;
    }

    /**
     * Function that should be overwritten, to provide delete-functionality
     * for the entities in the child-facade. If the function is not overwritten
     * than it returns 0, which indicates that nothing was deleted.
     */
    public async delete(): Promise<number> {
        return 0;
    }
}
