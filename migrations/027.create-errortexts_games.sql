CREATE TABLE IF NOT EXISTS `serious-game`.`errortexts_games`
(
    `errortexts_error_id` INT(11) NOT NULL,
    `games_id`            INT(11) NOT NULL,
    PRIMARY KEY (`errortexts_error_id`, `games_id`),
    INDEX `fk_errortexts_games_games1_idx` (`games_id` ASC),
    INDEX `fk_errortexts_games_errortexts1_idx` (`errortexts_error_id` ASC),
    CONSTRAINT `fk_errortexts_games_errortexts1`
        FOREIGN KEY (`errortexts_error_id`)
            REFERENCES `serious-game`.`errortexts` (`error_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_errortexts_games_games1`
        FOREIGN KEY (`games_id`)
            REFERENCES `serious-game`.`games` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;
