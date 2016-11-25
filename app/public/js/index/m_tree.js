define(['jquery'], function ($) {

    /**
     * 画布的组件dom树
     * @type {{firstHead: string, dom: {_root_: {parent: number, firstChild: null, rightSib: null, data: null}}, current: string}}
     * @private
     */
    var _domTree = {
        firstHead: '_root_',
        dom: {// 采用双亲、孩子和兄弟表示法做dom树
            '_root_': {
                parent: -1,
                firstChild: null,
                rightSib: null,
                data: null
            }// 根节点
        },
        current: ''
    };

    /**
     * 导出html框架
     * @param html
     * @param css
     * @returns {string}
     * @private
     */
    var _htmlFrame = function (html, css) {
        html = html || '';
        css = css || '';

        return [
            '<!DOCTYPE html><html>',
            '<head>',
            '<meta charset="utf-8">',
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
            '<title>Demo</title>',
            css ? '<style type="text/css">' + css + '</style>' : css,
            '</head><body>',
            html,
            '</body></html>'
        ].join('');
    };

    /**
     * 导出html,css代码
     * @returns {{html: (string|*|string|string|string|string), css: Array, file}}
     */
    var exportCode = function () {
        var _reformTree = {_css_: []};

        // 后序遍历所有节点生成子树和css
        _postOrder('_root_', _reformTree, function (id) {
            var parent = _domTree.dom[id].parent,
                reform = parent != -1 ? _domTree.dom[id].data.reform() : {html: $('<div id="canvas"></div>'), css: ''};

            this[id] = reform.html;

            var firstChild = _domTree.dom[id].firstChild;
            while (firstChild !== null) {
                this[id] = this[id].append(this[firstChild.child]);
                firstChild = firstChild.next;
            }

            this._css_ = reform.css + this._css_;
        });

        console.log(_reformTree._root_[0]);

        return {
            html: _reformTree._root_[0].innerHTML,
            css: _reformTree._css_,
            file: _htmlFrame(_reformTree._root_[0].innerHTML, _reformTree._css_)
        };
    };

    /**
     * 添加组件到domTree中
     * @param data
     * @returns {*}
     */
    var addDomTree = function (data) {
        // 添加dom
        _domTree.dom[data.id] = {
            parent: '_root_',
            firstChild: null,
            data: data
        };

        // 追加树关系
        _appendRelation(data.id, '_root_');

        return _domTree.dom;
    };

    /**
     * 移动组件到某个父元素下
     * @param id
     * @param parent
     * @returns {*}
     */
    var moveDom = function (id, parent) {
        parent = parent || '_root_';// 默认为根节点
        if (_domTree.dom[id] == undefined || _domTree.dom[parent] == undefined || _domTree.dom[id].parent == undefined) {
            return false;
        }

        // 删除原先的树关系（类似链表删除）
        _deleteRelation(id);

        // 追加到新的parent子树
        _appendRelation(id, parent);

        return _domTree.dom;
    };

    /**
     * 从dom树删除dom
     * @param id
     * @returns {*}
     */
    var deleteDom = function (id) {
        if (_domTree.dom[id] == undefined) {
            return true;
        }

        // 删除原先的树关系
        _deleteRelation(id);

        // 遍历要删除dom的ID
        var _arr = [];
        _preOrder(id, _arr, function (id) {
            Array.prototype.push.call(this, id);
        });
        _arr.forEach(function (element) {
            delete _domTree.dom[element];// 只删除的当前元素，应该包括其下的所有子元素
        });

        return _domTree.dom;
    };

    /**
     * 前序遍历
     * @param id
     * @param obj
     * @param callback
     * @private
     */
    var _preOrder = function (id, obj, callback) {
        callback.apply(obj, [id]);

        var firstChild = _domTree.dom[id].firstChild;
        if (firstChild !== null) {
            _preOrder(firstChild.child, obj, callback);

            while (firstChild.next !== null) {
                _preOrder(firstChild.next.child, obj, callback);

                firstChild = firstChild.next;
            }
        }
    };

    /**
     * 后序遍历
     * @param id
     * @param obj
     * @param callback
     * @private
     */
    var _postOrder = function (id, obj, callback) {
        var firstChild = _domTree.dom[id].firstChild;
        if (firstChild !== null) {
            _postOrder(firstChild.child, obj, callback);

            while (firstChild.next !== null) {
                _postOrder(firstChild.next.child, obj, callback);
                firstChild = firstChild.next;
            }

            callback.apply(obj, [id]);
        } else {
            callback.apply(obj, [id]);
        }
    };

    /**
     * 追加树关系（类似插入元素到链表末尾）
     * @param id
     * @param parent
     * @private
     */
    var _appendRelation = function (id, parent) {
        var firstChild = _domTree.dom[parent].firstChild;
        if (firstChild === null) {
            _domTree.dom[parent].firstChild = {
                child: id,
                next: null
            };
        } else {
            while (firstChild.child != id && firstChild.next !== null) {
                firstChild = firstChild.next;
            }

            // 避免重复append
            if (firstChild.child != id) {
                firstChild.next = {
                    child: id,
                    next: null
                };
            }
        }

        _domTree.dom[id].parent = parent;
    };

    /**
     * 删除原先的树关系（类似链表元素删除）
     * @param id
     * @private
     */
    var _deleteRelation = function (id) {
        var parent = _domTree.dom[_domTree.dom[id].parent],
            firstChild = parent.firstChild,
            lastChild = firstChild,
            flag = false;

        while (firstChild !== null) {
            if (firstChild.child == id) {
                flag = true;
                break;
            }

            lastChild = firstChild;
            firstChild = firstChild.next;
        }

        if (flag) {
            // dom关系的第一个节点
            if (parent.firstChild.child == id) {
                parent.firstChild = firstChild.next;
            } else {
                lastChild.next = firstChild.next;
            }
        }
    };

    /**
     * 更新dom树数据
     * @param id
     * @param data
     * @returns {*}
     */
    var updateDomData = function (id, data) {
        if (_domTree.dom[id]) {
            _domTree.dom[id].data = $.extend(_domTree.dom[id].data, data);

            return _domTree.dom[id];
        }

        return {};
    };

    /**
     * 获取组件dom树中的数据
     * @param id
     * @returns {*|{}}
     */
    var getDom = function (id) {
        return _domTree.dom[id] || {};
    };

    /**
     * 获取当前聚焦dom
     * @returns {*|{}}
     */
    var getCurDom = function () {
        return _domTree.dom[_domTree.current] || {};
    };

    /**
     * 设置当前选中domId
     * @param id
     * @returns {string}
     */
    var setCurDomId = function (id) {
        _domTree.current = id;

        return _domTree.current;
    };

    /**
     * 获取当前选中的domId
     * @returns {string}
     */
    var getCurDomId = function () {
        return _domTree.current;
    };

    /**
     * 获取dom树
     * @returns {{firstHead: string, dom: {_root_: {parent: number, firstChild: null, rightSib: null, data: null}}, current: string}}
     */
    var getDomTree = function () {
        return _domTree;
    };

    return {
        moveDom: moveDom,
        deleteDom: deleteDom,
        addDomTree: addDomTree,
        updateDomData: updateDomData,
        exportCode: exportCode,


        getDom: getDom,
        getCurDom: getCurDom,
        getDomTree: getDomTree,
        setCurDomId: setCurDomId,
        getCurDomId: getCurDomId
    };
});