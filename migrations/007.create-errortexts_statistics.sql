CREATE TABLE IF NOT EXISTS `serious-game`.`errortexts_statistics`
(
    `id`           INT(11)   NOT NULL AUTO_INCREMENT,
    `statistic_id` INT(11)   NOT NULL,
    `errortext_id` INT(11)   NOT NULL,
    `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`  TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`, `statistic_id`, `errortext_id`),
    INDEX `fk_errortexts_has_statistics_statistics1_idx` (`statistic_id` ASC),
    INDEX `fk_errortexts_has_statistics_errortexts1_idx` (`errortext_id` ASC),
    CONSTRAINT `fk_errortexts_has_statistics_errortexts1`
        FOREIGN KEY (`errortext_id`)
            REFERENCES `serious-game`.`errortexts` (`error_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_errortexts_has_statistics_statistics1`
        FOREIGN KEY (`statistic_id`)
            REFERENCES `serious-game`.`statistics` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1