CREATE TABLE IF NOT EXISTS `serious-game`.`recipes`
(
    `id`            INT(11)                                         NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(255)                                    NOT NULL,
    `description`   LONGTEXT                                        NOT NULL,
    `mealtime`      ENUM ('Frühstück', 'Mittagessen', 'Abendessen') NOT NULL,
    `difficulty_id` INT(11)                                         NOT NULL,
    `created_at`    TIMESTAMP                                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`   TIMESTAMP                                       NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_recipes_difficulties1_idx` (`difficulty_id` ASC),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC),
    CONSTRAINT `fk_recipes_difficulties1`
        FOREIGN KEY (`difficulty_id`)
            REFERENCES `serious-game`.`difficulties` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;