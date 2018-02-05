CREATE TABLE `patent_fee_future_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `an` varchar(45) DEFAULT NULL COMMENT '申请号',
  `status` tinyint(4) DEFAULT '0' COMMENT '0未处理 1处理完成',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='专利应缴年费爬取任务'