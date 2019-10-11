CREATE TABLE IF NOT EXISTS `serious-game`.`patients`
(
    `patient_id`  INT(11)      NOT NULL,
    `birthday`    DATE         NULL,
    `info`        VARCHAR(255) NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP    NULL,
    PRIMARY KEY (`patient_id`),
    CONSTRAINT `fk_patients_users1`
        FOREIGN KEY (`patient_id`)
            REFERENCES `serious-game`.`users` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;