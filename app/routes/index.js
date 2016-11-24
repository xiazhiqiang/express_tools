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

    // promise a+方式
    var promise = function (dir) {
        return new Promise(function (resolve, reject) {
            fs.exists(exportDir, function (exists) {
                if (exists) {
                    resolve({dir: dir, fileContent: req.body.file});
                } else {
                    // 创建目录
                    fs.mkdir(dir, 0777, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({dir: dir, fileContent: req.body.file});
                        }
                    });
                }
            });
        });
    }(exportDir);

    promise.then(function (params) {
        var filePath = [params.dir, 'export.html'].join('/');

        return new Promise(function (resolve, reject) {
            // 写html文件
            fs.writeFile(filePath, params.fileContent, 'utf8', function (err) {
                if (err) {
                    reject(err);
                }

                resolve(filePath);
            });
        });
    }).then(function (filePath) {
        // 下载文件
        res.download(filePath, 'export.html', function (err) {
            if (err) {
                throw err;
            }

            console.log('下载成功！');
        });
    }).catch(function (err) {
        console.error(err);
    });

});

module.exports = router;
