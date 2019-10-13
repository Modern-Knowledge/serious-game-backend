CREATE TABLE IF NOT EXISTS `images`
(
    `id`          INT(11)   NOT NULL AUTO_INCREMENT,
    `image`       BLOB      NOT NULL,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;