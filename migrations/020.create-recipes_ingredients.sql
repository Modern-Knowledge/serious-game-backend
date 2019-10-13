CREATE TABLE IF NOT EXISTS `recipes_ingredients`
(
    `recipe_id`     INT(11)   NOT NULL,
    `ingredient_id` INT(11)   NOT NULL,
    `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`   TIMESTAMP NULL,
    PRIMARY KEY (`recipe_id`, `ingredient_id`),
    INDEX `fk_recipes_has_ingredients_ingredients1_idx` (`ingredient_id` ASC),
    INDEX `fk_recipes_has_ingredients_recipes1_idx` (`recipe_id` ASC),
    CONSTRAINT `fk_recipes_has_ingredients_ingredients1`
        FOREIGN KEY (`ingredient_id`)
            REFERENCES `ingredients` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_recipes_has_ingredients_recipes1`
        FOREIGN KEY (`recipe_id`)
            REFERENCES `recipes` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;