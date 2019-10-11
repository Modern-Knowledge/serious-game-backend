CREATE TABLE IF NOT EXISTS `serious-game`.`ingredients`
(
    `id`               INT(11)      NOT NULL AUTO_INCREMENT,
    `name`             VARCHAR(255) NOT NULL,
    `image_id`         INT(11)      NULL,
    `food_category_id` INT(11)      NOT NULL,
    `created_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`      TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_ingridients_images1_idx` (`image_id` ASC),
    INDEX `fk_ingridients_food_categories1_idx` (`food_category_id` ASC),
    CONSTRAINT `fk_ingridients_food_categories1`
        FOREIGN KEY (`food_category_id`)
            REFERENCES `serious-game`.`food_categories` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_ingridients_images1`
        FOREIGN KEY (`image_id`)
            REFERENCES `serious-game`.`images` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;