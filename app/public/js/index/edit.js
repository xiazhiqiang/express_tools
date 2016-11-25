var callback = function () {
    requirejs(['jquery', 'jqueryui', 'colorpicker', 'index/m_tree', 'index/m_component', 'helper'], function ($, jqueryui, colorpicker, Tree, Component, Helper) {

        /**
         * 编辑器Controller
         * @constructor
         */
        var EditController = {};

        var _currentElementId = {};

        /**
         * 更新组件属性栏的属性
         * @param event
         * @param element 当前视图区组件元素
         * @private
         */
        var _attrUpdateCallback = function (event, element) {
            event.stopPropagation();

            var value = 'undefined',
                dom = element[0],
                domData = Tree.getCurDom().data;

            switch ($(this).data('item')) {
                // 自适应特殊处理
                case 'self-adaption':
                    domData.margin = dom.style.margin;
                    $(this)[0].checked = dom.style.margin != '0px';
                    break;

                // 基础属性
                case 'position':
                    domData.position = value = dom.style.position;
                    break;
                case 'position-left':
                    domData.left = value = dom.style.left;
                    break;
                case 'position-top':
                    domData.top = value = dom.style.top;
                    break;
                case 'position-zIndex':
                    domData.zIndex = value = dom.style.zIndex;
                    break;
                case 'size-width':
                    domData.width = value = dom.style.width;
                    break;
                case 'size-height':
                    domData.height = value = dom.style.height;
                    break;

                // 边框属性
                case 'border-width':
                    domData.borderWidth = value = dom.style.borderWidth;
                    break;
                case 'border-style':
                    domData.borderStyle = value = dom.style.borderStyle;
                    break;
                case 'border-color':
                    domData.borderColor = value = Helper.rgb2hex(dom.style.borderColor);
                    break;

                // 背景属性
                case 'background-position':
                    domData.backgroundPosition = value = dom.style.backgroundPosition;
                    break;
                case 'background-image':
                    domData.backgroundImage = value = dom.style.backgroundImage.slice(5, -2);
                    break;
                case 'background-color':
                    domData.backgroundColor = value = Helper.rgb2hex(dom.style.backgroundColor);
                    break;
                case 'background-repeat':
                    domData.backgroundRepeat = value = dom.style.backgroundRepeat;
                    break;
                case 'background-size':
                    domData.backgroundSize = value = dom.style.backgroundSize == 'initial' ? '' : dom.style.backgroundSize;
                    break;

                default:
                    break;
            }

            if (value !== 'undefined') {
                $(this).val(value);
            }

            if (domData.id) {
                Tree.updateDomData(domData.id, domData);
            }
        };

        /**
         * 组件更新视图
         * @param event
         * @param element 当前属性区元素
         * @private
         */
        var _elementUpdateCallback = function (event, element) {
            event.stopPropagation();

            var css = {},
                value = $.trim(element.val()),
                domData = Tree.getCurDom().data;
            switch (element.data('item')) {
                // 自适应特殊处理
                case 'self-adaption':
                    domData.margin = css.margin = element[0].checked ? '0 auto' : '0';
                    break;

                // 基础属性
                case 'position':
                    domData.position = css.position = value;
                    break;
                case 'position-left':
                    domData.left = css.left = value;
                    break;
                case 'position-top':
                    domData.top = css.top = value;
                    break;
                case 'position-zIndex':
                    domData.zIndex = css['z-index'] = value;
                    break;
                case 'size-width':
                    domData.width = css.width = value;
                    break;
                case 'size-height':
                    domData.height = css.height = value;
                    break;

                // 边框属性
                case 'border-width':
                    domData.borderWidth = css['border-width'] = value;
                    break;
                case 'border-style':
                    domData.borderStyle = css['border-style'] = value;
                    break;
                case 'border-color':
                    domData.borderColor = css['border-color'] = value;
                    break;

                // 背景属性
                case 'background-position':
                    domData.backgroundPosition = css['background-position'] = value;
                    break;
                case 'background-image':
                    domData.backgroundImage = value;
                    css['background-image'] = 'url(' + value + ')';
                    break;
                case 'background-color':
                    domData.backgroundColor = css['background-color'] = value;
                    break;
                case 'background-repeat':
                    domData.backgroundRepeat = css['background-repeat'] = value;
                    break;
                case 'background-size':
                    domData.backgroundSize = css['background-size'] = value;
                    break;

                default:
                    break;
            }

            if (JSON.stringify(css) !== '{}') {
                $(this).css(css);
            }

            if (domData.id) {
                Tree.updateDomData(domData.id, domData);
            }
        };

        /**
         * 删除视图区组件回调函数
         * @param event
         * @param element
         * @private
         */
        var _componentDelete = function (event) {
            event.stopPropagation();

            Tree.deleteDom($(this).attr('id'));
            Tree.setCurDomId('');
            $(this).remove();

            console.log(Tree.getDomTree());
        };

        /**
         * 获取视图区域组件最大的zIndex值
         * @returns {*}
         * @private
         */
        var _getMaxZIndex = function () {
            var zIndex = [1000];

            $('.canvas').find('.component').each(function (index, element) {
                zIndex.push(element.style.zIndex);
            });

            return Math.max.apply(Math, zIndex);
        };

        /**
         * 初始化事件
         * @private
         */
        var _initEvent = function () {
            // 属性区域操作
            $('.attr-item')
                .on('attr_update', _attrUpdateCallback)
                .on('change', function (event) {
                    event.stopPropagation();
                    _currentElementId = Tree.getCurDomId();

                    if (!_currentElementId) {
                        return false;
                    }

                    // 调整属性区域时联动改变其他属性区域的值
                    switch ($(this).data('item')) {
                        case 'position':
                            $('.position-left').val('0px').trigger('change');
                            $('.position-top').val('0px').trigger('change');
                            break;
                        case 'self-adaption':
                            if ($(this)[0].checked) {
                                $('.position-left').val('0px').trigger('change');
                                $('.position-top').val('0px').trigger('change');
                            }
                            break;
                    }

                    // 属性区改变同时作用于当前选中元素在视图区的显示
                    $('#' + _currentElementId).trigger('element_update', [$(this)]);
                });

            // 添加组件到视图区
            $('.component-menu li').on('click', 'a', function () {
                var type = $(this).data('item'),
                    zIndex = _getMaxZIndex() + 1;

                Component
                    .createComponent(type, {zIndex: zIndex})
                    .render('.canvas', {
                        elementUpdateCallback: _elementUpdateCallback,
                        componentDelete: _componentDelete,
                    });
            });

            // 画布区域绑定droppable事件
            $('.canvas').droppable({
                greedy: true,
                hoverClass: 'state-hover',
                drop: function (event, ui) {
                    var parent = $(this).attr('id');
                    if (parent != ui.helper.data('parent')) {
                        ui.helper
                            .data('parent', parent)
                            .css({position: 'absolute', left: 0, top: 0});
                    }

                    ui.helper.appendTo($(this));

                    $('.attr-item').trigger('attr_update', [ui.helper]);

                    console.log(Tree.moveDom(ui.helper[0].id, '_root_'));
                },
            });

            // 导出按钮
            $('.export').on('click', function (event) {
                event.stopPropagation();

                var code = Tree.exportCode();
                console.log(code);

                var form = $('<form method="post" action="/export"></form>')
                    .append($('<input type="hidden" name="html">').val(code.html))
                    .append($('<input type="hidden" name="css">').val(code.css))
                    .append($('<input type="hidden" name="file">').val(code.file));
                form.submit();
            });

            /**
             * 属性设置颜色拾取器初始化
             */
            $('.color-picker').ColorPicker({
                flat: false,
                onBeforeShow: function () {
                    $(this).ColorPickerSetColor(this.value);
                    return false;
                },
                onShow: function (element) {
                    $(element).css({'z-index': 9999}).fadeIn(500);
                    return false;
                },
                onHide: function (element) {
                    $(element).fadeOut(500);
                    return false;
                },
                onChange: function (hsb, hex, rgb) {
                },
                onSubmit: function (hsb, hex, rgb, element) {
                    $(element).val('#' + hex).ColorPickerHide();

                    _currentElementId = Tree.getCurDomId();
                    if (_currentElementId) {
                        $('#' + _currentElementId).trigger('element_update', [$(element)]);
                    }
                }
            });
        };

        // 控制器入口
        EditController.init = function () {
            _initEvent();
        }();
    });
};

requirejs(['../config'], callback);
