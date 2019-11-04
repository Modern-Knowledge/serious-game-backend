CREATE TABLE IF NOT EXISTS `serious-game`.`errortexts_games`
(
    `error_id` INT(11) NOT NULL,
    `game_id`            INT(11) NOT NULL,
    PRIMARY KEY (`error_id`, `game_id`),
    INDEX `fk_errortexts_games_games1_idx` (`game_id` ASC),
    INDEX `fk_errortexts_games_errortexts1_idx` (`error_id` ASC),
    CONSTRAINT `fk_errortexts_games_errortexts1`
        FOREIGN KEY (`error_id`)
            REFERENCES `serious-game`.`errortexts` (`error_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_errortexts_games_games1`
        FOREIGN KEY (`game_id`)
            REFERENCES `serious-game`.`games` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;
