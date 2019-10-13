CREATE TABLE IF NOT EXISTS `patient_settings`
(
    `id`          INT(11)    NOT NULL AUTO_INCREMENT,
    `neglect`     TINYINT(4) NULL     DEFAULT '0',
    `patient_id`  INT(11)    NOT NULL,
    `created_at`  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP  NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_patient_settings_patients1_idx` (`patient_id` ASC),
    CONSTRAINT `fk_patient_settings_patients1`
        FOREIGN KEY (`patient_id`)
            REFERENCES `patients` (`patient_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;