CREATE TABLE `patent_fee_future` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `an` varchar(45) DEFAULT NULL COMMENT '申请号',
  `fees` longtext COMMENT '预期未来费用多条记录',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='专利未来应缴年费，通过爬虫从国知局获得'