/*
 * Copyright (c) 2020 Florian Mold
 * All rights reserved.
 */

CREATE TABLE IF NOT EXISTS `errortexts_statistics`
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
            REFERENCES `errortexts` (`error_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_errortexts_has_statistics_statistics1`
        FOREIGN KEY (`statistic_id`)
            REFERENCES `statistics` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1