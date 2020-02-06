CREATE TABLE IF NOT EXISTS `therapists_patients`
(
    `therapist_id` INT(11)   NOT NULL,
    `patient_id`   INT(11)   NOT NULL,
    `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`  TIMESTAMP NULL,
    PRIMARY KEY (`therapist_id`, `patient_id`),
    INDEX `fk_therapists_has_patients_patients1_idx` (`patient_id` ASC),
    INDEX `fk_therapists_has_patients_therapists1_idx` (`therapist_id` ASC),
    CONSTRAINT `fk_therapists_has_patients_patients1`
        FOREIGN KEY (`patient_id`)
            REFERENCES `patients` (`patient_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT `fk_therapists_has_patients_therapists1`
        FOREIGN KEY (`therapist_id`)
            REFERENCES `therapists` (`therapist_id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;