var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* 编辑入口页 */
router.get('/edit', function (req, res, next) {
    res.render('index/edit', {title: '编辑'});
});

module.exports = router;
