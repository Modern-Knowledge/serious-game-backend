CREATE TABLE IF NOT EXISTS `serious-game`.`errortexts`
(
    `error_id`    INT(11)   NOT NULL,
    `severity_id` INT(11)   NOT NULL,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL,
    PRIMARY KEY (`error_id`),
    INDEX `fk_errortexts_severities1_idx` (`severity_id` ASC),
    CONSTRAINT `fk_errortexts_severities1`
        FOREIGN KEY (`severity_id`)
            REFERENCES `serious-game`.`severities` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_errortexts_texts1`
        FOREIGN KEY (`error_id`)
            REFERENCES `serious-game`.`texts` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;