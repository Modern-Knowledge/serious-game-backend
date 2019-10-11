CREATE TABLE IF NOT EXISTS `serious-game`.`helptexts_games`
(
    `game_id`     INT(11)   NOT NULL,
    `helptext_id` INT(11)   NOT NULL,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL,
    PRIMARY KEY (`game_id`, `helptext_id`),
    INDEX `fk_games_has_helptexts_helptexts1_idx` (`helptext_id` ASC),
    INDEX `fk_games_has_helptexts_games1_idx` (`game_id` ASC),
    CONSTRAINT `fk_games_has_helptexts_games1`
        FOREIGN KEY (`game_id`)
            REFERENCES `serious-game`.`games` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_games_has_helptexts_helptexts1`
        FOREIGN KEY (`helptext_id`)
            REFERENCES `serious-game`.`helptexts` (`helptext_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;