import { PromotionRuleOperator } from "@medusajs/types"
import { PromotionUtils, generateEntityId } from "@medusajs/utils"
import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  Enum,
  Index,
  ManyToMany,
  OnInit,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import Promotion from "./promotion"
import PromotionRuleValue from "./promotion-rule-value"

type OptionalFields = "description"
type OptionalRelations = "values" | "promotions"

@Entity()
export default class PromotionRule {
  [OptionalProps]?: OptionalFields | OptionalRelations

  @PrimaryKey({ columnType: "text" })
  id!: string

  @Property({ columnType: "text", nullable: true })
  description: string

  @Index({ name: "IDX_promotion_rule_attribute" })
  @Property({ columnType: "text" })
  attribute: string

  @Index({ name: "IDX_promotion_rule_operator" })
  @Enum(() => PromotionUtils.PromotionRuleOperator)
  operator: PromotionRuleOperator

  @OneToMany(() => PromotionRuleValue, (prv) => prv.promotion_rule, {
    cascade: [Cascade.REMOVE],
  })
  values = new Collection<PromotionRuleValue>(this)

  @ManyToMany(() => Promotion, (promotion) => promotion.rules)
  promotions = new Collection<Promotion>(this)

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at?: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at?: Date

  @Property({ columnType: "timestamptz", nullable: true })
  deleted_at?: Date

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "promo-rule")
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "promo-rule")
  }
}
