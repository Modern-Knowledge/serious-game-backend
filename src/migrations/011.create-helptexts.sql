CREATE TABLE IF NOT EXISTS `serious-game`.`helptexts`
(
    `helptext_id` INT(11)   NOT NULL,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL,
    PRIMARY KEY (`helptext_id`),
    INDEX `fk_helptexts_texts1_idx` (`helptext_id` ASC),
    CONSTRAINT `fk_helptexts_texts1`
        FOREIGN KEY (`helptext_id`)
            REFERENCES `serious-game`.`texts` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;