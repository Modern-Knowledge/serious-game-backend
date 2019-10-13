CREATE TABLE IF NOT EXISTS `game_settings`
(
    `id`            INT(11)   NOT NULL AUTO_INCREMENT,
    `game_id`       INT(11)   NOT NULL,
    `difficulty_id` INT(11)   NOT NULL,
    `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`   TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_game_settings_games1_idx` (`game_id` ASC),
    INDEX `fk_game_settings_difficulties1_idx` (`difficulty_id` ASC),
    CONSTRAINT `fk_game_settings_difficulties1`
        FOREIGN KEY (`difficulty_id`)
            REFERENCES `difficulties` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_game_settings_games1`
        FOREIGN KEY (`game_id`)
            REFERENCES `games` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;