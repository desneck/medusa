import { asValue } from "awilix"

import {
  InternalModuleDeclaration,
  LoaderOptions,
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
} from "@medusajs/modules-sdk"
import { MedusaError, ModulesSdkUtils } from "@medusajs/utils"

import { EntitySchema } from "@mikro-orm/core"

import { ConfigModule, ModulesSdkTypes } from "@medusajs/types"
import * as ProductModels from "@models"
import { createConnection } from "../utils"

export default async (
  {
    options,
    container,
  }: LoaderOptions<
    | ModulesSdkTypes.ModuleServiceInitializeOptions
    | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
  >,
  moduleDeclaration?: InternalModuleDeclaration
): Promise<void> => {
  if (
    moduleDeclaration?.scope === MODULE_SCOPE.INTERNAL &&
    moduleDeclaration.resources === MODULE_RESOURCE_TYPE.SHARED
  ) {
    const { projectConfig } = container.resolve("configModule") as ConfigModule
    options = {
      database: {
        clientUrl: projectConfig.database_url!,
        driverOptions: projectConfig.database_extra!,
        schema: projectConfig.database_schema!,
      },
    }
  }

  const customManager = (
    options as ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
  )?.manager

  if (!customManager) {
    const dbData = ModulesSdkUtils.loadDatabaseConfig("product", options)
    await loadDefault({ database: dbData, container })
  } else {
    container.register({
      manager: asValue(customManager),
    })
  }
}

async function loadDefault({ database, container }) {
  if (!database) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      `Database config is not present at module config "options.database"`
    )
  }

  const entities = Object.values(ProductModels) as unknown as EntitySchema[]
  const orm = await createConnection(database, entities)

  container.register({
    manager: asValue(orm.em.fork()),
  })
}
