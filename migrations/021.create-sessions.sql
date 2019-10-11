CREATE TABLE IF NOT EXISTS `serious-game`.`sessions`
(
    `id`              INT(11)   NOT NULL AUTO_INCREMENT,
    `game_id`         INT(11)   NOT NULL,
    `patient_id`      INT(11)   NOT NULL,
    `statistic_id`    INT(11)   NOT NULL,
    `game_setting_id` INT(11)   NOT NULL,
    `date`            DATETIME  NOT NULL,
    `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`     TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`, `game_id`, `patient_id`, `statistic_id`),
    INDEX `fk_games_has_patients_patients1_idx` (`patient_id` ASC),
    INDEX `fk_games_has_patients_games1_idx` (`game_id` ASC),
    INDEX `fk_sessions_game_settings1_idx` (`game_setting_id` ASC),
    INDEX `fk_sessions_statistics1_idx` (`statistic_id` ASC),
    CONSTRAINT `fk_games_has_patients_games1`
        FOREIGN KEY (`game_id`)
            REFERENCES `serious-game`.`games` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_games_has_patients_patients1`
        FOREIGN KEY (`patient_id`)
            REFERENCES `serious-game`.`patients` (`patient_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_sessions_game_settings1`
        FOREIGN KEY (`game_setting_id`)
            REFERENCES `serious-game`.`game_settings` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_sessions_statistics1`
        FOREIGN KEY (`statistic_id`)
            REFERENCES `serious-game`.`statistics` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;