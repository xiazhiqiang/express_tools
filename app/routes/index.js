var express = require('express');
var router = express.Router();

var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* 编辑入口页 */
router.get('/edit', function (req, res, next) {
    res.render('index/edit', {title: '编辑'});
});

/**
 * 导出下载
 */
var exportDir = __dirname + '/../../export';// 导出目录
router.post('/export', function (req, res, next) {
    // console.log(req.body);
    // TODO 待优化
    var writeFile = function () {
        // 写html文件
        fs.writeFile([exportDir, 'export.html'].join('/'), req.body.file, 'utf8', function (err) {
            if (err) {
                throw err;
            }

            // 下载文件
            res.download([exportDir, 'export.html'].join('/'), 'export.html', function (err) {
                if (err) {
                    throw err;
                }

                console.log('下载成功！');
            });
        });
    };

    // 创建目录
    fs.exists(exportDir, function (exists) {
        if (exists) {
            writeFile();
        } else {
            fs.mkdir(exportDir, 0777, function (err) {
                if (err) {
                    throw err;
                }

                writeFile();
            })
        }
    });
});

module.exports = router;
