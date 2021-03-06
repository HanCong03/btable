/*!
 * ====================================================
 * BTable - v1.0.0 - 2015-03-25
 * https://github.com/kitygraph/formula
 * GitHub: https://github.com/kitygraph/formula.git 
 * Copyright (c) 2015 Baidu Kity Group; Licensed MIT
 * ====================================================
 */

(function () {
var _p = {
    r: function(index) {
        if (_p[index].inited) {
            return _p[index].value;
        }
        if (typeof _p[index].value === "function") {
            var module = {
                exports: {}
            }, returnValue = _p[index].value(null, module.exports, module);
            _p[index].inited = true;
            _p[index].value = returnValue;
            if (returnValue !== undefined) {
                return returnValue;
            } else {
                for (var key in module.exports) {
                    if (module.exports.hasOwnProperty(key)) {
                        _p[index].inited = true;
                        _p[index].value = module.exports;
                        return module.exports;
                    }
                }
            }
        } else {
            _p[index].inited = true;
            return _p[index].value;
        }
    }
};

//src/base/clazz.js
_p[0] = {
    value: function(require) {
        var $ = _p.r(2), extend = _p.r(3);
        /**
     * 创建一个类
     * @param className 类名
     * @param defines 类定义
     * @returns {*} 根据类定义创建的构造器
     */
        function createClass(className, defines) {
            var constructor = getConstructor(defines);
            constructor = inherit(className, constructor, defines);
            return constructor;
        }
        function getConstructor(defines) {
            return defines.hasOwnProperty("constructor") ? defines.constructor : getDefaultConstructor();
        }
        function inherit(className, clazz, defines) {
            var Base = defines.base || getDefaultBaseClass(), InheritBaseClass = getInheritClass(Base), clazzChain = new InheritBaseClass(), baseFields = Base.prototype.___fields, currentFields = getFields(defines);
            // 补上缺省的__render方法
            if (!defines.__render) {
                defines.__render = function() {
                    if (this.isBadCall()) {
                        return this;
                    }
                    if (this.__rendered) {
                        return this;
                    }
                    this.callBase();
                    return this;
                };
            }
            for (var key in clazzChain) {
                if (!isOwnerFunction(key, clazzChain)) {
                    delete clazzChain[key];
                }
            }
            // 方法继承
            for (var key in defines) {
                if (defines.hasOwnProperty(key)) {
                    // 如果原型链中已经存在同名方法, 则覆盖并记录
                    if (isFunction(clazzChain[key])) {
                        defines[key].___super = clazzChain[key];
                    }
                    clazzChain[key] = defines[key];
                }
            }
            currentFields = extend({}, baseFields, currentFields);
            clazzChain.___fields = currentFields;
            clazzChain.constructor = clazz;
            clazzChain.___className = className;
            //        Base.___isConstructor = true;
            //        Base.___className = className;
            WrapperClass.___isConstructor = true;
            WrapperClass.prototype = clazzChain;
            WrapperClass.___baseClass = Base;
            WrapperClass.___className = className;
            clazz.prototype = clazzChain;
            clazz.___baseClass = Base;
            clazz.___className = className;
            function WrapperClass() {
                this.___callBase.apply(this, arguments);
                clazz.apply(this, arguments);
                this.__render && this.__render();
            }
            return WrapperClass;
        }
        /**
     * 获取继承链中的父类的代理类
     */
        function getInheritClass(baseClass) {
            function InheritBaseClass() {}
            InheritBaseClass.prototype = baseClass.prototype;
            return InheritBaseClass;
        }
        // 获取默认构造函数, 有别于getDefaultBaseClass
        function getDefaultConstructor() {
            function DefaultConstructor() {}
            DefaultConstructor.prototype = ObjectClass.prototype;
            DefaultConstructor.prototype.constructor = DefaultConstructor;
            return DefaultConstructor;
        }
        // 防止根继承时, 获取到同一个构造函数
        function getDefaultBaseClass() {
            function RootClass() {
                this.___initField();
                this.___callBase();
                this.__render && this.__render();
            }
            RootClass.prototype = ObjectClass.prototype;
            RootClass.prototype.constructor = RootClass;
            RootClass.___isConstructor = true;
            RootClass.___className = "RootClass" + +new Date();
            return RootClass;
        }
        function isOwnerFunction(key, obj) {
            if (!obj.hasOwnProperty(key)) {
                return false;
            }
            if (typeof obj[key] !== "function") {
                return false;
            }
            return true;
        }
        function isFunction(target) {
            return typeof target === "function";
        }
        function getFields(defines) {
            var fields = {};
            for (var key in defines) {
                if (defines.hasOwnProperty(key) && typeof defines[key] !== "function") {
                    fields[key] = defines[key];
                    delete defines[key];
                }
            }
            return fields;
        }
        /*---------------- 基础类定义*/
        function ObjectClass() {
            this.___initField();
            this.___callBase();
            this.__render && this.__render();
        }
        $.extend(ObjectClass.prototype, {
            /**
         * 不允许访问
         */
            ___fields: {},
            /**
         * 不允许手动调用
         * @private
         */
            ___callBase: function() {
                var constructor = arguments.callee.caller;
                if (constructor.___baseClass) {
                    constructor.___baseClass.apply(this, arguments);
                }
            },
            /**
         * 不允许手动调用
         * @private
         */
            ___initField: function() {
                var fields = this.___fields;
                extend(this, fields);
            },
            /**
         * 方法中可以调用,构造器中禁止调用该方法
         * 调用该方法可以invoke 父类的同名方法, 以实现继承super功能
         */
            callBase: function() {
                var method = arguments.callee.caller;
                if (method.___super) {
                    method.___super.apply(this, arguments);
                }
            },
            /**
         * 判定本次方法调用是否是一次不安全的调用, 如果不安全, 返回true, 否则返回false
         */
            isBadCall: function() {
                var originClass = this.___className, // 待验证方法
                verifyMethod = arguments.callee.caller, // caller
                caller = verifyMethod.caller;
                return caller.___isConstructor && originClass !== caller.___className;
            }
        });
        return {
            create: createClass
        };
    }
};

//src/base/env-manager.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[1] = {
    value: function(require) {
        return _p.r(0).create("EnvManager", {
            context: null,
            target: null,
            constructor: function(context, target) {
                this.context = context;
                this.target = target;
                this.init();
            },
            getContext: function() {
                return this.context;
            },
            init: function() {}
        });
    }
};

//src/base/jquery.js
/**
 * jquery模块封装
 */
_p[2] = {
    value: function() {
        var jQuery = window.jQuery;
        jQuery._clone = function(data) {
            var tmp = {
                _: data
            };
            return JSON.parse(JSON.stringify(tmp))._;
        };
        jQuery._extend = function(target, source) {
            var args = arguments;
            var tmp;
            for (var i = 1, len = args.length; i < len; i++) {
                source = args[i];
                if (!source) {
                    continue;
                }
                for (var key in source) {
                    if (!source.hasOwnProperty(key)) {
                        continue;
                    }
                    tmp = source[key];
                    if (tmp === undefined || tmp === "none") {
                        continue;
                    }
                    target[key] = source[key];
                }
            }
            return target;
        };
        return window.jQuery;
    }
};

//src/base/kit/extend.js
/**
 * 弥补jQuery的extend在克隆对象和数组时存在的问题
 */
_p[3] = {
    value: function(require) {
        var $ = _p.r(2);
        function extend(target) {
            var type = null, isPlainObject = false, isArray = false, sourceObj = null;
            if (arguments.length === 1) {
                return copy(target);
            }
            $.each([].slice.call(arguments, 1), function(i, source) {
                for (var key in source) {
                    sourceObj = source[key];
                    if (!source.hasOwnProperty(key)) {
                        continue;
                    }
                    isPlainObject = $.isPlainObject(sourceObj);
                    isArray = $.isArray(sourceObj);
                    if (!isPlainObject && !isArray) {
                        target[key] = source[key];
                    } else if (isPlainObject) {
                        if (!$.isPlainObject(target[key])) {
                            target[key] = {};
                        }
                        target[key] = extend(target[key], sourceObj);
                    } else if (isArray) {
                        target[key] = extend(sourceObj);
                    }
                }
            });
            return target;
        }
        function copy(target) {
            var tmp = null;
            if ($.isPlainObject(target)) {
                return extend({}, target);
            } else if ($.isArray(target)) {
                tmp = [];
                $.each(target, function(index, item) {
                    if ($.isPlainObject(item) || $.isArray(item)) {
                        tmp.push(copy(item));
                    } else {
                        tmp.push(item);
                    }
                });
                return tmp;
            } else {
                return target;
            }
        }
        return extend;
    }
};

//src/btable.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[4] = {
    value: function(require, exports, module) {
        var Context = _p.r(79);
        var FORMAT_CODE = _p.r(72);
        var codes = {};
        for (var key in FORMAT_CODE) {
            if (FORMAT_CODE.hasOwnProperty(key) && key !== "_default") {
                codes[key] = FORMAT_CODE[key];
            }
        }
        var BTable = _p.r(0).create("BTable", {
            context: null,
            constructor: function(target) {
                this.context = new Context(target);
            },
            execCommand: function(name) {
                return this.context.execCommand(null, name, [].slice.call(arguments, 1));
            },
            queryCommandValue: function(name) {
                return this.context.queryCommandValue(null, name, [].slice.call(arguments, 1));
            },
            on: function(evtName, evtHandler) {
                return this.context.addEventListener(evtName, evtHandler);
            }
        });
        $.extend(BTable, {
            module: function(modules) {
                Context.registerModule(modules);
            },
            command: function(commands) {
                Context.addCommand(commands);
            },
            mapEvent: function() {
                Context.mapEvent.apply(Context, arguments);
            },
            plugin: function(pluginName, pluginImpl) {
                Context.registerPlugin(pluginName, pluginImpl);
            },
            FORMAT_CODE: codes
        });
        return BTable;
    }
};

//src/commands.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[5] = {
    value: function(require) {
        return {
            basic: {
                undo: _p.r(77),
                redo: _p.r(76)
            },
            core: {
                init: _p.r(23),
                content: _p.r(20),
                resize: _p.r(28),
                move: _p.r(25),
                scroll: _p.r(29),
                range: _p.r(27),
                style: _p.r(30),
                clear: _p.r(19),
                border: _p.r(18),
                format: _p.r(22),
                "export": _p.r(21),
                merge: _p.r(24),
                batchstyle: _p.r(17),
                numberformat: _p.r(26)
            },
            system: {
                sort: _p.r(144),
                input: _p.r(143),
                _paste: _p.r(142)
            }
        };
    }
};

//src/common/cell.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[6] = {
    value: function(require) {
        // TODO common服务调用方式需要优化
        var CommonCellService = _p.r(0).create("Cell", {
            reference: null,
            base: _p.r(96),
            init: function() {
                this.registerCommonService({
                    "c.cell.viewrect": this.getViewRect,
                    "c.cell.compare": this.compare,
                    "c.cell.coordinate": this.getCellCoordinate,
                    "c.cell.global.coordinate": this.getGlobalCoordinate
                });
            },
            getViewRect: function(struct, start, end) {
                var tmp = this.compare(start, end);
                var min = tmp.min;
                var max = tmp.max;
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                // ---------- 计算定位坐标点， 如果给定的区域已经超出当前的视窗范围（不可见的情况下）， 则返回null
                var location;
                if (min.row > viewEnd.row || max.row < viewStart.row || min.col > viewEnd.col || max.col < viewStart.col) {
                    return null;
                }
                var result = {
                    overflow: {
                        top: false,
                        left: false,
                        bottom: false,
                        right: false
                    }
                };
                // ---------- 检查是否有溢出
                if (min.row < viewStart.row) {
                    result.overflow.top = true;
                    min.row = viewStart.row;
                }
                if (min.col < viewStart.col) {
                    result.overflow.left = true;
                    min.col = viewStart.col;
                }
                if (max.row > viewEnd.row) {
                    result.overflow.bottom = true;
                    max.row = viewEnd.row;
                }
                if (max.col > viewEnd.col) {
                    result.overflow.right = true;
                    max.col = viewEnd.col;
                }
                // ----------- 计算坐标
                location = this.getCellCoordinate(struct, min.row, min.col);
                result.x = location.x;
                result.y = location.y;
                // ----------- 计算size
                result.width = this.getColumnsWidth(struct, min.col, max.col), result.height = this.getRowsHeight(struct, min.row, max.row);
                return result;
            },
            getColumnsWidth: function(struct, startCol, endCol) {
                var grid = struct.getGrid();
                var borderWidth = struct.getBorderWidth();
                var colWidth = grid.width;
                var viewStart = struct.getViewStart();
                var widths = colWidth.slice(startCol - viewStart.col, endCol - viewStart.col + 1);
                return sum(widths) + (widths.length - 1) * borderWidth;
            },
            getRowsHeight: function(struct, startRow, endRow) {
                var viewStart = struct.getViewStart();
                var grid = struct.getGrid();
                var borderWidth = struct.getBorderWidth();
                var rowHeights = grid.height;
                var heights = rowHeights.slice(startRow - viewStart.row, endRow - viewStart.row + 1);
                return sum(heights) + (heights.length - 1) * borderWidth;
            },
            getGlobalCoordinate: function(struct, row, col) {
                var viewStart = struct.getViewStart();
                var borderWidth = struct.getBorderWidth();
                var grid = struct.getGrid();
                var coordinate = {
                    y: grid.row[0],
                    x: grid.col[0]
                };
                var width = 0;
                var height = 0;
                if (viewStart.col > col) {
                    for (var i = viewStart.col - 1; i >= col; i--) {
                        width += struct.getColumnWidth(i) + borderWidth;
                    }
                    coordinate.x -= width;
                } else if (viewStart.col < col) {
                    for (var i = viewStart.col; i < col; i++) {
                        width += struct.getColumnWidth(i) + borderWidth;
                    }
                    coordinate.x += width;
                }
                if (viewStart.row > row) {
                    for (var i = viewStart.row - 1; i >= row; i--) {
                        height += struct.getRowHeight(i) + borderWidth;
                    }
                    coordinate.y -= height;
                } else if (viewStart.row < row) {
                    for (var i = viewStart.row; i < row; i++) {
                        height += struct.getRowHeight(i) + borderWidth;
                    }
                    coordinate.y += height;
                }
                return coordinate;
            },
            getCellCoordinate: function(struct, row, col) {
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var grid = struct.getGrid();
                var borderWidth = struct.getBorderWidth();
                var offset = struct.getOffset();
                var visibleCount = struct.getVisibleCount();
                var index;
                var x;
                var y;
                // --- 横坐标
                if (row < viewStart.row) {
                    index = viewStart.row;
                    y = grid.row[0];
                    while (index > row) {
                        index--;
                        y -= grid.height[index - viewStart.row] + borderWidth;
                    }
                } else if (row > viewEnd.row) {
                    index = viewEnd.row;
                    y = grid.row[visibleCount.row];
                    while (index < row) {
                        index++;
                        y += grid.height[index - viewStart] + borderWidth;
                    }
                } else {
                    y = grid.row[row - viewStart.row];
                }
                // ---- 纵坐标
                if (col < viewStart.col) {
                    index = viewStart.col;
                    x = grid.col[0];
                    while (index > col) {
                        index--;
                        x -= grid.width[index - viewStart.col] + borderWidth;
                    }
                } else if (col > viewEnd.col) {
                    index = viewEnd.col;
                    x = grid.col[visibleCount.col];
                    while (index < col) {
                        index++;
                        x += grid.width[index - viewStart.col] + borderWidth;
                    }
                } else {
                    x = grid.col[col - viewStart.col];
                }
                return {
                    x: x + offset,
                    y: y + offset
                };
            },
            compare: function(start, end) {
                return {
                    min: {
                        row: Math.min(start.row, end.row),
                        col: Math.min(start.col, end.col)
                    },
                    max: {
                        row: Math.max(start.row, end.row),
                        col: Math.max(start.col, end.col)
                    }
                };
            }
        });
        function sum(arrs) {
            var sum = 0;
            for (var i = 0, len = arrs.length; i < len; i++) {
                sum += arrs[i];
            }
            return sum;
        }
        CommonCellService.getGlobalCoordinate = CommonCellService.prototype.getGlobalCoordinate;
        return CommonCellService;
    }
};

//src/common/color.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[7] = {
    value: function(require) {
        var NAMES = {
            aliceblue: "#f0f8ff",
            antiquewhite: "#faebd7",
            aqua: "#00ffff",
            aquamarine: "#7fffd4",
            azure: "#f0ffff",
            beige: "#f5f5dc",
            bisque: "#ffe4c4",
            black: "#000000",
            blanchedalmond: "#ffebcd",
            blue: "#0000ff",
            blueviolet: "#8a2be2",
            brown: "#a52a2a",
            burlywood: "#deb887",
            cadetblue: "#5f9ea0",
            chartreuse: "#7fff00",
            chocolate: "#d2691e",
            coral: "#ff7f50",
            cornflowerblue: "#6495ed",
            cornsilk: "#fff8dc",
            crimson: "#dc143c",
            cyan: "#00ffff",
            darkblue: "#00008b",
            darkcyan: "#008b8b",
            darkgoldenrod: "#b8860b",
            darkgray: "#a9a9a9",
            darkgreen: "#006400",
            darkkhaki: "#bdb76b",
            darkmagenta: "#8b008b",
            darkolivegreen: "#556b2f",
            darkorange: "#ff8c00",
            darkorchid: "#9932cc",
            darkred: "#8b0000",
            darksalmon: "#e9967a",
            darkseagreen: "#8fbc8f",
            darkslateblue: "#483d8b",
            darkslategray: "#2f4f4f",
            darkturquoise: "#00ced1",
            darkviolet: "#9400d3",
            deeppink: "#ff1493",
            deepskyblue: "#00bfff",
            dimgray: "#696969",
            dodgerblue: "#1e90ff",
            firebrick: "#b22222",
            floralwhite: "#fffaf0",
            forestgreen: "#228b22",
            fuchsia: "#ff00ff",
            gainsboro: "#dcdcdc",
            ghostwhite: "#f8f8ff",
            gold: "#ffd700",
            goldenrod: "#daa520",
            gray: "#808080",
            green: "#008000",
            greenyellow: "#adff2f",
            honeydew: "#f0fff0",
            hotpink: "#ff69b4",
            indianred: "#cd5c5c",
            indigo: "#4b0082",
            ivory: "#fffff0",
            khaki: "#f0e68c",
            lavender: "#e6e6fa",
            lavenderblush: "#fff0f5",
            lawngreen: "#7cfc00",
            lemonchiffon: "#fffacd",
            lightblue: "#add8e6",
            lightcoral: "#f08080",
            lightcyan: "#e0ffff",
            lightgoldenrodyellow: "#fafad2",
            lightgray: "#d3d3d3",
            lightgreen: "#90ee90",
            lightpink: "#ffb6c1",
            lightsalmon: "#ffa07a",
            lightseagreen: "#20b2aa",
            lightskyblue: "#87cefa",
            lightslategray: "#778899",
            lightsteelblue: "#b0c4de",
            lightyellow: "#ffffe0",
            lime: "#00ff00",
            limegreen: "#32cd32",
            linen: "#faf0e6",
            magenta: "#ff00ff",
            maroon: "#800000",
            mediumaquamarine: "#66cdaa",
            mediumblue: "#0000cd",
            mediumorchid: "#ba55d3",
            mediumpurple: "#9370db",
            mediumseagreen: "#3cb371",
            mediumslateblue: "#7b68ee",
            mediumspringgreen: "#00fa9a",
            mediumturquoise: "#48d1cc",
            mediumvioletred: "#c71585",
            midnightblue: "#191970",
            mintcream: "#f5fffa",
            mistyrose: "#ffe4e1",
            moccasin: "#ffe4b5",
            navajowhite: "#ffdead",
            navy: "#000080",
            oldlace: "#fdf5e6",
            olive: "#808000",
            olivedrab: "#6b8e23",
            orange: "#ffa500",
            orangered: "#ff4500",
            orchid: "#da70d6",
            palegoldenrod: "#eee8aa",
            palegreen: "#98fb98",
            paleturquoise: "#afeeee",
            palevioletred: "#db7093",
            papayawhip: "#ffefd5",
            peachpuff: "#ffdab9",
            peru: "#cd853f",
            pink: "#ffc0cb",
            plum: "#dda0dd",
            powderblue: "#b0e0e6",
            purple: "#800080",
            rebeccapurple: "#663399",
            red: "#ff0000",
            rosybrown: "#bc8f8f",
            royalblue: "#4169e1",
            saddlebrown: "#8b4513",
            salmon: "#fa8072",
            sandybrown: "#f4a460",
            seagreen: "#2e8b57",
            seashell: "#fff5ee",
            sienna: "#a0522d",
            silver: "#c0c0c0",
            skyblue: "#87ceeb",
            slateblue: "#6a5acd",
            slategray: "#708090",
            snow: "#fffafa",
            springgreen: "#00ff7f",
            steelblue: "#4682b4",
            tan: "#d2b48c",
            teal: "#008080",
            thistle: "#d8bfd8",
            tomato: "#ff6347",
            turquoise: "#40e0d0",
            violet: "#ee82ee",
            wheat: "#f5deb3",
            white: "#ffffff",
            whitesmoke: "#f5f5f5",
            yellow: "#ffff00",
            yellowgreen: "#9acd32"
        };
        return _p.r(0).create("Color", {
            base: _p.r(96),
            init: function() {
                this.registerCommonService({
                    "parse.color": this.parse
                });
            },
            parse: function(value) {
                if (!value) {
                    return undefined;
                }
                value = value.replace(/\s+/g, "");
                if (/^#[0-9a-f]{3}$/i.test(value)) {
                    value = value.split("");
                    return "#" + value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
                }
                if (/^#[0-9a-f]{6}$/i.test(value)) {
                    return value;
                }
                var r;
                var g;
                var b;
                var a;
                if (/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i.test(value)) {
                    r = parseInt(RegExp.$1, 10);
                    g = parseInt(RegExp.$2, 10);
                    b = parseInt(RegExp.$3, 10);
                    if (isNaN(r) || isNaN(g) || isNaN(b)) {
                        return undefined;
                    }
                    return this.__toStandardColor(r.toString(16), g.toString(16), b.toString(16));
                }
                if (/^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([0-1.]+)\)$/i.test(value)) {
                    r = parseInt(RegExp.$1, 10);
                    g = parseInt(RegExp.$2, 10);
                    b = parseInt(RegExp.$3, 10);
                    a = parseFloat(RegExp.$4);
                    if (a === 0) {
                        return undefined;
                    }
                    if (isNaN(r) || isNaN(g) || isNaN(b)) {
                        return undefined;
                    }
                    return this.__toStandardColor(r.toString(16), g.toString(16), b.toString(16));
                }
                return NAMES[value.toLowerCase()];
            },
            __toStandardColor: function(r, g, b) {
                if (r.length === 1) {
                    r = "0" + r;
                }
                if (g.length === 1) {
                    g = "0" + g;
                }
                if (b.length === 1) {
                    b = "0" + b;
                }
                return "#" + r + g + b;
            }
        });
    }
};

//src/common/content.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[8] = {
    value: function(require) {
        return _p.r(0).create("Content", {
            base: _p.r(96),
            init: function() {
                this.registerCommonService({
                    "c.encode.content": this.encodeContent,
                    "c.decode.content": this.decodeContent
                });
            },
            decodeContent: function(content) {
                if (!content) {
                    return content;
                }
                return content.replace(/\n/g, "<br>");
            },
            encodeContent: function(content) {
                if (!content) {
                    return content;
                }
                return content.replace(/<br[^>]*>/gi, "\n").replace(/<[^>]+>/gi, "");
            }
        });
    }
};

//src/common/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[9] = {
    value: function(require) {
        return _p.r(0).create("Cell", {
            reference: null,
            base: _p.r(96),
            init: function() {
                this.registerCommonService({
                    "style.to.text": this.toCssText
                });
            },
            toCssText: function(style) {
                var text = [];
                for (var key in style) {
                    if (!style.hasOwnProperty(key) || !style[key]) {
                        continue;
                    }
                    text.push(toCssName(key) + ": " + style[key]);
                }
                return text.join("; ");
            }
        });
        function toCssName(key) {
            return key.replace(/[A-Z]/g, function(match) {
                return "-" + match.toLowerCase();
            });
        }
    }
};

//src/common/title.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[10] = {
    value: function(require) {
        var KEY_COUNT = 26;
        return _p.r(0).create("Title", {
            titles: null,
            indexMapping: {},
            charMapping: {},
            carryIndexMapping: {},
            base: _p.r(96),
            init: function() {
                this.initTitles();
                this.registerCommonService({
                    "c.title.index2char": this.indexToChar,
                    "c.title.char2index": this.chartToIndex
                });
            },
            initTitles: function() {
                this.titles = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            },
            indexToChar: function(index) {
                var chars = [];
                var key;
                index = index.toString(KEY_COUNT).split("");
                var lastIndex = index.length - 1;
                key = parseInt(index[lastIndex], KEY_COUNT);
                chars[lastIndex] = this.titles[key];
                for (var i = 0, len = index.length - 1; i < len; i++) {
                    key = parseInt(index[i], KEY_COUNT) - 1;
                    chars[i] = this.titles[key];
                }
                return chars.join("");
            },
            chartToIndex: function(title) {
                var index = [];
                title = title.toUpperCase().split("");
                for (var i = 0, len = title.length; i < len; i++) {
                    index[i] = this.charMapping[title[i]];
                }
                return parseInt(index.join(""), 10) - 1;
            }
        });
    }
};

//src/config/local.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[11] = {
    value: {
        fonts: {
            color: "#000000",
            name: "宋体",
            bold: false,
            italic: false,
            underline: false,
            throughline: false,
            size: 13
        },
        fills: {
            fill: "none"
        },
        // 注： 如果修改该处border的值，请同时修改util文件
        borders: {
            border: {
                top: "none",
                left: "none",
                right: "none",
                bottom: "none"
            }
        },
        alignments: {
            wraptext: false,
            horizontal: "left",
            vertical: "bottom"
        }
    }
};

//src/config/sys.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[12] = {
    value: {
        head: {
            width: 50,
            height: 25,
            color: "#000000",
            focusColor: "#dddddd",
            font: "12px/1 宋体"
        },
        scrollbar: {
            width: 9,
            background: "#f8f8f8"
        },
        cell: {
            width: 100,
            height: 22
        },
        border: {
            width: 1,
            color: "#cccccc",
            offset: .5
        },
        canvas: {
            background: "#ffffff"
        },
        LINE_HEIGHT: 1.2,
        background: "#f8f8f8",
        enableScroll: true,
        CONTENT_PADDING: 2,
        CANDIDATE_FONT: [ "Arial", "sans", "sans-serif" ].join(","),
        ZOOM: Math.ceil(window.devicePixelRatio),
        // 栈长度
        stack: 50
    }
};

//src/core/actuary.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[13] = {
    value: function(require) {
        var Actuary = _p.r(0).create("Actuary", {
            cell: null,
            dataAccess: null,
            autosize: null,
            reverse: null,
            cellConfig: null,
            base: _p.r(94),
            init: function(dataAccess, cell, autosize) {
                this.dataAccess = dataAccess;
                this.cell = cell;
                this.autosize = autosize;
                this.initData();
                this.plug(this.calculate);
                this.initMessageHook();
            },
            reinit: function() {
                this.initData();
            },
            initData: function() {
                var config = this.getConfig();
                this.reverse = {};
                this.cellConfig = config.cell;
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.row.calculation.reverse": this.reverseRow,
                    "c.col.calculation.reverse": this.reverseColumn
                });
            },
            calculate: function() {
                var dataAccess = this.dataAccess;
                var size = this.getContentSize();
                this.dataAccess.setSpace(size.width, size.height);
                var grid = this.genGrid();
                var boundary = this.getBoundary(grid);
                dataAccess.setGrid(grid);
                dataAccess.setVisibleCount(grid.row.length - 1, grid.col.length - 1);
                var viewStart = this.dataAccess.getViewStart();
                dataAccess.setViewEnd(viewStart.row + grid.row.length - 2, viewStart.col + grid.col.length - 2);
                dataAccess.setBoundary(boundary.width, boundary.height);
                this.postMessage("c.refresh");
            },
            genGrid: function() {
                //var normalSapce =
                return this.getNormalGrid();
            },
            getPaneGrid: function() {},
            getNormalGrid: function() {
                var dataAccess = this.dataAccess;
                var autosize = this.autosize;
                var grid = {};
                var pane = dataAccess.getPane();
                var cellConfig = this.cellConfig;
                var space = dataAccess.getSpace();
                var total = dataAccess.getTotal();
                var borderWidth = dataAccess.getBorderWidth();
                var defaultCellWidth = cellConfig.width;
                var defaultCellHeight = cellConfig.height;
                var viewStart = dataAccess.getViewStart();
                var viewEnd = dataAccess.getViewEnd();
                var offset = dataAccess.getOffset();
                // row point
                var points = [ offset ];
                var length;
                var tmp;
                var inc = offset;
                var overflow;
                if (this.reverse.row) {
                    inc = borderWidth;
                    // 防止单个单元格的宽度超过整个可视空间的宽度时，起始点错误的问题
                    viewStart.row = viewEnd.row;
                    for (var i = viewEnd.row; i >= 0; i--) {
                        inc += borderWidth + Math.max(dataAccess.getRowHeight(i) || defaultCellHeight, autosize.getRowHeight(i));
                        if (inc > space.height) {
                            break;
                        }
                        viewStart.row = i;
                    }
                } else {
                    overflow = true;
                    inc = offset;
                    // 检测起始值viewStart是否有溢出
                    for (var i = viewStart.row, len = total.row; i < len; i++) {
                        inc += borderWidth + Math.max(dataAccess.getRowHeight(i) || defaultCellHeight, autosize.getRowHeight(i));
                        if (inc > space.height) {
                            // 无溢出
                            overflow = false;
                            break;
                        }
                    }
                    // 修复溢出
                    if (overflow) {
                        overflow = space.height - inc;
                        inc = 0;
                        for (var i = viewStart.row - 1; i >= 0; i--) {
                            inc += borderWidth + Math.max(dataAccess.getRowHeight(i) || defaultCellHeight, autosize.getRowHeight(i));
                            if (inc > overflow) {
                                break;
                            }
                            viewStart.row = i;
                        }
                    }
                }
                inc = offset;
                length = [];
                for (var i = viewStart.row, len = total.row; i < len; i++) {
                    tmp = Math.max(dataAccess.getRowHeight(i) || defaultCellHeight, autosize.getRowHeight(i));
                    inc += borderWidth + tmp;
                    length.push(tmp);
                    points.push(inc);
                    if (inc > space.height) {
                        break;
                    }
                }
                grid.row = points;
                grid.height = length;
                // col point
                points = [ offset ];
                length = [];
                inc = offset;
                if (this.reverse.col) {
                    inc = borderWidth;
                    viewStart.col = viewEnd.col;
                    for (var i = viewEnd.col; i >= 0; i--) {
                        inc += borderWidth + (dataAccess.getColumnWidth(i) || defaultCellWidth);
                        if (inc > space.width) {
                            break;
                        }
                        viewStart.col = i;
                    }
                } else {
                    overflow = true;
                    inc = offset;
                    // 检测起始值viewStart是否有溢出
                    for (var i = viewStart.col, len = total.col; i < len; i++) {
                        inc += borderWidth + (dataAccess.getColumnWidth(i) || defaultCellWidth);
                        if (inc > space.width) {
                            // 无溢出
                            overflow = false;
                            break;
                        }
                    }
                    // 修复溢出
                    if (overflow) {
                        overflow = space.width - inc;
                        inc = 0;
                        for (var i = viewStart.col - 1; i >= 0; i--) {
                            inc += borderWidth + (dataAccess.getColumnWidth(i) || defaultCellWidth);
                            if (inc > overflow) {
                                break;
                            }
                            viewStart.col = i;
                        }
                    }
                }
                inc = offset;
                for (var i = viewStart.col, len = total.col; i < len; i++) {
                    tmp = dataAccess.getColumnWidth(i) || defaultCellWidth;
                    inc += borderWidth + tmp;
                    length.push(tmp);
                    points.push(inc);
                    if (inc > space.width) {
                        break;
                    }
                }
                grid.col = points;
                grid.width = length;
                // 重置计算方式的标识
                this.reverse.row = false;
                this.reverse.col = false;
                return grid;
            },
            reverseRow: function() {
                this.reverse.row = true;
            },
            reverseColumn: function() {
                this.reverse.col = true;
            },
            getBoundary: function(grid) {
                var offset = this.dataAccess.getOffset();
                var size = this.getContentSize();
                return {
                    width: Math.min(size.width, grid.col[grid.col.length - 1] + offset),
                    height: Math.min(size.height, grid.row[grid.row.length - 1] + offset)
                };
            }
        });
        Actuary.deps = [ "dataAccess", "cell", "autosize" ];
        return Actuary;
    }
};

//src/core/autosize.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[14] = {
    value: function(require) {
        var common = _p.r(31);
        var SYS_CONFIG = _p.r(12);
        var DEFAULT_CELL_HEIGHT = SYS_CONFIG.cell.height;
        var CONTENT_PADDING = SYS_CONFIG.CONTENT_PADDING;
        var LINE_HEIGHT = SYS_CONFIG.LINE_HEIGHT;
        var Border = _p.r(0).create("AutoSize", {
            dataAccess: null,
            wraptext: null,
            styleModule: null,
            sizeRecord: [],
            base: _p.r(94),
            init: function(dataAccess, styleModule, wraptext) {
                this.dataAccess = dataAccess;
                this.wraptext = wraptext;
                this.styleModule = styleModule;
                this.initMessageHook();
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.contentchange": this.__contentChange,
                    "c.stylechange": this.__styleChange,
                    "c.columnresize": this.__columnResize,
                    "c.rowresize": this.__rowResize,
                    "c.mergechange": this.__mergeChange
                });
            },
            getRowHeight: function(row) {
                var height = this.dataAccess.getAutoSize(row);
                if (height === undefined) {
                    height = this.__calculateRowHeight(row);
                    this.dataAccess.setAutoSize(height, row);
                }
                if (isNaN(height)) {
                    debugger;
                    height = this.__calculateRowHeight(row);
                }
                return height;
            },
            __calculateRowHeight: function(row) {
                var totalIndex = this.dataAccess.getTotalIndex();
                var sizeRecord = this.sizeRecord;
                var maxColumnIndex = totalIndex.col;
                var height = 0;
                var isManually = !!this.dataAccess.getRowHeight(row);
                var content;
                var style;
                var currentHeight;
                var alignmentStyle;
                for (var i = 0; i <= maxColumnIndex; i++) {
                    content = this.wraptext.getDisplayValue(row, i);
                    if (!content) {
                        continue;
                    }
                    alignmentStyle = this.styleModule.getComputedStyle("alignments", row, i);
                    // 手动设置行高后，忽略自动换行的单元格
                    if (isManually && alignmentStyle.wraptext) {
                        continue;
                    }
                    if (this.dataAccess.isMergeCell(row, i)) {
                        continue;
                    }
                    if (sizeRecord[row] && sizeRecord[row][i]) {
                        currentHeight = sizeRecord[row][i];
                    } else {
                        style = this.styleModule.getComputedStyle("fonts", row, i);
                        currentHeight = Math.ceil(style.size * LINE_HEIGHT * content.split("\n").length);
                        currentHeight += 2 * CONTENT_PADDING;
                    }
                    height = Math.max(height, currentHeight);
                }
                return height;
            },
            __contentChange: function(row, col) {
                var start = row;
                var end = col;
                if (!isNaN(+row)) {
                    this.__clear(row, col);
                } else {
                    for (var i = start.row, limit = end.row; i <= limit; i++) {
                        for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                            this.__clear(i, j);
                        }
                    }
                }
            },
            __styleChange: function(start, end) {
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        this.__clear(i, j);
                    }
                }
            },
            __mergeChange: function(start, end) {
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        this.__clear(i, j);
                    }
                }
            },
            __columnResize: function(col) {
                var totalIndex = this.dataAccess.getTotalIndex();
                for (var i = 0, limit = totalIndex.row; i <= limit; i++) {
                    this.__clear(i, col);
                }
            },
            __rowResize: function(row) {
                var totalIndex = this.dataAccess.getTotalIndex();
                for (var i = 0, limit = totalIndex.col; i <= limit; i++) {
                    this.__clear(row, i);
                }
            },
            __clear: function(row, col) {
                var sizeRecord = this.sizeRecord;
                this.dataAccess.resetAutoSize(row);
                if (sizeRecord[row] && sizeRecord[row][col]) {
                    sizeRecord[row][col] = undefined;
                }
            }
        });
        Border.deps = [ "dataAccess", "style", "wraptext" ];
        return Border;
    }
};

//src/core/border.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[15] = {
    value: function(require) {
        var common = _p.r(31);
        var Border = _p.r(0).create("Border", {
            dataAccess: null,
            base: _p.r(94),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.set.border": this.setBorder,
                    "c.clear.border": this.clearBorder,
                    "c.outer.border": this.setOuterBorder
                });
            },
            getBorder: function(row, col) {
                return this.dataAccess.getBorder(row, col);
            },
            getBorders: function(start, end) {
                return this.dataAccess.getBorders(start, end);
            },
            setBorder: function(borderOption, start, end) {
                this.dataAccess.setBorder(borderOption, start, end);
                this.coreRefresh(true);
            },
            clearBorder: function(start, end) {
                this.dataAccess.clearBorder(start, end);
                this.coreRefresh(true);
            },
            setOuterBorder: function(borderData, row, col) {
                var range = common.formatCellIndex(row, col);
                this.dataAccess.setOuterBorder(borderData, range.start, range.end);
                this.coreRefresh(true);
            }
        });
        Border.deps = [ "dataAccess" ];
        return Border;
    }
};

//src/core/cell.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[16] = {
    value: function(require) {
        var $ = _p.r(2);
        var Cell = _p.r(0).create("Cell", {
            contentPanel: null,
            $contentPanel: null,
            style: null,
            dataAccess: null,
            valueModule: null,
            autosize: null,
            base: _p.r(94),
            init: function(dataAccess, valueModule, style, autosize) {
                this.dataAccess = dataAccess;
                this.valueModule = valueModule;
                this.style = style;
                this.autosize = autosize;
                this.contentPanel = this.createElement("div", "btb-core-content");
                this.$contentPanel = $(this.contentPanel);
                this.getContentContainer().appendChild(this.contentPanel);
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.cell.row.size": this.getRowSize,
                    "c.cell.col.size": this.getColSize,
                    "c.exchange.row": this.exchangeRow,
                    "c.exchange.column": this.exchangeColumn,
                    "c.resize.column": this.resizeCol,
                    "c.resize.row": this.resizeRow,
                    "c.cell.merge": this.merge,
                    "c.cell.unmerge": this.unmergeCell,
                    "c.is.merge.cell": this.isMergeCell,
                    "c.has.merge.cell": this.hasMergeCell,
                    "c.get.merge.cell": this.getMergeCell,
                    "c.standard.cell.range": this.standardCellRange,
                    "c.merge.cells.in.range": this.getMergeCellsInRange,
                    "c.set.horizontal.merge": this.horizontalMerge,
                    "c.set.vertical.merge": this.verticalMerge
                });
            },
            getAllMergeCell: function() {
                return this.dataAccess.getMergeCell();
            },
            getMergeCell: function(row, col) {
                return this.dataAccess.getMergeCell(row, col);
            },
            getMergeCellsInRange: function(range) {
                return this.dataAccess.getMergeCellsInRange(range);
            },
            merge: function(range) {
                this.dataAccess.setMerge(range);
                this.postMessage("c.mergechange", range.start, range.end);
                this.coreRefresh(true);
            },
            unmergeCell: function(range) {
                this.dataAccess.unmergeCell(range);
                this.postMessage("c.mergechange", range.start, range.end);
                this.coreRefresh(true);
            },
            horizontalMerge: function(range) {
                this.dataAccess.setHorizontalMerge(range);
                this.postMessage("c.mergechange", range.start, range.end);
                this.coreRefresh(true);
            },
            verticalMerge: function(range) {
                this.dataAccess.setVerticalMerge(range);
                this.postMessage("c.mergechange", range.start, range.end);
                this.coreRefresh(true);
            },
            getRowHeight: function(row) {
                var cellConfig = this.getConfig("cell");
                return Math.max(this.dataAccess.getRowHeight(row) || cellConfig.height, this.autosize.getRowHeight(row));
            },
            getColumnWidth: function(col) {
                var cellConfig = this.getConfig("cell");
                return this.dataAccess.getColumnWidth(col) || cellConfig.width;
            },
            isMergeCell: function(row, col) {
                return this.dataAccess.isMergeCell(row, col);
            },
            hasMergeCell: function(range) {
                return this.dataAccess.hasMergeCell(range);
            },
            resizeRow: function(size, row) {
                this.dataAccess.setRowHeight(size, row);
                this.postMessage("c.rowresize", row);
                this.coreRefresh(true);
            },
            resizeCol: function(size, col) {
                this.dataAccess.setColumnWidth(size, col);
                this.postMessage("c.columnresize", col);
                this.coreRefresh(true);
            },
            getRowSize: function(index) {
                return this.dataAccess.getRowHeight(index);
            },
            getColSize: function(index) {
                return this.dataAccess.getColumnWidth(index);
            },
            exchangeRow: function(index, range) {
                this.dataAccess.exchangeRow(index, range);
                this.coreRefresh(true);
            },
            // TODO 优化底层存储后再实现
            exchangeColumn: function(index, range) {
                debugger;
            },
            standardCellRange: function(start, end) {
                var mergeCell;
                var startRow = start.row;
                var endRow = end.row;
                var startCol = start.col;
                var endCol = end.col;
                // scan row
                for (var i = startCol, limit = endCol; i <= limit; i++) {
                    // start row
                    mergeCell = this.getMergeCell(startRow, i);
                    if (mergeCell && mergeCell.start.row !== startRow) {
                        return this.standardCellRange({
                            row: mergeCell.start.row,
                            col: startCol
                        }, end);
                    }
                    // end row
                    mergeCell = this.getMergeCell(endRow, i);
                    if (mergeCell && mergeCell.end.row !== endRow) {
                        return this.standardCellRange(start, {
                            row: mergeCell.end.row,
                            col: endCol
                        });
                    }
                }
                // scan column
                for (var i = startRow, limit = endRow; i <= limit; i++) {
                    // start column
                    mergeCell = this.getMergeCell(i, startCol);
                    if (mergeCell && mergeCell.start.col !== startCol) {
                        return this.standardCellRange({
                            row: startRow,
                            col: mergeCell.start.col
                        }, end);
                    }
                    // end row
                    mergeCell = this.getMergeCell(i, endCol);
                    if (mergeCell && mergeCell.end.col !== endCol) {
                        return this.standardCellRange(start, {
                            row: endRow,
                            col: mergeCell.end.col
                        });
                    }
                }
                return {
                    start: {
                        row: startRow,
                        col: startCol
                    },
                    end: {
                        row: endRow,
                        col: endCol
                    }
                };
            },
            isSameMergeCell: function(args) {
                return this.dataAccess.isSameMergeCell(arguments);
            }
        });
        Cell.deps = [ "dataAccess", "value", "style", "autosize" ];
        return Cell;
    }
};

//src/core/commands/batchstyle.js
/**
 * @file 行列style
 * @author hancong03@baiud.com
 */
_p[17] = {
    value: function(require) {
        var NAMED_MAP = {
            color: "color",
            fontsize: "fontSize",
            font: "fontFamily",
            bold: "fontWeight",
            italic: "fontStyle",
            fill: "backgroundColor",
            underline: "underline",
            throughline: "throughline",
            horizontal: "textAlign",
            vertical: "verticalAlign"
        };
        return _p.r(0).create("BatchStyleCommand", {
            name: "columnstyle rowstyle",
            base: _p.r(97),
            execBefore: function() {
                var args = [].slice.call(arguments, 1);
                switch (args[0]) {
                  case "bold":
                    args[1] = args[1] ? "bold" : undefined;
                    break;

                  case "italic":
                    args[1] = args[1] ? "italic" : undefined;
                    break;
                }
                return args;
            },
            execute: function(name) {
                return this[name].apply(this, [].slice.call(arguments, 1));
            },
            columnstyle: function(styleName, styleValue, startIndex, endIndex) {
                styleName = NAMED_MAP[styleName];
                if (!styleName) {
                    return false;
                }
                this.rs("c.set.column.style", styleName, styleValue, startIndex, endIndex);
                this.coreRefresh(true);
            },
            rowstyle: function(styleName, styleValue, startIndex, endIndex) {
                styleName = NAMED_MAP[styleName];
                if (!styleName) {
                    return false;
                }
                this.rs("c.set.row.style", styleName, styleValue, startIndex, endIndex);
                this.coreRefresh(true);
            }
        });
    }
};

//src/core/commands/border.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[18] = {
    value: function(require) {
        return _p.r(0).create("BorderCommand", {
            name: "border clearborder outerborder",
            base: _p.r(97),
            execute: function(name) {
                return this[name].apply(this, [].slice.call(arguments, 1));
            },
            border: function(borderOptions, start, end) {
                var range = this.__getCells(start, end);
                this.rs("c.setstyle", "border", borderOptions, range.start, range.end);
            },
            clearborder: function(start, end) {
                var range = this.__getCells(start, end);
                this.rs("c.setstyle", "border", null, range.start, range.end);
            },
            outerborder: function(borderOption, start, end) {
                var range = this.__getCells(start, end);
                this.rs("c.outer.border", borderOption, range.start, range.end);
            },
            __getCells: function(start, end) {
                if (start === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return {
                        start: range.getStart(),
                        end: range.getEnd()
                    };
                }
                return {
                    start: start,
                    end: end
                };
            }
        });
    }
};

//src/core/commands/clear.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[19] = {
    value: function(require) {
        return _p.r(0).create("ClearCommand", {
            name: "clearcontent clearformat",
            base: _p.r(97),
            execBefore: function(name, row, col) {
                var ranges = this.__getRanges(row, col);
                return [ ranges ];
            },
            execute: function(name) {
                return this[name].apply(this, [].slice.call(arguments, 1));
            },
            /**
         * clearconent()
         * clearcontent(row, col)
         * clearcontent(start, end)
         * clearcontent([range1, range2])
         */
            clearcontent: function(ranges) {
                this.rs("c.clear.content", ranges);
            },
            clearformat: function(ranges) {
                this.rs("c.clear.style", ranges[0].start, ranges[0].end);
            },
            __getRanges: function(row, col) {
                var range;
                if (row === undefined) {
                    range = this.rs("c.range");
                    return range.getAllSelection();
                }
                if (!isNaN(+row)) {
                    return [ {
                        start: {
                            row: row,
                            col: col
                        },
                        end: {
                            row: row,
                            col: col
                        }
                    } ];
                }
                if ($.isArray(row)) {
                    return row;
                }
                return [ {
                    start: row,
                    end: col
                } ];
            }
        });
    }
};

//src/core/commands/content.js
/**
 * @file 单元格写入命令的实现
 * @author hancong03@baiud.com
 */
_p[20] = {
    value: function(require) {
        return _p.r(0).create("WriteCommand", {
            base: _p.r(97),
            name: "content write",
            execBefore: function(name, content, row, col) {
                var cell = this.__getCells(row, col);
                return [ content, cell.row, cell.col ];
            },
            /**
         * 命令执行入口
         * @param name 当前运行的命令名称
         * @param content 将要写入的内容
         * @param row 写入的单元格所在的行索引
         * @param col 写入的单元格所在的列索引
         */
            execute: function(name, content, row, col) {
                if (name === "write") {
                    return this.rs("c.write", content, row, col);
                } else {
                    return this.rs("c.content", row, col);
                }
            },
            /**
         * 撤销写入操作
         * @param name 当前运行的命令名称
         * @param content 上一次命令之前的内容
         * @param row 发生撤销操作的单元格所在的行索引
         * @param col 发生撤销操作的单元格所在的列索引
         */
            unexecute: function(name, content, row, col) {
                this.rs("c.write", content, row, col);
            },
            /**
         * 获取命令执行前的快照，该快照的内容将用于undo操作的参数
         * 该方法由系统自动调用
         * @param name 当前运行命令的名称
         * @param content 即将写入的内容
         * @param row 即将写入的目标单元格的行索引
         * @param col 即将写入的目标单元格的列索引
         * @returns {*[]} 返回撤销写入命令执行时所需的参数列表
         */
            getStackInfo: function(name, content, row, col) {
                // 获取写入前，单元格的内容
                var struct = this.rs("c.struct");
                content = struct.getRawValue(row, col);
                return [ content, row, col ];
            },
            /**
         * 参数补全
         * @private
         */
            __getCells: function(row, col) {
                if (row === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return range.getFocus();
                }
                if (!isNaN(+row)) {
                    return {
                        row: row,
                        col: col
                    };
                }
            }
        });
    }
};

//src/core/commands/export.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[21] = {
    value: function(require) {
        return _p.r(0).create("ExportCommand", {
            base: _p.r(90),
            name: "export exportexcel",
            execute: function(commandName) {
                return this[commandName].apply(this, [].slice.call(arguments, 1));
            },
            "export": function(isSimple) {
                return this.rs("c.export", isSimple);
            },
            exportexcel: function() {
                return this.rs("c.export.excel");
            }
        });
    }
};

//src/core/commands/format.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[22] = {
    value: function(require) {
        return _p.r(0).create("FormatCommand", {
            base: _p.r(90),
            name: "format",
            execBefore: function(name, value, row, col) {
                var range = this.__getRanges(row, col);
                return [ value, range.start, range.end ];
            },
            //queryValueBefore: function (name, row, col) {
            //    var range;
            //    var focus;
            //
            //    if (row === undefined) {
            //        range = this.rs('c.range');
            //        focus = range.getFocus();
            //
            //        return [{
            //            row: focus.row,
            //            col: focus.col
            //        }];
            //    } else {
            //        range = this.__getRanges(row, col);
            //        return [{
            //            row: range.start.row,
            //            col: range.start.col
            //        }];
            //    }
            //},
            execute: function(commandName) {
                return this[commandName].apply(this, [].slice.call(arguments, 1));
            },
            //queryValue: function (name, cell) {
            //    return this['query' + name].apply(this, [].slice.call(arguments, 1));
            //},
            format: function(formatIndex, start, end) {
                this.rs("c.set.format", formatIndex, start, end);
            },
            //precision: function (value, ranges) {
            //    this.rs('c.set.format.parameter', 'precision', value, ranges);
            //},
            //
            //thousandth: function (value, ranges) {
            //    this.rs('c.set.format.parameter', 'thousandth', value, ranges);
            //},
            //
            //queryprecision: function (cell) {
            //    var result = this.rs('c.get.user.format.parameter', cell.row, cell.col);
            //
            //    if (!result) {
            //        return undefined;
            //    }
            //    return result.precision;
            //},
            __getRanges: function(start, end) {
                if (start === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return {
                        start: range.getStart(),
                        end: range.getEnd()
                    };
                }
                if ($.isNumeric(start)) {
                    return {
                        start: {
                            row: start,
                            col: end
                        },
                        end: {
                            row: start,
                            col: end
                        }
                    };
                }
                return {
                    start: start,
                    end: end
                };
            }
        });
    }
};

//src/core/commands/init.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[23] = {
    value: function(require) {
        return _p.r(0).create("InitCommand", {
            base: _p.r(90),
            name: "init load",
            execute: function(commandName, data) {
                this.rs("c.load", data);
            }
        });
    }
};

//src/core/commands/merge.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[24] = {
    value: function(require) {
        return _p.r(0).create("MergeCommand", {
            name: "merge verticalmerge horizontalmerge centermerge unmerge",
            base: _p.r(97),
            execBefore: function(name, row, col) {
                return [ this.__getCells(row, col) ];
            },
            execute: function(name, range) {
                return this[name].apply(this, [].slice.call(arguments, 1));
            },
            centermerge: function(range) {
                if (this.rs("c.has.merge.cell", range)) {
                    this.rs("c.cell.unmerge", range);
                } else {
                    this.rs("c.cell.merge", range);
                    this.execCommand("horizontal", "center", range.start, range.end);
                }
                this.rs("c.range.set", range.start, range.start, range.end);
            },
            merge: function(range) {
                this.rs("c.cell.merge", range);
            },
            unmerge: function(range) {
                this.rs("c.cell.unmerge", range);
            },
            verticalmerge: function(range) {
                this.rs("c.set.vertical.merge", range);
            },
            horizontalmerge: function(range) {
                this.rs("c.set.horizontal.merge", range);
            },
            __getCells: function(start, end) {
                if (start === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return {
                        start: range.getStart(),
                        end: range.getEnd()
                    };
                }
                var data = this.cs("c.cell.compare", start, end);
                return {
                    start: data.min,
                    end: data.max
                };
            }
        });
    }
};

//src/core/commands/move.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[25] = {
    value: function(require) {
        return _p.r(0).create("MoveCommand", {
            base: _p.r(90),
            name: "moveright moveup movedown moveleft",
            execute: function(name, count) {
                this[name](count);
            },
            moveright: function(count) {
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var viewEnd = struct.getViewEnd();
                var viewStart = struct.getViewStart();
                var total = struct.getTotal();
                var row = focus.row;
                var col = focus.col + count;
                if (col >= total.col) {
                    return;
                }
                if (row >= viewEnd.row) {
                    this.execCommand("scrollrowto", row, true);
                } else if (row < viewStart.row) {
                    this.execCommand("scrollrowto", row, false);
                }
                if (col >= viewEnd.col) {
                    this.execCommand("scrollcolumnto", col, true);
                } else if (col < viewStart.col) {
                    this.execCommand("scrollcolumnto", col, false);
                }
                this.rs("c.range.right", count);
            },
            moveleft: function(count) {
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var row = focus.row;
                var col = focus.col - count;
                if (col < 0) {
                    return;
                }
                if (row >= viewEnd.row) {
                    this.execCommand("scrollrowto", row, true);
                } else if (row < viewStart.row) {
                    this.execCommand("scrollrowto", row, false);
                }
                if (col >= viewEnd.col) {
                    this.execCommand("scrollcolumnto", col, true);
                } else if (col < viewStart.col) {
                    this.execCommand("scrollcolumnto", col, false);
                }
                this.rs("c.range.left", count);
            },
            moveup: function(count) {
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var row = focus.row - count;
                var col = focus.col;
                if (row < 0) {
                    return;
                }
                if (row >= viewEnd.row) {
                    this.execCommand("scrollrowto", row, true);
                } else if (row < viewStart.row) {
                    this.execCommand("scrollrowto", row, false);
                }
                if (col >= viewEnd.col) {
                    this.execCommand("scrollcolumnto", col, true);
                } else if (col < viewStart.col) {
                    this.execCommand("scrollcolumnto", col, false);
                }
                this.rs("c.range.up", count);
            },
            movedown: function(count) {
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var total = struct.getTotal();
                var row = focus.row + count;
                var col = focus.col;
                if (row >= total.row) {
                    return;
                }
                if (row >= viewEnd.row) {
                    this.execCommand("scrollrowto", row, true);
                } else if (row < viewStart.row) {
                    this.execCommand("scrollrowto", row, false);
                }
                if (col >= viewEnd.col) {
                    this.execCommand("scrollcolumnto", col, true);
                } else if (col < viewStart.col) {
                    this.execCommand("scrollcolumnto", col, false);
                }
                this.rs("c.range.down", count);
            }
        });
    }
};

//src/core/commands/numberformat.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[26] = {
    value: function(require) {
        return _p.r(0).create("NumberFormatCommand", {
            base: _p.r(97),
            execBefore: function(name) {
                var args = [];
                var data;
                data = this.__getCells(arguments[2], arguments[3]);
                args[0] = arguments[1];
                args[1] = data.start;
                args[2] = data.end;
                return args;
            },
            execute: function(name, value, start, end) {
                this.rs("c.numberformat", value, start, end);
            },
            __getCells: function(start, end) {
                if (start === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return {
                        start: range.getStart(),
                        end: range.getEnd()
                    };
                }
                if ($.isNumeric(start)) {
                    return {
                        start: {
                            row: start,
                            col: end
                        },
                        end: {
                            row: start,
                            col: end
                        }
                    };
                }
                var data = this.cs("c.cell.compare", start, end);
                return {
                    start: data.min,
                    end: data.max
                };
            }
        });
    }
};

//src/core/commands/range.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[27] = {
    value: function(require) {
        return _p.r(0).create("RangeCommand", {
            base: _p.r(90),
            name: "focus expandright expandleft expanddown expandup selectall selectcolumn selectrow",
            execute: function(name) {
                this[name].apply(this, [].slice.call(arguments, 1));
            },
            focus: function(row, col) {
                this.__update(row, col);
                this.rs("c.range.focus", row, col);
            },
            selectall: function() {
                var totalIndex = this.rs("c.struct").getTotalIndex();
                this.rs("c.range.selection", {
                    row: 0,
                    col: 0
                }, {
                    row: totalIndex.row,
                    col: totalIndex.col
                });
            },
            selectcolumn: function(startIndex, endIndex) {
                this.rs("c.select.column", startIndex, endIndex);
            },
            selectrow: function(startIndex, endIndex) {
                this.rs("c.select.row", startIndex, endIndex);
            },
            expandright: function(count) {
                this.rs("c.selection.expand.right", count);
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var range = this.rs("c.range");
                var start = range.getStart();
                var end = range.getEnd();
                if (start.col === focus.col) {
                    this.__update(end.row, end.col);
                } else {
                    this.__update(start.row, start.col);
                }
            },
            expandleft: function(count) {
                this.rs("c.selection.expand.left", count);
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var range = this.rs("c.range");
                var start = range.getStart();
                var end = range.getEnd();
                if (start.col === focus.col) {
                    this.__update(end.row, end.col);
                } else {
                    this.__update(start.row, start.col);
                }
            },
            expanddown: function(count) {
                this.rs("c.selection.expand.down", count);
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var range = this.rs("c.range");
                var start = range.getStart();
                var end = range.getEnd();
                if (start.row === focus.row) {
                    this.__update(end.row, end.col);
                } else {
                    this.__update(start.row, start.col);
                }
            },
            expandup: function(count) {
                this.rs("c.selection.expand.up", count);
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var range = this.rs("c.range");
                var start = range.getStart();
                var end = range.getEnd();
                if (start.row === focus.row) {
                    this.__update(end.row, end.col);
                } else {
                    this.__update(start.row, start.col);
                }
            },
            __update: function(row, col) {
                var range = this.rs("c.range");
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var commands = [];
                // 如果输入框不在视野内， 请求执行滚动
                if (row < viewStart.row) {
                    commands.push({
                        command: "scrollrowto",
                        args: [ row ]
                    });
                } else if (row >= viewEnd.row) {
                    commands.push({
                        command: "scrollrowto",
                        args: [ row, true ]
                    });
                }
                if (col < viewStart.col) {
                    commands.push({
                        command: "scrollcolumnto",
                        args: [ col ]
                    });
                } else if (col >= viewEnd.col) {
                    commands.push({
                        command: "scrollcolumnto",
                        args: [ col, true ]
                    });
                }
                if (commands.length) {
                    this.execCommand(commands);
                }
            }
        });
    }
};

//src/core/commands/resize.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[28] = {
    value: function(require) {
        return _p.r(0).create("ResizeCommand", {
            name: "resizerow resizecol",
            base: _p.r(97),
            execute: function(name, size, index) {
                if (name === "resizerow") {
                    return this.rs("c.resize.row", size, index);
                } else {
                    return this.rs("c.resize.column", size, index);
                }
            },
            unexecute: function(name, size, index) {
                return this.execute(name, size, index);
            },
            getStackInfo: function(name, size, index) {
                var size;
                if (name === "resizerow") {
                    size = this.rs("c.cell.row.size", index);
                } else {
                    size = this.rs("c.cell.col.size", index);
                }
                return [ size, index ];
            }
        });
    }
};

//src/core/commands/scroll.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[29] = {
    value: function(require) {
        return _p.r(0).create("ScrollCommand", {
            base: _p.r(90),
            name: "scrollrowto scrollcolumnto scrollrow scrollcolumn",
            execute: function(name, count, toEnd) {
                this[name](count, toEnd);
            },
            scrollrowto: function(count, toEnd) {
                return this.rs("c.row.scrollto", count, !!toEnd);
            },
            scrollcolumnto: function(count, toEnd) {
                return this.rs("c.col.scrollto", count, !!toEnd);
            },
            scrollrow: function(count) {
                return this.rs("c.row.scroll", count);
            },
            scrollcolumn: function(count) {
                return this.rs("c.col.scroll", count);
            }
        });
    }
};

//src/core/commands/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[30] = {
    value: function(require) {
        return _p.r(0).create("StyleCommand", {
            name: "color fontsize font bold italic fill horizontal vertical underline throughline wraptext cellstyles",
            base: _p.r(97),
            execBefore: function(name) {
                var args = [];
                var data;
                switch (name) {
                  case "bold":
                  case "underline":
                  case "throughline":
                  case "italic":
                  case "wraptext":
                    data = this.__getCells(arguments[1], arguments[2]);
                    args[0] = data.start;
                    args[1] = data.end;
                    break;

                  default:
                    data = this.__getCells(arguments[2], arguments[3]);
                    args[0] = arguments[1];
                    args[1] = data.start;
                    args[2] = data.end;
                    break;
                }
                return args;
            },
            queryValueBefore: function(name) {
                if (arguments[1] !== undefined) {
                    return [ arguments[1], arguments[2] ];
                }
                var range = this.rs("c.range");
                // 停止命令执行
                if (!range.isValid()) {
                    return false;
                }
                var focus = range.getFocus();
                return [ focus.row, focus.col ];
            },
            execute: function(name) {
                return this[name].apply(this, [].slice.call(arguments, 1));
            },
            queryValue: function(name) {
                return this["query" + name].apply(this, [].slice.call(arguments, 1));
            },
            color: function(val, start, end) {
                this.rs("c.setstyle", "color", val, start, end);
            },
            fontsize: function(val, start, end) {
                this.rs("c.setstyle", "size", val, start, end);
            },
            font: function(val, start, end) {
                this.rs("c.setstyle", "name", val, start, end);
            },
            italic: function(start, end) {
                var struct = this.rs("c.struct");
                var fontStyle = struct.getUserStyle("fonts", start.row, start.col);
                if (fontStyle && fontStyle.italic) {
                    this.rs("c.setstyle", "italic", false, start, end);
                } else {
                    this.rs("c.setstyle", "italic", true, start, end);
                }
            },
            bold: function(start, end) {
                var struct = this.rs("c.struct");
                var fontStyle = struct.getUserStyle("fonts", start.row, start.col);
                if (fontStyle && fontStyle.bold) {
                    this.rs("c.setstyle", "bold", false, start, end);
                } else {
                    this.rs("c.setstyle", "bold", true, start, end);
                }
            },
            wraptext: function(start, end) {
                var struct = this.rs("c.struct");
                var alignmentStyle = struct.getUserStyle("alignments", start.row, start.col);
                if (alignmentStyle && alignmentStyle.wraptext) {
                    this.rs("c.setstyle", "wraptext", false, start, end);
                } else {
                    this.rs("c.setstyle", "wraptext", true, start, end);
                }
            },
            underline: function(start, end) {
                var struct = this.rs("c.struct");
                var fontStyle = struct.getUserStyle("fonts", start.row, start.col);
                if (fontStyle && fontStyle.underline) {
                    this.rs("c.setstyle", "underline", false, start, end);
                } else {
                    this.rs("c.setstyle", "underline", true, start, end);
                }
            },
            throughline: function(start, end) {
                var struct = this.rs("c.struct");
                var fontStyle = struct.getUserStyle("fonts", start.row, start.col);
                if (fontStyle && fontStyle.throughline) {
                    this.rs("c.setstyle", "throughline", false, start, end);
                } else {
                    this.rs("c.setstyle", "throughline", true, start, end);
                }
            },
            fill: function(val, start, end) {
                this.rs("c.setstyle", "fill", val, start, end);
            },
            horizontal: function(val, start, end) {
                this.rs("c.setstyle", "horizontal", val, start, end);
            },
            vertical: function(val, start, end) {
                this.rs("c.setstyle", "vertical", val, start, end);
            },
            cellstyles: function(value, start, end) {
                var struct = this.rs("c.struct");
                this.rs("c.set.cellstyles", value, start, end);
            },
            /* ------------ query -----------*/
            queryfont: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value && value.name !== "none") {
                    return value.name;
                }
                return undefined;
            },
            querycolor: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value && value.color !== "none") {
                    return value.color;
                }
                return undefined;
            },
            queryfontsize: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value && value.size !== "none") {
                    return value.size;
                }
                return undefined;
            },
            querybold: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value) {
                    return !!value.bold;
                }
                return false;
            },
            querywraptext: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("alignments", row, col);
                if (value) {
                    return !!value.wraptext;
                }
                return false;
            },
            queryunderline: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value) {
                    return !!value.underline;
                }
                return false;
            },
            querythroughline: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value) {
                    return !!value.throughline;
                }
                return false;
            },
            queryitalic: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fonts", row, col);
                if (value) {
                    return !!value.italic;
                }
                return false;
            },
            queryfill: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("fills", row, col);
                if (value && value.fill !== "none") {
                    return value.fill;
                }
                return undefined;
            },
            queryhorizontal: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("alignments", row, col);
                if (value && value.horizontal !== "none") {
                    return value.horizontal;
                }
                return undefined;
            },
            queryvertical: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getUserStyle("alignments", row, col);
                if (value && value.vertical !== "none") {
                    return value.vertical;
                }
                return undefined;
            },
            __getCells: function(start, end) {
                if (start === undefined) {
                    var range = this.rs("c.range");
                    if (!range.isValid()) {
                        return null;
                    }
                    return {
                        start: range.getStart(),
                        end: range.getEnd()
                    };
                }
                if ($.isNumeric(start)) {
                    return {
                        start: {
                            row: start,
                            col: end
                        },
                        end: {
                            row: start,
                            col: end
                        }
                    };
                }
                var data = this.cs("c.cell.compare", start, end);
                return {
                    start: data.min,
                    end: data.max
                };
            }
        });
    }
};

//src/core/common.js
/**
 * @file core层通用函数包，提供一些常用功能，以助于减少业务代码的重复
 * @author hancong03@baiud.com
 */
_p[31] = {
    value: function(require) {
        var $ = _p.r(2);
        return {
            formatCellIndex: function(row, col) {
                if (col !== undefined) {
                    if (typeof row === "number") {
                        return {
                            row: row,
                            col: col
                        };
                    } else {
                        return {
                            start: {
                                row: row.row,
                                col: row.col
                            },
                            end: {
                                row: col.row,
                                col: col.col
                            }
                        };
                    }
                }
                return row;
            }
        };
    }
};

//src/core/data/basic.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[32] = {
    value: function(require) {
        return {
            // 自动大小
            auto: {},
            // 公式
            formula: {},
            // 单元格临时类型
            type: {},
            /* --- 计算 --- */
            viewStart: {
                row: 0,
                col: 0
            },
            viewEnd: {
                row: 0,
                col: 0
            },
            grid: {},
            effective: {
                row: 0,
                col: 0
            },
            // 当前可见的行列数
            visibleCount: {},
            // 单元格坐标偏移
            offset: 0,
            borderWidth: 1,
            boundary: {},
            space: {},
            local: {},
            wraptextRecord: {},
            computedValue: {},
            standardValue: {},
            formatColor: {}
        };
    }
};

//src/core/data/data-access.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[33] = {
    value: function(require) {
        var basic = _p.r(32);
        var DataHelper = _p.r(34);
        var SYS_CONFIG = _p.r(12);
        // TODO 解决引用问题
        var KernelHelper = _p.r(107);
        return _p.r(0).create("DataAccess", $.extend({
            base: _p.r(94),
            data: null,
            createSheet: function() {
                var data = this.kernelCreateSheet();
                var extData = $._clone(basic);
                return $.extend(data, extData);
            },
            "import": function(source) {
                var data = this.kernelImport(source);
                this.data = $.extend(data, $._clone(basic));
            },
            /* --- 读取 --- */
            getGrid: function() {
                return this.data.grid;
            },
            getPane: function() {
                return this.kernelGetPane();
            },
            getOffset: function() {
                return SYS_CONFIG.border.offset;
            },
            getViewStart: function() {
                return this.data.viewStart;
            },
            getViewEnd: function() {
                return this.data.viewEnd;
            },
            getVisibleCount: function() {
                return this.data.visibleCount;
            },
            getBorderWidth: function() {
                return SYS_CONFIG.border.width;
            },
            getTotal: function() {
                return this.kernelGetTotal();
            },
            getTotalIndex: function() {
                return this.kernelGetTotalIndex();
            },
            getBoundary: function() {
                return this.data.boundary;
            },
            getSpace: function() {
                return this.data.space;
            },
            getAutoSize: function(row) {
                return this.data.auto[row];
            },
            getColumnWidth: function(col) {
                return this.kernelGetColumnWidth(col);
            },
            getRowHeight: function(row) {
                return this.kernelGetRowHeight(row);
            },
            getType: function(row, col) {
                return this.data.type[this.indexToKey(row, col)];
            },
            getFormula: function(row, col) {
                return this.data.formula[this.indexToKey(row, col)];
            },
            getComputedValue: function(row, col) {
                return this.data.computedValue[this.indexToKey(row, col)];
            },
            getStandardValue: function(row, col) {
                return this.data.standardValue[this.indexToKey(row, col)];
            },
            getNumberFormat: function(row, col) {
                return this.kernelGetNumberFormat(row, col);
            },
            getDefaultStyle: function(classify) {
                return this.kernelGetDefaultStyle(classify);
            },
            getValue: function(row, col) {
                return this.kernelGetValue(row, col);
            },
            getStyle: function(classify, row, col) {
                return this.kernelGetStyle(classify, row, col);
            },
            getStyleById: function(classify, id) {
                return this.kernelGetStyleById(classify, id);
            },
            getStyleIds: function(classify, start, end) {
                return this.kernelGetStyleIds(classify, start, end);
            },
            getEffectiveIndex: function() {
                var effectiveIndex = this.data.effective;
                return {
                    row: effectiveIndex.row,
                    col: effectiveIndex.col
                };
            },
            getDimension: function() {
                return this.kernelGetDimension();
            },
            getCellType: function(row, col) {
                return this.kernelGetCellType(row, col);
            },
            getBorder: function(row, col) {
                return this.kernelGetBorder(row, col);
            },
            getBorders: function(start, end) {
                return this.kernelGetBorders(start, end);
            },
            getMergeCell: function(row, col) {
                return this.kernelGetMergeCell(row, col);
            },
            getMergeCellsInRange: function(range) {
                return this.kernelGetMergeCellsInRange(range);
            },
            isMergeCell: function(row, col) {
                return this.kernelIsMergeCell(row, col);
            },
            hasMergeCell: function(range) {
                return this.kernelHasMergeCellInRange(range);
            },
            isSameMergeCell: function(cells) {
                return this.kernelIsSameMergeCell(cells);
            },
            getWraptextRecord: function(row, col) {
                return this.data.wraptextRecord[this.indexToKey(row, col)];
            },
            getFormatColor: function(row, col) {
                return this.data.formatColor[this.indexToKey(row, col)];
            },
            /* ---- setter ---- */
            clearContent: function(ranges) {
                this.kernelClearValue(ranges);
                var end;
                var rows = [];
                var cols = [];
                for (var i = 0, len = ranges.length; i < len; i++) {
                    end = ranges[0].end;
                    rows[i] = end.row;
                    cols[i] = end.col;
                }
                this.data.effective = DataHelper.updateEffective(this.data, Math.max.apply(null, rows), Math.max.apply(null, cols));
            },
            setTotal: function(row, col) {
                this.kernelSetTotal(row, col);
            },
            setSpace: function(width, height) {
                this.data.space = {
                    width: width,
                    height: height
                };
            },
            setGrid: function(grid) {
                this.data.grid = grid;
            },
            setNumberFormat: function(code, start, end) {
                this.kernelSetNumberFormat(code, start, end);
            },
            clearNumberFormat: function(start, end) {
                this.kernelClearNumberFormat(start, end);
            },
            setBorder: function(borderOption, start, end) {
                this.kernelSetBorder(borderOption, start, end);
            },
            setOuterBorder: function(borderData, start, end) {
                this.kernelSetOuterBorder(borderData, start, end);
            },
            clearBorder: function(start, end) {
                this.kernelClearBorder(start, end);
            },
            setVisibleCount: function(row, col) {
                this.data.visibleCount = {
                    row: row,
                    col: col
                };
            },
            setViewStart: function(row, col) {
                this.data.viewStart = {
                    row: row,
                    col: col
                };
            },
            setViewEnd: function(row, col) {
                this.data.viewEnd = {
                    row: row,
                    col: col
                };
            },
            setComputedValue: function(value, row, col) {
                if (value) {
                    this.data.computedValue[this.indexToKey(row, col)] = value;
                } else {
                    this.clearComputedValue(row, col);
                }
            },
            clearComputedValue: function(row, col) {
                this.data.computedValue[this.indexToKey(row, col)] = undefined;
            },
            setFormatColor: function(value, row, col) {
                if (value) {
                    this.data.formatColor[this.indexToKey(row, col)] = value;
                } else {
                    this.clearFormatColor(row, col);
                }
            },
            clearFormatColor: function(row, col) {
                this.data.formatColor[this.indexToKey(row, col)] = undefined;
            },
            setStandardValue: function(value, row, col) {
                if (value) {
                    this.data.standardValue[this.indexToKey(row, col)] = value;
                } else {
                    this.clearStandardValue(row, col);
                }
            },
            clearStandardValue: function(row, col) {
                this.data.standardValue[this.indexToKey(row, col)] = undefined;
            },
            setBoundary: function(width, height) {
                this.data.boundary = {
                    width: width,
                    height: height
                };
            },
            setCellType: function(type, row, col) {
                this.kernelSetCellType(type, row, col);
            },
            clearCellType: function(row, col) {
                this.kernelClearCellType(row, col);
            },
            setType: function(type, row, col) {
                this.data.type[this.indexToKey(row, col)] = type || undefined;
            },
            setMerge: function(range) {
                return this.kernelSetMerge(range);
            },
            unmergeCell: function(range) {
                return this.kernelUnmerge(range);
            },
            setHorizontalMerge: function(range) {
                return this.kernelSetHorizontalMerge(range);
            },
            setVerticalMerge: function(range) {
                return this.kernelSetVerticalMerge(range);
            },
            clearType: function(ranges) {
                var data = this.data.type;
                var _self = this;
                var total = this.data.total;
                for (var i = 0, len = ranges.length; i < len; i++) {
                    if (clear(ranges[i].start, ranges[i].end)) {
                        break;
                    }
                }
                function clear(start, end) {
                    var allCount = total.row * total.col;
                    var clearCount = (end.row - start.row + 1) * (end.col - start.col + 1);
                    var index;
                    // 全部清除
                    if (allCount === clearCount) {
                        _self.data.type = {};
                        return true;
                    }
                    for (var i = start.row, limit = end.row; i <= limit; i++) {
                        for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                            index = _self.indexToKey(i, j);
                            if (data[index]) {
                                data[index] = undefined;
                            }
                        }
                    }
                    return false;
                }
            },
            setValue: function(content, row, col) {
                var effectiveIndex = this.data.effective;
                this.kernelSetValue(content, row, col);
                if (content) {
                    effectiveIndex.row = Math.max(effectiveIndex.row, row);
                    effectiveIndex.col = Math.max(effectiveIndex.col, col);
                    return;
                }
                this.data.effective = DataHelper.updateEffective(this.data, row, col);
            },
            clearValue: function(row, col) {
                this.setValue(undefined, row, col);
            },
            batchSetValue: function(contents, row, col) {
                this.kernelBatchSetValue(contents, row, col);
            },
            setStyle: function(styleName, styleValue, start, end) {
                this.kernelSetStyle.apply(this, arguments);
            },
            setCellStyles: function(styleOption, start, end) {
                this.kernelSetXfStyle(styleOption, start, end);
            },
            clearStyle: function(styleName, start, end) {
                this.kernelClearStyle.apply(this, arguments);
            },
            setColumnStyle: function(styleName, styleValue, startIndex, endIndex) {
                this.kernelSetColumnStyle.apply(this, arguments);
            },
            setRowStyle: function(styleName, styleValue, startIndex, endIndex) {
                this.kernelSetRowStyle.apply(this, arguments);
            },
            setAutoSize: function(size, row) {
                this.data.auto[row] = size || undefined;
            },
            clearAutoSize: function() {
                this.data.auto = {};
            },
            resetAutoSize: function(row) {
                this.data.auto[row] = undefined;
            },
            setColumnWidth: function(size, col) {
                this.kernelSetColumnWidth(size, col);
            },
            setRowHeight: function(size, col) {
                this.kernelSetRowHeight(size, col);
            },
            setFormula: function(formula, row, col) {
                this.data.formula[this.indexToKey(row, col)] = formula || undefined;
            },
            recordWraptext: function(contents, row, col) {
                this.data.wraptextRecord[this.indexToKey(row, col)] = contents;
            },
            clearWraptextRecord: function(row, col) {
                this.data.wraptextRecord[this.indexToKey(row, col)] = undefined;
            },
            exchangeRow: function(index, range) {
                var autoData = this.data.auto;
                this.kernelExchangeRow(index, range);
                KernelHelper.exchangeRow(this.data.type, index, range);
                KernelHelper.exchangeRow(this.data.formula, index, range);
                // clear auto size
                for (var i = range.start.row, limit = range.end.row; i <= limit; i++) {
                    autoData[i] = undefined;
                }
            },
            "export": function(isSimple) {
                return this.kernelExport(isSimple);
            },
            exportExcel: function() {
                return this.kernelExportExcel();
            }
        }, _p.r(118)));
    }
};

//src/core/data/helper.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[34] = {
    value: function(require) {
        var MAX_COLUMN_COUNT = Math.pow(26, 3);
        return {
            updateEffective: function(data, row, col) {
                var valueData = data.value;
                var oldMaxData = data.effective;
                var newMaxData = {
                    row: oldMaxData.row,
                    col: oldMaxData.col
                };
                var tmp;
                var colIndexList = [];
                if (oldMaxData.row === row) {
                    for (var key in valueData) {
                        if (!valueData[key]) {
                            continue;
                        }
                        tmp = key;
                    }
                    if (tmp) {
                        newMaxData.row = Math.floor(tmp / MAX_COLUMN_COUNT);
                    }
                }
                if (oldMaxData.col === col) {
                    for (var key in valueData) {
                        if (!valueData[key]) {
                            continue;
                        }
                        colIndexList.push(key % MAX_COLUMN_COUNT);
                    }
                    if (colIndexList.length) {
                        newMaxData.col = Math.max.apply(null, colIndexList);
                    }
                }
                return newMaxData;
            }
        };
    }
};

//src/core/datetime/datetime.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[35] = {
    value: function(require) {
        var ONE_DAY = 24 * 3600 * 1e3;
        var START_POINT = new Date(Date.UTC(1899, 11, 31, 0, 0, 0));
        return _p.r(0).create("DateTime", {
            base: _p.r(94),
            dateValueOf: function(dateStr) {
                var date = new Date(dateStr);
                date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
                return (date - START_POINT) / ONE_DAY + 1;
            }
        });
    }
};

//src/core/device.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[36] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("Device", {
            contentPanel: null,
            $contentPanel: null,
            style: null,
            dataAccess: null,
            valueModule: null,
            base: _p.r(94),
            init: function() {
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.zoom.refresh": this.refreshZoom,
                    "c.update.viewport": this.updateViewport
                });
            },
            refreshZoom: function() {
                var currentZoom = Math.ceil(window.devicePixelRatio);
                var config = this.getConfig();
                if (config.ZOOM === currentZoom) {
                    return;
                }
                config.ZOOM = currentZoom;
                this.postMessage("c.container.resize");
                this.coreRefresh(true);
            },
            updateViewport: function() {
                this.resizeContianer();
                this.postMessage("c.container.resize");
                this.coreRefresh(true);
            }
        });
    }
};

//src/core/export-manager.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[37] = {
    value: function(require) {
        var ExportManager = _p.r(0).create("ExportManager", {
            dataAccess: null,
            base: _p.r(94),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.export": this.export,
                    "c.export.excel": this.exportExcel
                });
            },
            "export": function(isSimple) {
                return this.dataAccess.export(isSimple);
            },
            exportExcel: function() {
                return this.dataAccess.exportExcel();
            }
        });
        ExportManager.deps = [ "dataAccess" ];
        return ExportManager;
    }
};

//src/core/range/range-facade.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[38] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("RangeFacade", {
            info: null,
            cell: null,
            base: _p.r(91),
            init: function(cell) {
                this.cell = cell;
            },
            reload: function(rangeInfo) {
                this.info = $._clone(rangeInfo);
            },
            getFocus: function() {
                return $._clone(this.info.focus);
            },
            getStart: function() {
                return $._clone(this.info.start);
            },
            getEnd: function() {
                return $._clone(this.info.end);
            },
            getAllSelection: function() {
                return [ $._clone({
                    start: this.info.start,
                    end: this.info.end
                }) ];
            },
            isMultiple: function() {
                var info = this.info;
                if (info.start.row === info.end.row && info.start.col === info.end.col && info.start.row === info.focus.row && info.start.col === info.focus.col) {
                    return false;
                } else {
                    return !this.cell.isSameMergeCell(info.focus, info.start, info.end);
                }
            },
            isValid: function() {
                return this.info.focus.row !== undefined;
            }
        });
    }
};

//src/core/range/range.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[39] = {
    value: function(require) {
        var RangeFacade = _p.r(38);
        var Range = _p.r(0).create("Range", {
            cell: null,
            dataAccess: null,
            facade: null,
            original: {},
            focus: {},
            start: {},
            end: {},
            base: _p.r(94),
            init: function(dataAccess, cell) {
                this.dataAccess = dataAccess;
                this.cell = cell;
                this.facade = this.createComponent(RangeFacade, cell);
                this.__updateFacade();
                this.registerService({
                    // setter
                    "c.range.focus": this.setFocus,
                    "c.range.selection": this.setSelection,
                    "c.range.disable": this.disable,
                    "c.range.set": this.setRange,
                    // getter
                    "c.range": this.getRange,
                    "c.range.down": this.moveDown,
                    "c.range.up": this.moveUp,
                    "c.range.left": this.moveLeft,
                    "c.range.right": this.moveRight,
                    "c.selection.expand.down": this.expandDown,
                    "c.selection.expand.right": this.expandRight,
                    "c.selection.expand.up": this.expandUp,
                    "c.selection.expand.left": this.expandLeft,
                    "c.select.column": this.selectColumn,
                    "c.select.row": this.selectRow
                });
            },
            setRange: function(focus, start, end) {
                // 传递的是一个RangeFacade对象
                if (!start) {
                    end = focus.getEnd();
                    start = focus.getStart();
                    focus = focus.getFocus();
                }
                this.setFocus(focus.row, focus.col);
                this.setSelection(start, end);
                this.__updateFacade();
                this.postMessage("c.range.change");
            },
            selectColumn: function(startIndex, endIndex) {
                var totalIndex = this.dataAccess.getTotalIndex();
                var totalRowIndex = totalIndex.row;
                var focusCol = startIndex;
                if (endIndex === undefined) {
                    endIndex = startIndex;
                }
                if (startIndex > endIndex) {
                    focusCol = endIndex;
                    endIndex = startIndex;
                    startIndex = focusCol;
                }
                var rowIndex = 0;
                var mergeCell;
                while (rowIndex <= totalRowIndex) {
                    if (this.cell.isMergeCell(rowIndex, startIndex)) {
                        mergeCell = this.cell.getMergeCell(rowIndex, startIndex);
                        rowIndex = mergeCell.end.row + 1;
                    } else {
                        break;
                    }
                }
                // --------- 整列被合并，则进行扩展选中
                if (rowIndex > totalRowIndex) {
                    this.setRange({
                        row: 0,
                        col: startIndex
                    }, {
                        row: 0,
                        col: startIndex
                    }, {
                        row: totalRowIndex,
                        col: endIndex
                    });
                    return;
                }
                this.setFocus(rowIndex, startIndex);
                this.start.row = 0;
                this.start.col = startIndex;
                this.end.row = totalRowIndex;
                this.end.col = endIndex;
                this.__updateFacade();
                this.postMessage("c.range.change");
            },
            selectRow: function(startIndex, endIndex) {
                var totalIndex = this.dataAccess.getTotalIndex();
                var focusRow = startIndex;
                var totalColumnIndex = totalIndex.col;
                if (endIndex === undefined) {
                    endIndex = startIndex;
                }
                if (startIndex > endIndex) {
                    focusRow = endIndex;
                    endIndex = startIndex;
                    startIndex = focusRow;
                }
                var colIndex = 0;
                var mergeCell;
                while (colIndex <= totalColumnIndex) {
                    if (this.cell.isMergeCell(startIndex, colIndex)) {
                        mergeCell = this.cell.getMergeCell(startIndex, colIndex);
                        colIndex = mergeCell.end.col + 1;
                    } else {
                        break;
                    }
                }
                // --------- 整行被合并，则进行扩展选中
                if (colIndex > totalColumnIndex) {
                    this.setRange({
                        row: startIndex,
                        col: 0
                    }, {
                        row: startIndex,
                        col: 0
                    }, {
                        row: endIndex,
                        col: totalColumnIndex
                    });
                    return;
                }
                this.setFocus(startIndex, colIndex);
                this.start.row = startIndex;
                this.start.col = 0;
                this.end.row = endIndex;
                this.end.col = totalColumnIndex;
                this.__updateFacade();
                this.postMessage("c.range.change");
            },
            setFocus: function(row, col) {
                var mergeCell;
                if (row === this.focus.row && col === this.focus.col) {
                    return;
                }
                this.original = {
                    row: row,
                    col: col
                };
                if (this.cell.isMergeCell(row, col)) {
                    mergeCell = this.cell.getMergeCell(row, col);
                    this.focus = {
                        row: mergeCell.start.row,
                        col: mergeCell.start.col
                    };
                    this.start = {
                        row: mergeCell.start.row,
                        col: mergeCell.start.col
                    };
                    this.end = {
                        row: mergeCell.end.row,
                        col: mergeCell.end.col
                    };
                } else {
                    this.focus = {
                        row: row,
                        col: col
                    };
                    this.start = {
                        row: row,
                        col: col
                    };
                    this.end = {
                        row: row,
                        col: col
                    };
                }
                this.__updateFacade();
                this.postMessage("c.focus.change");
                this.postMessage("c.range.change");
            },
            setSelection: function(start, end) {
                var tmp = this.cs("c.cell.compare", start, end);
                start = tmp.min;
                end = tmp.max;
                tmp = this.cell.standardCellRange(start, end);
                this.start.row = tmp.start.row;
                this.start.col = tmp.start.col;
                this.end.row = tmp.end.row;
                this.end.col = tmp.end.col;
                this.__updateFacade();
                this.postMessage("c.range.change");
            },
            expandDown: function(count) {
                var start = this.start;
                var focus = this.focus;
                var end = this.end;
                var limit = this.dataAccess.getTotal().row - 1;
                if (start.row === focus.row) {
                    end.row += count;
                    if (end.row > limit) {
                        end.row = limit;
                    }
                } else {
                    start.row += count;
                    if (start.row > limit) {
                        start.row = limit;
                    }
                }
                var tmp = this.cs("c.cell.compare", start, end);
                this.setSelection(tmp.min, tmp.max);
            },
            expandRight: function(count) {
                var start = this.start;
                var focus = this.focus;
                var end = this.end;
                var limit = this.dataAccess.getTotal().col - 1;
                if (start.col === focus.col) {
                    end.col += count;
                    if (end.col > limit) {
                        end.col = limit;
                    }
                } else {
                    start.col += count;
                    if (start.col > limit) {
                        start.col = limit;
                    }
                }
                var tmp = this.cs("c.cell.compare", start, end);
                this.setSelection(tmp.min, tmp.max);
            },
            expandUp: function(count) {
                var start = this.start;
                var focus = this.focus;
                var end = this.end;
                if (start.row === focus.row) {
                    end.row -= count;
                    if (end.row < 0) {
                        end.row = 0;
                    }
                } else {
                    start.row -= count;
                    if (start.row < 0) {
                        start.row = 0;
                    }
                }
                var tmp = this.cs("c.cell.compare", start, end);
                this.setSelection(tmp.min, tmp.max);
            },
            expandLeft: function(count) {
                var start = this.start;
                var focus = this.focus;
                var end = this.end;
                if (start.col === focus.col) {
                    end.col -= count;
                    if (end.col < 0) {
                        end.col = 0;
                    }
                } else {
                    start.col -= count;
                    if (start.col < 0) {
                        start.col = 0;
                    }
                }
                var tmp = this.cs("c.cell.compare", start, end);
                this.setSelection(tmp.min, tmp.max);
            },
            disable: function() {
                this.original = {};
                this.focus = {};
                this.start = {};
                this.end = {};
                this.__updateFacade();
                this.postMessage("c.range.disabled");
            },
            getRange: function() {
                return this.facade;
            },
            moveDown: function(count) {
                var limit = this.dataAccess.getTotal().row - 1;
                var mergeCell;
                count = count | 0;
                if (count <= 0 || this.focus.row >= limit) {
                    return;
                }
                if (this.cell.isMergeCell(this.original.row, this.original.col)) {
                    mergeCell = this.cell.getMergeCell(this.original.row, this.original.col);
                    count += mergeCell.end.row;
                } else {
                    count += this.original.row;
                }
                if (count > limit) {
                    count = limit;
                }
                this.setFocus(count, this.original.col);
                this.postMessage("c.range.change");
            },
            moveUp: function(count) {
                if (count <= 0 || this.focus.row === 0) {
                    return;
                }
                count = this.focus.row - count;
                if (count < 0) {
                    count = 0;
                }
                this.setFocus(count, this.original.col);
                this.postMessage("c.range.change");
            },
            moveLeft: function(count) {
                if (count <= 0 || this.focus.col === 0) {
                    return;
                }
                count = this.focus.col - count;
                if (count < 0) {
                    count = 0;
                }
                this.setFocus(this.original.row, count);
                this.postMessage("c.range.change");
            },
            moveRight: function(count) {
                var limit = this.dataAccess.getTotal().col - 1;
                var mergeCell;
                count = count | 0;
                if (count <= 0 || this.focus.col >= limit) {
                    return;
                }
                if (this.cell.isMergeCell(this.original.row, this.original.col)) {
                    mergeCell = this.cell.getMergeCell(this.original.row, this.original.col);
                    count += mergeCell.end.col;
                } else {
                    count += this.original.col;
                }
                if (count > limit) {
                    count = limit;
                }
                this.setFocus(this.original.row, count);
                this.postMessage("c.range.change");
            },
            __updateFacade: function() {
                this.facade.reload({
                    focus: this.focus,
                    start: this.start,
                    end: this.end
                });
            }
        });
        Range.deps = [ "dataAccess", "cell" ];
        return Range;
    }
};

//src/core/struct/struct-facade.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[40] = {
    value: function(require) {
        return _p.r(0).create("Struct", {
            dataAccess: null,
            valueModule: null,
            style: null,
            border: null,
            cell: null,
            wraptext: null,
            init: function(dataAccess, valueModule, style, border, cell, wraptext) {
                this.dataAccess = dataAccess;
                this.valueModule = valueModule;
                this.style = style;
                this.border = border;
                this.cell = cell;
                this.wraptext = wraptext;
            },
            getGrid: function() {
                return this.dataAccess.getGrid();
            },
            getOffset: function() {
                return this.dataAccess.getOffset();
            },
            getViewStart: function() {
                return this.dataAccess.getViewStart();
            },
            getViewEnd: function() {
                return this.dataAccess.getViewEnd();
            },
            getVisibleCount: function() {
                return this.dataAccess.getVisibleCount();
            },
            getBorderWidth: function() {
                return this.dataAccess.getBorderWidth();
            },
            getTotal: function() {
                return this.dataAccess.getTotal();
            },
            getTotalIndex: function() {
                return this.dataAccess.getTotalIndex();
            },
            getBoundary: function() {
                return this.dataAccess.getBoundary();
            },
            getDimension: function() {
                return this.dataAccess.getDimension();
            },
            getSpace: function() {
                return this.dataAccess.getSpace();
            },
            getCellByName: function(name) {
                return this.dataAccess.getCellByName();
            },
            getComputedStyle: function(classify, row, col) {
                return this.style.getComputedStyle(classify, row, col);
            },
            getAllComputedStyle: function(row, col) {
                return this.style.getAllComputedStyle(row, col);
            },
            getUserStyle: function(classify, row, col) {
                return this.style.getUserStyle(classify, row, col);
            },
            getDefaultStyle: function(classify) {
                return this.dataAccess.getDefaultStyle(classify);
            },
            getStyleIds: function(classify, start, end) {
                return this.dataAccess.getStyleIds(classify, start, end);
            },
            getStyleById: function(classify, id) {
                return this.dataAccess.getStyleById(classify, id);
            },
            getDisplayValue: function(row, col) {
                return this.wraptext.getDisplayValue(row, col);
            },
            getComputedValue: function(row, col) {
                return this.valueModule.getComputedValue(row, col);
            },
            getStandardValue: function(row, col) {
                return this.valueModule.getStandardValue(row, col);
            },
            getComputedValueInfo: function(row, col) {
                return this.valueModule.getComputedValueInfo(row, col);
            },
            getRawValue: function(row, col) {
                return this.valueModule.getRawValue(row, col);
            },
            getEffectiveIndex: function() {
                return this.dataAccess.getEffectiveIndex();
            },
            getBorder: function(row, col) {
                return this.border.getBorder(row, col);
            },
            getBorders: function(start, end) {
                return this.border.getBorders(start, end);
            },
            getAllMergeCell: function() {
                return this.cell.getAllMergeCell();
            },
            getMergeCell: function(row, col) {
                return this.cell.getMergeCell(row, col);
            },
            isMergeCell: function(row, col) {
                return this.cell.isMergeCell(row, col);
            },
            getMergeCellsInRange: function(range) {
                return this.cell.getMergeCellsInRange(range);
            },
            getColumnWidth: function(col) {
                return this.cell.getColumnWidth(col);
            },
            getRowHeight: function(row) {
                return this.cell.getRowHeight(row);
            }
        });
    }
};

//src/core/struct/struct.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[41] = {
    value: function(require) {
        var StructFacade = _p.r(40);
        var basic = _p.r(32);
        var Struct = _p.r(0).create("Struct", {
            base: _p.r(94),
            //-------- component
            actuary: null,
            dataAccess: null,
            init: function(dataAccess, actuary, valueModule, style, border, cell, wraptext) {
                this.dataAccess = dataAccess;
                this.actuary = actuary;
                this.structFacade = this.createComponent(StructFacade, dataAccess, valueModule, style, border, cell, wraptext);
                this.initService();
            },
            load: function(source) {
                if (!source) {
                    source = this.dataAccess.createSheet();
                } else {
                    source = $._clone(source);
                }
                this.dataAccess.import(source);
                this.actuary.reinit();
                this.actuary.calculate();
            },
            getStruct: function() {
                return this.structFacade;
            },
            initService: function() {
                this.registerService({
                    "c.struct": this.getStruct,
                    "c.load": this.load
                });
            }
        });
        Struct.deps = [ "dataAccess", "actuary", "value", "style", "border", "cell", "wraptext" ];
        return Struct;
    }
};

//src/core/style/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[42] = {
    value: function(require) {
        var TYPE_STYLE = _p.r(43);
        var Style = _p.r(0).create("Style", {
            dataAccess: null,
            valueModule: null,
            base: _p.r(94),
            init: function(dataAccess, valueModule) {
                this.dataAccess = dataAccess;
                this.valueModule = valueModule;
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.setstyle": this.setStyle,
                    "c.batch.setstyle": this.batchSetStyle,
                    "c.clear.style": this.clearStyle,
                    "c.set.column.style": this.setColumnStyle,
                    "c.set.row.style": this.setRowStyle,
                    "c.set.cellstyles": this.setCellStyles
                });
            },
            getAllComputedStyle: function(row, col) {
                var fontStyle = this.getComputedStyle("fonts", row, col);
                var fillStyle = this.getComputedStyle("fills", row, col);
                var alignmentStyle = this.getComputedStyle("alignments", row, col);
                return $.extend({}, fontStyle, fillStyle, alignmentStyle);
            },
            /**
         * 获取指定单元格的计算后的样式表
         * @param row
         * @param col
         */
            getComputedStyle: function(classify, row, col) {
                var userStyle = this.getUserStyle(classify, row, col);
                var typeStyle = this.__getTypeStyle(classify, row, col);
                var formatColor;
                var result;
                result = $._extend($._clone(this.dataAccess.getDefaultStyle(classify)), typeStyle, userStyle);
                if (classify === "font") {
                    formatColor = this.valueModule.getFormatColor(row, col);
                }
                if (formatColor) {
                    result.color = formatColor;
                }
                return result;
            },
            getUserStyle: function(classify, row, col) {
                return this.dataAccess.getStyle(classify, row, col);
            },
            setStyle: function(styleName, styleValue, start, end) {
                this.dataAccess.setStyle(styleName, styleValue, start, end);
                this.postMessage("c.stylechange", start, end);
                this.coreRefresh(true);
            },
            setColumnStyle: function(styleName, styleValue, startIndex, endIndex) {
                var totalIndex = this.dataAccess.getTotalIndex();
                this.dataAccess.setColumnStyle(styleName, styleValue, startIndex, endIndex);
                this.postMessage("c.stylechange", {
                    row: 0,
                    col: startIndex
                }, {
                    row: totalIndex.row,
                    col: endIndex
                });
                this.coreRefresh(true);
            },
            // 设置单元格主题样式
            setCellStyles: function(styleOption, start, end) {
                this.dataAccess.setCellStyles(styleOption, start, end);
                this.coreRefresh(true);
            },
            setRowStyle: function(styleName, styleValue, startIndex, endIndex) {
                var totalIndex = this.dataAccess.getTotalIndex();
                this.dataAccess.setRowStyle(styleName, styleValue, startIndex, endIndex);
                this.postMessage("c.stylechange", {
                    row: startIndex,
                    col: 0
                }, {
                    row: endIndex,
                    col: totalIndex.col
                });
                this.coreRefresh(true);
            },
            clearStyle: function(styleName, start, end) {
                if (!end) {
                    end = start;
                    start = styleName;
                    styleName = undefined;
                    this.dataAccess.clearStyle(start, end);
                } else {
                    this.dataAccess.clearStyle(styleName, start, end);
                }
                this.postMessage("c.stylechange", start, end);
                this.coreRefresh(true);
            },
            /**
         * 批量设置style
         * 根据给定的一个style矩阵和一个起始行列索引，批量应用该style
         * @param styles
         * @param start
         * @param end
         */
            batchSetStyle: function(styles, row, col) {
                var rowCount = styles.length;
                var colCount = 1;
                this.dataAccess.batchSetStyle(styles, row, col);
                for (var i = 0, len = styles.length; i < len; i++) {
                    colCount = Math.max(styles[i].length);
                }
                this.postMessage("c.stylechange", {
                    row: row,
                    col: col
                }, {
                    row: row + rowCount - 1,
                    col: col + colCount - 1
                });
                this.coreRefresh(true);
            },
            /**
         * 根据值的类型获取样式
         */
            __getTypeStyle: function(classify, row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                var style = TYPE_STYLE[cellType];
                if (!style) {
                    return;
                }
                return style[classify];
            }
        });
        Style.deps = [ "dataAccess", "value" ];
        return Style;
    }
};

//src/core/style/type-styles.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[43] = {
    value: {
        TEXT: {},
        NUMBER: {
            alignments: {
                horizontal: "right"
            }
        },
        LOGICAL: {
            alignments: {
                horizontal: "center"
            }
        },
        ERROR: {
            alignments: {
                horizontal: "center"
            }
        }
    }
};

//src/core/value/code-flag.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[44] = {
    value: function() {
        return {
            DECIMAL: 0,
            SCIENTIFIC: 1,
            DATETIME: 2,
            FRACTION: 4
        };
    }
};

//src/core/value/code-parser.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[45] = {
    value: function(require) {
        var cache = {};
        var LOGICAL_OPERATOR_PATTERN = /^(>=|<=|>|<|=)(\d+)/;
        var DATE_TIME_PATTERN = /[HMSymd]/;
        var DATE_PATTERN = /[ymd]/;
        var TIME_PATTERN = /[HMS]/;
        var CODE_FLAG = _p.r(44);
        var COLOR = "[black][blue][cyan][green][magenta][red][white][yellow]";
        return {
            getFormatColor: function(code, segmentIndex) {
                var segments = getSegments(code);
                return (segments[segmentIndex] || segments[0]).color;
            },
            getNumberSegment: function(value, code) {
                var segments = getSegments(code);
                if (value > 0) {
                    return {
                        index: 0,
                        select: 0,
                        segment: segments[0]
                    };
                } else if (value < 0) {
                    if (segments[1]) {
                        return {
                            index: 1,
                            select: 1,
                            segment: segments[1]
                        };
                    }
                    return {
                        index: 1,
                        select: 0,
                        segment: segments[0]
                    };
                } else {
                    if (segments[2]) {
                        return {
                            index: 2,
                            select: 2,
                            segment: segments[2]
                        };
                    }
                    return {
                        index: 2,
                        select: 0,
                        segment: segments[0]
                    };
                }
            },
            getTextSegment: function(code) {
                var segments = getSegments(code);
                return segments[3];
            }
        };
        function getSegments(code) {
            if (cache[code]) {
                return cache[code];
            }
            var segments = [];
            cache[code] = segments;
            var currentSegments;
            var currentCode;
            var c;
            var j;
            var formatResult = formatCode(code);
            var effectiveSymbols = formatResult.effectiveSymbols;
            var effectiveStr;
            code = formatResult.symbols;
            // 格式检测
            for (var i = 0, len = effectiveSymbols.length; i < len; i++) {
                currentSegments = {};
                segments.push(currentSegments);
                effectiveStr = effectiveSymbols[i];
                currentCode = code[i];
                currentSegments.color = currentCode.color;
                currentSegments.condition = currentCode.condition;
                // 日期时间
                if (DATE_TIME_PATTERN.test(effectiveStr)) {
                    currentSegments.flag = CODE_FLAG.DATETIME;
                    currentSegments.value = currentCode;
                    effectiveStr = effectiveStr.replace("AM/PM", "");
                    if (DATE_PATTERN.test(effectiveStr)) {
                        currentSegments.hasDate = true;
                    }
                    if (TIME_PATTERN.test(effectiveStr)) {
                        currentSegments.hasTime = true;
                    }
                    j = 0;
                    while (c = currentCode[j++]) {
                        if (c === "AM/PM" || c === "A/P") {
                            currentSegments.dSign = c;
                            break;
                        }
                    }
                    continue;
                }
                // 科学计数法
                if (effectiveStr.indexOf("e") !== -1) {
                    currentSegments.flag = CODE_FLAG.SCIENTIFIC;
                    j = 0;
                    while (c = currentCode[j++]) {
                        if (c === "e+" || c === "e-") {
                            currentSegments.eSign = c;
                            currentSegments.value = currentCode.slice(0, j);
                            currentSegments.exponent = currentCode.slice(j);
                            break;
                        }
                    }
                    continue;
                }
                // 分数
                if (effectiveStr.indexOf("/") !== -1) {
                    currentSegments.flag = CODE_FLAG.FRACTION;
                    currentSegments.value = currentCode;
                    continue;
                }
                // other
                currentSegments.flag = CODE_FLAG.DECIMAL;
                currentSegments.value = currentCode;
            }
            // 占位符检测
            for (var i = 0, len = segments.length; i < len; i++) {
                currentSegments = segments[i];
                currentSegments.value = analyzeToken(currentSegments.value);
                if (currentSegments.eSign) {
                    currentSegments.exponent = analyzeToken(currentSegments.exponent);
                }
            }
            return segments;
        }
        function formatCode(code) {
            var record = [ [] ];
            var c;
            var str;
            var symbols = [ [] ];
            var index = 0;
            var tmp;
            var originalCode = code.split("");
            code = code.toLowerCase().split("");
            for (var i = 0, len = code.length; i < len; i++) {
                c = code[i];
                switch (c) {
                  case "!":
                  case "\\":
                    record[index].push({
                        str: originalCode[++i],
                        index: symbols[index].length
                    });
                    break;

                  case '"':
                    str = [];
                    while (c = originalCode[++i]) {
                        if (c !== '"') {
                            str.push(c);
                        } else {
                            break;
                        }
                    }
                    record[index].push({
                        str: str.join(""),
                        index: symbols[index].length
                    });
                    break;

                  case "[":
                    str = [];
                    while (c = code[++i]) {
                        if (c !== "]") {
                            str.push(c);
                        } else {
                            break;
                        }
                    }
                    analyzeControlToken(symbols[index], str.join(""));
                    break;

                  case ";":
                    index++;
                    symbols[index] = [];
                    record[index] = [];
                    break;

                  case "_":
                    symbols[index].push(" ");
                    i++;
                    break;

                  case "a":
                    if (code.slice(i + 1, i + 5).join("") === "m/pm") {
                        symbols[index].push(originalCode.slice(i, i + 5).join("").toUpperCase());
                        i += 5;
                    } else if (code.slice(i + 1, i + 3).join("") === "/p") {
                        symbols[index].push(originalCode.slice(i, i + 3).join("").toUpperCase());
                        i += 3;
                    }
                    break;

                  case "e":
                    symbols[index].push(c + code[i + 1]);
                    i++;
                    break;

                  case "y":
                  case "d":
                  case "h":
                  case "s":
                  case "m":
                    str = c;
                    while (tmp = code[i + 1]) {
                        if (c === tmp) {
                            str += tmp;
                            i++;
                        } else {
                            break;
                        }
                    }
                    if (str.indexOf("h") !== -1 || str.indexOf("s") !== -1) {
                        str = str.toUpperCase();
                    }
                    symbols[index].push(str);
                    break;

                  default:
                    symbols[index].push(c.toLowerCase());
                }
            }
            var currentsymbols;
            var currentRecord;
            var hasHour;
            var lastMinuteIndex = -1;
            var effectiveSymbols = [];
            // 日期时间中的"m"调整
            for (var i = 0, len = symbols.length; i < len; i++) {
                currentsymbols = symbols[i];
                hasHour = false;
                lastMinuteIndex = -1;
                for (var j = 0, jlen = currentsymbols.length; j < jlen; j++) {
                    c = currentsymbols[j];
                    if (c.indexOf("H") !== -1) {
                        hasHour = true;
                        continue;
                    }
                    if (c.indexOf("m") !== -1) {
                        if (hasHour) {
                            hasHour = false;
                            currentsymbols[j] = c.toUpperCase();
                        } else {
                            lastMinuteIndex = j;
                        }
                        continue;
                    }
                    if (c.indexOf("S") !== -1 && lastMinuteIndex !== -1) {
                        lastMinuteIndex = -1;
                        currentsymbols[j] = currentsymbols[j].toUpperCase();
                    }
                }
                effectiveSymbols[i] = currentsymbols.join("");
            }
            var prevCodeIndex = -1;
            // 合并连续的文本代码段
            for (var i = 0, len = symbols.length; i < len; i++) {
                currentRecord = record[i];
                tmp = [];
                prevCodeIndex = -1;
                for (var j = 0, jlen = currentRecord.length; j < jlen; j++) {
                    c = currentRecord[j];
                    if (prevCodeIndex !== -1 && c.index === prevCodeIndex) {
                        tmp[tmp.length - 1].str += c.str;
                    } else {
                        tmp.push(c);
                    }
                    prevCodeIndex = c.index;
                }
                record[i] = tmp;
            }
            // 合并文本段和占位符段
            for (var i = 0, len = symbols.length; i < len; i++) {
                currentRecord = record[i];
                currentsymbols = symbols[i];
                for (var j = currentRecord.length - 1; j >= 0; j--) {
                    c = currentRecord[j];
                    currentsymbols.splice(c.index, 0, [ c.str ]);
                }
            }
            return {
                symbols: symbols,
                effectiveSymbols: effectiveSymbols
            };
        }
        function analyzeToken(code) {
            var c;
            var i = 0;
            var isFront = true;
            var result = {
                // 小数点前code，包含小数点本身
                front: [],
                // 小数点后code
                back: [],
                // 前部分中的数字替换符个数
                frontCount: 0,
                // 后部分中的数字替换符个数
                backCount: 0
            };
            var segments = result.front;
            while (c = code[i++]) {
                segments.push(c);
                if ($.isArray(c)) {
                    continue;
                }
                // control
                if (c.charAt(0) === "[") {
                    continue;
                }
                switch (c) {
                  case ".":
                    if (isFront) {
                        isFront = false;
                        segments = result.back;
                    }
                    break;

                  case "0":
                  case "#":
                  case "?":
                    if (isFront) {
                        result.frontCount++;
                    } else {
                        result.backCount++;
                    }
                    break;
                }
            }
            return result;
        }
        function analyzeControlToken(tokenGroup, code) {
            if (COLOR.indexOf("[" + code + "]") !== -1) {
                tokenGroup.color = code;
                return;
            }
            if (LOGICAL_OPERATOR_PATTERN.test(code)) {
                tokenGroup.condition = [ RegExp.$1, parseFloat(RegExp.$2) ];
                return;
            }
            tokenGroup.push("[" + code + "]");
        }
    }
};

//src/core/value/color-manager.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[46] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NumberFormatter = _p.r(61);
        var LOGICAL_VALUE = _p.r(73);
        var CodeParser = _p.r(45);
        return _p.r(0).create("Formatter", {
            dataAccess: null,
            base: _p.r(91),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
            },
            /**
         * 根据传递进来的内容和单元格，获取该内容最适合于该单元格的值和CODE。
         * @param content
         * @param row
         * @param col
         * @returns {*}
         */
            calculateFormatColor: function(row, col) {
                var code = this.dataAccess.getNumberFormat(row, col);
                var rawValue = this.dataAccess.getValue(row, col);
                if (!code || !rawValue) {
                    return undefined;
                }
                var partIndex;
                if (rawValue > 0) {
                    partIndex = 0;
                } else if (rawValue < 0) {
                    partIndex = 1;
                } else {
                    partIndex = 2;
                }
                return CodeParser.getFormatColor(code, partIndex);
            },
            getStandardValue: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (!cellType) {
                    return undefined;
                }
                var rawValue = this.dataAccess.getValue(row, col);
                switch (cellType) {
                  case CELL_TYPE.TEXT:
                  case CELL_TYPE.ERROR:
                    return rawValue;

                  case CELL_TYPE.NUMBER:
                    return NumberFormatter.getStandardValue(rawValue, this.dataAccess.getNumberFormat(row, col));

                  case CELL_TYPE.LOGICAL:
                    return rawValue ? LOGICAL_VALUE.TRUE : LOGICAL_VALUE.FALSE;
                }
            }
        });
    }
};

//src/core/value/format/analyzer.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[47] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var AccurateAnalyzer = _p.r(48);
        return {
            /**
         * 对传递进来的内容进行格式化，并返回格式化后的值和类型
         * @param content
         * @returns {*}
         */
            exec: function(content, numberFormatCode) {
                if (!content) {
                    return {
                        type: CELL_TYPE.UNDEFINED,
                        value: undefined
                    };
                }
                return AccurateAnalyzer.exec(content, numberFormatCode);
            }
        };
    }
};

//src/core/value/format/analyzer/accurate-analyzer.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[48] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NumberAnalyzer = _p.r(51);
        var LogicalAnalyzer = _p.r(50);
        var ErrorAnalyzer = _p.r(49);
        return {
            exec: function(content, numberFormatCode) {
                var result;
                if (!content) {
                    return {
                        type: CELL_TYPE.UNDEFINED,
                        content: undefined
                    };
                }
                var trimContent = content.trim();
                // 检查类型是否是数字类型
                result = NumberAnalyzer.exec(trimContent, numberFormatCode);
                if (result) {
                    return result;
                }
                // 是否是逻辑类型
                result = LogicalAnalyzer.exec(trimContent);
                if (result) {
                    return result;
                }
                // 是否是ERROR类型
                result = ErrorAnalyzer.exec(trimContent);
                if (result) {
                    return result;
                }
                // TODO 处理ARRAY格式
                return {
                    type: CELL_TYPE.TEXT,
                    value: content
                };
            }
        };
    }
};

//src/core/value/format/analyzer/error.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[49] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var ERROR_VALUE = _p.r(71);
        var ERROR_VALUE_STRING = [];
        for (var key in ERROR_VALUE) {
            if (ERROR_VALUE.hasOwnProperty(key)) {
                ERROR_VALUE_STRING.push(ERROR_VALUE[key]);
            }
        }
        ERROR_VALUE_STRING = "," + ERROR_VALUE_STRING.join(",") + ",";
        return {
            exec: function(content) {
                content = content.toUpperCase();
                if (content.indexOf(",") === -1 && ERROR_VALUE_STRING.indexOf("," + content + ",") !== -1) {
                    return {
                        type: CELL_TYPE.ERROR,
                        value: content
                    };
                }
                return false;
            }
        };
    }
};

//src/core/value/format/analyzer/logical.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[50] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var LOGICAL_VALUE = _p.r(73);
        return {
            exec: function(content) {
                content = content.toUpperCase();
                if (content === LOGICAL_VALUE.TRUE || content === LOGICAL_VALUE.FALSE) {
                    return {
                        type: CELL_TYPE.LOGICAL,
                        value: +(content === LOGICAL_VALUE.TRUE) + ""
                    };
                }
                return false;
            }
        };
    }
};

//src/core/value/format/analyzer/number.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[51] = {
    value: function(require) {
        var NumericAnalyzer = _p.r(55);
        var DateTimeAnalyzer = _p.r(53);
        var CurrencyAnalyzer = _p.r(52);
        var PercentAnalyzer = _p.r(56);
        var FractionAnalyzer = _p.r(54);
        var CodeParser = _p.r(45);
        var CODE_FLAG = _p.r(44);
        return {
            exec: function(content, code) {
                var result;
                var segment;
                // 检查类型是否是数字类型
                if ($.isNumeric(content)) {
                    result = NumericAnalyzer.exec(content);
                }
                if (code) {
                    segment = CodeParser.getNumberSegment(content, code).segment;
                }
                // 未设置格式化代码或者格式化代码中包含日期时间格式时，优先进行日期检查
                if (!code || segment.flag & (CODE_FLAG.DATE | CODE_FLAG.TIME | CODE_FLAG.DATETIME)) {
                    // 日期检查
                    if (!result) {
                        result = DateTimeAnalyzer.exec(content);
                    }
                    // 分数检查
                    if (!result) {
                        result = FractionAnalyzer.exec(content);
                    }
                } else {
                    // 分数检查
                    if (!result) {
                        result = FractionAnalyzer.exec(content);
                    }
                    // 日期检查
                    if (!result) {
                        result = DateTimeAnalyzer.exec(content);
                    }
                }
                // 货币检查
                if (!result) {
                    result = CurrencyAnalyzer.exec(content);
                }
                // 百分比检查
                if (!result) {
                    result = PercentAnalyzer.exec(content);
                }
                if (result) {
                    return result;
                }
                return false;
            }
        };
    }
};

//src/core/value/format/analyzer/number/currency.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[52] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var PATTERN = /^(?:\$|¥)([\s\S]+)$/;
        var FORMAT_CODE = _p.r(72);
        return {
            exec: function(content) {
                if (!PATTERN.test(content)) {
                    return false;
                }
                if (!$.isNumeric(RegExp.$1)) {
                    return false;
                }
                return {
                    type: CELL_TYPE.NUMBER,
                    subType: NUMBER_FORMAT.CURRENCY,
                    format: FORMAT_CODE._default[NUMBER_FORMAT.CURRENCY],
                    value: +RegExp.$1 + ""
                };
            }
        };
    }
};

//src/core/value/format/analyzer/number/datetime.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[53] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var DateTimeConverter = _p.r(57);
        var FORMAT_CODE = _p.r(72);
        var MAX_YEAR = 9999;
        var MIN_YEAR = 1900;
        return {
            exec: function(content) {
                var result;
                result = checkDate(content);
                if (result) {
                    return {
                        type: CELL_TYPE.NUMBER,
                        subType: NUMBER_FORMAT.DATE,
                        format: FORMAT_CODE._default[NUMBER_FORMAT.DATE],
                        value: DateTimeConverter.dateToNumber(result.year, result.month, result.day) + ""
                    };
                }
                result = checkTime(content);
                if (result) {
                    return {
                        type: CELL_TYPE.NUMBER,
                        subType: NUMBER_FORMAT.TIME,
                        format: FORMAT_CODE._default[NUMBER_FORMAT.TIME],
                        value: DateTimeConverter.timeToNumber(result.hour, result.minute, result.second) + ""
                    };
                }
                return false;
            }
        };
        function checkDate(content) {
            var year;
            var month;
            var day;
            if (/^(\d{1,4})年(\d{1,2})月(\d{1,2})日$/i.test(content) || /^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/i.test(content)) {
                year = RegExp.$1;
                month = RegExp.$2;
                day = RegExp.$3;
                if (year.length === 2) {
                    year = "20" + year;
                } else if (year.length === 1) {
                    year = "200" + year;
                }
            } else if (/^\d{1,2}月\d{1,2}日$/i.test(content) || /^(\d{1,2})[\/\-](\d{1,2})$/i.test(content)) {
                year = new Date().getFullYear() + "";
                month = RegExp.$1;
                day = RegExp.$2;
            } else if (/^\d{1,4}年\d{1,2}月$/i.test(content)) {
                year = RegExp.$1;
                month = RegExp.$2;
                day = new Date().getDate() + "";
            } else {
                return false;
            }
            if (!validateDate(+year, +month, +day)) {
                return false;
            }
            return {
                year: +year,
                month: +month,
                day: +day
            };
        }
        function checkTime(content) {
            var hour;
            var minute;
            var second;
            if (/^(\d{1,2})时(\d{1,2})分(\d{1,2})秒$/i.test(content) || /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/i.test(content)) {
                hour = RegExp.$1;
                minute = RegExp.$2;
                second = RegExp.$3;
            } else if (/^\d{1,2}时\d{1,2}分$/i.test(content) || /^(\d{1,2}):(\d{1,2})$/i.test(content)) {
                hour = RegExp.$1;
                minute = RegExp.$2;
                second = "0";
            } else if (/^\d{1,2}分\d{1,2}秒$/i.test(content)) {
                hour = "0";
                minute = RegExp.$1;
                second = RegExp.$2;
            } else {
                return false;
            }
            if (!validateTime(+hour, +minute, +second)) {
                return false;
            }
            return {
                hour: +hour,
                minute: +minute,
                second: +second
            };
        }
        function validateDate(year, month, day) {
            if (year > MAX_YEAR || year < MIN_YEAR) {
                return false;
            }
            var tmp = new Date(Date.UTC(year, month - 1, day));
            if (tmp.getUTCDate() !== day) {
                return false;
            }
            if (tmp.getUTCMonth() !== month - 1) {
                return false;
            }
            if (tmp.getUTCFullYear() !== year) {
                return false;
            }
            return true;
        }
        function validateTime(hour, minute, second) {
            if (hour >= 24 || hour < 0) {
                return false;
            }
            if (minute >= 60 || minute < 0) {
                return false;
            }
            if (second >= 60 || second < 0) {
                return false;
            }
            return true;
        }
    }
};

//src/core/value/format/analyzer/number/fraction.js
/**
 * @file 百分比分析器
 * @author hancong03@baiud.com
 */
_p[54] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var PATTERN = /^(?:(\d+)\s)?(\d+)\/(\d+)$/;
        var FORMAT_CODE = _p.r(72);
        return {
            exec: function(content) {
                var mixed;
                var numerator;
                var denominator;
                if (!PATTERN.test(content)) {
                    return false;
                }
                mixed = +RegExp.$1;
                numerator = +RegExp.$2;
                denominator = +RegExp.$3;
                return {
                    type: CELL_TYPE.NUMBER,
                    subType: NUMBER_FORMAT.FRACTION,
                    format: FORMAT_CODE._default[NUMBER_FORMAT.FRACTION],
                    value: mixed + numerator / denominator + ""
                };
            }
        };
    }
};

//src/core/value/format/analyzer/number/numeric.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[55] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var FORMAT_CODE = _p.r(72);
        return {
            exec: function(content) {
                if (content.toLowerCase().indexOf("e") !== -1) {
                    return {
                        type: CELL_TYPE.NUMBER,
                        subType: NUMBER_FORMAT.SCIENTIFIC,
                        format: FORMAT_CODE._default[NUMBER_FORMAT.SCIENTIFIC],
                        value: +content + ""
                    };
                }
                return {
                    type: CELL_TYPE.NUMBER,
                    subType: NUMBER_FORMAT.GENERAL,
                    value: +content + ""
                };
            }
        };
    }
};

//src/core/value/format/analyzer/number/percent.js
/**
 * @file 百分比分析器
 * @author hancong03@baiud.com
 */
_p[56] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var PATTERN = /^([\s\S]+)%$/;
        var FORMAT_CODE = _p.r(72);
        return {
            exec: function(content) {
                if (!PATTERN.test(content)) {
                    return false;
                }
                if (!$.isNumeric(RegExp.$1)) {
                    return false;
                }
                return {
                    type: CELL_TYPE.NUMBER,
                    subType: NUMBER_FORMAT.PERCENT,
                    format: FORMAT_CODE._default[NUMBER_FORMAT.PERCENT],
                    value: +RegExp.$1 + ""
                };
            }
        };
    }
};

//src/core/value/format/converter/datetime.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[57] = {
    value: function(require) {
        var START_DATE = Date.UTC(1900, 0, 0);
        var DAY_STEP = 24 * 60 * 60 * 1e3;
        var SECOND_OF_HOUR = 60 * 60;
        var SECOND_OF_DAY = 24 * 60 * 60;
        var SECOND_UNIT = 1 / SECOND_OF_DAY;
        return {
            dateToNumber: function(year, month, day) {
                var diff = Date.UTC(year, month - 1, day) - START_DATE;
                return diff / DAY_STEP;
            },
            timeToNumber: function(hour, minute, second) {
                return (hour * SECOND_OF_HOUR + minute * 60 + second) * SECOND_UNIT;
            },
            numberToDate: function(number) {
                number = parseInt(number, 10);
                var date = new Date(number * DAY_STEP + START_DATE);
                return {
                    year: date.getUTCFullYear(),
                    month: date.getUTCMonth() + 1,
                    day: date.getUTCDate(),
                    weekday: date.getUTCDay()
                };
            },
            numberToTime: function(number) {
                number = number - parseInt(number, 10);
                if (number === 0) {
                    return {
                        hour: 0,
                        minute: 0,
                        second: 0,
                        totalSecond: 0
                    };
                }
                var totalSecond = Math.round(number / SECOND_UNIT);
                var hour = Math.floor(totalSecond / SECOND_OF_HOUR);
                return {
                    hour: hour,
                    minute: Math.floor(totalSecond % SECOND_OF_HOUR / 60),
                    second: totalSecond % 60,
                    totalSecond: totalSecond,
                    am: hour < 12
                };
            }
        };
    }
};

//src/core/value/format/format.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[58] = {
    value: function(require) {
        var Analyzer = _p.r(47);
        return _p.r(0).create("Format", {
            dataAccess: null,
            base: _p.r(91),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
            },
            /**
         * 根据传递进来的内容和单元格，获取该内容最适合于该单元格的值和CODE。
         * @param content
         * @param row
         * @param col
         * @returns {*}
         */
            analyzeFormatInfo: function(content, row, col) {
                return Analyzer.exec(content, this.dataAccess.getNumberFormat(row, col));
            }
        });
    }
};

//src/core/value/formatter/format-util.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[59] = {
    value: function(require) {
        // 字面量列表
        // 句点（.）也按字面量进行处理
        var LITERAL = "$¥+(:^'{<=-/)&~}> .";
        return {
            formatLeftPart: function(value, segment) {
                value = value.split("");
                return __doFrontFormat(value, segment);
            },
            formatRightPart: function(value, segment) {
                value = value.split("");
                return __doBackFormat(value, segment);
            }
        };
        function __doFrontFormat(value, segment) {
            var result = [];
            var currentValueChar;
            var currentCodeChar;
            var firstString = "";
            var endIndex = 0;
            if ($.isArray(segment[0])) {
                endIndex = 1;
                firstString = segment[0][0];
            }
            var valueIndex = value.length - 1;
            for (var i = segment.length - 1; i >= endIndex; i--) {
                currentCodeChar = segment[i];
                currentValueChar = value[valueIndex];
                // 纯文本， 直接输入
                if ($.isArray(currentCodeChar)) {
                    result.push(currentCodeChar[0]);
                    continue;
                }
                if (LITERAL.indexOf(currentCodeChar) !== -1) {
                    result.push(currentCodeChar);
                    continue;
                }
                // TODO 暂时不处理*
                if (currentCodeChar === "*") {
                    continue;
                }
                if (currentCodeChar === "," && currentValueChar) {
                    result.push(currentCodeChar);
                    continue;
                }
                if (currentCodeChar === "%") {
                    result.push(currentCodeChar);
                    continue;
                }
                // 增加value index
                valueIndex--;
                if (currentCodeChar === "0") {
                    result.push(currentValueChar || 0);
                    continue;
                }
                if (currentCodeChar === "#" && currentValueChar) {
                    result.push(currentValueChar);
                    continue;
                }
                if (currentCodeChar === "?" && currentValueChar) {
                    result.push(currentValueChar || " ");
                    continue;
                }
            }
            value = value.slice(0, valueIndex + 1);
            return firstString + value.join("") + result.reverse().join("");
        }
        function __doBackFormat(value, segment) {
            var result = [];
            var currentValueChar;
            var currentCodeChar;
            var valueIndex = 0;
            for (var i = 0, len = segment.length; i < len; i++) {
                currentCodeChar = segment[i];
                currentValueChar = value[valueIndex];
                // 纯文本， 直接输入
                if ($.isArray(currentCodeChar)) {
                    result.push(currentCodeChar[0]);
                    continue;
                }
                if (LITERAL.indexOf(currentCodeChar) !== -1) {
                    result.push(currentCodeChar);
                    continue;
                }
                // TODO 暂时不处理*
                if (currentCodeChar === "*") {
                    continue;
                }
                if (currentCodeChar === ",") {
                    result.push(currentValueChar);
                    continue;
                }
                if (currentCodeChar === "%") {
                    result.push(currentCodeChar);
                    continue;
                }
                // 增加value index
                valueIndex++;
                if (currentCodeChar === "0") {
                    result.push(currentValueChar || 0);
                    continue;
                }
                if (currentCodeChar === "#" && currentValueChar) {
                    result.push(currentValueChar);
                    continue;
                }
                if (currentCodeChar === "?" && currentValueChar) {
                    result.push(currentValueChar || " ");
                    continue;
                }
            }
            return result.join("");
        }
    }
};

//src/core/value/formatter/formatter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[60] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NumberFormatter = _p.r(61);
        var TextFormatter = _p.r(66);
        var LOGICAL_VALUE = _p.r(73);
        return _p.r(0).create("Formatter", {
            dataAccess: null,
            base: _p.r(91),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
            },
            /**
         * 根据传递进来的内容和单元格，获取该内容最适合于该单元格的值和CODE。
         * @param content
         * @param row
         * @param col
         * @returns {*}
         */
            getValue: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (!cellType) {
                    return undefined;
                }
                var rawValue = this.dataAccess.getValue(row, col);
                switch (cellType) {
                  // text 和 logical都需要经过"文本"格式化
                    case CELL_TYPE.LOGICAL:
                    rawValue = rawValue ? LOGICAL_VALUE.TRUE : LOGICAL_VALUE.FALSE;

                  // break 省略
                    case CELL_TYPE.TEXT:
                    return TextFormatter.exec(rawValue, this.dataAccess.getNumberFormat(row, col));
                    break;

                  case CELL_TYPE.NUMBER:
                    return NumberFormatter.exec(rawValue, this.dataAccess.getNumberFormat(row, col));
                    break;

                  case CELL_TYPE.ERROR:
                    return rawValue;
                    break;
                }
            },
            getStandardValue: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (!cellType) {
                    return undefined;
                }
                var rawValue = this.dataAccess.getValue(row, col);
                switch (cellType) {
                  case CELL_TYPE.TEXT:
                  case CELL_TYPE.ERROR:
                    return rawValue;

                  case CELL_TYPE.NUMBER:
                    return NumberFormatter.getStandardValue(rawValue, this.dataAccess.getNumberFormat(row, col));

                  case CELL_TYPE.LOGICAL:
                    return rawValue ? LOGICAL_VALUE.TRUE : LOGICAL_VALUE.FALSE;
                }
            }
        });
    }
};

//src/core/value/formatter/number.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[61] = {
    value: function(require) {
        var CodeParser = _p.r(45);
        var DecimalFormatter = _p.r(63);
        var ScientificFormatter = _p.r(65);
        var DateTimeFormatter = _p.r(62);
        var FractionFormatter = _p.r(64);
        var CODE_FLAG = _p.r(44);
        var FORMAT_CODE = _p.r(72);
        return {
            exec: function(value, code) {
                if (value === undefined) {
                    return undefined;
                }
                if (!code) {
                    return value;
                }
                var segmentInfo = CodeParser.getNumberSegment(value, code);
                switch (segmentInfo.segment.flag) {
                  case CODE_FLAG.DECIMAL:
                    return DecimalFormatter.exec(value, segmentInfo);

                  case CODE_FLAG.SCIENTIFIC:
                    return ScientificFormatter.exec(value, segmentInfo);

                  case CODE_FLAG.DATETIME:
                    return DateTimeFormatter.exec(value, segmentInfo);

                  case CODE_FLAG.FRACTION:
                    return FractionFormatter.exec(value, segmentInfo);
                }
            },
            getStandardValue: function(value, code) {
                if (!code) {
                    return value;
                }
                var segmentInfo = CodeParser.getNumberSegment(value, code);
                var segment = segmentInfo.segment;
                switch (segment.flag) {
                  case CODE_FLAG.DATETIME:
                    if (segment.hasDate && segment.hasTime) {
                        segmentInfo = CodeParser.getNumberSegment(value, FORMAT_CODE._default["DATETIME"]);
                    } else if (segment.hasDate) {
                        segmentInfo = CodeParser.getNumberSegment(value, FORMAT_CODE._default["DATE"]);
                    } else {
                        segmentInfo = CodeParser.getNumberSegment(value, FORMAT_CODE._default["TIME"]);
                    }
                    return DateTimeFormatter.exec(value, segmentInfo);

                  default:
                    return value;
                }
            }
        };
    }
};

//src/core/value/formatter/number/datetime.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[62] = {
    value: function(require) {
        var DateTimeConverter = _p.r(57);
        var MEDIUM_MONTH = [ "", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var SHORT_MONTH = [ "", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D" ];
        var FULL_MONTH = [ "", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        var SHORT_WEEKDAY = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
        var FULL_WEEKDAY = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thurday", "Friday", "Saturday" ];
        // 字面量列表
        // 句点（.）也按字面量进行处理
        var LITERAL = "$¥+(:^'{<=-/)&~}> .";
        return {
            exec: function(value, segmentInfo) {
                if (value < 0 || value > 2958465) {
                    return undefined;
                }
                return format(value, segmentInfo.segment.value.front, segmentInfo.segment.dSign);
            }
        };
        function format(value, codeSegment, sign) {
            var dateValue = DateTimeConverter.numberToDate(value);
            var timeValue = DateTimeConverter.numberToTime(value);
            if (sign) {
                timeValue.hour %= 12;
            }
            var result = [];
            var currentCodeChar;
            for (var i = 0, len = codeSegment.length; i < len; i++) {
                currentCodeChar = codeSegment[i];
                // 纯文本， 直接输入
                if (typeof currentCodeChar !== "string") {
                    result.push(currentCodeChar.join(""));
                    continue;
                }
                if (LITERAL.indexOf(currentCodeChar) !== -1) {
                    result.push(currentCodeChar);
                    continue;
                }
                // TODO 暂时不处理*
                if (currentCodeChar === "*") {
                    continue;
                }
                switch (currentCodeChar) {
                  case "m":
                    result.push(dateValue.month);
                    break;

                  case "mm":
                    result.push(dateValue.month < 10 ? "0" + dateValue.month : dateValue.month);
                    break;

                  case "mmm":
                    result.push(MEDIUM_MONTH[dateValue.month]);
                    break;

                  case "mmmm":
                    result.push(FULL_MONTH[dateValue.month]);
                    break;

                  case "mmmmm":
                    result.push(SHORT_MONTH[dateValue.month]);
                    break;

                  case "d":
                    result.push(dateValue.day);
                    break;

                  case "dd":
                    result.push(dateValue.day < 10 ? "0" + dateValue.day : dateValue.day);
                    break;

                  case "ddd":
                    result.push(SHORT_WEEKDAY[dateValue.weekday]);
                    break;

                  case "dddd":
                    result.push(FULL_WEEKDAY[dateValue.weekday]);
                    break;

                  case "yy":
                    result.push((dateValue.year + "").substring(2));
                    break;

                  case "yyyy":
                    result.push(dateValue.year);
                    break;

                  case "H":
                    result.push(timeValue.hour);
                    break;

                  case "HH":
                    result.push(timeValue.hour < 10 ? "0" + timeValue.hour : timeValue.hour);
                    break;

                  case "M":
                    result.push(timeValue.minute);
                    break;

                  case "MM":
                    result.push(timeValue.minute < 10 ? "0" + timeValue.minute : timeValue.minute);
                    break;

                  case "S":
                    result.push(timeValue.second);
                    break;

                  case "SS":
                    result.push(timeValue.second < 10 ? "0" + timeValue.second : timeValue.second);
                    break;

                  case "A/P":
                    timeValue.am ? result.push("A") : result.push("P");
                    break;

                  case "AM/PM":
                    timeValue.am ? result.push("AM") : result.push("PM");
                    break;
                }
            }
            return result.join("");
        }
    }
};

//src/core/value/formatter/number/decimal.js
/**
 * @file 数值 格式化器
 * @author hancong03@baiud.com
 */
_p[63] = {
    value: function(require) {
        var FormatUtil = _p.r(59);
        return {
            exec: function(value, segmentInfo) {
                var segment = segmentInfo.segment;
                if (segmentInfo.index == 1 && segmentInfo.select === 1) {
                    value = Math.abs(value) + "";
                }
                value = (+value).toFixed(segment.value.backCount);
                value = (value + "").split(".");
                var front = value[0];
                var back = value[1] || "";
                front = FormatUtil.formatLeftPart(front, segment.value.front);
                back = FormatUtil.formatRightPart(back, segment.value.back);
                return front + back;
            }
        };
    }
};

//src/core/value/formatter/number/fraction.js
/**
 * @file 数值 格式化器
 * @author hancong03@baiud.com
 */
_p[64] = {
    value: function(require) {
        var FormatUtil = _p.r(59);
        return {
            exec: function(value, segmentInfo) {
                debugger;
            }
        };
    }
};

//src/core/value/formatter/number/scientific.js
/**
 * @file 科学计数法-格式化器
 * @author hancong03@baiud.com
 */
_p[65] = {
    value: function(require) {
        var FormatUtil = _p.r(59);
        var SPLIT_PATTERN = /(\d+)(?:\.(\d+))?e([+-])(\d+)/i;
        return {
            exec: function(value, segmentInfo) {
                var segment = segmentInfo.segment;
                if (segmentInfo.index == 1 && segmentInfo.select === 1) {
                    value = Math.abs(value) + "";
                }
                value = (+value).toExponential(segment.value.backCount);
                var match = SPLIT_PATTERN.exec(value);
                var intValue = FormatUtil.formatLeftPart(match[1], segment.value.front);
                var decimalValue = "";
                if (match[2]) {
                    decimalValue = FormatUtil.formatRightPart(match[2], segment.value.back);
                }
                var exponentValue = FormatUtil.formatLeftPart(match[4], segment.exponent.front);
                var exponentDecimalValue = FormatUtil.formatLeftPart("", segment.exponent.back);
                var exponentSign = segment.eSign;
                var sign;
                if (match[3] === "-") {
                    sign = "-";
                } else {
                    if (exponentSign === "e+") {
                        sign = "+";
                    } else {
                        sign = "";
                    }
                }
                return intValue + decimalValue + "E" + sign + exponentValue + exponentDecimalValue;
            }
        };
    }
};

//src/core/value/formatter/text.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[66] = {
    value: function(require) {
        var CodeParseer = _p.r(45);
        return {
            exec: function(value, code) {
                if (value === undefined) {
                    return undefined;
                }
                if (!code) {
                    return value;
                }
                var segment = CodeParseer.getTextSegment(code);
                if (!segment) {
                    return value;
                }
                debugger;
            }
        };
    }
};

//src/core/value/value.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[67] = {
    value: function(require) {
        var CELL_TYPE = _p.r(70);
        var NUMBER_FORMAT = _p.r(75);
        var Format = _p.r(58);
        var Formatter = _p.r(60);
        var ColorManager = _p.r(46);
        var Value = _p.r(0).create("Value", {
            dataAccess: null,
            format: null,
            formatter: null,
            colorManager: null,
            base: _p.r(94),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
                this.format = this.createComponent(Format, dataAccess);
                this.formatter = this.createComponent(Formatter, dataAccess);
                this.colorManager = this.createComponent(ColorManager, dataAccess);
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.write": this.writeCell,
                    "c.content": this.getDisplayValue,
                    "c.batch.write": this.batchWriteCell,
                    "c.clear.content": this.clearContent,
                    "c.set.format": this.setFormat
                });
            },
            writeCell: function(content, row, col) {
                this.corePrepareRefresh();
                // ------ 清除相关数据
                this.clearFormula(row, col);
                this.dataAccess.clearCellType(row, col);
                this.dataAccess.clearValue(row, col);
                this.dataAccess.clearComputedValue(row, col);
                this.dataAccess.clearFormatColor(row, col);
                this.postMessage("c.contentchange", row, col);
                // 在写入前对内容进行编码
                var content = this.cs("c.encode.content", content);
                // auto format
                var formatInfo = this.format.analyzeFormatInfo(content, row, col);
                if (formatInfo.type !== CELL_TYPE.UNDEFINED) {
                    this.dataAccess.setCellType(formatInfo.type, row, col);
                    this.dataAccess.setValue(formatInfo.value, row, col);
                    // 当前输入的内容被解析为数字类型时，动态调整当前单元格的数字格式
                    if (formatInfo.type === CELL_TYPE.NUMBER && formatInfo.subType !== NUMBER_FORMAT.GENERAL) {
                        this.dataAccess.setNumberFormat(formatInfo.format, {
                            row: row,
                            col: col
                        }, {
                            row: row,
                            col: col
                        });
                    }
                }
                if (formatInfo.type === CELL_TYPE.TEXT && formatInfo.value.charAt(0) === "=" && formatInfo.value.trim().length > 1) {
                    this.recordFormula(formatInfo.value, row, col);
                }
                this.coreRefresh();
            },
            setFormat: function(formatCode, start, end) {
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        this.dataAccess.clearComputedValue(i, j);
                        this.dataAccess.clearFormatColor(i, j);
                    }
                }
                this.dataAccess.setNumberFormat(formatCode, start, end);
                this.coreRefresh(true);
            },
            batchWriteCell: function(contents, row, col) {
                var rowContents;
                this.corePrepareRefresh();
                for (var i = 0, len = contents.length; i < len; i++) {
                    rowContents = contents[i];
                    for (var j = 0, jlen = rowContents.length; j < jlen; j++) {
                        this.writeCell(rowContents[j], row + i, col + j);
                    }
                }
                this.coreRefresh();
            },
            getFormatColor: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (cellType !== CELL_TYPE.NUMBER) {
                    return undefined;
                }
                var color = this.dataAccess.getFormatColor(row, col);
                if (!color) {
                    color = this.colorManager.calculateFormatColor(row, col);
                    if (!color) {
                        color = "none";
                    }
                    this.dataAccess.setFormatColor(color, row, col);
                }
                if (color === "none") {
                    return undefined;
                }
                return color;
            },
            clearContent: function(ranges) {
                var range;
                var start;
                var end;
                for (var i = 0, len = ranges.length; i < len; i++) {
                    range = ranges[i];
                    start = range.start;
                    end = range.end;
                    for (var i = start.row, limit = end.row; i <= limit; i++) {
                        for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                            this.clearFormula(i, j);
                            this.dataAccess.clearCellType(i, j);
                            this.dataAccess.clearValue(i, j);
                            this.dataAccess.clearComputedValue(i, j);
                            this.dataAccess.clearFormatColor(i, j);
                        }
                    }
                    this.postMessage("c.contentchange", start, end);
                }
                this.coreRefresh(true);
            },
            getComputedValue: function(row, col) {
                return this.getComputedValueInfo(row, col).value;
            },
            /**
         * 返回单元格进过计算后的值的信息， 包含计算后的值和该值的类型
         * 该方法计算单元格的值不同于getRawValue的地方在于：
         * 如果单元格为公式，则getComputedValueInfo()方法会计算该公式，然后返回计算结果作为值，且以计算后结果的类型作为最终的类型
         * @param row
         * @param col
         * @returns {{type: *, value: *}}
         */
            getComputedValueInfo: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (!cellType) {
                    return {
                        type: CELL_TYPE.UNDEFINED,
                        value: undefined
                    };
                }
                var computedValue = this.dataAccess.getComputedValue(row, col);
                if (!computedValue) {
                    computedValue = this.formatter.getValue(row, col);
                    this.dataAccess.setComputedValue(computedValue, row, col);
                }
                return {
                    type: cellType,
                    value: computedValue
                };
            },
            /**
         * 获取一个最符合当前单元格内容类型和格式的值。
         * 该值以最精确、最简单的方式展现。
         * 注：该值适合于输入框内的值
         * @param row
         * @param col
         */
            getStandardValue: function(row, col) {
                var cellType = this.dataAccess.getCellType(row, col);
                if (!cellType) {
                    return "";
                }
                var standardValue = this.dataAccess.getStandardValue(row, col);
                if (!standardValue) {
                    standardValue = this.formatter.getStandardValue(row, col);
                    this.dataAccess.setStandardValue(standardValue);
                }
                return standardValue;
            },
            getRawValue: function(row, col) {
                return this.dataAccess.getValue(row, col);
            },
            getRawType: function(row, col) {
                var type = this.dataAccess.getType(row, col);
                if (type) {
                    return type;
                }
                var rawValue = this.dataAccess.getValue(row, col);
                rawValue = this.format.writeFormat(rawValue, row, col);
                this.dataAccess.setType(rawValue.type, row, col);
                return rawValue.type;
            },
            recordFormula: function(content, row, col) {
                var tokens = this.cs("c.formula.parse", content);
                this.dataAccess.setFormula(tokens, row, col);
            },
            clearFormula: function(row, col) {
                this.dataAccess.setFormula(null, row, col);
            }
        });
        Value.deps = [ "dataAccess" ];
        return Value;
    }
};

//src/core/view.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[68] = {
    value: function(require) {
        var View = _p.r(0).create("View", {
            dataAccess: null,
            base: _p.r(94),
            init: function(dataAccess) {
                this.dataAccess = dataAccess;
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.scrollto": this.scrollTo,
                    "c.row.scrollto": this.scrollRowTo,
                    "c.col.scrollto": this.scrollColTo,
                    "c.row.scroll": this.scrollRow,
                    "c.col.scroll": this.scrollCol
                });
            },
            scrollRowTo: function(row, toEnd) {
                if (!toEnd) {
                    return this.__resetRowToStart(row);
                } else {
                    return this.__resetRowToEnd(row);
                }
            },
            scrollColTo: function(col, toEnd) {
                if (!toEnd) {
                    return this.__resetColumnToStart(col);
                } else {
                    return this.__resetColumnToEnd(col);
                }
            },
            scrollTo: function(row, col) {
                this.__resetRowToStart(row);
                this.__resetColumnToStart(col);
            },
            scrollRow: function(row) {
                var viewStart = this.dataAccess.getViewStart();
                return this.__resetRowToStart(row + viewStart.row);
            },
            scrollCol: function(col) {
                var viewStart = this.dataAccess.getViewStart();
                return this.__resetColumnToStart(col + viewStart.col);
            },
            __resetRowToStart: function(row) {
                var total = this.dataAccess.getTotal();
                if (row < 0) {
                    row = 0;
                } else if (row >= total.row) {
                    row = total.row - 1;
                }
                var viewStart = this.dataAccess.getViewStart();
                if (row === viewStart.row) {
                    return;
                }
                this.dataAccess.setViewStart(row, viewStart.col);
                this.coreRefresh(true);
            },
            __resetRowToEnd: function(row) {
                var total = this.dataAccess.getTotal();
                if (row < 0) {
                    row = 0;
                } else if (row >= total.row) {
                    row = total.row - 1;
                }
                var viewEnd = this.dataAccess.getViewEnd();
                this.dataAccess.setViewEnd(row, viewEnd.col);
                // 建议actuary在下一次计算时执行逆序计算
                this.postMessage("c.row.calculation.reverse");
                this.coreRefresh(true);
            },
            __resetColumnToStart: function(col) {
                var total = this.dataAccess.getTotal();
                if (col < 0) {
                    col = 0;
                } else if (col >= total.col) {
                    col = total.col - 1;
                }
                var viewStart = this.dataAccess.getViewStart();
                if (col === viewStart.col) {
                    return;
                }
                this.dataAccess.setViewStart(viewStart.row, col);
                this.coreRefresh(true);
            },
            __resetColumnToEnd: function(col) {
                var total = this.dataAccess.getTotal();
                if (col < 0) {
                    col = 0;
                } else if (col >= total.col) {
                    col = total.col - 1;
                }
                var viewEnd = this.dataAccess.getViewEnd();
                this.dataAccess.setViewEnd(viewEnd.row, col);
                // 建议actuary在下一次计算时执行逆序计算
                this.postMessage("c.col.calculation.reverse");
                this.coreRefresh(true);
            }
        });
        View.deps = [ "dataAccess" ];
        return View;
    }
};

//src/core/wraptext.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[69] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var DEFAULT_CELL_WIDTH = SYS_CONFIG.cell.width;
        var CONTENT_PADDING = SYS_CONFIG.CONTENT_PADDING;
        var BORDER_WIDTH = SYS_CONFIG.border.width;
        var CANDIDATE_FONT = SYS_CONFIG.CANDIDATE_FONT;
        var Wraptext = _p.r(0).create("Wraptext", {
            shadowCanvas: null,
            canvasContext: null,
            dataAccess: null,
            valueModule: null,
            styleModule: null,
            cellModule: null,
            base: _p.r(94),
            init: function(dataAccess, valueModule, styleModule) {
                this.dataAccess = dataAccess;
                this.styleModule = styleModule;
                this.valueModule = valueModule;
                this.shadowCanvas = this.createElement("canvas");
                this.canvasContext = this.shadowCanvas.getContext("2d");
                this.shadowCanvas.width = 1;
                this.shadowCanvas.height = 1;
                this.initMessageHook();
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.contentchange": this.__contentChange,
                    "c.stylechange": this.__styleChange,
                    "c.columnresize": this.__columnResize,
                    "c.rowresize": this.__rowResize,
                    "c.mergechange": this.__mergeChange
                });
            },
            /**
         * 获取用于显示的值
         * 用于显示的值是经过格式化后的值
         */
            getDisplayValue: function(row, col) {
                var aligmentStyle = this.styleModule.getComputedStyle("alignments", row, col);
                var computedValue = this.valueModule.getComputedValue(row, col);
                if (aligmentStyle.wraptext) {
                    return this.__getContent(computedValue, row, col);
                }
                return computedValue;
            },
            __getContent: function(content, row, col) {
                if (!content) {
                    return;
                }
                var record = this.dataAccess.getWraptextRecord(row, col);
                if (record) {
                    return record;
                }
                var style = this.styleModule.getComputedStyle("fonts", row, col);
                var contents = this.__getWrapText(style, content, row, col);
                this.dataAccess.recordWraptext(contents, row, col);
                return contents;
            },
            __getWrapText: function(style, content, row, col) {
                var canvasContext = this.canvasContext;
                var cellWidth;
                var mergeCell;
                canvasContext.font = [ style.italic ? "italic" : "normal", style.bold ? "bold" : "normal", style.size + "px", style.name + "," + CANDIDATE_FONT ].join(" ");
                mergeCell = this.dataAccess.getMergeCell(row, col);
                if (!mergeCell) {
                    cellWidth = (this.dataAccess.getColumnWidth(col) || DEFAULT_CELL_WIDTH) - CONTENT_PADDING;
                } else {
                    cellWidth = this.__getCellsWidth(mergeCell.start.col, mergeCell.end.col) - CONTENT_PADDING;
                }
                var widths = [];
                var contents = content.split("\n");
                for (var i = 0, len = contents.length; i < len; i++) {
                    widths.push(canvasContext.measureText(contents[i]).width);
                }
                contents = this.__checkText(cellWidth, widths, contents, parseInt(style.fontSize, 10));
                return contents.join("\n");
            },
            __checkText: function(cellWidth, widths, contents, fontSize) {
                var contentSet = [];
                var width;
                for (var i = 0, len = contents.length; i < len; i++) {
                    width = widths[i];
                    if (width <= cellWidth) {
                        contentSet.push(contents[i]);
                    } else {
                        this.__wraptext(contentSet, cellWidth, width, contents[i], "", fontSize * 2);
                    }
                }
                return contentSet;
            },
            __wraptext: function(contentSet, cellWidth, width, frontText, backText, minWidth) {
                var canvasContext = this.canvasContext;
                var contentLength;
                if (width === cellWidth) {
                    contentSet.push(frontText);
                    if (backText.length === 0) {
                        return;
                    }
                    frontText = backText;
                    backText = "";
                    width = canvasContext.measureText(frontText).width;
                }
                if (width <= cellWidth && backText.length === 0) {
                    contentSet.push(frontText);
                    return;
                }
                var diff = Math.abs(width - cellWidth);
                if (width > cellWidth) {
                    while (width > cellWidth) {
                        contentLength = frontText.length - 1;
                        backText = frontText.charAt(contentLength) + backText;
                        frontText = frontText.substring(0, contentLength);
                        width = canvasContext.measureText(frontText).width;
                    }
                    contentSet.push(frontText);
                    if (backText.length === 0) {
                        return;
                    }
                    //计算剩余内容宽度
                    width = canvasContext.measureText(backText).width;
                    this.__wraptext(contentSet, cellWidth, width, backText, "", minWidth);
                } else {
                    if (diff < minWidth) {
                        while (backText.length) {
                            frontText += backText.charAt(0);
                            backText = backText.substring(1);
                            width = canvasContext.measureText(frontText).width;
                            if (width > cellWidth) {
                                break;
                            }
                        }
                        if (width > cellWidth) {
                            backText = frontText.charAt(frontText.length - 1) + backText;
                            frontText = frontText.substring(0, frontText.length - 1);
                            contentSet.push(frontText);
                            frontText = backText;
                            backText = "";
                            width = canvasContext.measureText(frontText).width;
                            return this.__wraptext(contentSet, cellWidth, width, frontText, backText, minWidth);
                        }
                        // backText 已用尽
                        contentSet.push(frontText);
                    } else {
                        contentLength = Math.ceil(backText.length / 2);
                        frontText += backText.substring(0, contentLength);
                        backText = backText.substring(contentLength);
                        width = canvasContext.measureText(frontText).width;
                        this.__wraptext(contentSet, cellWidth, width, frontText, backText, minWidth);
                    }
                }
            },
            __contentChange: function(row, col) {
                var start = row;
                var end = col;
                if (!isNaN(+row)) {
                    this.__clear(row, col);
                } else {
                    for (var i = start.row, limit = end.row; i <= limit; i++) {
                        for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                            this.__clear(i, j);
                        }
                    }
                }
            },
            __styleChange: function(start, end) {
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        this.__clear(i, j);
                    }
                }
            },
            __mergeChange: function(start, end) {
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        this.__clear(i, j);
                    }
                }
            },
            __columnResize: function(col) {
                var totalIndex = this.dataAccess.getTotalIndex();
                for (var i = 0, limit = totalIndex.row; i <= limit; i++) {
                    this.__clear(i, col);
                }
            },
            __rowResize: function(row) {
                var totalIndex = this.dataAccess.getTotalIndex();
                for (var i = 0, limit = totalIndex.col; i <= limit; i++) {
                    this.__clear(row, i);
                }
            },
            __clear: function(row, col) {
                this.dataAccess.clearWraptextRecord(row, col);
            },
            __getCellsWidth: function(startIndex, endIndex) {
                var sum = 0;
                for (var i = startIndex; i <= endIndex; i++) {
                    sum += this.dataAccess.getColumnWidth(i) || DEFAULT_CELL_WIDTH;
                }
                return sum + (endIndex - startIndex) * BORDER_WIDTH;
            }
        });
        Wraptext.deps = [ "dataAccess", "value", "style" ];
        return Wraptext;
    }
};

//src/definition/cell-type.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[70] = {
    value: {
        UNDEFINED: "UNDEFINED",
        TEXT: "TEXT",
        NUMBER: "NUMBER",
        LOGICAL: "LOGICAL",
        ERROR: "ERROR",
        ARRAY: "ARRAY"
    }
};

//src/definition/error-value.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[71] = {
    value: {
        NULL: "#NULL!",
        DIV0: "#DIV/0!",
        VALUE: "#VALUE!",
        REF: "#REF!",
        NAME: "#NAME?",
        NUM: "#NUM!",
        NAN: "#N/A",
        DATA: "#GETTING_DATA"
    }
};

//src/definition/format-code.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[72] = {
    value: function() {
        var data = {
            1: "0",
            2: "0.00",
            3: "#,##0",
            4: "#,##0.00",
            5: '_ * #,##0_ ;_ * -#,##0_ ;_ * "-"_ ;_ @_ ',
            6: '_ * #,##0.00_ ;_ * -#,##0.00_ ;_ * "-"??_ ;_ @_ ',
            7: '_ ¥* #,##0_ ;_ ¥* -#,##0_ ;_ ¥* "-"_ ;_ @_ ',
            8: '_ ¥* #,##0.00_ ;_ ¥* -#,##0.00_ ;_ ¥* "-"??_ ;_ @_ ',
            9: "#,##0;-#,##0",
            10: "#,##0;[red]-#,##0",
            11: "#,##0.00;-#,##0.00",
            12: "#,##0.00;[red]-#,##0.00",
            13: "¥#,##0;¥-#,##0",
            14: "¥#,##0;[red]¥-#,##0",
            15: "¥#,##0.00;¥-#,##0.00",
            16: "¥#,##0.00;[red]¥-#,##0.00",
            17: "0%",
            18: "0.00%",
            19: "0.00E+00",
            20: "##0.0E+0",
            21: "# ?/?",
            22: "# ??/??",
            23: "$#,##0_);($#,##0)",
            24: "$#,##0_);[red]($#,##0)",
            25: "$#,##0.00_);($#,##0.00)",
            26: "$#,##0.00_);[red]($#,##0.00)",
            27: 'yyyy"年"m"月"',
            28: 'm"月"d"日"',
            29: "yyyy/m/d",
            30: 'yyyy"年"m"月"d"日"',
            31: "m/d/yy",
            32: "d-mmm-yy",
            33: "d-mmm",
            34: "mmm-yy",
            35: "h:mm AM/PM",
            36: "h:mm:ss AM/PM",
            37: "h:mm",
            38: "h:mm:ss",
            39: 'h"时"mm"分"',
            40: 'h"时"mm"分"ss"秒"',
            41: '上午/下午h"时"mm"分"',
            42: '上午/下午h"时"mm"分"ss"秒"',
            43: "yyyy/m/d h:mm",
            44: "mm:ss",
            45: "mm:ss.0",
            46: "@",
            47: "[h]:mm:ss",
            48: "0.00_);[red](0.00)",
            49: "0.00_);(0.00)",
            50: "0.00;[red]0.00",
            51: "0.00_ "
        };
        data._default = {
            DECIMAL: data[51],
            CURRENCY: data[15],
            PERCENT: data[18],
            SCIENTIFIC: data[19],
            FRACTION: data[21],
            DATE: data[29],
            TIME: data[38],
            DATETIME: data[22],
            TEXT: data[46]
        };
        return data;
    }
};

//src/definition/logical-value.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[73] = {
    value: {
        TRUE: "TRUE",
        FALSE: "FALSE"
    }
};

//src/definition/none.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[74] = {
    value: function() {
        return "none";
    }
};

//src/definition/number-format.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[75] = {
    value: {
        GENERAL: "GENERAL",
        DECIMAL: "DECIMAL",
        CURRENCY: "CURRENCY",
        PERCENT: "PERCENT",
        SCIENTIFIC: "SCIENTIFIC",
        FRACTION: "FRACTION",
        DATE: "DATE",
        TIME: "TIME",
        DATETIME: "DATETIME",
        TEXT: "TEXT"
    }
};

//src/env/commands/redo.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[76] = {
    value: function(require) {
        return _p.r(0).create("RedoCommand", {
            base: _p.r(90),
            execute: function() {
                return this.____ctx.redo();
            }
        });
    }
};

//src/env/commands/undo.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[77] = {
    value: function(require) {
        return _p.r(0).create("UndoCommand", {
            base: _p.r(90),
            execute: function() {
                return this.____ctx.undo();
            }
        });
    }
};

//src/env/configure.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[78] = {
    value: function(require) {
        var config = _p.r(12);
        var $ = _p.r(2);
        return _p.r(0).create("Configure", {
            constructor: function() {
                this.config = $.extend(true, {}, config);
            },
            getConfig: function(key) {
                if (!key) {
                    return this.config;
                }
                return this.config[key] || null;
            }
        });
    }
};

//src/env/context.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[79] = {
    value: function(require) {
        var Container = _p.r(82);
        var ElementFactory = _p.r(83);
        var Service = _p.r(86);
        var Command = _p.r(81);
        var Message = _p.r(84);
        var RefreshManager = _p.r(85);
        var Configure = _p.r(78);
        var ModuleLoader = _p.r(87);
        var PluginWrapper = _p.r(88);
        var Context = _p.r(0).create("Context", {
            target: null,
            config: null,
            loader: null,
            ____type: "core",
            manager: {},
            constructor: function(target) {
                this.target = target;
                this.config = new Configure();
                this.loader = new ModuleLoader(this);
                this.init();
                this.initModuleLoadListener();
                this.manager.command.startBasic();
                this.loader.start();
                this.ready();
            },
            getConfig: function(key) {
                return this.config.getConfig(key);
            },
            getDocument: function() {
                return this.manager.element.getDocument();
            },
            getContainer: function(type) {
                return this.manager.container.getContainer(type);
            },
            getSize: function(type) {
                return this.manager.container.getSize(type);
            },
            resizeContianer: function() {
                return this.manager.container.resize();
            },
            createElement: function(ele, opt) {
                return this.manager.element.createElement(ele, opt);
            },
            execCommand: function(type, name, args) {
                return this.manager.command.execCommand(type, name, args);
            },
            queryCommandValue: function(type, name, args) {
                return this.manager.command.queryCommandValue(type, name, args);
            },
            undo: function() {
                return this.manager.command.undo();
            },
            redo: function() {
                return this.manager.command.redo();
            },
            /*----------------------- service*/
            registerService: function(provider, name, handler) {
                return this.manager.service.registerService(provider.____type, provider, name, handler);
            },
            rs: function(caller, name, args) {
                return this.manager.service.rs(caller.____type, name, args);
            },
            registerCommonService: function(provider, name, handler) {
                return this.manager.service.registerCommonService(provider, name, handler);
            },
            cs: function(name, args) {
                return this.manager.service.cs(name, args);
            },
            /*----------------------- message*/
            onMessage: function(listener, name, handler) {
                return this.manager.message.onMessage(listener.____type, listener, name, handler);
            },
            postMessage: function(publisher, name, args) {
                return this.manager.message.postMessage(publisher.____type, name, args);
            },
            closeMessage: function() {
                this.manager.message.close();
            },
            openMessage: function() {
                this.manager.message.open();
            },
            addEventListener: function() {
                return this.manager.message.addEventListener.apply(this.manager.message, arguments);
            },
            on: function(subscriber, name, handler) {
                return this.manager.message.addInternalListener.apply(this.manager.message, arguments);
            },
            prepareRefresh: function() {
                this.manager.refresh.prepareRefresh();
            },
            refresh: function(isIgnore) {
                this.manager.refresh.refresh(isIgnore);
            },
            plug: function(provider, handler) {
                this.manager.refresh.plug(provider, handler);
            },
            init: function() {
                var target = this.target;
                this.manager.element = new ElementFactory(this, target);
                this.manager.container = new Container(this, target);
                this.manager.service = new Service(this, target);
                this.manager.command = new Command(this, target);
                this.manager.message = new Message(this, target);
                this.manager.refresh = new RefreshManager(this, target);
            },
            initModuleLoadListener: function() {
                var _self = this;
                this.loader.onBeforeLoad(function(type) {
                    _self.manager.command.start(type);
                });
            },
            ready: function() {
                this.target.appendChild(this.getContainer("main"));
            }
        });
        // TODO 插件机制需要再完善
        $.extend(Context, {
            registerModule: function(modules) {
                ModuleLoader.register(modules);
            },
            addCommand: function(commands) {
                Command.add(commands);
            },
            mapEvent: function() {
                Message.map.apply(Message, arguments);
            },
            registerPlugin: function(name, impl) {
                ModuleLoader.registerPlugin(name, PluginWrapper.wrap(name, impl));
            }
        });
        return Context;
    }
};

//src/env/manager/command/command-stack.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[80] = {
    value: function(require) {
        return _p.r(0).create("CommandStack", {
            stack: [],
            max: 50,
            topIndex: -1,
            validIndex: -1,
            stackItem: [],
            // 是否暂停记录命令执行
            hold: false,
            commandCount: 0,
            constructor: function(max) {
                this.max = max;
            },
            pop: function() {
                var index = this.topIndex;
                if (index < 0) {
                    return null;
                }
                this.topIndex--;
                return this.stack[index];
            },
            push: function(command, args) {
                if (this.hold) {
                    return;
                }
                this.stackItem.push({
                    command: command,
                    args: args
                });
            },
            holdOn: function() {
                this.hold = true;
            },
            goOn: function() {
                this.hold = false;
            },
            begin: function() {
                this.commandCount++;
            },
            end: function() {
                this.commandCount--;
            },
            moveUp: function() {
                if (this.topIndex >= this.validIndex) {
                    return null;
                }
                this.topIndex++;
                return this.stack[this.topIndex];
            },
            complete: function() {
                if (this.hold) {
                    return;
                }
                if (this.commandCount !== 0) {
                    return;
                }
                this.topIndex++;
                this.validIndex = this.topIndex;
                this.stack[this.topIndex] = this.stackItem;
                this.stackItem = [];
            }
        });
    }
};

//src/env/manager/command/command.js
/**
 * @file 命令管理器
 * @author hancong03@baiud.com
 */
_p[81] = {
    value: function(require) {
        var CommandStack = _p.r(80);
        var $ = _p.r(2);
        var COMMAND_POOL = {
            core: {},
            system: {},
            ext: {},
            basic: {}
        };
        var CommandManager = _p.r(0).create("Command", {
            base: _p.r(1),
            // 命令调用栈
            stack: null,
            // 当前BTable实例中的命令对象
            commands: null,
            executeLock: 0,
            init: function() {
                this.commands = $.extend(true, {}, COMMAND_POOL);
                this.stack = new CommandStack(this.getContext().getConfig("stack"));
            },
            /**
         * 启动基本命令：undo和redo
         * 由于undo和redo命令太过特殊，它们需要监控所有命令的执行过程，
         * 所以要求此类命令必须在其他命令加载之前先加载
         */
            startBasic: function() {
                this.start("basic");
            },
            /**
         * 开始Command对象的装载过程，实例化指定类型的Command对象
         * @param type 当前装载的Command类型
         */
            start: function(type) {
                var commands = COMMAND_POOL[type];
                var context = this.getContext();
                var command;
                var pattern = /\s+/;
                var currentTypeCommands = this.commands[type];
                $.each(commands, function(name, CommandConstructor) {
                    command = new CommandConstructor(context);
                    if (command.name) {
                        name = command.name.trim().split(pattern);
                    } else {
                        name = [ name ];
                    }
                    command.____type = type;
                    command.init();
                    for (var i = 0, len = name.length; i < len; i++) {
                        currentTypeCommands[name[i]] = command;
                    }
                });
            },
            /**
         * 执行命令的接口
         * 该接口允许对命令进行批量调用
         * @param invokerType 调用者所属的类型
         * @param name 命令名称
         * @param args 命令要求的参数
         * @returns {*} 如果执行的是非批量调用，则返回命令执行结果， 否则，什么也不返回
         */
            execCommand: function(invokerType, name, args) {
                var result = null;
                if (typeof name !== "string") {
                    for (var i = 0, len = name.length; i < len; i++) {
                        this.__execCommand(invokerType, name[i].command, name[i].args);
                    }
                } else {
                    result = this.__execCommand(invokerType, name, args);
                }
                return result;
            },
            queryCommandValue: function(invokerType, name, args) {
                var targetCommand = this.__getCommand(invokerType, name);
                if (!targetCommand) {
                    throw new Error("command notfound: " + name);
                }
                args.unshift(name);
                args = targetCommand.queryValueBefore.apply(targetCommand, args);
                // 参数不合法，停止
                if (args === false) {
                    return;
                }
                args.unshift(name);
                return targetCommand.queryValue.apply(targetCommand, args);
            },
            /**
         * 执行单条命令的实际方法
         * @param invokerType 调用者所属的类型
         * @param name 命令名称
         * @param args 命令要求的参数
         * @returns {*} 命令执行结果
         * @private
         */
            __execCommand: function(invokerType, name, args) {
                var targetCommand = this.__getCommand(invokerType, name);
                var stackInfo;
                if (!targetCommand) {
                    throw new Error("command notfound: " + name);
                }
                // 获取规范化后的参数
                args = targetCommand.execBefore.apply(targetCommand, [ name ].concat(args));
                args = [ name ].concat(args);
                var hasUndo = !!targetCommand.unexecute;
                this.stack.begin();
                this.lock();
                if (hasUndo) {
                    stackInfo = targetCommand.getStackInfo.apply(targetCommand, args);
                    stackInfo = $._clone([ name ].concat(stackInfo));
                    this.stack.push(targetCommand, {
                        redo: $._clone(args),
                        undo: stackInfo,
                        range: targetCommand.getRange()
                    });
                }
                var result = targetCommand.execute.apply(targetCommand, args);
                this.stack.end();
                if (hasUndo) {
                    this.stack.complete();
                }
                this.unlock();
                this.emitCommandExecute(args);
                return result;
            },
            /**
         * undo命令内置实现
         * @returns {boolean} undo命令执行是否成功
         */
            undo: function() {
                var historyList = this.stack.pop();
                var history;
                var command;
                if (historyList == null) {
                    return false;
                }
                // undo操作不用进入记录栈
                this.stack.holdOn();
                for (var i = 0, len = historyList.length; i < len; i++) {
                    history = historyList[i];
                    command = history.command;
                    command.unexecute.apply(command, history.args.undo);
                    command.resetRange(history.args.range);
                }
                this.stack.goOn();
                return true;
            },
            /**
         * redo命令内置实现
         * @returns {boolean} redo命令执行是否成功
         */
            redo: function() {
                var historyList = this.stack.moveUp();
                var history;
                var command;
                if (historyList == null) {
                    return false;
                }
                // redo操作不用进入记录栈
                this.stack.holdOn();
                for (var i = 0, len = historyList.length; i < len; i++) {
                    history = historyList[i];
                    command = history.command;
                    command.execute.apply(command, history.args.redo);
                    command.resetRange(history.args.range);
                }
                this.stack.goOn();
                return true;
            },
            /**
         * 为命令执行时的消息传递加锁，防止嵌套命令重复触发消息
         */
            lock: function() {
                this.executeLock++;
            },
            /**
         * 释放执行命令的消息锁
         */
            unlock: function() {
                this.executeLock--;
            },
            /**
         * 根据给定的调用类型和Command名称，返回Command对象
         * @param type 命令调用者的级别
         * @param name 命令名称
         * @returns {*} 如果找到对应的Command对象，则返回该对象，否则返回null
         * @private
         */
            __getCommand: function(type, name) {
                var commands = [];
                var targetCommand;
                // 外部调用，可以视为ext调用
                if (type === null) {
                    type = "ext";
                }
                switch (type) {
                  case "ext":
                    commands.push(this.commands.ext);

                  // break; // 故意省略
                    case "system":
                    commands.push(this.commands.system);

                  // break; // 故意省略
                    case "core":
                    commands.push(this.commands.core);

                  // break; // 故意省略
                    case "basic":
                    commands.push(this.commands.basic);
                }
                for (var i = 0, len = commands.length; i < len; i++) {
                    targetCommand = commands[i][name];
                    if (targetCommand) {
                        return targetCommand;
                    }
                }
                return null;
            },
            /**
         * 触发命令执行消息
         * @param args 命令执行时的参数列表
         */
            emitCommandExecute: function(args) {
                if (this.executeLock === 0) {
                    this.getContext().postMessage(this.getContext(), "c.command.exec", $._clone(args));
                }
            }
        });
        $.extend(CommandManager, {
            /**
         * 对外接口，用于向系统注册Command
         * @param commands Command对象Map
         */
            add: function(commands) {
                $.extend(true, COMMAND_POOL, commands);
            }
        });
        return CommandManager;
    }
};

//src/env/manager/container.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[82] = {
    value: function(require) {
        return _p.r(0).create("Container", {
            base: _p.r(1),
            containers: {},
            size: {},
            init: function() {
                this.__initContainer();
                this.resize();
            },
            getContainer: function(type) {
                if (type === "scroll") {
                    return {
                        h: this.containers.scrollbarBottom,
                        v: this.containers.scrollbarRight
                    };
                }
                return this.containers[type];
            },
            getSize: function(type) {
                return $.extend({}, this.size[type]);
            },
            resize: function() {
                this.__refreshSize();
                var size = this.size;
                $(this.containers.main).css({
                    width: size.main.width,
                    height: size.main.height
                });
                $(this.containers.left).css({
                    width: size.left.width,
                    height: size.left.height
                });
                $(this.containers.top).css({
                    width: size.top.width,
                    height: size.top.height
                });
                $(this.containers.content).css({
                    width: size.content.width,
                    height: size.content.height
                });
                $(this.containers.scrollbarRight).css({
                    height: size.scroll.v.height
                });
                $(this.containers.scrollbarBottom).css({
                    width: size.scroll.h.width
                });
            },
            __initContainer: function() {
                var headConfig = this.context.getConfig("head");
                var scrollbarConfig = this.context.getConfig("scrollbar");
                var background = this.context.getConfig("background");
                var borderConfig = this.context.getConfig("border");
                var borderWidth = borderConfig.width;
                var borderColor = borderConfig.color;
                this.containers = {
                    main: this.createElement("btb-main-container", {
                        background: background
                    }),
                    left: this.createElement("btb-left-container", {
                        top: headConfig.height
                    }),
                    top: this.createElement("btb-top-container", {
                        left: headConfig.width
                    }),
                    content: this.createElement("btb-content-container", {
                        top: headConfig.height,
                        left: headConfig.width
                    }),
                    scrollbarRight: this.createElement("btb-scrollbar-v-container", {
                        width: scrollbarConfig.width,
                        top: headConfig.height,
                        right: 0,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                        backgroundColor: scrollbarConfig.background
                    }),
                    scrollbarBottom: this.createElement("btb-scrollbar-h-container", {
                        height: scrollbarConfig.width,
                        bottom: 0,
                        left: headConfig.width,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                        backgroundColor: scrollbarConfig.background
                    })
                };
                this.containers.main.appendChild(this.containers.top);
                this.containers.main.appendChild(this.containers.left);
                this.containers.main.appendChild(this.containers.content);
                this.containers.main.appendChild(this.containers.scrollbarRight);
                this.containers.main.appendChild(this.containers.scrollbarBottom);
            },
            __refreshSize: function() {
                var headConfig = this.context.getConfig("head");
                var scrollbarConfig = this.context.getConfig("scrollbar");
                var background = this.context.getConfig("background");
                var borderConfig = this.context.getConfig("border");
                var borderWidth = borderConfig.width;
                var targetSize = {
                    width: this.target.clientWidth,
                    height: this.target.clientHeight
                };
                var availableSize = {
                    width: targetSize.width - scrollbarConfig.width,
                    height: targetSize.height - scrollbarConfig.width
                };
                var contentSize = {
                    width: availableSize.width - headConfig.width,
                    height: availableSize.height - headConfig.height
                };
                var topSize = {
                    width: contentSize.width,
                    height: headConfig.height
                };
                var leftSize = {
                    width: headConfig.width,
                    height: contentSize.height
                };
                this.size = {
                    main: targetSize,
                    left: leftSize,
                    top: topSize,
                    content: contentSize,
                    scroll: {
                        h: {
                            width: contentSize.width - 2 * borderWidth,
                            height: scrollbarConfig.width
                        },
                        v: {
                            width: scrollbarConfig.width,
                            height: contentSize.height - 2 * borderWidth
                        }
                    }
                };
            },
            createElement: function(className, styles) {
                return this.context.createElement("div", {
                    attr: {
                        "class": "btb-container " + className
                    },
                    style: styles
                });
            }
        });
    }
};

//src/env/manager/element-factory.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[83] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("ElementFactory", {
            base: _p.r(1),
            doc: null,
            createElement: function(eleName, opt) {
                var ele = this.doc.createElement(eleName);
                if (typeof opt === "string") {
                    ele.className = opt;
                    return ele;
                }
                if (opt) {
                    if (opt.attr) {
                        $(ele).attr(opt.attr);
                    }
                    if (opt.inner) {
                        ele.innerHTML = opt.inner;
                    }
                    if (opt.style) {
                        $(ele).css(opt.style);
                    }
                }
                return ele;
            },
            getDocument: function() {
                return this.doc;
            },
            init: function() {
                this.doc = this.target.ownerDocument;
            }
        });
    }
};

//src/env/manager/message.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[84] = {
    value: function(require) {
        var $ = _p.r(2);
        var EVENT_MAP = {};
        var MessageManager = _p.r(0).create("Message", {
            base: _p.r(1),
            pool: {
                core: {},
                system: {},
                ext: {}
            },
            eventPool: {},
            internalEventPool: {},
            chain: {},
            count: 0,
            state: true,
            addEventListener: function(evtName, evtHandler) {
                var opt = {};
                var pool = this.eventPool;
                if (evtHandler) {
                    opt[evtName] = evtHandler;
                } else {
                    opt = evtName;
                }
                for (var name in opt) {
                    if (!opt.hasOwnProperty(name)) {
                        continue;
                    }
                    if (!pool[name]) {
                        pool[name] = [];
                    }
                    pool[name].push(opt[name]);
                }
            },
            addInternalListener: function(subscriber, eventName, eventHandler) {
                var opt = {};
                var pool = this.internalEventPool;
                if (eventHandler) {
                    opt[eventName] = eventHandler;
                } else {
                    opt = eventName;
                }
                for (var name in opt) {
                    if (!opt.hasOwnProperty(name)) {
                        continue;
                    }
                    if (!pool[name]) {
                        pool[name] = [];
                    }
                    pool[name].push({
                        subscriber: subscriber,
                        handler: opt[name]
                    });
                }
            },
            onMessage: function(type, listener, name, handler) {
                var map = {};
                var currentPool = this.pool[type];
                if (typeof name === "string") {
                    map[name] = handler;
                } else {
                    map = name;
                }
                for (var key in map) {
                    if (map.hasOwnProperty(key)) {
                        if (!currentPool[key]) {
                            currentPool[key] = [];
                        }
                        currentPool[key].push({
                            listener: listener,
                            handler: map[key]
                        });
                    }
                }
            },
            postMessage: function(type, name, args) {
                if (!this.state) {
                    return;
                }
                var handlerList = [];
                var handlers;
                if (this.chain[name]) {
                    delete this.chain[name];
                    return;
                } else {
                    this.chain[name] = true;
                }
                switch (type) {
                  case "core":
                    handlerList.push(this.pool.core);

                  case "system":
                    handlerList.push(this.pool.system);

                  case "ext":
                    handlerList.push(this.pool.ext);
                }
                try {
                    for (var i = 0, len = handlerList.length; i < len; i++) {
                        handlers = handlerList[i][name];
                        if (!handlers) {
                            continue;
                        }
                        for (var j = 0, jlen = handlers.length; j < jlen; j++) {
                            handlers[j].handler.apply(handlers[j].listener, args);
                        }
                    }
                } finally {
                    delete this.chain[name];
                    if (EVENT_MAP[name]) {
                        this.emit(EVENT_MAP[name], args);
                    }
                }
            },
            emit: function(eventName, args) {
                var internalPool = this.internalEventPool[eventName] || [];
                var pool = this.eventPool[eventName] || [];
                args = [ eventName ].concat(args);
                // 内部传递
                for (var i = 0, len = internalPool.length; i < len; i++) {
                    internalPool[i].handler.apply(internalPool[i].subscriber, $._clone(args));
                }
                // 外部传递
                for (var i = 0, len = pool.length; i < len; i++) {
                    pool[i].apply(null, $._clone(args));
                }
            },
            close: function() {
                this.count++;
                this.state = false;
            },
            open: function() {
                this.count--;
                if (this.count === 0) {
                    this.state = true;
                }
            }
        });
        MessageManager.map = function(messageName, eventName) {
            var map = {};
            if (eventName) {
                map[messageName] = eventName;
            } else {
                map = messageName;
            }
            $.extend(EVENT_MAP, $._clone(map));
        };
        return MessageManager;
    }
};

//src/env/manager/refresh.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[85] = {
    value: function(require) {
        return _p.r(0).create("Refresh", {
            provider: null,
            handler: null,
            count: 0,
            base: _p.r(1),
            prepareRefresh: function() {
                this.count++;
            },
            refresh: function(isIgnore) {
                if (!isIgnore) {
                    this.count--;
                }
                if (this.count === 0 && this.handler) {
                    this.handler.call(this.provider);
                }
            },
            plug: function(provider, handler) {
                this.provider = provider;
                this.handler = handler;
            }
        });
    }
};

//src/env/manager/service.js
/**
 * @file 服务管理器
 * @author hancong03@baiud.com
 */
_p[86] = {
    value: function(require) {
        return _p.r(0).create("Service", {
            base: _p.r(1),
            // 通用服务对象池
            commonPool: {},
            // 普通服务对象池
            pool: {
                core: {},
                system: {},
                ext: {}
            },
            /**
         * 注册服务接口
         * @param type 服务级别
         * @param provider 服务提供者
         * @param name 服务名称
         * @param handler 具体的服务方法
         */
            registerService: function(type, provider, name, handler) {
                var map = {};
                var currentPool = this.pool[type];
                if (typeof name === "string") {
                    map[name] = handler;
                } else {
                    map = name;
                }
                for (var key in map) {
                    if (map.hasOwnProperty(key)) {
                        currentPool[key] = {
                            provider: provider,
                            handler: map[key]
                        };
                    }
                }
            },
            /**
         * 请求服务接口
         * @param reqType 请求者的级别， 该级别限制了请求者所能访问的服务种类。
         * @param name 所请求的服务的名称
         * @param args 传递给服务的参数数组， 该参数必须满足当前所请求服务的参数要求
         * @returns {*|boolean} 返回服务执行结果
         * @throws 如果请求的服务不存在，则抛出错误对象
         */
            rs: function(reqType, name, args) {
                var services = [];
                var targetService;
                switch (reqType) {
                  case "ext":
                    services.push(this.pool.ext);

                  case "system":
                    services.push(this.pool.system);

                  case "core":
                    services.push(this.pool.core);
                }
                for (var i = 0, len = services.length; i < len; i++) {
                    targetService = services[i][name];
                    if (targetService) {
                        break;
                    }
                }
                if (!targetService) {
                    throw new Error("service not found: " + name);
                }
                return targetService.handler.apply(targetService.provider, args);
            },
            /**
         * 注册公共服务接口
         * 公共服务和普通的服务不同，该类型的服务不限制请求者级别，任何模块都可以请求该类型的服务。
         * 同时，公共服务也是无状态的服务。此种类型的服务不应该保存于系统核心相关的任何状态。
         * @param provider 服务提供者
         * @param name 服务名称
         * @param handler 提供服务的具体方法
         */
            registerCommonService: function(provider, name, handler) {
                var map = {};
                var pool = this.commonPool;
                if (typeof name === "string") {
                    map[name] = handler;
                } else {
                    map = name;
                }
                for (var key in map) {
                    if (map.hasOwnProperty(key)) {
                        pool[key] = {
                            provider: provider,
                            handler: map[key]
                        };
                    }
                }
            },
            /**
         * 调用公共服务的接口
         * @param name 服务名称
         * @param args 服务所要求的参数数组
         * @returns {*|boolean} 服务执行的结果
         * @throws 如果请求的服务不存在，则抛出错误对象
         */
            cs: function(name, args) {
                var service = this.commonPool[name];
                if (!service) {
                    throw new Error("common service not found: " + name);
                }
                return service.handler.apply(service.provider, args);
            }
        });
    }
};

//src/env/module-loader.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[87] = {
    value: function(require) {
        /**
     * 当前系统已知的模块缓存
     */
        var MODULE_POOL = {
            common: {},
            core: {},
            system: {},
            ext: {}
        };
        var $ = _p.r(2);
        var ModuleLoader = _p.r(0).create("ModuleLoader", {
            context: null,
            // 当前BTable对象所加载的模块实例
            instances: {
                common: [],
                core: [],
                system: [],
                ext: []
            },
            // 模块启动前置监听器列表
            beforeListeners: [],
            // 模块启动后置监听器列表
            afterListeners: [],
            constructor: function(context) {
                this.context = context;
            },
            /**
         * 根据给定的模块实例获取其所属的类型
         * @param module 模块实例
         * @returns {string} 模块所属的类型
         */
            getType: function(module) {
                return module.____type;
            },
            /**
         * 根据给定的参数创建模块内的组件对象
         * @param module 模块对象
         * @param args 组件对象参数数组， 该数组的第1项是组件对象的构造器，其后的项将作为该组件对象的初始化参数依次传入
         * @returns {Component} 刚创建的组件实例
         */
            createComponent: function(module, args) {
                var Component = args[0];
                var comp = new Component(this.context);
                args = args.slice(1);
                comp.____type = typeof module !== "string" ? module.____type : module;
                comp.init.apply(comp, args);
                return comp;
            },
            /**
         * 注册前置监听器
         * @param cb
         */
            onBeforeLoad: function(cb) {
                this.beforeListeners.push(cb);
            },
            /**
         * 启动模块加载器
         * 该启动器会首先启动通用模块，然后再按模块类别顺序加载模块
         */
            start: function() {
                this.startupCommonModule();
                this.startupModules("core");
                this.startupModules("system");
                this.startupModules("ext");
            },
            /**
         * 启动通用模块方法
         */
            startupCommonModule: function() {
                var modules = MODULE_POOL["common"];
                var commonInstance = this.instances["common"];
                var moduleInstance = null;
                var context = this.context;
                for (var key in modules) {
                    if (modules.hasOwnProperty(key)) {
                        moduleInstance = new modules[key](context);
                        moduleInstance.init();
                        commonInstance.push(moduleInstance);
                    }
                }
            },
            /**
         * 根据指定的类型，启动对应的模块
         * @param type 需要启动的模块的类型
         */
            startupModules: function(type) {
                this.emitBefore(type);
                var started = {};
                var modules = MODULE_POOL[type];
                var currentInstaces = this.instances[type];
                for (var key in modules) {
                    if (modules.hasOwnProperty(key)) {
                        this.initModule(started, modules[key], type, key);
                    }
                }
                for (var i = 0, len = currentInstaces.length; i < len; i++) {
                    currentInstaces[i].run();
                }
                this.emitAfter(type);
            },
            /**
         * 触发模块启动前置监听器
         * @param type 即将启动的模块类型
         */
            emitBefore: function(type) {
                this.emit(this.beforeListeners, type);
            },
            /**
         * 触发模块启动后置监听器
         * @param type 刚启动完成的模块类型
         */
            emitAfter: function(type) {
                this.emit(this.afterListeners, type);
            },
            /**
         * 触发器实现
         */
            emit: function(pool, type) {
                for (var i = 0, len = pool.length; i < len; i++) {
                    pool[i].call(null, type);
                }
            },
            /**
         * 初始化模块，该方法将在模块实例创建后完成对应模块的初始化工作
         * @param started 当前已启动的模块Map
         * @param module 当前需要初始化的模块实例
         * @param type 模块所属的类型
         * @param moduleName 模块名称
         */
            initModule: function(started, module, type, moduleName) {
                if (started[moduleName]) {
                    return;
                }
                var depName;
                var deps = [];
                var modules = MODULE_POOL[type];
                if (module.deps) {
                    for (var i = 0, len = module.deps.length; i < len; i++) {
                        depName = module.deps[i];
                        if (started[depName]) {
                            deps[i] = started[depName];
                        } else if (modules[depName]) {
                            deps[i] = this.initModule(started, modules[depName], type, depName);
                        } else {
                            throw new Error("notfound module: " + depName);
                        }
                    }
                }
                var instance = new module(this.context);
                instance.____type = type;
                instance.____loader = this;
                instance.init.apply(instance, deps);
                started[moduleName] = instance;
                this.instances[type].push(instance);
                return instance;
            }
        });
        $.extend(ModuleLoader, {
            /**
         * 注册模块
         * 该方法为系统内部所用，外界无法访问该方法
         * @param modules
         */
            register: function(modules) {
                $.extend(true, MODULE_POOL, modules);
            },
            /**
         * 注册插件模块
         * 使用户自定义的插件能够被容器感知到，并管理其生命周期。
         * @param name 注册的插件名
         * @param plugin 插件实现
         */
            registerPlugin: function(name, plugin) {
                MODULE_POOL.ext[name] = plugin;
            }
        });
        return ModuleLoader;
    }
};

//src/env/plugin-wrapper.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[88] = {
    value: function(require) {
        var clazz = _p.r(0);
        var Plugin = _p.r(95);
        return {
            wrap: function(name, pluginImpl) {
                pluginImpl.base = Plugin;
                return clazz.create("Plugin-" + name, pluginImpl);
            }
        };
    }
};

//src/events.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[89] = {
    value: function(require) {
        return {
            "c.focus.change": "focuschange",
            "c.range.disabled": "focusout",
            "c.command.exec": "commandexecute",
            "s.input.statechange": "inputmodelchange",
            "c.refresh": "refresh"
        };
    }
};

//src/interface/command.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[90] = {
    value: function(require) {
        return _p.r(0).create("Command", {
            base: _p.r(91),
            execBefore: function() {
                return [].slice.call(arguments, 1);
            },
            execute: function() {},
            queryValue: function() {}
        });
    }
};

//src/interface/component.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[91] = {
    value: function(require) {
        return _p.r(0).create("Component", {
            base: _p.r(92),
            registerService: function(name, handler) {
                return this.____ctx.registerService(this, name, handler);
            },
            execCommand: function(name) {
                return this.____ctx.execCommand(this.____type, name, [].slice.call(arguments, 1));
            },
            corePrepareRefresh: function() {
                this.____ctx.prepareRefresh();
            },
            coreRefresh: function(isIgnore) {
                this.____ctx.refresh(isIgnore);
            },
            plug: function(handler) {
                this.____ctx.plug(this, handler);
            }
        });
    }
};

//src/interface/functional.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[92] = {
    value: function(require) {
        return _p.r(0).create("Functional", {
            ____ctx: null,
            ____type: null,
            base: _p.r(93),
            constructor: function(context) {
                this.____ctx = context;
            },
            getDocument: function() {
                return this.____ctx.getDocument();
            },
            getConfig: function(key) {
                return this.____ctx.getConfig(key);
            },
            rs: function(name) {
                var args = [].slice.call(arguments, 1);
                return this.____ctx.rs(this, name, args);
            },
            cs: function(name) {
                var args = [].slice.call(arguments, 1);
                return this.____ctx.cs(name, args);
            },
            createElement: function(ele, opt) {
                return this.____ctx.createElement(ele, opt);
            },
            postMessage: function(name) {
                return this.____ctx.postMessage(this, name, [].slice.call(arguments, 1));
            },
            onMessage: function(name, handler) {
                return this.____ctx.onMessage(this, name, handler);
            },
            closeMessage: function() {
                return this.____ctx.closeMessage();
            },
            openMessage: function() {
                return this.____ctx.openMessage();
            },
            getMainContainer: function() {
                return this.____ctx.getContainer("main");
            },
            getTopContainer: function() {
                return this.____ctx.getContainer("top");
            },
            getLeftContainer: function() {
                return this.____ctx.getContainer("left");
            },
            getContentContainer: function() {
                return this.____ctx.getContainer("content");
            },
            resizeContianer: function() {
                return this.____ctx.resizeContianer();
            },
            getScrollContainer: function() {
                return this.____ctx.getContainer("scroll");
            },
            getTopSize: function() {
                return this.____ctx.getSize("top");
            },
            getLeftSize: function() {
                return this.____ctx.getSize("left");
            },
            getContentSize: function() {
                return this.____ctx.getSize("content");
            },
            getScrollSize: function() {
                return this.____ctx.getSize("scroll");
            }
        });
    }
};

//src/interface/lifecycle.js
/**
 * 生命周期
 * 控制组件的生命周期
 */
_p[93] = {
    value: function(require) {
        return _p.r(0).create("Lifecycle", {
            init: function() {},
            destroy: function() {}
        });
    }
};

//src/interface/module.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[94] = {
    value: function(require) {
        return _p.r(0).create("Module", {
            ____loader: null,
            base: _p.r(91),
            run: function() {},
            createComponent: function(Component) {
                return this.____loader.createComponent(this, [].slice.call(arguments, 0));
            }
        });
    }
};

//src/interface/plugin.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[95] = {
    value: function(require) {
        return _p.r(0).create("Plugin", {
            base: _p.r(94),
            on: function(eventName, handler) {
                this.____ctx.on(this, eventName, handler);
            }
        });
    }
};

//src/interface/service.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[96] = {
    value: function(require) {
        return _p.r(0).create("Component", {
            base: _p.r(93),
            constructor: function(context) {
                this.____ctx = context;
            },
            init: function() {},
            registerCommonService: function(name, handler) {
                this.____ctx.registerCommonService(this, name, handler);
            }
        });
    }
};

//src/interface/undoable-command.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[97] = {
    value: function(require) {
        return _p.r(0).create("UndoableCommand", {
            base: _p.r(90),
            unexecute: function() {},
            getStackInfo: function() {},
            getRange: function() {
                return this.rs("c.range");
            },
            resetRange: function(range) {
                this.rs("c.range.set", range);
            }
        });
    }
};

//src/kernel/adapter/excel.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[98] = {
    value: function(require) {
        return {
            "import": _p.r(101),
            "export": _p.r(99)
        };
    }
};

//src/kernel/adapter/excel/export.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[99] = {
    value: function(require) {
        var HASH = _p.r(106);
        var FORMAT_CODE = _p.r(72);
        var FORMAT_CODE_MAP = {};
        for (var key in FORMAT_CODE) {
            if (FORMAT_CODE.hasOwnProperty(key) && key !== "_default") {
                FORMAT_CODE_MAP[FORMAT_CODE[key]] = key;
            }
        }
        function exportExcel(btableData) {
            var result = {
                value: [],
                row: [],
                column: [],
                border: {},
                mergeCells: {},
                style: {},
                columnStyle: [],
                rowStyle: []
            };
            btableData = JSON.parse(btableData);
            result.value = exportValue(btableData);
            result.row = exportRowHeight(btableData);
            result.column = exportColumnWidth(btableData);
            result.numberFormat = exportNumberFormat(btableData);
            result.style = exportStyle(btableData);
            result.columnStyle = exportColumnStyle(btableData);
            result.rowStyle = exportRowStyle(btableData);
            result.mergeCells = exportMergeCells(btableData);
            result.border = exportBorder(btableData);
            result.columnBorder = exportColumnBorder(btableData);
            result.rowBorder = exportRowBorder(btableData);
            return JSON.stringify(result);
        }
        function exportValue(data) {
            var valueData = data.value;
            var cellTypeData = data.cellType;
            var result = [];
            var keys = Object.keys(valueData);
            var index;
            for (var i = 0, len = keys.length; i < len; i++) {
                index = HASH.keyToIndex(keys[i]);
                result.push({
                    r: index.row,
                    c: index.col,
                    v: valueData[keys[i]] || "",
                    t: cellTypeData[keys[i]]
                });
            }
            return result;
        }
        function exportRowHeight(data) {
            var rowHeightData = data.row;
            var result = [];
            var keys = Object.keys(rowHeightData);
            var index;
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                result.push({
                    r: index,
                    v: rowHeightData[index]
                });
            }
            return result;
        }
        function exportColumnWidth(data) {
            var columnWidthData = data.column;
            var result = [];
            var keys = Object.keys(columnWidthData);
            var index;
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                result.push({
                    c: index,
                    v: columnWidthData[index]
                });
            }
            return result;
        }
        function exportNumberFormat(data) {
            var numberFormatData = data.numberFormat;
            var codeMap = data.formatCodeMap;
            var result = [];
            var index;
            for (var key in numberFormatData) {
                if (!numberFormatData.hasOwnProperty(key)) {
                    continue;
                }
                index = HASH.keyToIndex(key);
                key = numberFormatData[key];
                result.push({
                    c: index.col,
                    r: index.row,
                    v: {
                        id: 1,
                        code: FORMAT_CODE_MAP[key] || codeMap[key]
                    }
                });
            }
            return result;
        }
        /**
     * 单元格样式导出
     * @param data
     */
        function exportStyle(data) {
            var styleData = data.style;
            var middle = {};
            var currentData;
            var arr = [];
            var index;
            for (var styleName in styleData) {
                if (!styleData.hasOwnProperty(styleName)) {
                    continue;
                }
                currentData = styleData[styleName];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middle[key]) {
                        middle[key] = {};
                    }
                    middle[key][styleName] = currentData[key];
                }
            }
            for (var key in middle) {
                if (middle.hasOwnProperty(key)) {
                    index = HASH.keyToIndex(key);
                    arr.push({
                        r: index.row,
                        c: index.col,
                        v: middle[key]
                    });
                }
            }
            return arr;
        }
        function exportColumnStyle(data) {
            var styleData = data.columnStyle;
            var middle = {};
            var currentData;
            var arr = [];
            for (var styleName in styleData) {
                if (!styleData.hasOwnProperty(styleName)) {
                    continue;
                }
                currentData = styleData[styleName];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middle[key]) {
                        middle[key] = {};
                    }
                    middle[key][styleName] = currentData[key];
                }
            }
            var keys = Object.keys(middle);
            var index;
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                arr.push({
                    c: index,
                    v: middle[index]
                });
            }
            return arr;
        }
        function exportRowStyle(data) {
            var styleData = data.rowStyle;
            var middle = {};
            var currentData;
            var arr = [];
            for (var styleName in styleData) {
                if (!styleData.hasOwnProperty(styleName)) {
                    continue;
                }
                currentData = styleData[styleName];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middle[key]) {
                        middle[key] = {};
                    }
                    middle[key][styleName] = currentData[key];
                }
            }
            var keys = Object.keys(middle);
            var index;
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                arr.push({
                    r: index,
                    v: middle[index]
                });
            }
            return arr;
        }
        function exportMergeCells(data) {
            var mergeData = data.merge;
            var keys = Object.keys(mergeData);
            var result = [];
            var currentData;
            for (var i = 0, len = keys.length; i < len; i++) {
                currentData = mergeData[keys[i]];
                result.push({
                    start: {
                        r: currentData.start.row,
                        c: currentData.start.col
                    },
                    end: {
                        r: currentData.end.row,
                        c: currentData.end.col
                    }
                });
            }
            return result;
        }
        function exportBorder(data) {
            var borderData = data.border;
            var keys;
            var result = [];
            var middleData = {};
            var currentData;
            var index;
            for (var borderType in borderData) {
                if (!borderData.hasOwnProperty(borderType)) {
                    continue;
                }
                currentData = borderData[borderType];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middleData[key]) {
                        middleData[key] = {};
                    }
                    middleData[key][borderType] = currentData[key];
                }
            }
            keys = Object.keys(middleData);
            for (var i = 0, len = keys.length; i < len; i++) {
                index = HASH.keyToIndex(keys[i]);
                result.push({
                    r: index.row,
                    c: index.col,
                    v: middleData[keys[i]]
                });
            }
            return result;
        }
        function exportColumnBorder(data) {
            var borderData = data.columnBorder;
            var keys;
            var result = [];
            var middleData = {};
            var currentData;
            var index;
            for (var borderType in borderData) {
                if (!borderData.hasOwnProperty(borderType)) {
                    continue;
                }
                currentData = borderData[borderType];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middleData[key]) {
                        middleData[key] = {};
                    }
                    middleData[key][borderType] = currentData[key];
                }
            }
            keys = Object.keys(middleData);
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                result.push({
                    c: index,
                    v: middleData[keys[i]]
                });
            }
            return result;
        }
        function exportRowBorder(data) {
            var borderData = data.columnBorder;
            var keys;
            var result = [];
            var middleData = {};
            var currentData;
            var index;
            for (var borderType in borderData) {
                if (!borderData.hasOwnProperty(borderType)) {
                    continue;
                }
                currentData = borderData[borderType];
                for (var key in currentData) {
                    if (!currentData.hasOwnProperty(key)) {
                        continue;
                    }
                    if (!middleData[key]) {
                        middleData[key] = {};
                    }
                    middleData[key][borderType] = currentData[key];
                }
            }
            keys = Object.keys(middleData);
            for (var i = 0, len = keys.length; i < len; i++) {
                index = keys[i];
                result.push({
                    r: index,
                    v: middleData[keys[i]]
                });
            }
            return result;
        }
        return exportExcel;
    }
};

//src/kernel/adapter/excel/filter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[100] = {
    value: {
        horizontal: {
            none: "none",
            left: "left",
            right: "right",
            center: "center"
        },
        vertical: {
            none: "none",
            top: "top",
            middle: "middle",
            bottom: "bottom"
        }
    }
};

//src/kernel/adapter/excel/import.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[101] = {
    value: function(require) {
        var HASH = _p.r(106);
        var NONE = "none";
        var BORDER_STYLE = {
            thin: "thin",
            dashed: "dashed",
            dotted: "dotted"
        };
        var STYLE_GROUP = _p.r(132).styleGroup;
        var DEFAULT_STYLE_VALUE = _p.r(104);
        var FORMAT_CODE = _p.r(72);
        var VALUE_FILTER = _p.r(100);
        var FORMAT_CODE_MAP = {};
        for (var key in FORMAT_CODE) {
            if (FORMAT_CODE.hasOwnProperty(key) && key !== "_default") {
                FORMAT_CODE_MAP[FORMAT_CODE[key]] = key;
            }
        }
        function importExcel(excelData) {
            if (typeof excelData === "string") {
                excelData = JSON.parse(excelData);
            }
            var result = {};
            var total = {
                row: 0,
                col: 0
            };
            var dimension = excelData.dimension;
            if (dimension.r === 0) {
                total.row = 100;
            } else {
                total.row = Math.ceil(dimension.r / 100) * 100;
            }
            if (dimension.c === 0) {
                total.col = 26;
            } else {
                total.col = Math.ceil(dimension.c / 26) * 26;
            }
            /* ------- format 解析 ------- */
            //parseResult = importNumberFormat(excelData);
            //result.numberFormat = parseResult.format;
            //result.formatCodeMap = parseResult.map;
            //result.customCodeIndex = parseResult.index;
            var cellInfo = parseCell(excelData);
            var rowInfo = parseRow(excelData);
            var columnInfo = parseColumn(excelData);
            result.total = total;
            result.value = cellInfo.value;
            result.cellType = cellInfo.type;
            result.cellStyle = cellInfo.cellStyle;
            result.styleGroup = importStyleGroup(excelData);
            result.styleIndex = importStyleIndex(excelData);
            result.xfList = importXfStyleList(excelData);
            result.row = rowInfo.height;
            result.rowStyle = rowInfo.style;
            result.column = columnInfo.width;
            result.columnStyle = columnInfo.style;
            var mergeInfo = parseMergeCells(excelData);
            result.merge = mergeInfo.cells;
            result.mergeMap = mergeInfo.map;
            return result;
        }
        function parseCell(data) {
            var cellData = data.cell;
            var valueResult = {};
            var typeResult = {};
            var styleResult = {};
            var currentData;
            var index;
            for (var i = 0, len = cellData.length; i < len; i++) {
                currentData = cellData[i];
                index = HASH.indexToKey(currentData.r, currentData.c);
                if (currentData.v !== undefined) {
                    valueResult[index] = currentData.v + "";
                    typeResult[index] = currentData.t + "";
                }
                if (currentData.s !== undefined) {
                    styleResult[index] = +currentData.s;
                }
            }
            return {
                value: valueResult,
                type: typeResult,
                cellStyle: styleResult
            };
        }
        function parseRow(data) {
            var rowData = data.row;
            var heightResult = {};
            var styleResult = {};
            var current;
            for (var i = 0, len = rowData.length; i < len; i++) {
                current = rowData[i];
                if (current.h !== undefined) {
                    heightResult[current.r] = current.h;
                }
                if (current.s !== undefined) {
                    styleResult[current.r] = current.s;
                }
            }
            return {
                height: heightResult,
                style: styleResult
            };
        }
        function parseColumn(data) {
            var columnData = data.column;
            var widthResult = {};
            var styleResult = {};
            var current;
            for (var i = 0, len = columnData.length; i < len; i++) {
                current = columnData[i];
                if (current.w !== undefined) {
                    widthResult[current.c] = current.w;
                }
                if (current.s !== undefined) {
                    styleResult[current.c] = current.s;
                }
            }
            return {
                width: widthResult,
                style: styleResult
            };
        }
        function importStyleGroup(data) {
            var result = {};
            var source = data.styleSheet;
            result.fonts = importFonts();
            result.alignments = importAlignments();
            result.fills = importFills();
            result.borders = importBorders();
            return result;
            function importFonts() {
                var res = [];
                var fontData = source.fonts;
                var fontOrder = STYLE_GROUP.fonts[0];
                var tmp;
                var currentData;
                for (var i = 0, len = fontData.length; i < len; i++) {
                    tmp = {};
                    currentData = fontData[i];
                    for (var key in fontOrder) {
                        if (!fontOrder.hasOwnProperty(key)) {
                            continue;
                        }
                        tmp[key] = currentData[key] || DEFAULT_STYLE_VALUE[key];
                    }
                    res.push(tmp);
                }
                return res;
            }
            function importAlignments() {
                var res = [];
                var alignmentData = source.alignments;
                var alignmentOrder = STYLE_GROUP.alignments[0];
                var tmp;
                var currentData;
                for (var i = 0, len = alignmentData.length; i < len; i++) {
                    tmp = {};
                    currentData = alignmentData[i];
                    for (var key in alignmentOrder) {
                        if (!alignmentOrder.hasOwnProperty(key)) {
                            continue;
                        }
                        switch (key) {
                          case "horizontal":
                            tmp[key] = VALUE_FILTER.horizontal[currentData[key] || DEFAULT_STYLE_VALUE[key]];
                            break;

                          case "vertical":
                            tmp[key] = VALUE_FILTER.vertical[currentData[key] || DEFAULT_STYLE_VALUE[key]];
                            break;

                          case "wraptext":
                            tmp[key] = +(currentData[key] || DEFAULT_STYLE_VALUE[key]);
                            break;
                        }
                    }
                    res.push(tmp);
                }
                return res;
            }
            function importFills() {
                var res = [];
                var fillData = source.fills;
                var currentData;
                for (var i = 0, len = fillData.length; i < len; i++) {
                    currentData = fillData[i];
                    res.push({
                        fill: currentData || DEFAULT_STYLE_VALUE["fill"]
                    });
                }
                return res;
            }
            function importBorders() {
                var res = [];
                var borderData = source.borders;
                var borderOrder = STYLE_GROUP.borders[0].border;
                var tmp;
                var currentData;
                for (var i = 0, len = borderData.length; i < len; i++) {
                    tmp = {};
                    currentData = borderData[i];
                    for (var key in borderOrder) {
                        if (!borderOrder.hasOwnProperty(key)) {
                            continue;
                        }
                        if (currentData[key]) {
                            if (currentData[key] === NONE) {
                                tmp[key] = NONE;
                            } else {
                                tmp[key] = {
                                    style: BORDER_STYLE[currentData[key].style] || BORDER_STYLE.thin,
                                    color: currentData[key].color
                                };
                            }
                        } else {
                            tmp[key] = DEFAULT_STYLE_VALUE.border[key];
                        }
                    }
                    res.push({
                        border: tmp
                    });
                }
                return res;
            }
        }
        function parseMergeCells(data) {
            var mergeCellsData = data.mergeCells;
            var mergeMap = {};
            var result = {};
            var currentData;
            var startData;
            var endData;
            var key;
            for (var i = 0, len = mergeCellsData.length; i < len; i++) {
                currentData = mergeCellsData[i];
                key = HASH.indexToKey(currentData.start.r, currentData.start.c);
                startData = currentData.start;
                endData = currentData.end;
                result[key] = {
                    start: {
                        row: startData.r,
                        col: startData.c
                    },
                    end: {
                        row: endData.r,
                        col: endData.c
                    }
                };
                for (var j = startData.r, jlimit = endData.r; j <= jlimit; j++) {
                    for (var k = startData.c, klimit = endData.c; k <= klimit; k++) {
                        mergeMap[[ HASH.indexToKey(j, k) ]] = key;
                    }
                }
            }
            return {
                cells: result,
                map: mergeMap
            };
        }
        function importStyleIndex(data) {
            var result = [];
            var indexData = data.styleSheet.cellXfs;
            for (var i = 0, len = indexData.length; i < len; i++) {
                var current = indexData[i];
                // 注意顺序
                result.push({
                    fonts: current.font ? +current.font : 0,
                    borders: current.border ? +current.border : 0,
                    fills: current.fill ? +current.fill : 0,
                    alignments: current.align ? +current.align : 0,
                    applyFont: current.applyFont === 0 ? 0 : 1,
                    applyBorder: current.applyBorder === 0 ? 0 : 1,
                    applyFill: current.applyFill === 0 ? 0 : 1,
                    applyAlignment: current.applyAlignment === 0 ? 0 : 1
                });
            }
            return result;
        }
        function importXfStyleList(data) {
            var result = [];
            var indexData = data.styleSheet.cellStyleXfs;
            for (var i = 0, len = indexData.length; i < len; i++) {
                var current = indexData[i];
                // 注意顺序
                result.push({
                    fonts: current.font ? +current.font : 0,
                    borders: current.border ? +current.border : 0,
                    fills: current.fill ? +current.fill : 0,
                    alignments: current.align ? +current.align : 0,
                    xf: current.xfId ? +current.xfId : 0,
                    applyFont: current.applyFont ? 1 : 0,
                    applyBorder: current.applyBorder ? 1 : 0,
                    applyFill: current.applyFill ? 1 : 0,
                    applyAlignment: current.applyAlignment ? 1 : 0
                });
            }
            return result;
        }
        return importExcel;
    }
};

//src/kernel/border-type.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[102] = {
    value: function() {
        return [ "top", "right", "bottom", "left" ];
    }
};

//src/kernel/data.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[103] = {
    value: function(require) {
        var map = _p.r(105);
        var data = {
            total: {
                row: 100,
                col: 26
            },
            // 手动调整行高记录
            row: {},
            // 主动调整列宽记录
            column: {},
            value: {},
            defaultStyle: $._clone(_p.r(11)),
            // 样式
            columnStyle: {},
            rowStyle: {},
            cellStyle: [],
            // 命名单元格vi
            name: {},
            numberFormat: {},
            rowNumberFormat: {},
            columnNumberFormat: {},
            formatCodeMap: {},
            customCodeIndex: 0,
            mergeMap: {},
            merge: {},
            cellType: {},
            // 窗格
            pane: {
                row: 10,
                col: -1
            },
            // 数据维度
            dimension: {
                row: [],
                col: []
            },
            dimensionIndex: {
                row: -1,
                col: -1
            },
            dimensionValid: {
                row: true,
                col: true
            },
            // 维度行列变更记录
            dimensionChanged: {
                row: {},
                col: {}
            }
        };
        $.extend(data, _p.r(132));
        return data;
    }
};

//src/kernel/definition/default-style-value.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[104] = {
    value: function(require) {
        var NONE = _p.r(74);
        return {
            color: NONE,
            name: NONE,
            bold: false,
            italic: false,
            underline: false,
            throughline: false,
            size: NONE,
            fill: NONE,
            border: {
                top: NONE,
                left: NONE,
                right: NONE,
                bottom: NONE
            },
            wraptext: false,
            horizontal: NONE,
            vertical: NONE
        };
    }
};

//src/kernel/escape-map.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[105] = {
    value: {
        color: "c",
        backgroundColor: "b",
        textAlign: "h",
        verticalAlign: "v",
        underline: "u",
        throughline: "t",
        fontStyle: "f",
        fontWeight: "w",
        fontSize: "s",
        fontFamily: "m",
        wraptext: "w"
    }
};

//src/kernel/hash.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[106] = {
    value: function(require) {
        var MAX_COLUMN_COUNT = _p.r(128).MAX_COLUMN_COUNT;
        return {
            indexToKey: function(row, col) {
                return row * MAX_COLUMN_COUNT + +col;
            },
            indexToKeys: function(start, end) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var keys = [];
                var index;
                for (var i = startRow, limit = endRow; i <= limit; i++) {
                    index = i * MAX_COLUMN_COUNT + +startCol;
                    for (var j = startCol, jlimit = endCol; j <= jlimit; j++, index++) {
                        keys.push(index);
                    }
                }
                return keys;
            },
            keyToIndex: function(key) {
                return {
                    row: Math.floor(key / MAX_COLUMN_COUNT),
                    col: key % MAX_COLUMN_COUNT
                };
            }
        };
    }
};

//src/kernel/helper.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[107] = {
    value: function(require) {
        var HASH = _p.r(106);
        var ExchangeHelper = _p.r(108);
        return {
            exchangeRow: function(data, index, range) {
                ExchangeHelper.exchangeRow(data, index, range);
            }
        };
    }
};

//src/kernel/helpers/exchange-helper.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[108] = {
    value: function(require) {
        var HASH = _p.r(106);
        function exchangeRow(data, index, range) {
            // result index
            var keys;
            // original index
            var originalKeys;
            var startRow = range.start.row;
            for (var i = range.start.col, limit = range.end.col; i <= limit; i++) {
                keys = [];
                originalKeys = [];
                for (var j = 0, jlen = index.length; j < jlen; j++) {
                    keys.push(HASH.indexToKey(index[j], i));
                    originalKeys.push(HASH.indexToKey(startRow + j, i));
                }
                exchange(data, keys, originalKeys);
            }
        }
        function exchange(source, index, originalIndex) {
            var cache = {};
            var from;
            var to;
            for (var i = 0, len = index.length; i < len; i++) {
                from = index[i];
                to = originalIndex[i];
                if (from === to) {
                    continue;
                }
                cache[to] = source[to];
                if (from < to) {
                    source[to] = cache[from];
                } else {
                    source[to] = source[from];
                    source[from] = undefined;
                }
            }
        }
        return {
            exchangeRow: exchangeRow
        };
    }
};

//src/kernel/interpreter/command.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[109] = {
    value: function(require) {
        return $.extend({
            bind: function(data) {
                this.data = data;
            },
            execCommand: function(commandName) {
                var args = [].slice.call(arguments);
                this.interpreter.exec(this.data, args);
            }
        }, _p.r(118));
    }
};

//src/kernel/interpreter/commands/clear.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[110] = {
    value: function(require) {
        function ClearCommand() {}
        $.extend(ClearCommand, $.extend({
            exec: function(commandName, ranges) {
                if (commandName === "clearcontent") {
                    this.kernelClearValue(ranges);
                } else {
                    this.kernelClearStyle(ranges);
                }
            }
        }, _p.r(109)));
        return ClearCommand;
    }
};

//src/kernel/interpreter/commands/export.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[111] = {
    value: function(require) {
        function ExportCommand() {}
        $.extend(ExportCommand, $.extend({
            exec: function(commandName, isSimple) {
                if (commandName === "export") {
                    return this.kernelExport(isSimple);
                } else {
                    return this.kernelExportExcel();
                }
            }
        }, _p.r(109)));
        return ExportCommand;
    }
};

//src/kernel/interpreter/commands/paste.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[112] = {
    value: function(require) {
        function PasteCommand() {}
        $.extend(PasteCommand, $.extend({
            exec: function(commandName, data, styles, point, range) {
                if (commandName === "paste") {
                    this.paste(data, styles, point);
                } else {
                    this.cut(data, styles, point, range);
                }
            },
            paste: function(data, styles, point) {
                this.batchWriteCell(data, point.row, point.col);
                if (styles) {
                    this.kernelBatchSetStyle(styles, point.row, point.col);
                }
            },
            cut: function(data, styles, point, range) {
                this.execCommand("clearcontent", [ range ]);
                this.execCommand("clearformat", [ range ]);
                this.paste(data, styles, point);
            },
            batchWriteCell: function(contents, row, col) {
                var rowContents;
                for (var i = 0, len = contents.length; i < len; i++) {
                    rowContents = contents[i];
                    for (var j = 0, jlen = rowContents.length; j < jlen; j++) {
                        this.execCommand("write", rowContents[j], row + i, col + j);
                    }
                }
            }
        }, _p.r(109)));
        return PasteCommand;
    }
};

//src/kernel/interpreter/commands/resize.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[113] = {
    value: function(require) {
        function ResizeCommand() {}
        $.extend(ResizeCommand, $.extend({
            exec: function(commandName, size, index) {
                if (commandName === "resizerow") {
                    this.kernelSetRowHeight(size, index);
                } else {
                    this.kernelSetColumnWidth(size, index);
                }
            }
        }, _p.r(109)));
        return ResizeCommand;
    }
};

//src/kernel/interpreter/commands/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[114] = {
    value: function(require) {
        function StyleCommand() {}
        $.extend(StyleCommand, $.extend({
            exec: function(commandName) {
                this[commandName].apply(this, [].slice.call(arguments, 1));
            },
            color: function(val, start, end) {
                this.kernelSetStyle("color", val, start, end);
            },
            fontsize: function(val, start, end) {
                this.kernelSetStyle("fontSize", val, start, end);
            },
            font: function(val, start, end) {
                this.kernelSetStyle("fontFamily", val, start, end);
            },
            italic: function(start, end) {
                if (this.kernelGetStyle(start.row, start.col).fontStyle === "italic") {
                    this.kernelSetStyle("fontStyle", undefined, start, end);
                } else {
                    this.kernelSetStyle("fontStyle", "italic", start, end);
                }
            },
            bold: function(start, end) {
                if (this.kernelGetStyle(start.row, start.col).fontWeight === "bold") {
                    this.kernelSetStyle("fontWeight", undefined, start, end);
                } else {
                    this.kernelSetStyle("fontWeight", "bold", start, end);
                }
            },
            fill: function(val, start, end) {
                this.kernelSetStyle("backgroundColor", val, start, end);
            },
            horizontal: function(val, start, end) {
                this.kernelSetStyle("textAlign", val, start, end);
            },
            vertical: function(val, start, end) {
                this.kernelSetStyle("verticalAlign", val, start, end);
            }
        }, _p.r(109)));
        return StyleCommand;
    }
};

//src/kernel/interpreter/commands/write.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[115] = {
    value: function(require) {
        function WriteCommand() {}
        $.extend(WriteCommand, $.extend({
            exec: function(commandName, content, row, col) {
                this.kernelSetValue(content, row, col);
            }
        }, _p.r(109)));
        return WriteCommand;
    }
};

//src/kernel/interpreter/interpreter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[116] = {
    value: function(require) {
        var COMMAND_MAP = _p.r(117);
        function Interpreter() {}
        $.extend(Interpreter.prototype, {
            exec: function(data, commandArgs) {
                var commandName = commandArgs[0];
                var command = COMMAND_MAP[commandName];
                if (!command) {
                    return;
                }
                command.bind(data);
                command.interpreter = this;
                return command.exec.apply(command, commandArgs);
            },
            createSheet: function() {
                return $.clone(_p.r(103), true);
            }
        });
        return Interpreter;
    }
};

//src/kernel/interpreter/map.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[117] = {
    value: function(require) {
        var StyleCommand = _p.r(114);
        var ResizeCommand = _p.r(113);
        var ClearCommand = _p.r(110);
        var WriteCommand = _p.r(115);
        var ExportCommand = _p.r(111);
        var PasteCommand = _p.r(112);
        return {
            write: WriteCommand,
            clearcontent: ClearCommand,
            clearformat: ClearCommand,
            color: StyleCommand,
            bold: StyleCommand,
            font: StyleCommand,
            fontsize: StyleCommand,
            italic: StyleCommand,
            vertical: StyleCommand,
            horizontal: StyleCommand,
            resizecol: ResizeCommand,
            resizerow: ResizeCommand,
            fill: StyleCommand,
            "export": ExportCommand,
            exportexcel: ExportCommand,
            paste: PasteCommand,
            cut: PasteCommand
        };
    }
};

//src/kernel/kernel.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[118] = {
    value: function(require) {
        var MIN_SIZE = 5;
        var KERNEL_DATA = _p.r(103);
        var ESCAPE_MAP = _p.r(105);
        var UNESCAPE_MAP = _p.r(133);
        var HASH = _p.r(106);
        var KernelHelper = _p.r(107);
        return $.extend({
            /* ---------------- read ---------------- */
            kernelCreateSheet: function() {
                return $._clone(KERNEL_DATA);
            },
            kernelGetCellByName: function(name) {},
            kernelGetValue: function(row, col) {
                return this.data.value[HASH.indexToKey(row, col)];
            },
            kernelGetRowHeight: function(row) {
                return this.data.row[row];
            },
            kernelGetColumnWidth: function(col) {
                return this.data.column[col];
            },
            kernelGetTotal: function() {
                return this.data.total;
            },
            kernelGetTotalIndex: function() {
                var total = this.data.total;
                return {
                    row: total.row - 1,
                    col: total.col - 1
                };
            },
            kernelGetDefaultStyle: function(classify) {
                return this.data.defaultStyle[classify];
            },
            kernelGetCellType: function(row, col) {
                return this.data.cellType[this.indexToKey(row, col)];
            },
            /* ---------------- write ---------------- */
            kernelClearValue: function(ranges) {
                var data = this.data.value;
                var _self = this;
                var total = this.data.total;
                for (var i = 0, len = ranges.length; i < len; i++) {
                    if (clear(ranges[i].start, ranges[i].end)) {
                        break;
                    }
                }
                function clear(start, end) {
                    var allCount = total.row * total.col;
                    var clearCount = (end.row - start.row + 1) * (end.col - start.col + 1);
                    var index;
                    // 全部清除
                    if (allCount === clearCount) {
                        _self.data.value = {};
                        // 维度变更
                        this.__kernelClearAllDimension();
                        return true;
                    }
                    for (var i = start.row, limit = end.row; i <= limit; i++) {
                        for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                            index = HASH.indexToKey(i, j);
                            if (data[index]) {
                                data[index] = undefined;
                            }
                        }
                    }
                    // 维度变更
                    this.__kernelBatchClearDimension(start, end);
                    return false;
                }
            },
            kernelSetValue: function(value, row, col) {
                var data = this.data.value;
                var index = HASH.indexToKey(row, col);
                if (!value) {
                    if (data[index]) {
                        data[index] = undefined;
                    }
                    this.__kernelClearDimension(row, col);
                } else {
                    data[index] = value;
                    this.__kernelAddDimension(row, col);
                }
            },
            kernelBatchSetValue: function(contents, row, col) {
                var data = this.data.value;
                var index;
                var rowContents;
                var value;
                for (var i = 0, len = contents.length; i < len; i++) {
                    rowContents = contents[i];
                    for (var j = 0, jlen = rowContents.length; j < jlen; j++) {
                        index = HASH.indexToKey(row + i, col + j);
                        value = rowContents[j] || undefined;
                        data[index] = value;
                        if (value) {
                            this.__kernelAddDimension(row + i, col + j);
                        } else {
                            this.__kernelClearDimension(row + i, col + j);
                        }
                    }
                }
            },
            kernelSetCellType: function(type, row, col) {
                if (!type) {
                    this.kernelClearCellType(row, col);
                } else {
                    this.data.cellType[this.indexToKey(row, col)] = type;
                }
            },
            kernelClearCellType: function(row, col) {
                this.data.cellType[this.indexToKey(row, col)] = undefined;
            },
            kernelSetColumnWidth: function(value, col) {
                if (!value) {
                    this.data.column[col] = undefined;
                } else {
                    this.data.column[col] = Math.max(value, MIN_SIZE);
                }
            },
            kernelSetRowHeight: function(value, row) {
                if (!value) {
                    this.data.row[row] = undefined;
                } else {
                    this.data.row[row] = Math.max(value, MIN_SIZE);
                }
            },
            kernelExchangeRow: function(index, range) {
                var data = this.data;
                var styleData = data.style;
                KernelHelper.exchangeRow(data.value, index, range);
                KernelHelper.exchangeRow(data.format, index, range);
                var keys = Object.keys(UNESCAPE_MAP);
                keys.forEach(function(key) {
                    KernelHelper.exchangeRow(styleData[key], index, range);
                });
            },
            /* ---------------- private ---------------- */
            __kernelEscape: function(styles) {
                if (!styles) {
                    return styles;
                }
                var result = {};
                for (var key in styles) {
                    if (styles.hasOwnProperty(key)) {
                        result[ESCAPE_MAP[key]] = styles[key];
                    }
                }
                return result;
            },
            __kernelUnescape: function(styles) {
                if (!styles) {
                    return styles;
                }
                var result = {};
                for (var key in styles) {
                    if (styles.hasOwnProperty(key)) {
                        result[UNESCAPE_MAP[key]] = styles[key];
                    }
                }
                return result;
            },
            __kernelGetRangeType: function(start, end) {
                var totalIndex = this.kernelGetTotalIndex();
                var isFullRow = start.row === 0 && end.row >= totalIndex.row;
                var isFullColumn = start.col === 0 && end.col >= totalIndex.col;
                if (isFullColumn && isFullRow) {
                    return "ALL";
                }
                if (isFullColumn) {
                    return "ROW";
                }
                if (isFullRow) {
                    return "COLUMN";
                }
                return "RANGE";
            }
        }, _p.r(106), _p.r(121), _p.r(125), _p.r(127), _p.r(124), _p.r(119), _p.r(122), _p.r(123), _p.r(125), _p.r(120), _p.r(119));
    }
};

//src/kernel/kernels/border.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[119] = {
    value: function(require) {
        var StyleUtil = _p.r(126);
        var NONE = _p.r(74);
        return {
            kernelGetBorder: function(row, col) {
                var data = this.data;
                var cellStyle = data.cellStyle;
                var rowStyle = data.rowStyle;
                var columnStyle = data.columnStyle;
                var styleIndex = data.styleIndex;
                var index = cellStyle[row][col];
                if (index !== undefined && styleIndex[index].applyBorder === 1) {
                    return styleIndex[index].borders;
                }
                index = rowStyle[row];
                if (index !== undefined && styleIndex[index].applyBorder === 1) {
                    return styleIndex[index].borders;
                }
                index = columnStyle[col];
                if (index !== undefined && styleIndex[index].applyBorder === 1) {
                    return styleIndex[index].borders;
                }
                return undefined;
            },
            kernelGetBorders: function(start, end) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var borders = [];
                var rowBorders;
                for (var i = startRow; i <= endRow; i++) {
                    rowBorders = [];
                    for (var j = startCol; j <= endCol; j++) {
                        rowBorders.push(this.kernelGetBorder(i, j));
                    }
                    borders.push(rowBorders);
                }
                return borders;
            },
            kernelSetBorder: function(borderOption, start, end) {
                if (!borderOption) {
                    borderOption = {
                        top: NONE,
                        left: NONE,
                        right: NONE,
                        bottom: NONE
                    };
                }
                var rangeType = this.__kernelGetRangeType(start, end);
                switch (rangeType) {
                  case "ALL":
                    this.__kernelSetAllBorder(borderOption);
                    break;

                  case "ROW":
                    this.__kernelSetRowBorder(borderOption, start.row, end.row);
                    break;

                  case "COLUMN":
                    this.__kernelSetColumnBorder(borderOption, start.col, end.col);
                    break;

                  case "RANGE":
                    this.__kernelSetRangeBorder(borderOption, start, end);
                    break;
                }
            },
            __kernelGetBorderByIndex: function(index) {
                return this.styleGroup.borders[index].border;
            },
            __kernelSetAllBorder: function(borderOption) {
                var totalIndex = this.kernelGetTotalIndex();
                this.__kernelSetColumnBorder(borderOption, 0, totalIndex.col);
            },
            __kernelSetRowBorder: function(borderOption, startIndex, endIndex, isClear) {
                var index;
                var rowStyle = this.data.rowStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = rowStyle[i] || 0;
                    rowStyle[i] = StyleUtil.generateBorder(this.data, index, borderOption);
                }
                // 补齐在行内的单元格样式
                this.__patchRowCellBorder(borderOption, startIndex, endIndex);
                // 覆盖交叉的列数据
                this.__overlayColumnBorder(borderOption, startIndex, endIndex);
                if (isClear === false) {
                    return;
                }
                // 清除上一行数据
                startIndex -= 1;
                if (startIndex >= 0) {
                    this.__clearRowBorder({
                        bottom: NONE
                    }, startIndex);
                }
                // 清除下一行数据
                endIndex += 1;
                this.__clearRowBorder({
                    top: NONE
                }, endIndex);
            },
            __kernelSetColumnBorder: function(borderOption, startIndex, endIndex, isClear) {
                var index;
                var columnStyle = this.data.columnStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = columnStyle[i] || 0;
                    columnStyle[i] = StyleUtil.generateBorder(this.data, index, borderOption);
                }
                this.__patchColumnCellBorder(borderOption, startIndex, endIndex);
                this.__overlayRowBorder(borderOption, startIndex, endIndex);
                if (isClear === false) {
                    return;
                }
                // 清除左列数据
                startIndex -= 1;
                if (startIndex >= 0) {
                    this.__clearColumnBorder({
                        right: NONE
                    }, startIndex);
                }
                // 清除右列数据
                endIndex += 1;
                this.__clearColumnBorder({
                    left: NONE
                }, endIndex);
            },
            __kernelSetRangeBorder: function(borderOption, start, end, isClear) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var index;
                var cellStyle = this.data.cellStyle;
                for (var i = startRow; i <= endRow; i++) {
                    for (var j = startCol; j <= endCol; j++) {
                        index = this.__getStyleIndex(i, j) || 0;
                        cellStyle[i][j] = StyleUtil.generateBorder(this.data, index, borderOption);
                    }
                }
                if (isClear === false) {
                    return;
                }
                // clear top
                if (startRow > 0) {
                    this.__kernelSetRangeBorder({
                        bottom: NONE
                    }, {
                        row: startRow - 1,
                        col: startCol
                    }, {
                        row: startRow - 1,
                        col: endCol
                    }, false);
                }
                // clear bottom
                this.__kernelSetRangeBorder({
                    top: NONE
                }, {
                    row: endRow + 1,
                    col: startCol
                }, {
                    row: endRow + 1,
                    col: endCol
                }, false);
                // clear left
                if (startCol > 0) {
                    this.__kernelSetRangeBorder({
                        right: NONE
                    }, {
                        row: startRow,
                        col: startCol - 1
                    }, {
                        row: endRow,
                        col: startCol - 1
                    }, false);
                }
                this.__kernelSetRangeBorder({
                    left: NONE
                }, {
                    row: startRow,
                    col: endCol + 1
                }, {
                    row: endRow,
                    col: endCol + 1
                }, false);
            },
            __clearRowBorder: function(borderOption, index) {
                var currentIndex = this.data.rowStyle[index];
                var styleIndex = this.data.styleIndex;
                var currentStyle = styleIndex[currentIndex];
                // 该行有有效行样式，则按设置行样式执行
                if (currentStyle && currentStyle.applyBorder === 1) {
                    this.__kernelSetRowBorder(borderOption, index, index, false);
                } else {
                    // 没有行样式，则单独设置交叉的单元格
                    this.__patchRowCellBorder(borderOption, index, index);
                    // 覆盖与该行交叉的列数据
                    this.__overlayColumnBorder(borderOption, index, index);
                }
            },
            __clearColumnBorder: function(borderOption, index) {
                var currentIndex = this.data.columnStyle[index];
                var styleIndex = this.data.styleIndex;
                var currentStyle = styleIndex[currentIndex];
                // 该列包含有效列样式
                if (currentStyle && currentStyle.applyBorder === 1) {
                    this.__kernelSetColumnBorder(borderOption, index, index, false);
                } else {
                    this.__patchColumnCellBorder(borderOption, index, index);
                    this.__overlayRowBorder(borderOption, index, index);
                }
            },
            __patchRowCellBorder: function(borderOption, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    rowCellStyle = cellStyle[i];
                    for (var j = 0, jlen = rowCellStyle.length; j < jlen; j++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立数据，则跳过不补齐
                        if (currentCellStyle === undefined) {
                            continue;
                        }
                        newIndex = StyleUtil.generateBorder(this.data, currentCellStyle, borderOption);
                        // 新生成的样式和现有的行样式一致，则清除该单元格的样式
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            __patchColumnCellBorder: function(borderOption, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = cellStyle.length; i < len; i++) {
                    rowCellStyle = cellStyle[i];
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立单元格数据， 跳过
                        if (!currentCellStyle) {
                            continue;
                        }
                        newIndex = StyleUtil.generateBorder(this.data, currentCellStyle, borderOption);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            // 覆盖与行重叠的列
            __overlayColumnBorder: function(borderOption, startIndex, endIndex) {
                var columnStyle = this.data.columnStyle;
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    for (var j = 0, jlen = columnStyle.length; j < jlen; j++) {
                        // 不存在列样式
                        // 或者，该行列单元格已经存在独立样式，跳过
                        if (!columnStyle[j] || cellStyle[i][j]) {
                            continue;
                        }
                        // 合并行列样式
                        newIndex = StyleUtil.mergeBorder(this.data, columnStyle[j], rowStyle[i], borderOption);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            },
            __overlayRowBorder: function(borderOption, startIndex, endIndex) {
                var rowStyle = this.data.rowStyle;
                var cellStyle = this.data.cellStyle;
                var columnStyle = this.data.columnStyle;
                var currentRowStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = rowStyle.length; i < len; i++) {
                    currentRowStyle = rowStyle[i];
                    if (!currentRowStyle) {
                        continue;
                    }
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = cellStyle[i][j];
                        // 不存在该列样式
                        // 已存在独立单元格样式， 跳过
                        if (!columnStyle[j] || currentCellStyle) {
                            continue;
                        }
                        // 合并行列样式， 基于合并后的样式，结合新增加的样式，生成新的样式
                        newIndex = StyleUtil.mergeBorder(this.data, columnStyle[j], currentRowStyle, borderOption);
                        // 行样式和单元格样式一致，则清除单元格样式
                        if (currentRowStyle === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            }
        };
    }
};

//src/kernel/kernels/dimension.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[120] = {
    value: function(require) {
        var MAX_COLUMN_COUNT = _p.r(128).MAX_COLUMN_COUNT;
        var maxFn = Math.max;
        return {
            kernelGetDimension: function(ignoreValid) {
                var dimensionIndex = this.data.dimensionIndex;
                var dimensionValid = this.data.dimensionValid;
                // 忽略数据是否合法， 该参数仅供底层使用。上层插件禁止调用
                if (ignoreValid) {
                    // 注意：行列值要进行交换。
                    return {
                        row: dimensionIndex.col,
                        col: dimensionIndex.row
                    };
                }
                if (!dimensionValid.row) {
                    this.__kernelUpdateRowDimension();
                }
                if (!dimensionValid.col) {
                    this.__kernelUpdateColumnDimension();
                }
                // 注意：行列值要进行交换。
                return {
                    row: dimensionIndex.col,
                    col: dimensionIndex.row
                };
            },
            __kernelClearDimension: function(row, col) {
                var dimensionData = this.data.dimension;
                var rowDimensionData = dimensionData.row;
                var columnDimensionData = dimensionData.col;
                var max = rowDimensionData[row];
                if (max === col) {
                    // 置行维度记录为无效
                    this.__kernelInvalidRowDimension(row);
                }
                max = columnDimensionData[col];
                if (max === row) {
                    this.__kernelInvalidColumnDimension(col);
                }
            },
            __kernelClearAllDimension: function() {
                this.data.dimensionValid = {
                    row: true,
                    col: true
                };
                this.data.dimension = {
                    row: [],
                    col: []
                };
                this.data.dimensionIndex = {
                    row: -1,
                    col: -1
                };
                this.data.dimensionValid = {
                    row: true,
                    col: true
                };
                this.data.dimensionChanged = {
                    row: {},
                    col: {}
                };
            },
            __kernelBatchClearDimension: function(start, end) {
                var dimensionValid = this.data.dimensionValid;
                var changedRecord = this.data.dimensionChanged;
                dimensionValid.row = false;
                dimensionValid.col = false;
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    changedRecord.row[i] = true;
                }
                for (var i = start.col, limit = end.col; i <= limit; i++) {
                    changedRecord.col[i] = true;
                }
            },
            __kernelAddDimension: function(row, col) {
                var dimensionData = this.data.dimension;
                var dimensionIndex = this.data.dimensionIndex;
                var rowDimensionData = dimensionData.row;
                var columnDimensionData = dimensionData.col;
                var max = rowDimensionData[row] || 0;
                rowDimensionData[row] = Math.max(max, col);
                if (rowDimensionData[row] > dimensionIndex.row) {
                    dimensionIndex.row = rowDimensionData[row];
                }
                max = columnDimensionData[col] || 0;
                columnDimensionData[col] = Math.max(max, row);
                if (columnDimensionData[col] > dimensionIndex.col) {
                    dimensionIndex.col = columnDimensionData[col];
                }
            },
            __kernelInvalidRowDimension: function(index) {
                this.data.dimensionValid.row = false;
                this.data.dimensionChanged.row[index] = true;
            },
            __kernelInvalidColumnDimension: function(index) {
                this.data.dimensionValid.col = false;
                this.data.dimensionChanged.col[index] = true;
            },
            __kernelUpdateRowDimension: function() {
                var rowDimensionData = this.data.dimension.row;
                var changedRecord = this.data.dimensionChanged.row;
                var keys = Object.keys(rowDimensionData);
                var indexes = [];
                // 重置变更数据行的记录
                for (var key in changedRecord) {
                    if (changedRecord.hasOwnProperty(key)) {
                        this.__kernelResetRowDimension(key);
                        delete changedRecord[key];
                    }
                }
                for (var i = 0, len = keys.length; i < len; i++) {
                    indexes[i] = rowDimensionData[keys[i]];
                }
                this.data.dimensionIndex.row = maxFn.apply(null, indexes);
            },
            __kernelUpdateColumnDimension: function() {
                var columnDimensionData = this.data.dimension.col;
                var changedRecord = this.data.dimensionChanged.col;
                var keys = Object.keys(columnDimensionData);
                var indexes = [];
                for (var key in changedRecord) {
                    if (changedRecord.hasOwnProperty(key)) {
                        this.__kernelRestColumnDimension(key);
                        delete changedRecord[key];
                    }
                }
                for (var i = 0, len = keys.length; i < len; i++) {
                    indexes[i] = columnDimensionData[keys[i]];
                }
                this.data.dimensionIndex.col = maxFn.apply(null, indexes);
            },
            __kernelResetRowDimension: function(row) {
                var max = this.data.dimension.row[row];
                if (!max) {
                    return 0;
                }
                var pool = this.data.value;
                var maxIndex = this.indexToKey(row, max);
                var minIndex = this.indexToKey(row, 0);
                var index;
                var val;
                for (var i = maxIndex; i >= minIndex; i--) {
                    val = pool[i];
                    if (val) {
                        index = i;
                        break;
                    }
                }
                if (index !== undefined) {
                    this.data.dimension.row[row] = this.keyToIndex(index).col;
                } else {
                    this.data.dimension.row[row] = -1;
                }
            },
            __kernelRestColumnDimension: function(col) {
                var max = this.data.dimension.col[col];
                if (!max) {
                    return 0;
                }
                var pool = this.data.value;
                var maxIndex = this.indexToKey(max, col);
                var minIndex = this.indexToKey(0, col);
                var index;
                var val;
                for (var i = maxIndex; i >= minIndex; i -= MAX_COLUMN_COUNT) {
                    val = pool[i];
                    if (val) {
                        index = i;
                        break;
                    }
                }
                if (index !== undefined) {
                    this.data.dimension.col[col] = this.keyToIndex(index).row;
                } else {
                    this.data.dimension.col[col] = -1;
                }
            }
        };
    }
};

//src/kernel/kernels/io.js
/**
 * @file 导入导出BTable数据
 * @author hancong03@baiud.com
 */
_p[121] = {
    value: function(require) {
        var HASH = _p.r(106);
        var KERNEL_DATA = _p.r(103);
        return {
            /**
         * 获取存储数据，该数据是btable使用的数据格式
         * @returns {*}
         */
            kernelExport: function() {
                var data = this.data;
                return JSON.stringify({
                    total: data.total,
                    row: data.row,
                    column: data.column,
                    value: data.value,
                    cellType: data.cellType,
                    cellStyle: exportCellStyle(data.cellStyle),
                    rowStyle: data.rowStyle,
                    columnStyle: data.columnStyle,
                    styleGroup: data.styleGroup,
                    styleIndex: data.styleIndex,
                    merge: data.merge,
                    numberFormat: data.numberFormat,
                    formatCodeMap: data.formatCodeMap,
                    customCodeIndex: data.customCodeIndex
                });
            },
            kernelImport: function(data) {
                data = $.extend($._clone(KERNEL_DATA), data);
                var styleGroup = data.styleGroup;
                var groupMap = data.styleGroupMap;
                var target;
                for (var groupName in styleGroup) {
                    target = styleGroup[groupName][0];
                    groupMap[groupName] = {};
                    groupMap[groupName][JSON.stringify(target)] = 0;
                }
                // 生成样式索引映射
                data.styleIndexMap[JSON.stringify(data.styleIndex[0])] = 0;
                // 边框索引
                data.borderMap[JSON.stringify(data.styleGroup.borders[0].border)] = 0;
                data.cellStyle = importCellStyle(data);
                data.defaultStyle = importDefaultStyle(data);
                data.rowStyle = data.rowStyle;
                data.columnStyle = data.columnStyle;
                return data;
            }
        };
        function exportCellStyle(data) {
            var result = {};
            var rowData;
            var currentData;
            for (var i = 0, len = data.length; i < len; i++) {
                rowData = data[i];
                for (var j = 0, jlen = rowData.length; j < jlen; j++) {
                    currentData = rowData[j];
                    if (currentData !== undefined) {
                        result[HASH.indexToKey(i, j)] = currentData;
                    }
                }
            }
            return result;
        }
        function importCellStyle(data) {
            var originalCellStyle = data.cellStyle;
            var newCellStyle = [];
            var index;
            for (var i = 0, len = data.total.row; i < len; i++) {
                newCellStyle[i] = [];
            }
            for (var key in originalCellStyle) {
                if (!originalCellStyle.hasOwnProperty(key)) {
                    continue;
                }
                index = HASH.keyToIndex(key);
                newCellStyle[index.row][index.col] = originalCellStyle[key];
            }
            return newCellStyle;
        }
        function importDefaultStyle(data) {
            var result = {};
            var defaultStyle = data.defaultStyle;
            var styleGroup = data.styleGroup;
            for (var key in styleGroup) {
                if (!styleGroup.hasOwnProperty(key)) {
                    continue;
                }
                result[key] = $._extend($._clone(defaultStyle[key]), styleGroup[key][0]);
            }
            return result;
        }
    }
};

//src/kernel/kernels/merge.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[122] = {
    value: function(require) {
        var HASH = _p.r(106);
        var NONE = "none";
        return {
            kernelSetMerge: function(range) {
                var data = this.data;
                var cellStyle = data.cellStyle;
                var mergeMap = this.data.mergeMap;
                var start = range.start;
                var end = range.end;
                var mergeIndex;
                if (start.row === end.row && start.col === end.col) {
                    return false;
                }
                this.kernelUnmerge(range);
                mergeIndex = HASH.indexToKey(start.row, start.col);
                data.merge[mergeIndex] = $._clone(range);
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        mergeMap[[ HASH.indexToKey(i, j) ]] = mergeIndex;
                    }
                }
                var borderOption = this.__kernelGetMergeCellBorder(start, end);
                this.kernelSetBorder(borderOption, start.row, start.col);
                // 设置所有单元格的样式为统一样式
                var rootStyleId = cellStyle[start.row][start.col];
                for (var i = start.row; i <= end.row; i++) {
                    for (var j = start.col; j <= end.col; j++) {
                        cellStyle[i][j] = rootStyleId;
                    }
                }
                return true;
            },
            kernelSetHorizontalMerge: function(range) {
                var startRow = range.start.row;
                var startCol = range.start.col;
                var endRow = range.end.row;
                var endCol = range.end.col;
                for (var i = startRow, limit = endRow; i <= limit; i++) {
                    this.kernelSetMerge({
                        start: {
                            row: i,
                            col: startCol
                        },
                        end: {
                            row: i,
                            col: endCol
                        }
                    });
                }
            },
            kernelSetVerticalMerge: function(range) {
                var startRow = range.start.row;
                var startCol = range.start.col;
                var endRow = range.end.row;
                var endCol = range.end.col;
                for (var i = startCol, limit = endCol; i <= limit; i++) {
                    this.kernelSetMerge({
                        start: {
                            row: startRow,
                            col: i
                        },
                        end: {
                            row: endRow,
                            col: i
                        }
                    });
                }
            },
            kernelGetMergeCell: function(row, col) {
                if (row === undefined) {
                    return this.data.merge;
                }
                var mergeIndex = this.data.mergeMap[HASH.indexToKey(row, col)];
                if (mergeIndex === undefined) {
                    return null;
                }
                return this.data.merge[mergeIndex];
            },
            kernelIsMergeCell: function(row, col) {
                return this.data.mergeMap[HASH.indexToKey(row, col)] !== undefined;
            },
            kernelHasMergeCellInRange: function(range) {
                var mergeMap = this.data.mergeMap;
                var start = range.start;
                var end = range.end;
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        if (mergeMap[HASH.indexToKey(i, j)]) {
                            return true;
                        }
                    }
                }
                return false;
            },
            kernelGetMergeCellsInRange: function(range) {
                var mergeData = this.data.merge;
                var indices = {};
                var index;
                var mergeCells = [];
                var start = range.start;
                var end = range.end;
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        index = this.data.mergeMap[HASH.indexToKey(i, j)];
                        if (index !== undefined) {
                            indices[index] = true;
                        }
                    }
                }
                for (var key in indices) {
                    if (indices.hasOwnProperty(key)) {
                        mergeCells.push(mergeData[key]);
                    }
                }
                return $._clone(mergeCells);
            },
            kernelIsSameMergeCell: function(cells) {
                var mergeIndex;
                var mergeMap = this.data.mergeMap;
                var firstMergeIndex;
                firstMergeIndex = mergeMap[HASH.indexToKey(cells[0].row, cells[0].col)];
                if (firstMergeIndex === undefined) {
                    return false;
                }
                for (var i = 1, len = cells.length; i < len; i++) {
                    mergeIndex = mergeMap[HASH.indexToKey(cells[i].row, cells[i].col)];
                    if (mergeIndex !== firstMergeIndex) {
                        return false;
                    }
                }
                return true;
            },
            kernelUnmerge: function(range) {
                var mergeMap = this.data.mergeMap;
                var start = range.start;
                var end = range.end;
                var key;
                var mergeIndex;
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        key = HASH.indexToKey(i, j);
                        mergeIndex = mergeMap[key];
                        if (mergeIndex) {
                            this.__kernelUnmergeCell(mergeIndex);
                        }
                    }
                }
            },
            __kernelUnmergeCell: function(key) {
                var data = this.data;
                var mergeMap = data.mergeMap;
                var mergeData = data.merge[key];
                var start = mergeData.start;
                var end = mergeData.end;
                data.merge[key] = undefined;
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    for (var j = start.col, jlimit = end.col; j <= jlimit; j++) {
                        mergeMap[HASH.indexToKey(i, j)] = undefined;
                    }
                }
            },
            /**
         * 重置合并单元格的边框设置
         * @private
         */
            __kernelGetMergeCellBorder: function(start, end) {
                var topBorders;
                var leftBorders;
                var rightBorders;
                var bottomBorders;
                var borderOption = {};
                var startRow = start.row;
                var endRow = end.row;
                var startCol = start.col;
                var endCol = end.col;
                var isDifferent;
                topBorders = this.kernelGetBorders({
                    row: startRow,
                    col: startCol
                }, {
                    row: startRow,
                    col: endCol
                })[0];
                if (start.row === end.row) {
                    bottomBorders = topBorders;
                } else {
                    bottomBorders = this.kernelGetBorders({
                        row: endRow,
                        col: startCol
                    }, {
                        row: endRow,
                        col: endCol
                    })[0];
                }
                leftBorders = this.kernelGetBorders({
                    row: startRow,
                    col: startCol
                }, {
                    row: endRow,
                    col: startCol
                })[0];
                if (start.col === end.col) {
                    rightBorders = leftBorders;
                } else {
                    rightBorders = this.kernelGetBorders({
                        row: startRow,
                        col: endCol
                    }, {
                        row: endRow,
                        col: endCol
                    })[0];
                }
                // top
                isDifferent = isDifferences(topBorders);
                if (isDifferent) {
                    borderOption.top = NONE;
                } else {
                    borderOption.top = this.__kernelGetBorderByIndex(topBorders[0]).top;
                }
                // left
                isDifferent = isDifferences(leftBorders);
                if (isDifferent) {
                    borderOption.left = NONE;
                } else {
                    borderOption.left = this.__kernelGetBorderByIndex(leftBorders[0]).left;
                }
                // right
                isDifferent = isDifferences(rightBorders);
                if (isDifferent) {
                    borderOption.right = NONE;
                } else {
                    borderOption.right = this.__kernelGetBorderByIndex(rightBorders[0]).right;
                }
                // top
                isDifferent = isDifferences(bottomBorders);
                if (isDifferent) {
                    borderOption.bottom = NONE;
                } else {
                    borderOption.bottom = this.__kernelGetBorderByIndex(bottomBorders[0]).bottom;
                }
                return borderOption;
            }
        };
        function isDifferences(borders) {
            var borderId = borders[0];
            if (borderId === undefined) {
                return true;
            } else {
                for (var i = 1, len = borders.length; i <= len; i++) {
                    if (borderId !== borders[i]) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
};

//src/kernel/kernels/numberformat.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[123] = {
    value: function(require) {
        var FORMAT_CODE = _p.r(72);
        var Format_CODE_INDEX_MAP = {};
        var HASH = _p.r(106);
        var NONE = "none";
        for (var key in FORMAT_CODE) {
            if (FORMAT_CODE.hasOwnProperty(key) && key !== "_default") {
                Format_CODE_INDEX_MAP[FORMAT_CODE[key]] = key;
            }
        }
        return {
            kernelGetNumberFormat: function(row, col) {
                var codeIndex = this.data.numberFormat[this.indexToKey(row, col)];
                if (codeIndex === undefined) {
                    codeIndex = this.data.rowNumberFormat[row];
                    if (codeIndex === undefined) {
                        codeIndex = this.data.columnNumberFormat[col];
                    }
                }
                if (codeIndex && codeIndex !== NONE) {
                    return this.__kernelGetFormatCode(codeIndex);
                }
                return undefined;
            },
            kernelSetNumberFormat: function(code, start, end) {
                var rangeType = this.__kernelGetRangeType(start, end);
                switch (rangeType) {
                  case "ALL":
                    this.kernelSetAllNumberFormat(code);
                    break;

                  case "FULL_COLUMN":
                    this.kernelSetRowNumberFormat(code, start.row, end.row);
                    break;

                  case "FULL_ROW":
                    this.kernelSetColumnNumberFormat(code, start.col, end.col);
                    break;

                  case "RANGE":
                    this.__kernelSetNumberFormat(code, start, end);
                    break;
                }
            },
            kernelClearNumberFormat: function(start, end) {
                this.kernelSetNumberFormat(undefined, start, end);
            },
            kernelClearRowNumberFormat: function(startIndx, endIndex) {
                this.kernelSetRowNumberFormat(undefined, startIndx, endIndex);
            },
            kernelClearColumnNumberFormat: function(startIndx, endIndex) {
                this.kernelSetColumnNumberFormat(undefined, startIndx, endIndex);
            },
            kernelClearAllNumberFormat: function() {
                this.kernelSetAllNumberFormat(undefined);
            },
            kernelSetAllNumberFormat: function(code) {
                var data = this.data;
                var totalIndex = this.kernelGetTotalIndex();
                var codeIndex;
                data.numberFormat = {};
                data.rowNumberFormat = {};
                data.columnNumberFormat = {};
                if (!code) {
                    return;
                }
                codeIndex = this.__kernelGetFormatCodeIndex(code);
                for (var i = 0, limit = totalIndex.col; i <= limit; i++) {
                    data.columnNumberFormat[i] = codeIndex;
                }
            },
            kernelSetRowNumberFormat: function(code, startIndex, endIndex) {
                var rowData = this.data.rowNumberFormat;
                var formatData = this.data.numberFormat;
                var totalIndex = this.kernelGetTotalIndex();
                var index;
                var codeIndex;
                if (code) {
                    codeIndex = this.__kernelGetFormatCodeIndex(code);
                } else {
                    codeIndex = NONE;
                }
                for (var i = startIndex; i <= endIndex; i++) {
                    // clear cell format
                    for (var j = 0, jlimit = totalIndex.col; j <= jlimit; j++) {
                        index = HASH.indexToKey(i, j);
                        formatData[index] = undefined;
                    }
                    // set row format
                    rowData[i] = codeIndex;
                }
            },
            kernelSetColumnNumberFormat: function(code, startIndex, endIndex) {
                var columnData = this.data.columnNumberFormat;
                var rowData = this.data.rowNumberFormat;
                var formatData = this.data.numberFormat;
                var totalIndex = this.kernelGetTotalIndex();
                var index;
                var codeIndex;
                if (code) {
                    codeIndex = this.__kernelGetFormatCodeIndex(code);
                } else {
                    codeIndex = NONE;
                }
                // set column format
                for (var i = startIndex; i <= endIndex; i++) {
                    columnData[i] = codeIndex;
                }
                // clear cell format
                for (var i = 0, limit = totalIndex.row; i <= limit; i++) {
                    index = HASH.indexToKey(i, startIndex);
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        if (formatData[index]) {
                            formatData[index] = undefined;
                        }
                    }
                }
                var keys = Object.keys(rowData);
                // overlay row format
                for (var i = 0, len = keys.length; i < len; i++) {
                    index = keys[i];
                    if (rowData[index] === undefined) {
                        continue;
                    }
                    index = this.indexToKey(i, startIndex);
                    for (var j = startIndex; j <= endIndex; i++, index++) {
                        formatData[index] = codeIndex;
                    }
                }
            },
            __kernelGetFormatCodeIndex: function(code) {
                var index;
                if (Format_CODE_INDEX_MAP[code]) {
                    return Format_CODE_INDEX_MAP[code];
                }
                index = "_" + this.data.customCodeIndex;
                this.data.customCodeIndex++;
                Format_CODE_INDEX_MAP[code] = index;
                this.data.formatCodeMap[index] = code;
                return index;
            },
            __kernelGetFormatCode: function(index) {
                return FORMAT_CODE[index] || this.data.formatCodeMap[index];
            },
            __kernelSetNumberFormat: function(code, start, end) {
                var numberFormatData = this.data.numberFormat;
                var keys = HASH.indexToKeys(start, end);
                var codeIndex = undefined;
                if (code) {
                    codeIndex = this.__kernelGetFormatCodeIndex(code);
                } else {
                    codeIndex = NONE;
                }
                for (var i = 0, len = keys.length; i < len; i++) {
                    numberFormatData[keys[i]] = codeIndex;
                }
            }
        };
    }
};

//src/kernel/kernels/pane.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[124] = {
    value: function(require) {
        return {
            kernelSetPane: function(row, col) {
                this.data.pane = {
                    row: row,
                    col: col
                };
            },
            kernelGetPane: function(row, col) {
                return this.data.pane;
            },
            kernelClearPane: function() {
                this.data.pane = {
                    row: -1,
                    col: -1
                };
            }
        };
    }
};

//src/kernel/kernels/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[125] = {
    value: function(require) {
        var StyleUtil = _p.r(126);
        var APPLY_CLASSIFY = _p.r(130).applyName;
        return {
            kernelGetStyle: function(classify, row, col) {
                var index = this.__kernelGetStyle(classify, row, col);
                if (index === undefined) {
                    return undefined;
                }
                return this.data.styleGroup[classify][index];
            },
            kernelGetStyleIds: function(classify, start, end) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var result = [];
                var rowRes;
                var groupId;
                var index;
                for (var i = startRow; i <= endRow; i++) {
                    rowRes = [];
                    index = 0;
                    for (var j = startCol; j <= endCol; j++, index++) {
                        groupId = this.__kernelGetStyle(classify, i, j);
                        if (groupId !== undefined) {
                            rowRes[index] = groupId;
                        }
                    }
                    result.push(rowRes);
                }
                return result;
            },
            kernelGetStyleById: function(classify, id) {
                return this.data.styleGroup[classify][id];
            },
            kernelSetStyle: function(styleName, styleValue, start, end) {
                // border 处理
                if (styleName === "border") {
                    return this.kernelSetBorder(styleValue, start, end);
                }
                var rangeType = this.__kernelGetRangeType(start, end);
                switch (rangeType) {
                  case "ALL":
                    this.__kernelSetAllStyle(styleName, styleValue);
                    break;

                  case "ROW":
                    this.__kernelSetRowStyle(styleName, styleValue, start.row, end.row);
                    break;

                  case "COLUMN":
                    this.__kernelSetColumnStyle(styleName, styleValue, start.col, end.col);
                    break;

                  case "RANGE":
                    this.__kernelSetRangeStyle(styleName, styleValue, start, end);
                    break;
                }
            },
            __kernelSetAllStyle: function(styleName, styleValue) {
                var totalIndex = this.kernelGetTotalIndex();
                this.__kernelSetColumnStyle(styleName, styleValue, 0, totalIndex.col);
            },
            __kernelSetRowStyle: function(styleName, styleValue, startIndex, endIndex) {
                var index;
                var rowStyle = this.data.rowStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = rowStyle[i] || 0;
                    rowStyle[i] = StyleUtil.generateStyle(this.data, index, styleName, styleValue);
                }
                // 补齐在行内的单元格样式
                this.__patchRowCellStyle(styleName, styleValue, startIndex, endIndex);
                // 覆盖交叉的列数据
                this.__overlayColumnStyle(styleName, styleValue, startIndex, endIndex);
            },
            __kernelSetColumnStyle: function(styleName, styleValue, startIndex, endIndex) {
                var index;
                var columnStyle = this.data.columnStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = columnStyle[i] || 0;
                    columnStyle[i] = StyleUtil.generateStyle(this.data, index, styleName, styleValue);
                }
                this.__patchColumnCellStyle(styleName, styleValue, startIndex, endIndex);
                this.__overlayRowStyle(styleName, styleValue, startIndex, endIndex);
            },
            __kernelSetRangeStyle: function(styleName, styleValue, start, end) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var index;
                var cellStyle = this.data.cellStyle;
                for (var i = startRow; i <= endRow; i++) {
                    for (var j = startCol; j <= endCol; j++) {
                        index = this.__getStyleIndex(i, j) || 0;
                        cellStyle[i][j] = StyleUtil.generateStyle(this.data, index, styleName, styleValue);
                    }
                }
            },
            __patchRowCellStyle: function(styleName, styleValue, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    rowCellStyle = cellStyle[i];
                    for (var j = 0, jlen = rowCellStyle.length; j < jlen; j++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立数据，则跳过不补齐
                        if (currentCellStyle === undefined) {
                            continue;
                        }
                        newIndex = StyleUtil.generateStyle(this.data, currentCellStyle, styleName, styleValue);
                        // 新生成的样式和现有的行样式一致，则清除该单元格的样式
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            __patchColumnCellStyle: function(styleName, styleValue, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = cellStyle.length; i < len; i++) {
                    rowCellStyle = cellStyle[i];
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立单元格数据， 跳过
                        if (!currentCellStyle) {
                            continue;
                        }
                        newIndex = StyleUtil.generateStyle(this.data, currentCellStyle, styleName, styleValue);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            __overlayColumnStyle: function(styleName, styleValue, startIndex, endIndex) {
                var columnStyle = this.data.columnStyle;
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    for (var j = 0, jlen = columnStyle.length; j < jlen; j++) {
                        // 不存在列样式
                        // 或者，该行列单元格已经存在独立样式，跳过
                        if (!columnStyle[j] || cellStyle[i][j]) {
                            continue;
                        }
                        // 合并行列样式
                        newIndex = StyleUtil.mergeStyle(this.data, columnStyle[j], rowStyle[i], styleName, styleValue);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            },
            __overlayRowStyle: function(styleName, styleValue, startIndex, endIndex) {
                var rowStyle = this.data.rowStyle;
                var cellStyle = this.data.cellStyle;
                var columnStyle = this.data.columnStyle;
                var currentRowStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = rowStyle.length; i < len; i++) {
                    currentRowStyle = rowStyle[i];
                    if (!currentRowStyle) {
                        continue;
                    }
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = cellStyle[i][j];
                        // 不存在该列样式
                        // 已存在独立单元格样式， 跳过
                        if (!columnStyle[j] || currentCellStyle) {
                            continue;
                        }
                        // 合并行列样式， 基于合并后的样式，结合新增加的样式，生成新的样式
                        newIndex = StyleUtil.mergeStyle(this.data, columnStyle[j], currentRowStyle, styleName, styleValue);
                        // 行样式和单元格样式一致，则清除单元格样式
                        if (currentRowStyle === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            },
            __kernelGetStyle: function(classify, row, col) {
                var data = this.data;
                var cellStyle = data.cellStyle;
                var rowStyle = data.rowStyle;
                var columnStyle = data.columnStyle;
                var styleIndex = data.styleIndex;
                var index = cellStyle[row][col];
                var result = this.__kernelGetClassifyInStyle(classify, styleIndex[index]);
                if (result !== undefined) {
                    return result;
                }
                index = rowStyle[row];
                result = this.__kernelGetClassifyInStyle(classify, styleIndex[index]);
                if (result !== undefined) {
                    return result;
                }
                index = columnStyle[col];
                result = this.__kernelGetClassifyInStyle(classify, styleIndex[index]);
                if (result !== undefined) {
                    return result;
                }
                return undefined;
            },
            __getStyleIndex: function(row, col) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var columnStyle = this.data.columnStyle;
                var index = cellStyle[row][col];
                if (index !== undefined) {
                    return index;
                }
                index = rowStyle[row];
                if (index !== undefined) {
                    return index;
                }
                return columnStyle[col];
            },
            __kernelGetClassifyInStyle: function(classify, styles) {
                var applyName = APPLY_CLASSIFY[classify];
                var xfStyle;
                if (!styles) {
                    return undefined;
                }
                if (styles[applyName]) {
                    return styles[classify];
                }
                xfStyle = this.data.xfList[styles.xf];
                if (xfStyle[applyName]) {
                    return xfStyle[classify];
                }
                return undefined;
            }
        };
    }
};

//src/kernel/kernels/style/util.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[126] = {
    value: function(require) {
        var STYLE_REL = _p.r(130);
        var STYLE_CLASSIFY = STYLE_REL.classify;
        var APPLY_CLASSIFY = STYLE_REL.applyName;
        var APPLY_CLASSIFY_MAP = STYLE_REL.applyClassifyMap;
        var NONE = _p.r(74);
        var DEFAULT_STYLE_VALUE = _p.r(104);
        return {
            generateStyle: function(data, index, styleName, styleValue) {
                if (!styleValue) {
                    styleValue = DEFAULT_STYLE_VALUE[styleName];
                }
                var classify = STYLE_CLASSIFY[styleName];
                var applyName = APPLY_CLASSIFY[styleName];
                var styleIndex = data.styleIndex;
                var styleGroup = data.styleGroup[classify];
                var styles = styleIndex[index];
                var groupIndex = styles[classify];
                var groupStyle = styleGroup[groupIndex];
                // 设置的值和原始值一致，直接返回该style的索引即可
                if (groupStyle[styleName] === styleValue && styles[applyName] === 1) {
                    return index;
                }
                groupStyle = $._clone(groupStyle);
                groupStyle[styleName] = styleValue;
                index = getGroupIndex(data, classify, groupStyle);
                styles = $._clone(styles);
                styles[classify] = index;
                styles[applyName] = 1;
                return getStyleIndex(data, styles);
            },
            generateStyleByXfId: function(data, index, xfId) {
                var styles = $._clone(data.styleIndex[index]);
                var xfStyles = data.xfList[xfId];
                var originalXfStyle = data.xfList[styles.xf];
                var classify;
                styles.xf = xfId;
                for (var applyName in APPLY_CLASSIFY_MAP) {
                    if (!APPLY_CLASSIFY_MAP.hasOwnProperty(applyName)) {
                        continue;
                    }
                    classify = APPLY_CLASSIFY_MAP[applyName];
                    // clone 新xfstyle中所应用的所有样式
                    if (xfStyles[applyName]) {
                        styles[applyName] = 0;
                        styles[classify] = xfStyles[classify];
                    } else if (originalXfStyle[applyName]) {
                        styles[applyName] = 1;
                        styles[classify] = originalXfStyle[classify];
                    }
                }
                return getStyleIndex(data, styles);
            },
            generateBorder: function(data, index, styleValue) {
                if (!styleValue) {
                    styleValue = DEFAULT_STYLE_VALUE["border"];
                }
                var currentGroudpIndex = borderNormalized(data, index, styleValue);
                var styleIndex = data.styleIndex;
                var styles = styleIndex[index];
                // 设置的值和原始值一致，直接返回该style的索引即可
                if (styles.applyBorder === 1 && styles.borders === currentGroudpIndex) {
                    return index;
                }
                styles = $._clone(styles);
                styles.borders = currentGroudpIndex;
                styles.applyBorder = 1;
                return getStyleIndex(data, styles);
            },
            generateGroupIndex: function(data, classify, groupStyle) {
                return getGroupIndex(data, classify, groupStyle);
            },
            mergeStyle: function(data, toIndex, fromIndex, styleName, styleValue) {
                var newStyle = merge(data, toIndex, fromIndex);
                var styleGroup = data.styleGroup;
                var target;
                var classify = STYLE_CLASSIFY[styleName];
                var applyName = APPLY_CLASSIFY[styleName];
                if (newStyle[applyName] === 1) {
                    target = $._clone(styleGroup[classify][newStyle[classify]]);
                } else {
                    target = $._clone($._clone(styleGroup[classify][0]));
                }
                target[styleName] = styleValue;
                newStyle[applyName] = 1;
                newStyle[classify] = getGroupIndex(data, classify, target);
                return getStyleIndex(data, newStyle);
            },
            mergeBorder: function(data, toIndex, fromIndex, borderOption) {
                var newStyle = merge(data, toIndex, fromIndex);
                var styleGroup = data.styleGroup;
                var target;
                if (newStyle.applyBorder === 1) {
                    target = $._clone(styleGroup.borders[newStyle.borders].border);
                } else {
                    target = $._clone(styleGroup.borders[0].border);
                }
                newStyle.applyBorder = 1;
                newStyle.borders = generateNewBorder(data, target, borderOption);
                return getStyleIndex(data, newStyle);
            }
        };
        /**
     * 合并两个样式，返回新的样式的值。注意：新的样式并未被索引
     * @param data
     * @param toIndex
     * @param fromIndex
     * @returns {*}
     */
        function merge(data, toIndex, fromIndex) {
            var styleIndex = data.styleIndex;
            var target = $._clone(styleIndex[toIndex]);
            // 重要条件
            if (!fromIndex) {
                return target;
            }
            if (toIndex === fromIndex) {
                return target;
            }
            var source = styleIndex[fromIndex];
            if (source.applyBorder) {
                target.applyBorder = 1;
                target.borders = source.borders;
            }
            if (source.applyFill) {
                target.applyFill = 1;
                target.fills = source.fills;
            }
            if (source.applyFont) {
                target.applyFont = 1;
                target.fonts = source.fonts;
            }
            if (source.applyAlignment) {
                target.applyAlignment = 1;
                target.alignments = source.alignments;
            }
            return target;
        }
        function getGroupIndex(data, classify, groupStyle) {
            var styleGroupMap = data.styleGroupMap[classify];
            var groupStyleKey = JSON.stringify(groupStyle);
            var classifyIndex = styleGroupMap[groupStyleKey];
            // 已经存在该组的样式
            if (classifyIndex !== undefined) {
                return classifyIndex;
            }
            // 不存在，则创建新的组样式
            var styleGroup = data.styleGroup[classify];
            classifyIndex = styleGroup.length;
            styleGroupMap[groupStyleKey] = classifyIndex;
            styleGroup.push(groupStyle);
            return classifyIndex;
        }
        function getStyleIndex(data, styles) {
            var styleIndexMap = data.styleIndexMap;
            var styleKey = JSON.stringify(styles);
            var index = styleIndexMap[styleKey];
            // 已有相同样式
            if (index !== undefined) {
                return index;
            }
            // 否则，记录新的样式
            var styleIndex = data.styleIndex;
            styleIndexMap[styleKey] = styleIndex.length;
            styleIndex.push(styles);
            return styleIndexMap[styleKey];
        }
        // 对border值进行归一化
        function borderNormalized(data, index, borderOption) {
            var styleIndex = data.styleIndex;
            var styleGroup = data.styleGroup.borders;
            var currentStyle = styleIndex[index];
            var basicBorder;
            if (currentStyle.applyBorder === 0) {
                basicBorder = {
                    top: NONE,
                    left: NONE,
                    right: NONE,
                    bottom: NONE
                };
            } else {
                basicBorder = $._clone(styleGroup[currentStyle.borders].border);
            }
            return generateNewBorder(data, basicBorder, borderOption);
        }
        // 合并两个border值，并索引该值。同时返回新值的索引序号
        function generateNewBorder(data, target, source) {
            var borderGroup = data.styleGroup.borders;
            for (var key in source) {
                if (!source.hasOwnProperty(key)) {
                    continue;
                }
                target[key] = source[key];
            }
            var valueKey = JSON.stringify(target);
            // 有相同样式存在
            if (data.borderMap[valueKey] !== undefined) {
                return data.borderMap[valueKey];
            }
            // 无相同样式存在
            data.borderMap[valueKey] = borderGroup.length;
            borderGroup.push({
                border: target
            });
            return data.borderMap[valueKey];
        }
    }
};

//src/kernel/kernels/xfstyle.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[127] = {
    value: function(require) {
        var StyleUtil = _p.r(126);
        var STYLE_REL = _p.r(130);
        var STYLE_CLASSIFY = STYLE_REL.classify;
        var STYLE_APPLY_NAME = STYLE_REL.applyName;
        var XF_STYLE_DEFAULT = _p.r(129).xfStyle;
        return {
            kernelSetXfStyle: function(styleOption, start, end) {
                var xfId = this.__kernelGetXfId(styleOption);
                var rangeType = this.__kernelGetRangeType(start, end);
                switch (rangeType) {
                  case "ALL":
                    this.__kernelSetAllXfStyle(xfId);
                    break;

                  case "ROW":
                    this.__kernelSetRowXfStyle(xfId, start.row, end.row);
                    break;

                  case "COLUMN":
                    this.__kernelSetColumnXfStyle(xfId, start.col, end.col);
                    break;

                  case "RANGE":
                    this.__kernelSetRangeXfStyle(xfId, start, end);
                    break;
                }
            },
            __kernelSetAllXfStyle: function(xfId) {
                var totalIndex = this.kernelGetTotalIndex();
                this.__kernelSetColumnStyle(xfId, 0, totalIndex.col);
            },
            __kernelSetRowXfStyle: function(xfId, startIndex, endIndex) {
                // 设置行
                var index;
                var rowStyle = this.data.rowStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = rowStyle[i] || 0;
                    rowStyle[i] = StyleUtil.generateStyleByXfId(this.data, index, xfId);
                }
                // 补齐在行内的单元格样式
                this.__patchRowCellXfStyle(xfId, startIndex, endIndex);
                // 覆盖交叉的列数据
                this.__overlayColumnXfStyle(xfId, startIndex, endIndex);
            },
            __kernelSetColumnXfStyle: function(xfId, startIndex, endIndex) {
                var index;
                var columnStyle = this.data.columnStyle;
                for (var i = startIndex; i <= endIndex; i++) {
                    index = columnStyle[i] || 0;
                    columnStyle[i] = StyleUtil.generateStyleByXfId(this.data, index, xfId);
                }
                this.__patchColumnCellXfStyle(xfId, startIndex, endIndex);
                this.__overlayRowXfStyle(xfId, startIndex, endIndex);
            },
            __kernelSetRangeXfStyle: function(xfId, start, end) {
                var startRow = start.row;
                var startCol = start.col;
                var endRow = end.row;
                var endCol = end.col;
                var index;
                var cellStyle = this.data.cellStyle;
                for (var i = startRow; i <= endRow; i++) {
                    for (var j = startCol; j <= endCol; j++) {
                        index = this.__getStyleIndex(i, j) || 0;
                        cellStyle[i][j] = StyleUtil.generateStyleByXfId(this.data, index, xfId);
                    }
                }
            },
            __patchRowCellXfStyle: function(xfId, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    rowCellStyle = cellStyle[i];
                    for (var j = 0, jlen = rowCellStyle.length; j < jlen; j++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立数据，则跳过不补齐
                        if (currentCellStyle === undefined) {
                            continue;
                        }
                        newIndex = StyleUtil.generateStyleByXfId(this.data, currentCellStyle, xfId);
                        // 新生成的样式和现有的行样式一致，则清除该单元格的样式
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            __patchColumnCellXfStyle: function(xfId, startIndex, endIndex) {
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var rowCellStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = cellStyle.length; i < len; i++) {
                    rowCellStyle = cellStyle[i];
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = rowCellStyle[j];
                        // 无独立单元格数据， 跳过
                        if (!currentCellStyle) {
                            continue;
                        }
                        newIndex = StyleUtil.generateStyleByXfId(this.data, currentCellStyle, xfId);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            rowCellStyle[j] = undefined;
                        } else {
                            rowCellStyle[j] = newIndex;
                        }
                    }
                }
            },
            __overlayColumnXfStyle: function(xfId, startIndex, endIndex) {
                var columnStyle = this.data.columnStyle;
                var cellStyle = this.data.cellStyle;
                var rowStyle = this.data.rowStyle;
                var newIndex;
                for (var i = startIndex; i <= endIndex; i++) {
                    for (var j = 0, jlen = columnStyle.length; j < jlen; j++) {
                        // 不存在列样式
                        // 或者，该行列单元格已经存在独立样式，跳过
                        if (!columnStyle[j] || cellStyle[i][j]) {
                            continue;
                        }
                        // 合并行列样式
                        newIndex = StyleUtil.generateStyleByXfId(this.data, columnStyle[j], xfId);
                        // 新样式和当前所在行样式一致，则清除
                        if (rowStyle[i] === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            },
            __overlayRowXfStyle: function(xfId, startIndex, endIndex) {
                var rowStyle = this.data.rowStyle;
                var cellStyle = this.data.cellStyle;
                var columnStyle = this.data.columnStyle;
                var currentRowStyle;
                var currentCellStyle;
                var index;
                var newIndex;
                for (var i = 0, len = rowStyle.length; i < len; i++) {
                    currentRowStyle = rowStyle[i];
                    if (!currentRowStyle) {
                        continue;
                    }
                    index = 0;
                    for (var j = startIndex; j <= endIndex; j++, index++) {
                        currentCellStyle = cellStyle[i][j];
                        // 不存在该列样式
                        // 已存在独立单元格样式， 跳过
                        if (!columnStyle[j] || currentCellStyle) {
                            continue;
                        }
                        // 合并行列样式， 基于合并后的样式，结合新增加的样式，生成新的样式
                        newIndex = StyleUtil.generateStyleByXfId(this.data, columnStyle[j], xfId);
                        // 行样式和单元格样式一致，则清除单元格样式
                        if (currentRowStyle === newIndex) {
                            cellStyle[i][j] = undefined;
                        } else {
                            cellStyle[i][j] = newIndex;
                        }
                    }
                }
            },
            __kernelGetXfId: function(styleOption, start, end) {
                var data = this.data;
                var group = {};
                var classify;
                var classifyList = [];
                var groupStyle;
                var styles = {};
                var styleOptionKey = JSON.stringify(styleOption);
                var xfId = data.xfValueRecord[styleOptionKey];
                // 已缓存
                if (xfId !== undefined) {
                    return xfId;
                }
                for (var styleName in styleOption) {
                    if (!styleOption.hasOwnProperty(styleName)) {
                        continue;
                    }
                    classify = STYLE_CLASSIFY[styleName];
                    classifyList.push(classify);
                    if (!group[classify]) {
                        group[classify] = {};
                    }
                    group[classify][styleName] = styleOption[styleName];
                }
                // 标准化值
                for (var i = 0, len = classifyList.length; i < len; i++) {
                    classify = classifyList[i];
                    groupStyle = this.__kernelGroupStyleNormalized(classify, group[classify]);
                    styles[STYLE_APPLY_NAME[classify]] = 1;
                    styles[classify] = StyleUtil.generateGroupIndex(data, classify, groupStyle);
                }
                // 标准化xfstyle
                styles = this.__kernelXfStyleNormalized(styles);
                // 存储并记录
                xfId = data.xfList.length;
                data.xfList.push(styles);
                data.xfValueRecord[styleOptionKey] = xfId;
                return xfId;
            },
            // TODO 不能取默认值，需要修改为去默认定义的值
            __kernelGroupStyleNormalized: function(classify, styleOption) {
                var defaultStyle = $._clone(this.kernelGetDefaultStyle(classify));
                return $.extend(defaultStyle, styleOption);
            },
            __kernelXfStyleNormalized: function(styles) {
                var defaultXfStyle = $._clone(XF_STYLE_DEFAULT);
                return $.extend(defaultXfStyle, styles);
            }
        };
    }
};

//src/kernel/limit.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[128] = {
    value: {
        MAX_COLUMN_COUNT: Math.pow(26, 3) - 1,
        MAX_ROW_COUNT: Math.pow(2, 16) - 1
    }
};

//src/kernel/style-default.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[129] = {
    value: {
        style: {
            fonts: 0,
            borders: 0,
            fills: 0,
            alignments: 0,
            xf: 0,
            applyFont: 0,
            applyBorder: 0,
            applyFill: 0,
            applyAlignment: 0
        },
        xfStyle: {
            fonts: 0,
            borders: 0,
            fills: 0,
            alignments: 0,
            applyFont: 0,
            applyBorder: 0,
            applyFill: 0,
            applyAlignment: 0
        }
    }
};

//src/kernel/style-rel.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[130] = {
    value: function() {
        return {
            classify: {
                color: "fonts",
                name: "fonts",
                bold: "fonts",
                italic: "fonts",
                underline: "fonts",
                throughline: "fonts",
                size: "fonts",
                fill: "fills",
                border: "borders",
                wraptext: "alignments",
                horizontal: "alignments",
                vertical: "alignments"
            },
            applyName: {
                color: "applyFont",
                name: "applyFont",
                bold: "applyFont",
                italic: "applyFont",
                underline: "applyFont",
                throughline: "applyFont",
                size: "applyFont",
                font: "applyFont",
                border: "applyBorder",
                fill: "applyFill",
                wraptext: "applyAlignment",
                horizontal: "applyAlignment",
                vertical: "applyAlignment",
                alignments: "applyAlignment",
                fonts: "applyFont",
                fills: "applyFill",
                borders: "applyBorder"
            },
            applyClassifyMap: {
                applyFont: "fonts",
                applyBorder: "borders",
                applyFill: "fills",
                applyAlignment: "alignments"
            }
        };
    }
};

//src/kernel/style-type.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[131] = {
    value: function() {
        return [ "color", "backgroundColor", "textAlign", "verticalAlign", "underline", "throughline", "fontStyle", "fontWeight", "fontSize", "fontFamily", "wraptext" ];
    }
};

//src/kernel/style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[132] = {
    value: function(require) {
        var NONE = _p.r(74);
        var data = {
            styleGroup: {
                fonts: [ {
                    color: "#000000",
                    name: "宋体",
                    bold: false,
                    italic: false,
                    underline: false,
                    throughline: false,
                    size: 13
                } ],
                fills: [ {
                    fill: NONE
                } ],
                // 注： 如果修改该处border的值，请同时修改util文件
                borders: [ {
                    border: {
                        top: NONE,
                        left: NONE,
                        right: NONE,
                        bottom: NONE
                    }
                } ],
                alignments: [ {
                    wraptext: false,
                    horizontal: NONE,
                    vertical: NONE
                } ]
            },
            xfList: [ {
                fonts: 0,
                borders: 0,
                fills: 0,
                alignments: 0,
                applyFont: 1,
                applyBorder: 1,
                applyFill: 1,
                applyAlignment: 0
            } ],
            styleIndex: [ {
                fonts: 0,
                borders: 0,
                fills: 0,
                alignments: 0,
                xf: 0,
                applyFont: 0,
                applyBorder: 0,
                applyFill: 0,
                applyAlignment: 0
            } ],
            allStyle: {
                fonts: 0,
                borders: 0,
                fills: 0,
                alignments: 0,
                xf: 0,
                applyFont: 0,
                applyBorder: 0,
                applyFill: 0,
                applyAlignment: 0
            },
            styleGroupMap: {},
            styleIndexMap: {},
            xfListMap: {},
            // 记录style值和xfid的映射
            xfValueRecord: {},
            borderMap: {}
        };
        return data;
    }
};

//src/kernel/unescape-map.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[133] = {
    value: function(require) {
        var data = {};
        var ESCAPE_MAP = _p.r(105);
        for (var key in ESCAPE_MAP) {
            if (ESCAPE_MAP.hasOwnProperty(key)) {
                data[ESCAPE_MAP[key]] = key;
            }
        }
        return data;
    }
};

//src/modules.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[134] = {
    value: function(require) {
        return {
            common: {
                cell: _p.r(6),
                title: _p.r(10),
                content: _p.r(8),
                color: _p.r(7),
                style: _p.r(9)
            },
            core: {
                struct: _p.r(41),
                dataAccess: _p.r(33),
                actuary: _p.r(13),
                range: _p.r(39),
                value: _p.r(67),
                datetime: _p.r(35),
                cell: _p.r(16),
                view: _p.r(68),
                style: _p.r(42),
                border: _p.r(15),
                device: _p.r(36),
                exportManager: _p.r(37),
                wraptext: _p.r(69),
                autosize: _p.r(14)
            },
            system: {
                screen: _p.r(170),
                scrollbar: _p.r(173),
                cover: _p.r(145),
                position: _p.r(155),
                input: _p.r(153),
                selection: _p.r(175),
                resize: _p.r(156),
                rowcolumn: _p.r(157),
                sort: _p.r(176),
                viewport: _p.r(177),
                clipboard: _p.r(136),
                selectall: _p.r(174)
            }
        };
    }
};

//src/system/clipboard/blacklist.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[135] = {
    value: {
        area: true,
        audio: true,
        base: true,
        bdi: true,
        bdo: true,
        body: true,
        canvas: true,
        cite: true,
        command: true,
        datalist: true,
        details: true,
        dfn: true,
        embed: true,
        figcaption: true,
        figure: true,
        footer: true,
        form: true,
        head: true,
        hr: true,
        html: true,
        iframe: true,
        img: true,
        input: true,
        ins: true,
        kbd: true,
        keygen: true,
        link: true,
        map: true,
        mark: true,
        meta: true,
        meter: true,
        noscript: true,
        object: true,
        optgroup: true,
        option: true,
        output: true,
        param: true,
        progress: true,
        rp: true,
        ruby: true,
        script: true,
        select: true,
        source: true,
        style: true,
        summary: true,
        tbody: true,
        textarea: true,
        tfoot: true,
        th: true,
        thead: true,
        title: true,
        track: true,
        "var": true,
        video: true,
        wbr: true
    }
};

//src/system/clipboard/clipboard.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[136] = {
    value: function(require) {
        var $ = _p.r(2);
        var Filter = _p.r(139);
        var Fax = _p.r(138);
        var KEY_CODE = _p.r(148);
        var Clipboard = _p.r(0).create("Clipboard", {
            base: _p.r(94),
            inputModule: null,
            filter: null,
            tipNode: null,
            $tipNode: null,
            state: false,
            cutState: false,
            start: null,
            end: null,
            init: function(inputModule) {
                this.inputModule = inputModule;
                this.filter = this.createComponent(Filter);
                this.fax = this.createComponent(Fax);
                this.tipNode = this.createElement("div", "btb-copy-tip");
                this.$tipNode = $(this.tipNode);
                this.initEvent();
                this.initMessageHook();
                this.initService();
            },
            run: function() {
                this.getContentContainer().appendChild(this.tipNode);
            },
            initEvent: function() {
                var _self = this;
                $(this.getMainContainer()).on("paste", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!_self.inputModule.isActive()) {
                        _self.__pasteHandler(e.originalEvent.clipboardData);
                    } else {
                        _self.pasteToInput(e.originalEvent.clipboardData);
                    }
                }).on("copy", function(e) {
                    if (_self.inputModule.isActive()) {
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    _self.__copyHandler(e.originalEvent.clipboardData);
                }).on("cut", function(e) {
                    if (_self.inputModule.isActive()) {
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    _self.__cutHandler(e.originalEvent.clipboardData);
                }).on("keydown", function(e) {
                    if (e.keyCode === KEY_CODE.ESC && _self.state) {
                        _self.hide();
                        _self.cutState = false;
                    }
                });
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.refresh": this.refresh
                });
            },
            initService: function() {
                this.registerService({
                    "s.paste": this.paste,
                    "s.cut": this.cut
                });
            },
            paste: function(data, styles, point) {
                var startRow = point.row;
                var startCol = point.col;
                this.corePrepareRefresh();
                this.rs("c.batch.write", data, point.row, point.col);
                if (styles) {
                    this.rs("c.batch.setstyle", styles, point.row, point.col);
                }
                var cols = [];
                for (var i = 0, len = data.length; i < len; i++) {
                    cols.push(data[i].length);
                }
                var maxCol = Math.max.apply(null, cols);
                this.__changeSelection({
                    row: startRow,
                    col: startCol
                }, {
                    row: startRow + data.length - 1,
                    col: startCol + maxCol - 1
                });
                this.coreRefresh();
            },
            cut: function(data, styles, point, range) {
                this.execCommand("clearcontent", range.start, range.end);
                this.execCommand("clearformat", range.start, range.end);
                this.paste(data, styles, point);
            },
            pasteToInput: function(clipboardData) {
                var types = clipboardData.types;
                if (types.indexOf("text/plain") === -1) {
                    return;
                }
                this.writeToInput(clipboardData.getData("text/plain"));
            },
            writeToInput: function(str) {
                str = str.replace(/\n/g, "<br>");
                this.inputModule.inesert(str);
            },
            show: function(start, end) {
                this.state = true;
                this.start = {
                    row: start.row,
                    col: start.col
                };
                this.end = {
                    row: end.row,
                    col: end.col
                };
                this.refresh();
            },
            hide: function() {
                this.state = false;
                this.start = null;
                this.end = null;
                this.cutState = false;
                this.$tipNode.css("display", "none");
            },
            refresh: function() {
                if (!this.state) {
                    return;
                }
                var struct = this.rs("c.struct");
                var rect = this.cs("c.cell.viewrect", struct, this.start, this.end);
                if (!rect) {
                    this.$tipNode.css("display", "none");
                    return;
                }
                var overflow = rect.overflow;
                this.$tipNode.css({
                    top: rect.y,
                    left: rect.x,
                    width: rect.width,
                    height: rect.height,
                    borderLeftColor: overflow.left ? "transparent" : "",
                    borderRightColor: overflow.right ? "transparent" : "",
                    borderTopColor: overflow.top ? "transparent" : "",
                    borderBottomColor: overflow.bottom ? "transparent" : "",
                    display: "block"
                });
            },
            __copyHandler: function(clipboardData) {
                var range = this.rs("c.range");
                var focus;
                var start;
                var end;
                var htmlSource;
                var strSource;
                this.show(range.getStart(), range.getEnd());
                clipboardData.clearData();
                if (!range.isMultiple()) {
                    focus = range.getFocus();
                    htmlSource = this.fax.getSingleCellHTML(focus.row, focus.col);
                    strSource = this.fax.getSingleCellString(focus.row, focus.col);
                } else {
                    start = range.getStart();
                    end = range.getEnd();
                    htmlSource = this.fax.getMultiCellHTML(start, end);
                    strSource = this.fax.getMultiCellString(start, end);
                }
                if (!htmlSource) {
                    return;
                }
                clipboardData.setData("text/html", htmlSource);
                clipboardData.setData("text/plain", strSource);
            },
            __cutHandler: function(clipboardData) {
                this.cutState = true;
                this.__copyHandler(clipboardData);
            },
            __pasteHandler: function(clipboardData) {
                var range = this.rs("c.range");
                var rangeStart = range.getStart();
                var result;
                if (clipboardData.types.indexOf("text/html") !== -1) {
                    result = this.__formatHTML(clipboardData.getData("text/html"));
                } else if (clipboardData.types.indexOf("text/plain") !== -1) {
                    result = this.__formatStr(clipboardData.getData("text/plain"));
                } else {
                    return;
                }
                if (this.cutState) {
                    this.execCommand("cut", result.data, result.style, rangeStart, {
                        start: {
                            row: this.start.row,
                            col: this.start.col
                        },
                        end: {
                            row: this.end.row,
                            col: this.end.col
                        }
                    });
                } else {
                    this.execCommand("paste", result.data, result.style, rangeStart);
                }
                this.hide();
            },
            __formatHTML: function(html) {
                var layout = this.filter.parseHTML(html);
                var data = [];
                var style = [];
                var rowLayout;
                for (var i = 0, len = layout.length; i < len; i++) {
                    rowLayout = layout[i];
                    data[i] = [];
                    style[i] = [];
                    for (var j = 0, jlen = rowLayout.length; j < jlen; j++) {
                        data[i][j] = rowLayout[j].content;
                        style[i][j] = rowLayout[j].style;
                    }
                }
                return {
                    data: data,
                    style: style
                };
            },
            __formatStr: function(str) {
                var layout = this.filter.parseString(str);
                return {
                    data: layout,
                    style: null
                };
            },
            __changeSelection: function(start, end) {
                this.rs("c.range.set", {
                    row: start.row,
                    col: start.col
                }, {
                    row: start.row,
                    col: start.col
                }, {
                    row: end.row,
                    col: end.col
                });
            }
        });
        Clipboard.deps = [ "input" ];
        return Clipboard;
    }
};

//src/system/clipboard/default-element-style.js
_p[137] = {
    value: function(require) {
        var BASE_FONT_SIZE = 13;
        return {
            th: {
                fontWeight: "bold",
                textAlign: "center",
                verticalAlign: "middle"
            },
            caption: {
                textAlign: "center"
            },
            h1: {
                fontSize: Math.ceil(2 * BASE_FONT_SIZE),
                fontWeight: "bold"
            },
            h2: {
                fontSize: Math.ceil(1.5 * BASE_FONT_SIZE),
                fontWeight: "bold"
            },
            h3: {
                fontSize: Math.ceil(1.17 * BASE_FONT_SIZE),
                fontWeight: "bold"
            },
            h4: {
                fontWeight: "bold"
            },
            h5: {
                fontSize: Math.ceil(.83 * BASE_FONT_SIZE),
                fontWeight: "bold"
            },
            h6: {
                fontSize: Math.ceil(.75 * BASE_FONT_SIZE),
                fontWeight: "bold"
            },
            b: {
                fontWeight: "bold"
            },
            strong: {
                fontWeight: "bold"
            },
            i: {
                fontStyle: "italic"
            },
            cite: {
                fontStyle: "italic"
            },
            em: {
                fontStyle: "italic"
            },
            "var": {
                fontStyle: "italic"
            },
            address: {
                fontStyle: "italic"
            },
            big: {
                fontSize: Math.ceil(1.17 * BASE_FONT_SIZE)
            },
            small: {
                fontSize: Math.ceil(.83 * BASE_FONT_SIZE)
            },
            sub: {
                fontSize: Math.ceil(.83 * BASE_FONT_SIZE)
            },
            sup: {
                fontSize: Math.ceil(.83 * BASE_FONT_SIZE)
            },
            td: {
                verticalAlign: "middle"
            },
            s: {
                textDecoration: "line-through"
            },
            strike: {
                textDecoration: "line-through"
            },
            del: {
                textDecoration: "line-through"
            },
            u: {
                textDecoration: "underline"
            },
            ins: {
                textDecoration: "underline"
            },
            center: {
                textAlign: "center"
            }
        };
    }
};

//src/system/clipboard/fax.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[138] = {
    value: function(require) {
        return _p.r(0).create("Fax", {
            base: _p.r(91),
            isolatedNode: null,
            getMultiCellHTML: function(start, end) {
                var struct = this.rs("c.struct");
                var effectiveIndex = struct.getEffectiveIndex();
                var values = [];
                var styles = [];
                var effectiveRow = Math.min(end.row, effectiveIndex.row);
                var effectiveCol = Math.min(end.col, effectiveIndex.col);
                for (var i = start.row, rowCount = 0, limit = effectiveRow; i <= limit; i++, rowCount++) {
                    values[rowCount] = [];
                    styles[rowCount] = [];
                    for (var j = start.col, colCount = 0, jlimit = effectiveCol; j <= jlimit; j++, colCount++) {
                        values[rowCount][colCount] = struct.getRawValue(i, j);
                        styles[rowCount][colCount] = struct.getUserStyle(i, j);
                    }
                }
                var trs = [];
                var tds = [];
                var currentValue;
                for (var i = 0, len = values.length; i < len; i++) {
                    currentValue = values[i];
                    tds = [];
                    for (var j = 0, jlen = currentValue.length; j < jlen; j++) {
                        tds.push('<td style="' + this.cs("style.to.text", styles[i][j]) + '">' + (currentValue[j] || "") + "</td>");
                    }
                    trs.push(tds.join(""));
                }
                return "<table><tbody><tr>" + trs.join("</tr><tr>") + "</tr></tbody></table>";
            },
            getMultiCellString: function(start, end) {
                var struct = this.rs("c.struct");
                var effectiveIndex = struct.getEffectiveIndex();
                var effectiveRow = Math.min(end.row, effectiveIndex.row);
                var effectiveCol = Math.min(end.col, effectiveIndex.col);
                var values = [];
                var colValues;
                for (var i = start.row, rowCount = 0, limit = effectiveRow; i <= limit; i++, rowCount++) {
                    colValues = [];
                    for (var j = start.col, colCount = 0, jlimit = effectiveCol; j <= jlimit; j++, colCount++) {
                        colValues.push(struct.getRawValue(i, j) || "");
                    }
                    values.push(colValues.join("	"));
                }
                return values.join("\n");
            },
            getSingleCellHTML: function(row, col) {
                var struct = this.rs("c.struct");
                var value = struct.getRawValue(row, col) || "";
                var style = struct.getUserStyle(row, col);
                style = this.cs("style.to.text", style);
                return '<span style="' + style + '">' + value + "</span>";
            },
            getSingleCellString: function(row, col) {
                var struct = this.rs("c.struct");
                return struct.getDisplayValue(row, col) || "";
            }
        });
    }
};

//src/system/clipboard/filter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[139] = {
    value: function(require) {
        var StandardStyle = _p.r(141);
        var INLINE_ELEMENTS = _p.r(140);
        var ELEMENT_BLACKLIST = _p.r(135);
        var DEFAULT_ELEMENT_STYLE = _p.r(137);
        var BASE_FONT_SIZE = 13;
        var BACKGROUND_COLOR = "#fff";
        return _p.r(0).create("PasteHtmlFilter", {
            base: _p.r(91),
            isolatedNode: null,
            init: function() {
                this.isolatedNode = this.createElement("div", "btb-isolated");
                this.range = this.getDocument().createRange();
            },
            parseHTML: function(html) {
                html = html.replace(/\n*?\r*?\s*?</g, "<").replace(/>\s*\n*?\r*?/, ">");
                var isolatedNode = this.isolatedNode;
                isolatedNode.innerHTML = html;
                var tableLayout = [ [] ];
                var rowLayout = tableLayout[0];
                this.__parseLayout(tableLayout, isolatedNode, rowLayout);
                return this.restructLayout(tableLayout);
            },
            parseString: function(str) {
                var layout = [];
                var columnStr;
                str = str.split("\n");
                for (var i = 0, len = str.length; i < len; i++) {
                    columnStr = str[i].split("	");
                    layout[i] = [];
                    for (var j = 0, jlen = columnStr.length; j < jlen; j++) {
                        layout[i][j] = columnStr[j].trim();
                    }
                }
                return layout;
            },
            __parseLayout: function(tableLayout, node, rowLayout) {
                var childs = node.childNodes;
                var currentNode;
                var nodeName;
                var nodeType;
                // empty node
                if (childs.length === 0) {
                    if (rowLayout.length === 0) {
                        rowLayout.push([ {
                            isEmpty: true,
                            node: node
                        } ]);
                    } else {
                        rowLayout[rowLayout.length - 1].push({
                            isEmpty: true,
                            node: node
                        });
                    }
                    return;
                }
                for (var i = 0, len = childs.length; i < len; i++) {
                    currentNode = childs[i];
                    nodeName = currentNode.nodeName.toLowerCase();
                    nodeType = currentNode.nodeType;
                    // 黑名单
                    if (ELEMENT_BLACKLIST[nodeName]) {
                        continue;
                    }
                    if (nodeType === 1 && !INLINE_ELEMENTS[nodeName]) {
                        if (nodeName === "br") {
                            if (rowLayout.length === 0) {
                                tableLayout[tableLayout.length - 1] = {
                                    isBr: true
                                };
                            }
                            rowLayout = [];
                            tableLayout.push(rowLayout);
                        } else if (nodeName === "table") {
                            rowLayout = [];
                            tableLayout.push(rowLayout);
                            this.__parseTableLayout(tableLayout, currentNode, rowLayout);
                        } else {
                            rowLayout = [];
                            tableLayout.push(rowLayout);
                            this.__parseLayout(tableLayout, currentNode, rowLayout);
                        }
                    } else if (nodeType !== 1 && nodeType !== 3) {
                        continue;
                    } else {
                        if (nodeType === 3) {
                            if (rowLayout.length === 0) {
                                rowLayout.push([ currentNode ]);
                            } else {
                                rowLayout[rowLayout.length - 1].push(currentNode);
                            }
                        } else {
                            this.__parseLayout(tableLayout, currentNode, rowLayout);
                        }
                    }
                }
            },
            __parseTableLayout: function(tableLayout, node, rowLayout) {
                var rows = node.rows;
                var cells;
                for (var i = 0, len = rows.length; i < len; i++) {
                    rowLayout = [];
                    tableLayout.push(rowLayout);
                    cells = rows[i].cells;
                    for (var j = 0, jlen = cells.length; j < jlen; j++) {
                        rowLayout.push({
                            isCell: true,
                            content: cells[j].innerText,
                            node: cells[j].firstChild || cells[j]
                        });
                    }
                }
            },
            restructLayout: function(layout) {
                var result = [];
                var rowLayout;
                var columnLayout;
                var contents;
                for (var i = 0, len = layout.length; i < len; i++) {
                    rowLayout = layout[i];
                    if (rowLayout.length === 0) {
                        continue;
                    }
                    result[i] = [];
                    if (rowLayout.isBr) {
                        result[i] = rowLayout;
                        continue;
                    }
                    for (var j = 0, jlen = rowLayout.length; j < jlen; j++) {
                        columnLayout = rowLayout[j];
                        // table cell
                        if (columnLayout.isCell) {
                            result[i][j] = {
                                content: columnLayout.content,
                                style: this.__getStyle(columnLayout.node)
                            };
                            continue;
                        }
                        // 普通行
                        contents = [];
                        for (var k = 0, klen = columnLayout.length; k < klen; k++) {
                            if (columnLayout[k].isEmpty) {
                                contents[k] = "";
                            } else {
                                contents[k] = columnLayout[k].nodeValue.trim();
                            }
                        }
                        result[i][j] = {
                            content: contents.join(" "),
                            style: this.__getStyle(columnLayout[0].isEmpty ? columnLayout[0].node : columnLayout[0])
                        };
                    }
                }
                // 删除所有非显式换行的空行
                return this.__clearEmptyLine(result);
            },
            __clearEmptyLine: function(layout) {
                var result = [];
                for (var i = 0, len = layout.length; i < len; i++) {
                    if (layout[i]) {
                        result.push(layout[i]);
                    }
                }
                return result;
            },
            __getStyle: function(node) {
                while (node && node.nodeType === 3) {
                    node = node.parentNode;
                }
                var cssStyle = node.style;
                var nodeName = node.nodeName.toLowerCase();
                var result = {};
                var defaultStyle = DEFAULT_ELEMENT_STYLE[nodeName] || {};
                var fontFamily = cssStyle.fontFamily;
                if (fontFamily === "sans-serif" || fontFamily === "serif") {
                    fontFamily = undefined;
                }
                var fontSize = cssStyle.fontSize;
                if (fontSize && fontSize.lastIndexOf("em") !== -1) {
                    fontSize = Math.floor(parseFloat(fontSize) * BASE_FONT_SIZE);
                } else if (fontSize && fontSize.lastIndexOf("%") !== -1) {
                    fontSize = Math.floor(parseFloat(fontSize) / 100 * BASE_FONT_SIZE);
                }
                var fontWeight = cssStyle.fontWeight;
                if (fontWeight === "normal") {
                    fontWeight = undefined;
                } else if (fontWeight) {
                    fontWeight = "bold";
                }
                var backgroundColor = this.cs("parse.color", cssStyle.backgroundColor);
                var color = this.cs("parse.color", cssStyle.color);
                if (color === BACKGROUND_COLOR && !backgroundColor) {
                    while (node && !backgroundColor || backgroundColor === "inherit") {
                        node = node.parentNode;
                        if (node) {
                            backgroundColor = node.style.backgroundColor;
                        }
                    }
                    backgroundColor = this.cs("parse.color", backgroundColor);
                }
                if (color === BACKGROUND_COLOR && (!backgroundColor || backgroundColor === BACKGROUND_COLOR)) {
                    color = undefined;
                }
                result.fontFamily = fontFamily ? fontFamily.split(",")[0] : undefined;
                result.fontWeight = fontWeight || defaultStyle.fontWeight;
                result.fontStyle = StandardStyle.fontStyle[cssStyle.fontStyle] || defaultStyle.fontStyle;
                result.fontSize = fontSize ? Math.ceil(parseInt(fontSize, 10)) : defaultStyle.fontSize;
                result.textAlign = StandardStyle.halign[cssStyle.textAlign] || defaultStyle.textAlign;
                result.verticalAlign = StandardStyle.valign[cssStyle.verticalAlign] || defaultStyle.verticalAlign;
                result.color = this.cs("parse.color", color);
                result.backgroundColor = this.cs("parse.color", backgroundColor);
                return result;
            }
        });
    }
};

//src/system/clipboard/inline-elements.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[140] = {
    value: {
        b: true,
        big: true,
        i: true,
        small: true,
        tt: true,
        abbr: true,
        acronym: true,
        cite: true,
        code: true,
        dfn: true,
        em: true,
        kbd: true,
        strong: true,
        samp: true,
        "var": true,
        a: true,
        bdo: true,
        img: true,
        map: true,
        object: true,
        q: true,
        script: true,
        span: true,
        sub: true,
        sup: true,
        button: true,
        input: true,
        label: true,
        select: true,
        textarea: true
    }
};

//src/system/clipboard/standard-style.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[141] = {
    value: {
        fontWeight: {
            bold: "bold",
            bolder: "bold"
        },
        valign: {
            baseline: "bottom",
            "text-bottom": "bottom",
            "text-top": "top",
            sub: "bottom",
            "super": "top"
        },
        fontStyle: {
            italic: "italic"
        },
        halign: {
            left: "left",
            center: "center",
            right: "right"
        }
    }
};

//src/system/commands/_paste.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[142] = {
    value: function(require) {
        return _p.r(0).create("_PasteCommand", {
            base: _p.r(90),
            name: "paste cut",
            execute: function(name, data, style, point, range) {
                if (name === "paste") {
                    this.rs("s.paste", data, style, point);
                } else {
                    this.rs("s.cut", data, style, point, range);
                }
            }
        });
    }
};

//src/system/commands/input.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[143] = {
    value: function(require) {
        return _p.r(0).create("InputLockCommand", {
            base: _p.r(90),
            name: "lockinput unlockinput inputfocus",
            execute: function(name) {
                switch (name) {
                  case "lockinput":
                    this.rs("s.input.lock");
                    break;

                  case "unlockinput":
                    this.rs("s.input.unlock");
                    break;

                  case "inputfocus":
                    this.rs("s.input.focus");
                    break;
                }
            }
        });
    }
};

//src/system/commands/sort.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[144] = {
    value: function(require) {
        return _p.r(0).create("SortCommand", {
            base: _p.r(90),
            name: "sortcolumnbyasc sortcolumnbydesc sortrowbyasc sortrowbydesc",
            execBefore: function(name) {
                if (arguments.length === 3) {
                    return [].slice.call(arguments, 1);
                }
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var index;
                switch (name) {
                  case "sortcolumnbyasc":
                  case "sortcolumnbydesc":
                    index = focus.col;
                    break;

                  case "sortrowbyasc":
                  case "sortrowbydesc":
                    index = focus.row;
                    break;
                }
                var struct = this.rs("c.struct");
                var effectiveIndex = struct.getEffectiveIndex();
                var end = range.getEnd();
                return [ index, {
                    start: range.getStart(),
                    end: {
                        row: Math.min(end.row, effectiveIndex.row),
                        col: Math.min(end.col, effectiveIndex.col)
                    }
                } ];
            },
            execute: function(name, index, range) {
                this[name](index, range);
            },
            sortcolumnbyasc: function(index, range) {
                return this.rs("c.sort.column.asc", index, range);
            },
            sortcolumnbydesc: function(index, range) {
                return this.rs("c.sort.column.desc", index, range);
            },
            sortrowbyasc: function(index, range) {
                return this.rs("c.sort.row.asc", index, range);
            },
            sortrowbydesc: function(index, range) {
                return this.rs("c.sort.row.desc", index, range);
            }
        });
    }
};

//src/system/cover/cover.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[145] = {
    value: function(require) {
        var $ = _p.r(2);
        var Cover = _p.r(0).create("Cover", {
            position: null,
            panel: null,
            queue: {
                mousedown: [],
                mousemove: [],
                mouseup: [],
                dblclick: []
            },
            base: _p.r(94),
            init: function(position) {
                this.position = position;
                this.panel = this.createPanel();
                this.initEvent();
            },
            initEvent: function() {
                var position = this.position;
                var _self = this;
                var state = false;
                $(this.panel).on("mousedown dblclick", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.type !== "dblclick") {
                        state = true;
                    }
                    var index = position.toIndex(evt.clientX, evt.clientY);
                    _self.emit(evt.type, index.row, index.col);
                });
                $(this.panel).on("mouseup", function(evt) {
                    if (!state) {
                        return;
                    }
                    state = false;
                    evt.stopPropagation();
                    evt.preventDefault();
                    var index = position.toIndex(evt.clientX, evt.clientY);
                    _self.emit(evt.type, index.row, index.col);
                });
                $(this.panel).on("mousemove", function(evt) {
                    if (!state) {
                        return;
                    }
                    evt.stopPropagation();
                    evt.preventDefault();
                    var index = position.toIndex(evt.clientX, evt.clientY);
                    _self.emit(evt.type, index.row, index.col);
                });
            },
            emit: function(type) {
                var queue = this.queue[type];
                var args = [].slice.call(arguments, 1);
                for (var i = 0, len = queue.length; i < len; i++) {
                    queue[i].handler.apply(queue[i].provider, args);
                }
            },
            onmousedown: function(provider, handler) {
                this.queue.mousedown.push({
                    provider: provider,
                    handler: handler
                });
            },
            onmouseup: function(provider, handler) {
                this.queue.mouseup.push({
                    provider: provider,
                    handler: handler
                });
            },
            onmousemove: function(provider, handler) {
                this.queue.mousemove.push({
                    provider: provider,
                    handler: handler
                });
            },
            ondblclick: function(provider, handler) {
                this.queue.dblclick.push({
                    provider: provider,
                    handler: handler
                });
            },
            run: function() {
                this.getContentContainer().appendChild(this.panel);
            },
            createPanel: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-cover"
                    }
                });
            }
        });
        Cover.deps = [ "position" ];
        return Cover;
    }
};

//src/system/definition/color.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[146] = {
    value: [ {
        color: "rgba(247, 152, 29, 0.1)",
        border: "#D78E30"
    }, {
        color: "rgba(60, 160, 232, 0.1)",
        border: "#3B8ECA"
    }, {
        color: "rgba(180, 77, 192, 0.1)",
        border: "rgb(180, 77, 192)"
    }, {
        color: "rgba(58, 189, 37, 0.1)",
        border: "#3ABD25"
    }, {
        color: "rgba(115, 213, 202, 0.1)",
        border: "rgb(115, 213, 202)"
    } ]
};

//src/system/definition/formula-type.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[147] = {
    value: {
        OPERAND: "operand",
        OPERATOR: "operator",
        REFERENCE: "reference",
        CONSTANT: "constant"
    }
};

//src/system/definition/keycode.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[148] = {
    value: {
        ENTER: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        TAB: 9,
        ESC: 27,
        BACKSPACE: 8,
        DELETE: 46
    }
};

//src/system/formula-content/content.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[149] = {
    value: function(require) {
        var $ = _p.r(2);
        var Editor = _p.r(150);
        var TEXT_SPACE = 2;
        var FormulaAnalyzer = _p.r(151);
        var FormulaContent = _p.r(0).create("FormulaContent", {
            cover: null,
            wrapper: null,
            container: null,
            editor: null,
            analyzer: null,
            controlState: false,
            base: _p.r(94),
            init: function(position) {
                this.position = position;
                this.wrapper = this.createWrapper();
                this.container = this.createEditorContainer();
                this.cover = this.createFormulaCover();
                this.editor = this.createComponent(Editor);
                this.analyzer = this.createComponent(FormulaAnalyzer);
                this.editor.setAnalyzer(this.analyzer);
                this.initMessageHook();
                this.initEvent();
            },
            run: function() {
                this.editor.appendTo(this.container);
                this.editor.appendToCover(this.cover);
                this.wrapper.appendChild(this.container);
                this.getContentContainer().appendChild(this.wrapper);
                this.getContentContainer().appendChild(this.cover);
            },
            initMessageHook: function() {
                this.onMessage({
                    "s.formula.model.open": this.start,
                    "s.formula.controlstatechange": this.changeControlState,
                    "s.formula.exit": this.exit
                });
            },
            initEvent: function() {
                var _self = this;
                var index;
                var viewStart;
                $(this.cover).on("mousedown", function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    viewStart = _self.rs("c.struct").getViewStart();
                    index = _self.position.toIndex(evt.clientX, evt.clientY);
                    if (!_self.controlState) {
                        _self.exit();
                    }
                    _self.execCommand("focus", viewStart.row + index.row, viewStart.col + index.col);
                });
            },
            start: function() {
                this.showCover();
                this.resize();
                this.showInput();
                this.editor.reset();
            },
            exit: function() {
                this.hideCover();
                this.hideInput();
                this.editor.exit();
                this.postMessage("s.formula.model.close");
            },
            changeControlState: function(state) {
                this.controlState = state;
            },
            showCover: function() {
                this.cover.style.display = "block";
            },
            hideCover: function() {
                this.cover.style.display = "none";
            },
            showInput: function() {
                this.wrapper.style.display = "block";
            },
            hideInput: function() {
                this.wrapper.style.display = "none";
            },
            resize: function() {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var borderWidth = struct.getBorderWidth();
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var coordinate = this.cs("c.cell.coordinate", struct, focus.row, focus.col);
                $(this.container).css({
                    minWidth: grid.width[focus.col] - 2 * borderWidth - 2 * TEXT_SPACE,
                    minHeight: grid.height[focus.row] - 2 * borderWidth - 2 * TEXT_SPACE
                });
                $(this.wrapper).css({
                    top: coordinate.y - borderWidth,
                    left: coordinate.x - borderWidth
                });
            },
            createFormulaCover: function() {
                return this.createElement("div", "btb-formula-cover");
            },
            createWrapper: function() {
                return this.createElement("div", "btb-formula-wrapper");
            },
            createEditorContainer: function() {
                return this.createElement("div", "btb-editor-container");
            }
        });
        FormulaContent.deps = [ "position" ];
        return FormulaContent;
    }
};

//src/system/formula-content/editor.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[150] = {
    value: function(require) {
        var $ = _p.r(2);
        var KEY_CODE = _p.r(148);
        var COLOR = _p.r(146);
        var TYPE = _p.r(147);
        return _p.r(0).create("Editor", {
            input: null,
            $input: null,
            tooltip: null,
            $tooltip: null,
            templateSelection: null,
            templatePart: null,
            placeholder: null,
            analyzer: null,
            total: null,
            doc: null,
            parts: [],
            blocks: [],
            selections: [],
            snapshot: null,
            focusIndex: 0,
            originalCell: null,
            controlState: true,
            imeState: false,
            workState: false,
            tipState: false,
            index: 0,
            base: _p.r(91),
            init: function() {
                this.input = this.createInput();
                this.$input = $(this.input);
                this.doc = this.getDocument();
                this.tooltip = this.createTooltip();
                this.$tooltip = $(this.tooltip);
                this.container = this.createContainer();
                this.placeholder = this.doc.createTextNode("﻿");
                this.templatePart = this.createTemplatePart();
                this.templateSelection = this.createTemplateSelection();
                this.initEvent();
                this.initMessageHook();
            },
            setAnalyzer: function(analyzer) {
                this.analyzer = analyzer;
            },
            reset: function() {
                this.total = this.rs("c.struct").getTotal();
                this.originalCell = this.rs("c.range").getFocus();
                this.workState = true;
                this.tipState = true;
                this.index = 0;
                this.input.innerHTML = "<span>=</span>";
                this.placeholder.textContent = "﻿";
                this.changeControlState(true);
                this.input.appendChild(this.placeholder);
                this.input.appendChild(this.tooltip);
                this.toNodeInnerEnd(this.placeholder);
            },
            exit: function() {
                this.workState = false;
                this.blocks = [];
                this.selections = [];
                this.parts = [];
                this.input.blur();
                this.container.innerHTML = "";
            },
            flush: function(moveUp) {
                var content = this.input.innerText.replace("﻿", "");
                this.transferControl();
                this.execCommand("write", content, this.originalCell.row, this.originalCell.col);
                if (moveUp) {
                    this.execCommand("moveup", 1);
                } else {
                    this.execCommand("movedown", 1);
                }
            },
            transferControl: function() {
                this.postMessage("s.formula.exit");
                this.execCommand("focus", this.originalCell.row, this.originalCell.col);
            },
            initEvent: function() {
                var _self = this;
                this.$input.on("keydown", function(evt) {
                    switch (evt.keyCode) {
                      case KEY_CODE.ENTER:
                        evt.preventDefault();
                        _self.flush(evt.shiftKey);
                        return;

                      case KEY_CODE.ESC:
                        evt.preventDefault();
                        _self.transferControl();
                        return;
                    }
                    if (!_self.controlState || _self.imeState) {
                        return;
                    }
                    switch (evt.keyCode) {
                      case KEY_CODE.LEFT:
                        _self.leftMove(evt);
                        break;

                      case KEY_CODE.RIGHT:
                        _self.rightMove(evt);
                        break;

                      case KEY_CODE.UP:
                        _self.upMove(evt);
                        break;

                      case KEY_CODE.DOWN:
                        _self.downMove(evt);
                        break;

                      case KEY_CODE.DELETE:
                      case KEY_CODE.BACKSPACE:
                        _self.keyDelete();
                        break;
                    }
                }).on("compositionstart", function(evt) {
                    _self.imeState = true;
                }).on("compositionend", function(evt) {
                    _self.imeState = false;
                }).on("input", function() {
                    if (_self.imeState) {
                        return;
                    }
                    _self.restruct();
                }).on("blur", function() {
                    if (_self.workState) {
                        _self.flush();
                        _self.postMessage("s.formula.blur");
                    }
                });
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.refresh": this.update,
                    "c.range.change": this.update
                });
            },
            update: function() {
                if (!this.workState) {
                    return;
                }
                var struct = this.rs("c.struct");
                var range = this.rs("c.range");
                var selections = this.selections;
                selections[this.index] = {
                    start: range.getStart(),
                    end: range.getEnd()
                };
                this.focusIndex = this.index;
                this.refreshSelection();
                this.updatePart(range);
                this.hintSelection();
            },
            refreshSelection: function() {
                var struct = this.rs("c.struct");
                var borderWidth = struct.getBorderWidth();
                var selections = this.selections;
                var blocks = this.blocks;
                var rect;
                var currentSelection;
                for (var i = 0, len = selections.length; i < len; i++) {
                    currentSelection = selections[i];
                    rect = this.cs("c.cell.viewrect", struct, currentSelection.start, currentSelection.end);
                    if (!blocks[i]) {
                        blocks[i] = this.getNewSelection(i);
                    }
                    if (rect) {
                        blocks[i].css({
                            width: rect.width - 2 * borderWidth,
                            height: rect.height - 2 * borderWidth,
                            top: rect.y - borderWidth,
                            left: rect.x - borderWidth,
                            background: "none",
                            display: "block"
                        });
                    } else {
                        blocks[i].css("display", "none");
                    }
                }
            },
            hintSelection: function() {
                var blocks = this.blocks;
                if (this.focusIndex !== -1) {
                    blocks[this.focusIndex].css("backgroundColor", this.getColor(this.focusIndex).color);
                }
            },
            updatePart: function(range) {
                if (range.isMultiple()) {
                    return;
                }
                var selection = this.selections[this.index];
                var color;
                var title = this.cs("c.title.index2char", selection.start.col);
                var part = this.parts[this.index];
                if (!part) {
                    color = this.getColor();
                    this.parts[this.index] = this.templatePart.cloneNode(true);
                    part = this.parts[this.index];
                    part.style.color = color.border;
                    this.insertNodeBeforeStart(part);
                }
                part.innerHTML = title + (selection.start.row + 1);
            },
            keyDelete: function() {
                this.toNodeBefore(this.placeholder);
            },
            hideTooltip: function() {
                this.$tooltip.remove();
                this.tipState = false;
            },
            restruct: function() {
                var content = this.input.innerText.replace(/\uFEFF/g, "");
                this.saveRangeSnapshot();
                var result = this.analyzer.analyze(this.total, content);
                if (!result) {
                    this.transferControl();
                    this.postMessage("s.toinput", content);
                    return;
                }
                this.reload(result);
                this.refreshSelection();
                this.hintSelection();
            },
            saveRangeSnapshot: function() {
                var range = this.doc.getSelection().getRangeAt(0);
                this.snapshot = {
                    container: range.startContainer,
                    offset: range.startOffset,
                    commonAncestorContainer: range.commonAncestorContainer
                };
            },
            reload: function(parts) {
                var part;
                this.index = 0;
                var segments = [];
                this.free();
                this.parts = [];
                this.selections = [];
                this.blocks = [];
                for (var i = 0, len = parts.length; i < len; i++) {
                    part = parts[i];
                    switch (part.type) {
                      case TYPE.REFERENCE:
                        segments[i] = this.createReferencePart(part.content);
                        this.parts[this.index] = segments[i];
                        this.selections[this.index] = part.value;
                        this.index++;
                        break;

                      case TYPE.CONSTANT:
                        segments[i] = this.createConstantPart(part.content);
                        break;

                      case TYPE.OPERATOR:
                        segments[i] = this.createOperatorPart(part.content);
                    }
                }
                segments.unshift(this.createElement("span", {
                    inner: "="
                }));
                var replaceRange = this.getReplaceRange(segments);
                if (replaceRange.focus > 0 && parts[replaceRange.focus - 1].type === TYPE.REFERENCE) {
                    this.focusIndex = parts[replaceRange.focus - 1].index;
                } else {
                    this.focusIndex = -1;
                }
                this.input.innerHTML = "";
                for (var i = 0, len = segments.length; i < len; i++) {
                    this.input.appendChild(segments[i]);
                }
                if (parts.length === 0 || parts[parts.length - 1].type === TYPE.OPERATOR) {
                    $(this.placeholder).remove();
                    $(this.tooltip).remove();
                    this.placeholder.textContent = "﻿";
                    if (replaceRange.container.parentNode !== this.input) {
                        $(this.placeholder).insertAfter(replaceRange.container.parentNode);
                    } else {
                        $(this.placeholder).insertAfter(replaceRange.container);
                    }
                    $(this.tooltip).insertAfter(this.placeholder);
                    this.tipState = true;
                    this.changeControlState(true);
                    this.toNodeInnerEnd(this.placeholder);
                } else {
                    this.tipState = false;
                    this.changeControlState(false);
                    this.replaceRange(replaceRange);
                }
            },
            changeControlState: function(state) {
                this.controlState = state;
                this.postMessage("s.formula.controlstatechange", state);
            },
            getReplaceRange: function(segments) {
                var count = this.getFocusBeforeCount();
                var currentCount;
                var container;
                var offset;
                var focus = 0;
                for (var i = 0, len = segments.length; i < len; i++) {
                    currentCount = segments[i].textContent.length;
                    if (count > currentCount) {
                        focus++;
                        count -= currentCount;
                        continue;
                    } else {
                        container = segments[i].firstChild || segments[i];
                        offset = count;
                        break;
                    }
                }
                return {
                    container: container,
                    offset: offset,
                    focus: focus
                };
            },
            getFocusBeforeCount: function() {
                var snapshot = this.snapshot;
                var focusNode = snapshot.container;
                var offset = snapshot.offset;
                var slice = [].slice;
                if (focusNode.parentNode !== this.input) {
                    focusNode = focusNode.parentNode;
                }
                var template = this.input.cloneNode(true);
                var childNodes = template.childNodes;
                var count;
                var index = slice.call(this.input.childNodes).indexOf(focusNode);
                var newFocus = childNodes[index];
                for (var i = childNodes.length - 1; i >= index; i--) {
                    template.removeChild(childNodes[i]);
                }
                count = template.innerText.replace("﻿").length;
                var text = newFocus.textContent.split("");
                for (var i = 0, len = offset; i < len; i++) {
                    if (text[i] === "﻿") {
                        continue;
                    }
                    count++;
                }
                return count;
            },
            replaceRange: function(simpleRange) {
                var selection = this.doc.getSelection();
                var range = selection.getRangeAt(0);
                range = range.cloneRange();
                range.setEnd(simpleRange.container, simpleRange.offset);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            free: function() {
                this.container.innerHTML = "";
            },
            createReferencePart: function(content) {
                var color = this.getColor();
                var node = this.templatePart.cloneNode(true);
                node.style.color = color.border;
                node.style.textDecoration = "none";
                node.innerHTML = content;
                return node;
            },
            createConstantPart: function(content) {
                return this.createElement("span", {
                    inner: content
                });
            },
            createOperatorPart: function(content) {
                return this.doc.createTextNode(content);
            },
            leftMove: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.resetCellRange();
                this.hideTooltip();
                this.execCommand("moveleft", 1);
            },
            rightMove: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.resetCellRange();
                this.hideTooltip();
                this.execCommand("moveright", 1);
            },
            upMove: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.resetCellRange();
                this.hideTooltip();
                this.execCommand("moveup", 1);
            },
            downMove: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.resetCellRange();
                this.hideTooltip();
                this.execCommand("movedown", 1);
            },
            resetCellRange: function() {
                if (!this.selections[this.index]) {
                    this.rs("c.range.focus", this.originalCell.row, this.originalCell.col);
                }
            },
            getColor: function(index) {
                index = index === undefined ? this.index : index;
                return COLOR[index % COLOR.length];
            },
            getNewSelection: function(index) {
                var selection = this.createSelection(index);
                selection.appendTo(this.container);
                return selection;
            },
            createSelection: function(index) {
                var color = this.getColor(index);
                var block = this.templateSelection.cloneNode(false);
                return $(block).css({
                    borderColor: color.border
                });
            },
            insertNodeBeforeStart: function(node) {
                var range = this.doc.getSelection().getRangeAt(0);
                var startContainer = range.startContainer;
                if (startContainer.nodeType === 1) {
                    startContainer.insertBefore(node, startContainer.childNodes[range.startOffset]);
                } else {
                    startContainer.parentNode.insertBefore(node, startContainer);
                }
            },
            toNodeBefore: function(node) {
                var range = this.doc.createRange();
                var selection = this.doc.getSelection();
                var parent = node.parentNode;
                range.setEnd(parent, [].slice.call(parent.childNodes, 0).indexOf(node));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            toNodeAfter: function(node) {
                var range = this.doc.createRange();
                var selection = this.doc.getSelection();
                range.setEndAfter(node);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            toNodeInnerEnd: function(node) {
                var range = this.doc.createRange();
                var selection = this.doc.getSelection();
                if (node.nodeType === 1) {
                    var target = node.childNodes;
                    range.setEndAfter(target[target.length - 1]);
                } else {
                    range.setEnd(node, node.textContent.length);
                }
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            toNodeInnerStart: function(node) {
                var range = this.doc.createRange();
                var selection = this.doc.getSelection();
                range.setStart(node, 0);
                range.setEnd(node, 0);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            appendToCover: function(cover) {
                cover.appendChild(this.container);
            },
            appendTo: function(container) {
                container.appendChild(this.input);
            },
            createInput: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-formula-editor",
                        contenteditable: true,
                        spellcheck: false
                    }
                });
            },
            createContainer: function() {
                return this.createElement("div", "btb-formula-selection");
            },
            createTooltip: function() {
                return this.createElement("span", "btb-formula-tooltip");
            },
            createTemplatePart: function() {
                return this.createElement("span", "btb-formula-part");
            },
            createTemplateSelection: function() {
                return this.createElement("div", "btb-formula-part-block");
            }
        });
    }
};

//src/system/formula-content/formula-analyzer.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[151] = {
    value: function(require) {
        var $ = _p.r(2);
        var TYPE = _p.r(147);
        var COL_PATTERN = /[\sA-Z]+/i;
        return _p.r(0).create("FormulaAnalyzer", {
            base: _p.r(91),
            analyze: function(totalCount, content) {
                if (content.charAt(0) !== "=") {
                    return null;
                }
                if (content === "=") {
                    return [];
                }
                var original = content.substring(1);
                var unit;
                var pattern = /([^+*\/^-]+)|([+*\/^-])/g;
                var parts = [];
                while (unit = pattern.exec(original)) {
                    if (unit[1] !== undefined) {
                        parts.push({
                            type: TYPE.OPERAND,
                            content: unit[1]
                        });
                    } else {
                        parts.push({
                            type: TYPE.OPERATOR,
                            content: unit[2]
                        });
                    }
                }
                return this.analyzePart(totalCount, parts);
            },
            analyzePart: function(totalCount, parts) {
                var result = [];
                var currentPart;
                var index = 0;
                for (var i = 0, len = parts.length; i < len; i++) {
                    currentPart = parts[i];
                    if (currentPart.type === TYPE.OPERATOR) {
                        result[i] = currentPart;
                    } else {
                        currentPart = currentPart.content;
                        if (currentPart.indexOf(":") !== -1) {
                            result[i] = this.parseMultiPart(totalCount, currentPart);
                        } else {
                            result[i] = this.parseSinglePart(totalCount, currentPart);
                        }
                        if (result[i].type === TYPE.REFERENCE) {
                            result[i].index = index;
                            index++;
                        }
                    }
                }
                return result;
            },
            parseSinglePart: function(totalCount, content) {
                var colIndex = COL_PATTERN.exec(content);
                var rowIndex;
                if (!colIndex) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                }
                colIndex = colIndex[0];
                rowIndex = content.substring(colIndex.length);
                if (colIndex + rowIndex !== content) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                }
                colIndex = colIndex.trim();
                rowIndex = rowIndex.trim();
                if (colIndex.length === 0 || rowIndex.length === 0) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                }
                var colNumber = this.cs("c.title.char2index", colIndex.trim());
                if (!$.isNumeric(rowIndex)) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                }
                // 行号和实际的索引之间有1个单位的差距
                var rowNumber = parseInt(rowIndex, 10) - 1;
                if (colNumber >= totalCount.col || rowNumber >= totalCount.row) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                }
                return {
                    type: TYPE.REFERENCE,
                    content: content,
                    value: {
                        start: {
                            row: rowNumber,
                            col: colNumber
                        },
                        end: {
                            row: rowNumber,
                            col: colNumber
                        }
                    }
                };
            },
            parseMultiPart: function(totalCount, content) {
                var parts = content.split(":", 2);
                var first = this.parseSinglePart(totalCount, parts[0]);
                var second = this.parseSinglePart(totalCount, parts[1]);
                if (first.type !== TYPE.REFERENCE || second.type !== TYPE.REFERENCE) {
                    return {
                        type: TYPE.CONSTANT,
                        content: content
                    };
                } else {
                    return {
                        type: TYPE.REFERENCE,
                        content: content,
                        value: {
                            start: first.value.start,
                            end: second.value.start
                        }
                    };
                }
            }
        });
    }
};

//src/system/input/input-shadow-man.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[152] = {
    value: function(require) {
        var $ = _p.r(2);
        var THRESHOLD = 20;
        return _p.r(0).create("InputShadowMan", {
            inputNode: null,
            $inputNode: null,
            padding: 0,
            borderWidth: 0,
            diff: 0,
            base: _p.r(91),
            init: function() {
                this.inputNode = this.createElement("div", {
                    attr: {
                        "class": "btb-shadow-input"
                    }
                });
                this.$inputNode = $(this.inputNode);
            },
            appendTo: function(container) {
                container.appendChild(this.inputNode);
                this.diff = 2 * (this.padding + this.borderWidth - this.rs("c.struct").getBorderWidth());
            },
            setPadding: function(padding) {
                this.padding = padding;
                this.diff = 2 * (this.padding + this.borderWidth - this.rs("c.struct").getBorderWidth());
            },
            setBorderWidth: function(borderWidth) {
                this.borderWidth = borderWidth;
            },
            resetStyle: function(cssText) {
                this.inputNode.innerHTML = "";
                this.inputNode.style.cssText = cssText;
            },
            // TODO 处理高度时需要重构
            getSize: function(content, align, size, index) {
                this.inputNode.innerHTML = content;
                var contentSize = {
                    width: size.width - 2 * this.padding,
                    height: size.height - 2 * this.padding
                };
                var currentSize = this.inputNode.getBoundingClientRect();
                var threshold = THRESHOLD + this.padding * 2;
                // 当前宽度和高度足够， 则不重新计算
                if (currentSize.width < contentSize.width - threshold && currentSize.height < contentSize.height) {
                    return null;
                }
                switch (align) {
                  case "left":
                    return this.__getLeftAlignWidth(index, size, currentSize, contentSize, threshold);

                  case "right":
                    return this.__getRightAlignWidth(index, size, currentSize, contentSize, threshold);

                  case "center":
                    return this.__getCenterAlignWidth(index, size, currentSize, contentSize, threshold);
                }
            },
            /**
         * 左对齐：向右扩展
         * @private
         */
            __getLeftAlignWidth: function(index, size, currentSize, contentSize, threshold) {
                var newSize = {};
                if (currentSize.width > contentSize.width - threshold) {
                    newSize.width = this.__getWidth(currentSize, index);
                    // 发生了变化， 需要更新数据
                    currentSize = this.inputNode.getBoundingClientRect();
                } else {
                    newSize.width = size.width;
                }
                if (currentSize.height > contentSize.height) {
                    newSize.height = this.__getHeight(currentSize.height, index.row);
                } else {
                    newSize.height = size.height;
                }
                return {
                    start: index.col,
                    size: newSize
                };
            },
            /**
         * 右对齐：向左扩展
         * @private
         */
            __getRightAlignWidth: function(index, size, currentSize, contentSize, threshold) {
                var newSize = {};
                var result = {};
                if (currentSize.width > contentSize.width - threshold) {
                    result = this.__getNewWidthByRight(currentSize, index, threshold);
                    newSize.width = result.width;
                    // 发生了变化， 需要更新数据
                    currentSize = this.inputNode.getBoundingClientRect();
                } else {
                    newSize.width = size.width;
                }
                if (currentSize.height > contentSize.height) {
                    newSize.height = this.__getHeight(currentSize.height, index.row);
                } else {
                    newSize.height = size.height;
                }
                return {
                    start: result.start,
                    size: newSize
                };
            },
            /**
         * 居中对齐：向两端扩展
         * @private
         */
            __getCenterAlignWidth: function(index, size, currentSize, contentSize, threshold) {
                var newSize = {};
                var result = {};
                if (currentSize.width > contentSize.width - threshold) {
                    result = this.__getNewWidthByCenter(currentSize, index, threshold);
                    newSize.width = result.width;
                    // 发生了变化， 需要更新数据
                    currentSize = this.inputNode.getBoundingClientRect();
                } else {
                    result.start = index.col;
                    newSize.width = size.width;
                }
                if (currentSize.height > contentSize.height) {
                    newSize.height = this.__getHeight(currentSize.height, index.row);
                } else {
                    newSize.height = size.height;
                }
                return {
                    start: result.start,
                    size: newSize
                };
            },
            __getWidth: function(size, index) {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var visibleCount = struct.getVisibleCount();
                var colPoints = grid.col;
                var offset = struct.getOffset();
                var borderWidth = struct.getBorderWidth();
                var maxSize = this.getContentSize();
                var col = index.col;
                var width = size.width + colPoints[col];
                var result = 0;
                var threshold = THRESHOLD + this.padding * 2;
                var max = maxSize.width - colPoints[index.col] - offset - borderWidth;
                col += 1;
                if (width > maxSize.width - threshold) {
                    result = max;
                } else {
                    while (width > colPoints[col] - offset - threshold) {
                        col++;
                        if (col >= visibleCount.col) {
                            break;
                        }
                    }
                    result = Math.min(colPoints[col] - offset, maxSize.width - borderWidth) - colPoints[index.col] - offset;
                }
                if (result === max) {
                    this.inputNode.style.width = max + "px";
                }
                return result;
            },
            /**
         * 获取右对齐情况下的新宽度
         * @private
         */
            __getNewWidthByRight: function(size, index, threshold) {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var colWidth = grid.width;
                var minWidth = size.width + threshold;
                var borderWidth = struct.getBorderWidth();
                var width = 0;
                var overflow = false;
                for (var i = index.col; i >= 0; i--) {
                    width += colWidth[i];
                    if (width >= minWidth) {
                        break;
                    }
                    if (i === 0) {
                        overflow = true;
                        break;
                    }
                    width += borderWidth;
                }
                if (overflow) {
                    this.inputNode.style.width = width + "px";
                }
                return {
                    start: i,
                    width: width
                };
            },
            __getNewWidthByCenter: function(size, index, threshold) {
                var col = index.col;
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var visibleCount = struct.getVisibleCount().col;
                var colWidth = grid.width;
                var colPoint = grid.col;
                var minWidth = size.width + threshold;
                var borderWidth = struct.getBorderWidth();
                var boundary = struct.getBoundary();
                colWidth = [].concat(colWidth);
                var width = colWidth[col];
                var overflow = false;
                // 最后可显示的列的可见宽度
                var lastWidth = colWidth[visibleCount - 1] - (colPoint[visibleCount] - boundary.width);
                // 更新最后一列的宽度为可显示宽度
                colWidth[visibleCount - 1] = lastWidth;
                if (col !== 0) {
                    width += borderWidth + colWidth[col - 1];
                }
                if (col + 1 <= visibleCount) {
                    width += borderWidth + colWidth[col + 1];
                }
                if (width >= minWidth) {
                    return {
                        start: col < 1 ? 0 : col - 1,
                        width: width
                    };
                }
                var leftIndex = 0;
                var rightIndex = 0;
                var currentLeftIndex;
                var currentRightIndex;
                width = colWidth[col];
                while (width < minWidth) {
                    leftIndex += 1;
                    rightIndex += 1;
                    currentLeftIndex = col - leftIndex;
                    currentRightIndex = col + rightIndex;
                    if (currentLeftIndex < 0 && currentRightIndex >= visibleCount) {
                        overflow = true;
                        break;
                    }
                    if (currentLeftIndex >= 0) {
                        width += colWidth[currentLeftIndex] + borderWidth;
                    } else {
                        leftIndex -= 1;
                    }
                    if (currentRightIndex < visibleCount) {
                        width += colWidth[currentRightIndex] + borderWidth;
                    }
                }
                if (overflow) {
                    this.inputNode.style.width = width + "px";
                }
                return {
                    start: col - leftIndex < 0 ? 0 : col - leftIndex,
                    width: width
                };
            },
            /**
         * 溢出的情况下计算高度
         * @private
         */
            __getHeight: function(height, row) {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var visibleCount = struct.getVisibleCount();
                var rowPoints = grid.row;
                var offset = struct.getOffset();
                var borderWidth = struct.getBorderWidth();
                var maxSize = this.getContentSize();
                var threshold = this.padding * 2;
                var originalRow = row;
                height += rowPoints[row];
                if (height > maxSize.height) {
                    return maxSize.height;
                }
                row += 1;
                while (height > rowPoints[row] - threshold) {
                    row++;
                    if (row >= visibleCount.row) {
                        break;
                    }
                }
                return Math.min(rowPoints[row] - offset, maxSize.height - borderWidth) - rowPoints[originalRow] - offset;
            }
        });
    }
};

//src/system/input/input.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[153] = {
    value: function(require) {
        var CANDIDATE_FONT = _p.r(12).CANDIDATE_FONT;
        var $ = _p.r(2);
        var KEY_CODE = _p.r(148);
        var InputShadowMan = _p.r(152);
        var TextHelper = _p.r(154);
        var BOX_BORDER_WIDTH = 2;
        var PADDING = 2;
        var Input = _p.r(0).create("Input", {
            cover: null,
            textHelper: null,
            shadowMan: null,
            inputNode: null,
            $inputNode: null,
            inputWrapper: null,
            $inputWrapper: null,
            workState: true,
            shadowWrapper: null,
            $shadowWrapper: null,
            label: null,
            $label: null,
            active: false,
            quick: true,
            contentchanged: false,
            writable: false,
            style: null,
            lockState: false,
            labelState: false,
            inputLockState: false,
            index: {},
            inputSize: {
                width: 0,
                height: 0
            },
            base: _p.r(94),
            init: function(cover) {
                this.cover = cover;
                this.borderWidth = this.rs("c.struct").getBorderWidth();
                this.shadowMan = this.createComponent(InputShadowMan);
                this.shadowMan.setPadding(PADDING);
                this.shadowMan.setBorderWidth(BOX_BORDER_WIDTH);
                this.inputWrapper = this.createWrapper();
                this.$inputWrapper = $(this.inputWrapper);
                this.shadowWrapper = this.inputWrapper.cloneNode(false);
                this.$shadowWrapper = $(this.shadowWrapper);
                this.$shadowWrapper.addClass("btb-shadow-wrapper");
                this.inputNode = this.createInput();
                this.$inputNode = $(this.inputNode);
                this.label = this.createLabel();
                this.$label = $(this.label);
                this.textHelper = this.createComponent(TextHelper);
                this.initMessageHook();
                this.initEvent();
                this.initService();
            },
            run: function() {
                this.textHelper.bind(this.inputNode);
                this.inputWrapper.appendChild(this.inputNode);
                this.inputWrapper.appendChild(this.label);
                this.getContentContainer().appendChild(this.inputWrapper);
                this.getContentContainer().appendChild(this.shadowWrapper);
                this.shadowMan.appendTo(this.inputWrapper);
            },
            initEvent: function() {
                var _self = this;
                this.cover.onmousedown(this, this.onmousedown);
                this.cover.ondblclick(this, this.ondblclick);
                this.$inputNode.on("blur", function() {
                    if (!_self.workState || _self.inputLockState) {
                        return;
                    }
                    _self.flush();
                    _self.disable();
                }).on("input", function() {
                    if (_self.isFormulaModel()) {
                        _self.exitInput();
                        _self.offline();
                        _self.postMessage("s.formula.model.open");
                    } else {
                        _self.toggleToInput();
                        _self.inputResize();
                        _self.contentchanged = true;
                        _self.postMessage("s.input.contentchange", _self.inputNode.innerHTML);
                    }
                }).on("keydown", function(evt) {
                    if ((evt.ctrlKey || evt.metaKey) && evt.keyCode === 65) {
                        _self.selectAll(evt);
                        return;
                    }
                    switch (evt.keyCode) {
                      case KEY_CODE.ENTER:
                        _self.__keyEnter(evt);
                        break;

                      case KEY_CODE.LEFT:
                        _self.__keyLeft(evt);
                        break;

                      case KEY_CODE.RIGHT:
                        _self.__keyRight(evt);
                        break;

                      case KEY_CODE.UP:
                        _self.__keyUp(evt);
                        break;

                      case KEY_CODE.DOWN:
                        _self.__keyDown(evt);
                        break;

                      case KEY_CODE.TAB:
                        _self.__keyTab(evt);
                        break;

                      case KEY_CODE.ESC:
                        _self.__keyEsc(evt);
                        break;

                      case KEY_CODE.DELETE:
                      case KEY_CODE.BACKSPACE:
                        _self.__keyDelete(evt);
                        break;
                    }
                }).on("mousedown contextmenu", function(evt) {
                    if (_self.workState && _self.active) {
                        evt.stopPropagation();
                    }
                });
                $(this.getMainContainer()).on("mousedown", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _self.toggleToUninput();
                    _self.flush();
                }).on("contextmenu", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _self.focusEnd();
                });
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.range.change": this.change,
                    "c.refresh": this.change,
                    "c.range.disabled": this.rangeFailed,
                    "s.formula.model.close": this.online,
                    "s.formula.blur": this.disable,
                    "s.toinput": this.tryToInputModel
                });
            },
            initService: function() {
                this.registerService({
                    "s.input.lock": this.lockInput,
                    "s.input.unlock": this.unlockInput,
                    "s.input.focus": this.focusEnd,
                    "s.input.open": this.openInput,
                    "s.input.close": this.closeInput,
                    "s.input.sync": this.syncInput
                });
            },
            onmousedown: function(row, col) {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                this.flush();
                this.toggleToUninput();
                this.rs("c.range.focus", viewStart.row + row, viewStart.col + col);
            },
            lock: function() {
                this.lockState = true;
            },
            unlock: function() {
                this.lockState = false;
            },
            isLock: function() {
                return this.lockState;
            },
            isFormulaModel: function() {
                return this.inputNode.innerText.indexOf("=") === 0;
            },
            lockInput: function() {
                this.inputLockState = true;
            },
            unlockInput: function() {
                this.inputLockState = false;
            },
            change: function() {
                if (!this.workState) {
                    return;
                }
                var range = this.rs("c.range");
                if (!range.isValid()) {
                    return;
                }
                var focus = range.getFocus();
                var row = focus.row;
                var col = focus.col;
                if (this.active) {
                    this.showLabel(row, col);
                    return;
                }
                var mergeCell = this.rs("c.get.merge.cell", row, col);
                if (mergeCell) {
                    this.updateInput(mergeCell.start, mergeCell.end);
                } else {
                    this.updateInput({
                        row: row,
                        col: col
                    }, {
                        row: row,
                        col: col
                    });
                }
            },
            updateInput: function(start, end) {
                this.hideLabel();
                var struct = this.rs("c.struct");
                this.toggleToUninput();
                this.reset();
                this.index.row = start.row;
                this.index.col = start.col;
                var style = struct.getAllComputedStyle(start.row, start.col);
                this.resetStyle(style);
                this.relocation(start.row, start.col);
                var rect = this.cs("c.cell.viewrect", struct, start, end);
                if (!rect) {
                    this.hide();
                    return;
                }
                this.resetShadowWrapper(struct.getBorderWidth(), rect);
                this.resize(struct.getBorderWidth(), rect.width, rect.height);
                this.enable();
                this.focus();
            },
            ondblclick: function() {
                var struct = this.rs("c.struct");
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var value = struct.getStandardValue(focus.row, focus.col);
                if (!value) {
                    value = "";
                }
                this.dblclick(value);
            },
            dblclick: function(value, isChanged) {
                if (value && value.indexOf("=") === 0) {
                    this.exitInput();
                    this.offline();
                    this.postMessage("s.formula.model.open");
                    return;
                }
                this.quick = false;
                this.toggleToInput();
                if (value !== null) {
                    this.inputNode.innerHTML = this.cs("c.decode.content", value);
                    this.inputResize();
                    this.textHelper.focus();
                    this.contentchanged = isChanged;
                }
            },
            openInput: function(value) {
                this.quick = false;
                this.toggleToInput(false);
                if (value !== null) {
                    this.inputNode.innerHTML = value;
                    this.inputResize();
                    this.contentchanged = true;
                }
            },
            closeInput: function() {
                this.toggleToUninput();
                this.flush();
            },
            syncInput: function(content) {
                this.inputNode.innerHTML = content || "";
                this.inputResize();
                this.contentchanged = true;
            },
            toggleToInput: function(autoFocus) {
                if (this.active) {
                    return;
                }
                var commands = this.checkFocusInvisible();
                if (commands) {
                    this.lock();
                    this.execCommand(commands);
                    this.unlock();
                }
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var style = struct.getComputedStyle("fonts", focus.row, focus.col);
                this.relocation(focus.row, focus.col);
                this.active = true;
                this.$inputWrapper.addClass("btb-input-active");
                this.inputWrapper.style.backgroundColor = style.backgroundColor;
                if (autoFocus !== false) {
                    this.focus();
                }
                this.postMessage("s.input.statechange", true);
            },
            toggleToUninput: function() {
                if (!this.active) {
                    return;
                }
                this.active = false;
                this.quick = true;
                this.$inputWrapper.removeClass("btb-input-active");
                this.inputWrapper.style.backgroundColor = "";
                this.postMessage("s.input.statechange", false);
            },
            isActive: function() {
                return this.active;
            },
            checkFocusInvisible: function() {
                var range = this.rs("c.range");
                var focus = range.getFocus();
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var commands = [];
                // 如果输入框不在视野内， 请求执行滚动
                if (focus.row < viewStart.row) {
                    commands.push({
                        command: "scrollrowto",
                        args: [ focus.row ]
                    });
                } else if (focus.row >= viewEnd.row) {
                    commands.push({
                        command: "scrollrowto",
                        args: [ focus.row, true ]
                    });
                }
                if (focus.col < viewStart.col) {
                    commands.push({
                        command: "scrollcolumnto",
                        args: [ focus.col ]
                    });
                } else if (focus.col >= viewEnd.col) {
                    commands.push({
                        command: "scrollcolumnto",
                        args: [ focus.col, true ]
                    });
                }
                return commands.length ? commands : null;
            },
            showLabel: function(row, col) {
                if (this.labelState) {
                    return;
                }
                this.labelState = true;
                this.$label.text(this.cs("c.title.index2char", col) + "" + (row + 1)).show();
            },
            hideLabel: function() {
                if (!this.labelState) {
                    return;
                }
                this.labelState = false;
                this.$label.hide();
            },
            resetStyle: function(style) {
                var cssText = this.__styleToCss(style);
                this.style = style;
                this.inputNode.style.cssText = cssText;
                this.shadowMan.resetStyle(cssText);
            },
            offline: function() {
                this.workState = false;
            },
            online: function() {
                this.inputNode.innerHTML = "";
                this.workState = true;
            },
            reset: function() {
                this.active = false;
                this.quick = true;
                this.contentchanged = false;
                this.writable = false;
                this.index = {};
                this.inputSize = {
                    width: 0,
                    height: 0
                };
                this.style = null;
            },
            flush: function() {
                if (!this.contentchanged) {
                    this.clear();
                    return;
                }
                var content = this.getContent();
                var index = this.index;
                this.clear();
                this.contentchanged = false;
                this.execCommand("write", content, index.row, index.col);
            },
            getContent: function() {
                return this.inputNode.innerHTML;
            },
            clear: function() {
                this.inputNode.innerHTML = "";
            },
            /**
         * 非编辑状态下的输入框定位
         * @param row
         * @param col
         */
            relocation: function(row, col) {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var grid = struct.getGrid();
                var offset = struct.getOffset();
                this.$inputWrapper.css({
                    top: grid.row[row - viewStart.row] - offset,
                    left: grid.col[col - viewStart.col] - offset
                });
            },
            /**
         * 该方法专用于编辑状态下的输入框定位
         */
            updateLocation: function(index) {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var offset = struct.getOffset();
                this.$inputWrapper.css({
                    left: grid.col[index] - offset
                });
            },
            resize: function(borderWidth, width, height) {
                var diff = 2 * (BOX_BORDER_WIDTH - borderWidth);
                // 记录输入框所占用空间大小
                this.inputSize.width = width;
                this.inputSize.height = height;
                this.$inputWrapper.css({
                    width: width - diff,
                    height: height - diff
                });
                this.$inputNode.css({
                    width: width - diff - PADDING * 2,
                    height: height - diff - PADDING * 2
                });
            },
            inesert: function(html) {
                this.textHelper.insert(html);
                this.$inputNode.trigger("input");
            },
            resetShadowWrapper: function(borderWidth, rect) {
                this.$shadowWrapper.css({
                    display: "block",
                    top: rect.y - borderWidth,
                    left: rect.x - borderWidth,
                    width: rect.width - 2 * (BOX_BORDER_WIDTH - borderWidth),
                    height: rect.height - 2 * (BOX_BORDER_WIDTH - borderWidth)
                });
            },
            exitInput: function() {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var grid = struct.getGrid();
                var range = this.rs("c.range");
                var focus = range.getFocus();
                this.toggleToUninput();
                this.clear();
                this.resize(struct.getBorderWidth(), grid.width[focus.col - viewStart.col], grid.height[focus.row - viewStart.row]);
            },
            inputResize: function() {
                var content = this.getContent();
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var index = {
                    row: this.index.row - viewStart.row,
                    col: this.index.col - viewStart.col
                };
                var size = this.shadowMan.getSize(content, this.style.horizontal, this.inputSize, index);
                if (!size) {
                    return;
                }
                index = size.start;
                size = size.size;
                this.resize(this.borderWidth, size.width, size.height);
                this.updateLocation(index, size.width);
            },
            tryToInputModel: function(initContent) {
                if (!this.workState) {
                    return;
                }
                this.dblclick(initContent, !!initContent);
            },
            selectAll: function(evt) {
                if (!this.workState) {
                    return;
                }
                if (this.active) {
                    return;
                }
                evt.stopPropagation();
                evt.preventDefault();
                this.execCommand("selectall");
            },
            focus: function() {
                this.inputNode.focus();
            },
            focusEnd: function() {
                this.textHelper.focus();
            },
            enable: function() {
                this.$inputWrapper.show();
                this.writable = true;
            },
            disable: function() {
                this.rs("c.range.disable");
            },
            hide: function() {
                this.$inputWrapper.css({
                    top: -1e4,
                    left: -1e5
                });
                this.$shadowWrapper.hide();
            },
            rangeFailed: function() {
                this.$inputWrapper.hide();
                this.$shadowWrapper.hide();
                this.toggleToUninput();
                this.reset();
            },
            createWrapper: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-input-wrapper " + (this.writable ? "btb-input-writable" : "")
                    },
                    style: {
                        "border-width": BOX_BORDER_WIDTH + "px"
                    }
                });
            },
            createInput: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-input",
                        contenteditable: true,
                        spellcheck: false
                    },
                    style: {
                        borderWidth: BOX_BORDER_WIDTH + "px",
                        top: PADDING,
                        left: PADDING
                    }
                });
            },
            createLabel: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-input-label"
                    },
                    style: {
                        left: -BOX_BORDER_WIDTH
                    }
                });
            },
            __keyEnter: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.metaKey || evt.altKey) {
                    // 成功换行主动更新一下输入框大小
                    if (this.textHelper.newline()) {
                        this.inputResize();
                        this.contentchanged = true;
                    }
                    return;
                }
                if (!this.active) {
                    this.ondblclick();
                    return;
                }
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("movedown", 1);
                } else {
                    this.execCommand("moveup", 1);
                }
            },
            isNormalEditMode: function() {
                return this.active && !this.quick;
            },
            __keyDown: function(evt) {
                // 正常编辑模式，交由平台处理
                if (this.isNormalEditMode()) {
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("movedown", 1);
                } else {
                    this.execCommand("expanddown", 1);
                }
            },
            __keyUp: function(evt) {
                if (this.isNormalEditMode()) {
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("moveup", 1);
                } else {
                    this.execCommand("expandup", 1);
                }
            },
            __keyLeft: function(evt) {
                if (this.isNormalEditMode()) {
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("moveleft", 1);
                } else {
                    this.execCommand("expandleft", 1);
                }
            },
            __keyRight: function(evt) {
                if (this.isNormalEditMode()) {
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("moveright", 1);
                } else {
                    this.execCommand("expandright", 1);
                }
            },
            __keyTab: function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                this.toggleToUninput();
                this.flush();
                if (!evt.shiftKey) {
                    this.execCommand("moveright", 1);
                } else {
                    this.execCommand("moveleft", 1);
                }
            },
            __keyEsc: function(evt) {
                evt.preventDefault();
                if (!this.active) {
                    return;
                }
                evt.stopPropagation();
                this.exitInput();
            },
            __keyDelete: function(evt) {
                if (this.active) {
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                this.execCommand("clearcontent");
            },
            __styleToCss: function(style) {
                var cssText = [];
                cssText.push("color: " + style.color);
                cssText.push("background-color: " + style.fill);
                cssText.push("text-align: " + style.horizontal);
                cssText.push("font-family: " + style.name + "," + CANDIDATE_FONT);
                cssText.push("font-size: " + style.size + "px");
                cssText.push("vertical-align: " + style.vertical);
                if (style.bold) {
                    cssText.push("font-weight: bold");
                }
                if (style.italic) {
                    cssText.push("font-style: italic");
                }
                if (style.underline) {
                    cssText.push("text-decoration: underline");
                }
                if (style.throughline) {
                    cssText.push("text-decoration: line-through");
                }
                return cssText.join(";");
            }
        });
        Input.deps = [ "cover" ];
        return Input;
    }
};

//src/system/input/text-helper.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[154] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("TextHelper", {
            inputNode: null,
            doc: null,
            tmpNode: null,
            placeholder: null,
            base: _p.r(94),
            init: function() {
                this.doc = this.getDocument();
                var tmpNode = this.createElement("div");
                tmpNode.innerHTML = "&#xFEFF;";
                this.tmpNode = tmpNode;
                this.placeholder = tmpNode.firstChild;
            },
            bind: function(inputNode) {
                this.inputNode = inputNode;
            },
            newline: function() {
                var selection = this.doc.getSelection();
                if (selection.rangeCount === 0) {
                    return false;
                }
                var range = selection.getRangeAt(0);
                range = range.cloneRange();
                var splitNode = this.createElement("br");
                var placeholderNode = this.placeholder.cloneNode(false);
                range.surroundContents(splitNode);
                $(placeholderNode).insertAfter(splitNode);
                range.selectNode(placeholderNode);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
            },
            focus: function() {
                var selection = this.doc.getSelection();
                var range = selection.getRangeAt(0);
                range = range.cloneRange();
                range.setEnd(this.inputNode, this.inputNode.childNodes.length);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            },
            insert: function(html) {
                var selection = this.doc.getSelection();
                if (selection.rangeCount === 0) {
                    return false;
                }
                this.tmpNode.innerHTML = html;
                var fragment = this.getDocument().createDocumentFragment();
                var range = selection.getRangeAt(0);
                var childs = this.tmpNode.childNodes;
                range = range.cloneRange();
                range.deleteContents();
                while (childs.length) {
                    fragment.appendChild(childs[0]);
                }
                range.insertNode(fragment);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    }
};

//src/system/position.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[155] = {
    value: function(require) {
        return _p.r(0).create("Position", {
            reference: null,
            base: _p.r(94),
            init: function() {
                this.reference = this.getContentContainer();
            },
            toIndex: function(x, y) {
                var location = this.getLocation();
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var count = struct.getVisibleCount();
                var colPoint = grid.col;
                var rowPoint = grid.row;
                var index = {
                    row: -1,
                    col: -1
                };
                var finded = false;
                x -= location.left;
                y -= location.top;
                for (var i = 1, len = count.row; i <= len; i++) {
                    if (y < rowPoint[i]) {
                        index.row = i - 1;
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    index.row = count.row - 1;
                }
                finded = false;
                for (var i = 1, len = count.col; i <= len; i++) {
                    if (x < colPoint[i]) {
                        index.col = i - 1;
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    index.col = count.col - 1;
                }
                return index;
            },
            getLocation: function() {
                return this.reference.getBoundingClientRect();
            }
        });
    }
};

//src/system/resize/resize.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[156] = {
    value: function(require) {
        var $ = _p.r(2);
        // 单元格最小size
        var MIN_SPACE = 5;
        var BUTTON_SIZE = 5;
        // TODO 所有按钮的位置更新可以做延迟优化
        return _p.r(0).create("Resize", {
            base: _p.r(94),
            wrapper: null,
            templateColumnNode: null,
            templateRowNode: null,
            colBtns: [],
            rowBtns: [],
            rowState: false,
            columnState: false,
            init: function() {
                this.wrapper = this.createElement("div", "btb-resize-wrap");
                this.initTemplateNode();
                this.initEvent();
                this.initMessageHook();
            },
            run: function() {
                this.getMainContainer().appendChild(this.wrapper);
            },
            initTemplateNode: function() {
                var headConfig = this.getConfig("head");
                var borderWidth = this.rs("c.struct").getBorderWidth();
                this.templateColumnNode = this.createElement("div", {
                    attr: {
                        "class": "btb-resize-btn btb-resize-column-btn"
                    },
                    style: {
                        height: headConfig.height + borderWidth
                    },
                    inner: '<div class="btb-resize-line btb-resize-column-line"></div>'
                });
                this.templateRowNode = this.createElement("div", {
                    attr: {
                        "class": "btb-resize-btn btb-resize-row-btn"
                    },
                    style: {
                        width: headConfig.width + borderWidth
                    },
                    inner: '<div class="btb-resize-line btb-resize-row-line"></div>'
                });
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.refresh": this.reset
                });
            },
            initEvent: function() {
                var _self = this;
                $(this.wrapper).delegate(".btb-resize-column-btn", "mousedown", function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    _self.startResizeColumn(this, evt.clientX, evt.clientY);
                }).delegate(".btb-resize-row-btn", "mousedown", function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    _self.startResizeRow(this, evt.clientX, evt.clientY);
                });
                $(this.getTopContainer()).on("mouseenter", function() {
                    _self.updateColResizeBtn();
                });
                $(this.getLeftContainer()).on("mouseenter", function() {
                    _self.updateRowResizeBtn();
                });
            },
            reset: function() {
                this.columnState = false;
                this.rowState = false;
            },
            startResizeColumn: function(btnNode, x, y) {
                var _self = this;
                var $btnNode = $(btnNode);
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var viewStart = struct.getViewStart();
                var colPoints = grid.col;
                var offset = struct.getOffset();
                var borderWidth = struct.getBorderWidth();
                var index = +btnNode.getAttribute("data-index");
                var max = struct.getSpace().width - BUTTON_SIZE - borderWidth;
                var min = colPoints[index] + offset + MIN_SPACE - 3;
                var headOffset = this.getConfig("head").width;
                var original = colPoints[index + 1] - offset - 2;
                // 最终单元格的位置
                var left;
                $btnNode.addClass("btb-resizing");
                $(this.getDocument()).on("mousemove.resize", function(evt) {
                    var distance = evt.clientX - x;
                    left = original + distance;
                    left = Math.min(left, max);
                    left = Math.max(left, min);
                    $btnNode.css("left", headOffset + left);
                }).one("mouseup.resize", function() {
                    $btnNode.removeClass("btb-resizing");
                    $(this).off("mousemove.resize");
                    _self.execCommand("resizecol", Math.abs(left - (colPoints[index] - offset - 2)), index + viewStart.col);
                });
            },
            startResizeRow: function(btnNode, x, y) {
                var _self = this;
                var $btnNode = $(btnNode);
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var viewStart = struct.getViewStart();
                var rowPoints = grid.row;
                var offset = struct.getOffset();
                var borderWidth = struct.getBorderWidth();
                var index = +btnNode.getAttribute("data-index");
                var max = struct.getSpace().height - BUTTON_SIZE - borderWidth;
                var min = rowPoints[index] + offset + MIN_SPACE - 3;
                var headOffset = this.getConfig("head").height;
                var original = rowPoints[index + 1] - offset - 2;
                // 最终单元格的位置
                var top;
                $btnNode.addClass("btb-resizing");
                $(this.getDocument()).on("mousemove.resize", function(evt) {
                    var distance = evt.clientY - y;
                    top = original + distance;
                    top = Math.min(top, max);
                    top = Math.max(top, min);
                    $btnNode.css("top", headOffset + top);
                }).one("mouseup.resize", function() {
                    $btnNode.removeClass("btb-resizing");
                    $(this).off("mousemove.resize");
                    _self.execCommand("resizerow", Math.abs(top - (rowPoints[index] - offset - 2)), index + viewStart.row);
                });
            },
            updateColResizeBtn: function() {
                if (this.columnState) {
                    return;
                }
                this.columnState = true;
                var headConfig = this.getConfig("head");
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var visibleCount = struct.getVisibleCount();
                var offset = struct.getOffset();
                var colPoints = grid.col;
                var btns = this.getColBtns(visibleCount.col);
                for (var i = 1, len = visibleCount.col; i < len; i++) {
                    btns[i - 1].style.left = headConfig.width + colPoints[i] - 2 - offset + "px";
                }
            },
            getColBtns: function(count) {
                var btns = this.colBtns;
                var wrapper = this.wrapper;
                if (btns.length < count) {
                    for (var i = 0, len = count - btns.length; i < len; i++) {
                        btns.push(this.templateColumnNode.cloneNode(true));
                        btns[i].setAttribute("data-index", i);
                        wrapper.appendChild(btns[i]);
                    }
                } else {
                    for (var i = count, len = btns.length; i < len; i++) {
                        btns[i].style.display = "none";
                    }
                }
                return btns;
            },
            updateRowResizeBtn: function() {
                if (this.rowState) {
                    return;
                }
                this.rowState = true;
                var headConfig = this.getConfig("head");
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var visibleCount = struct.getVisibleCount();
                var offset = struct.getOffset();
                var rowPoints = grid.row;
                var btns = this.getRowBtns(visibleCount.row);
                for (var i = 1, len = visibleCount.row; i < len; i++) {
                    btns[i - 1].style.top = headConfig.height + rowPoints[i] - 2 - offset + "px";
                }
            },
            getRowBtns: function(count) {
                var btns = this.rowBtns;
                var wrapper = this.wrapper;
                if (btns.length < count) {
                    for (var i = 0, len = count - btns.length; i < len; i++) {
                        btns.push(this.templateRowNode.cloneNode(true));
                        btns[i].setAttribute("data-index", i);
                        wrapper.appendChild(btns[i]);
                    }
                } else {
                    for (var i = count, len = btns.length; i < len; i++) {
                        btns[i].style.display = "none";
                    }
                }
                return btns;
            }
        });
    }
};

//src/system/row-column.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[157] = {
    value: function(require) {
        var $ = _p.r(2);
        var RowColumnSelector = _p.r(0).create("RowColumnSelector", {
            position: null,
            base: _p.r(94),
            init: function(position) {
                this.position = position;
                var _self = this;
                $(this.getTopContainer()).on("click", function(e) {
                    _self.selectColumn(e.clientX);
                });
                $(this.getLeftContainer()).on("click", function(e) {
                    _self.selectRow(e.clientY);
                });
            },
            selectColumn: function(x) {
                var index = this.position.toIndex(x, 0);
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                this.execCommand("selectcolumn", index.col + viewStart.col);
            },
            selectRow: function(y) {
                var index = this.position.toIndex(0, y);
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                this.execCommand("selectrow", index.row + viewStart.row);
            }
        });
        RowColumnSelector.deps = [ "position" ];
        return RowColumnSelector;
    }
};

//src/system/screen/body/body-screen.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[158] = {
    value: function(require) {
        var Canvas = _p.r(168);
        var CellGrid = _p.r(159);
        var Painter = _p.r(163);
        return _p.r(0).create("BodyScreen", {
            panel: null,
            width: 0,
            height: 0,
            canvas: null,
            visiableCanvas: null,
            base: _p.r(91),
            init: function() {
                this.panel = this.createElement("div", "btb-body-screen");
                this.canvas = new Canvas(this.getDocument(), this.width, this.height);
                this.visiableCanvas = new Canvas(this.getDocument(), this.width, this.height);
                this.contentCanvas = new Canvas(this.getDocument(), this.width, this.height);
                this.painter = new Painter(this.getDocument(), this.width, this.height);
            },
            appendTo: function(contianer) {
                contianer.appendChild(this.panel);
            },
            resize: function(width, height) {
                this.width = width;
                this.height = height;
                this.canvas.resize(width, height, this.getConfig("ZOOM"));
                this.visiableCanvas.resize(width, height, this.getConfig("ZOOM"));
                this.contentCanvas.resize(width, height, this.getConfig("ZOOM"));
            },
            clear: function() {
                this.canvas.clear();
                this.visiableCanvas.clear();
                this.contentCanvas.clear();
            },
            render: function() {
                var struct = this.rs("c.struct");
                //var cellGrid = CellGrid.generate(struct);
                this.painter.draw(this.canvas, this.contentCanvas, struct);
                this.__toggle();
            },
            __toggle: function() {
                this.visiableCanvas.remove();
                this.canvas.appendTo(this.panel);
                var tmp = this.visiableCanvas;
                this.visiableCanvas = this.canvas;
                this.canvas = tmp;
            }
        });
    }
};

//src/system/screen/body/cell-grid.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[159] = {
    value: function() {
        return {
            generate: function(struct) {
                var cells = getCells(struct);
                var contents = getContents(struct, cells);
                return {
                    layout: getLayout(struct, cells, contents),
                    cells: cells
                };
            }
        };
        function getCells(struct) {
            var viewStart = struct.getViewStart();
            var viewEnd = struct.getViewEnd();
            var mergeCell;
            var mergeMap = {};
            var cells = [];
            var index;
            var currentRow = [];
            for (var i = viewStart.row, limit = viewEnd.row; i <= limit; i++) {
                currentRow = [];
                cells.push(currentRow);
                for (var j = viewStart.col, jlimit = viewEnd.col; j <= jlimit; j++) {
                    mergeCell = struct.getMergeCell(i, j);
                    if (mergeCell) {
                        index = mergeCell.start.row + "," + mergeCell.start.col;
                        if (mergeMap[index]) {
                            currentRow.push({
                                type: "cellunit"
                            });
                            continue;
                        }
                        mergeMap[index] = true;
                        currentRow.push({
                            type: "mergecell",
                            row: i,
                            col: j,
                            mergeCell: mergeCell,
                            userStyle: struct.getUserStyle(mergeCell.start.row, mergeCell.start.col)
                        });
                    } else {
                        currentRow.push({
                            type: "cell",
                            row: i,
                            col: j,
                            userStyle: struct.getUserStyle(i, j)
                        });
                    }
                }
            }
            return cells;
        }
        function getContents(struct, cells) {
            var contents = [];
            var rowCells;
            var cell;
            var rowContents;
            for (var i = 0, len = cells.length; i < len; i++) {
                rowCells = cells[i];
                rowContents = [];
                contents.push(rowContents);
                for (var j = 0, jlen = rowCells.length; j < jlen; j++) {
                    cell = rowCells[j];
                    if (cell.type === "cellunit") {
                        continue;
                    }
                    if (cell.userStyle.wraptext) {
                        if (cell.type === "mergecell") {
                            rowContents[j] = struct.getDisplayWrapText(cell.mergeCell.start.row, cell.mergeCell.start.col);
                        } else {
                            rowContents[j] = struct.getDisplayWrapText(cell.row, cell.col);
                        }
                    } else {
                        if (cell.type === "mergecell") {
                            rowContents[j] = struct.getDisplayValue(cell.mergeCell.start.row, cell.mergeCell.start.col, false);
                        } else {
                            rowContents[j] = struct.getDisplayValue(cell.row, cell.col, false);
                        }
                    }
                }
            }
            return contents;
        }
        function getLayout(struct, cells, contents) {
            var layout = [];
            var rowCells;
            var rowContents;
            var cell;
            var count;
            var content;
            var rowLayout;
            var prevCell;
            var style;
            for (var i = 0, len = cells.length; i < len; i++) {
                rowCells = cells[i];
                rowContents = contents[i];
                count = 0;
                rowLayout = [];
                layout[i] = rowLayout;
                prevCell = null;
                for (var j = 0, jlen = rowCells.length; j < jlen; j++) {
                    cell = rowCells[j];
                    content = rowContents[j];
                    if (cell.type === "cell") {
                        if (!content) {
                            count++;
                        } else {
                            if (prevCell && prevCell.type === "cell") {
                                prevCell.right = count;
                            }
                            style = struct.getComputedStyle(cell.row, cell.col);
                            prevCell = {
                                type: "cell",
                                wraptext: !!style.wraptext,
                                left: count,
                                row: cell.row,
                                col: cell.col,
                                content: content,
                                style: style
                            };
                            count = 0;
                            rowLayout.push(prevCell);
                        }
                    } else {
                        if (prevCell && prevCell.type === "cell") {
                            prevCell.right = count;
                            prevCell = null;
                        }
                        count = 0;
                        if (cell.type === "cellunit") {
                            continue;
                        } else {
                            // 合并后的单元格，没有内容也需要获取其格式
                            rowLayout.push({
                                type: "mergecell",
                                row: cell.row,
                                col: cell.col,
                                mergeCell: cell.mergeCell,
                                content: content,
                                style: struct.getComputedStyle(cell.mergeCell.start.row, cell.mergeCell.start.col)
                            });
                        }
                    }
                    if (prevCell && prevCell.type === "cell") {
                        prevCell.right = count;
                    }
                }
            }
            return layout;
        }
    }
};

//src/system/screen/body/line-painters/border.js
/**
 * @file 边框绘制
 * @author hancong03@baiud.com
 */
_p[160] = {
    value: function(require) {
        var SYS_CONF = _p.r(12);
        var LINE_OFFSET = SYS_CONF.border.offset;
        var DEFAULT_FILL_COLOR = SYS_CONF.canvas.background;
        var BORDER_TYPE_SPACE = {
            thin: [ 0, 0 ],
            dashed: [ 5, 3 ],
            dotted: [ 1, 1 ]
        };
        var CACHE = {};
        var SYS_CONFIG = _p.r(12);
        var BORDER_OFFSET = SYS_CONFIG.border.offset;
        var BORDER_WIDTH = SYS_CONFIG.border.width;
        var DOUBLE_BORDER_WIDTH = 2 * BORDER_WIDTH;
        var NONE = _p.r(74);
        return {
            draw: function(canvas, contentCanvas, struct) {
                var borders = struct.getBorders(struct.getViewStart(), struct.getViewEnd());
                canvas.save();
                drawBorders(canvas, contentCanvas, struct, borders);
                canvas.restore();
                // clear cache
                CACHE = {};
            }
        };
        function drawBorders(canvas, contentCanvas, struct, borders) {
            var rowBorders;
            var current;
            for (var i = 0, len = borders.length; i < len; i++) {
                rowBorders = borders[i];
                for (var j = 0, jlen = rowBorders.length; j <= jlen; j++) {
                    current = rowBorders[j];
                    if (current === undefined) {
                        continue;
                    }
                    drawBorder(canvas, contentCanvas, struct, current, i, j);
                }
            }
        }
        function drawBorder(canvas, contentCanvas, struct, borderIndex, rowIndex, colIndex) {
            var borderOption = struct.getStyleById("borders", borderIndex).border;
            var boundary = struct.getBoundary();
            var grid = struct.getGrid();
            var imageData;
            var width = grid.width[colIndex] + DOUBLE_BORDER_WIDTH;
            var height = grid.height[rowIndex] + DOUBLE_BORDER_WIDTH;
            if (borderOption.top !== NONE) {
                imageData = getBorderImage(contentCanvas, borderIndex, borderOption, "top", width, boundary);
                canvas.putImageData(imageData, grid.col[colIndex] - BORDER_OFFSET, grid.row[rowIndex] - BORDER_OFFSET);
            }
            if (borderOption.right !== NONE) {
                imageData = getBorderImage(contentCanvas, borderIndex, borderOption, "right", height, boundary);
                canvas.putImageData(imageData, grid.col[colIndex + 1] - BORDER_OFFSET, grid.row[rowIndex] - BORDER_OFFSET);
            }
            if (borderOption.bottom !== NONE) {
                imageData = getBorderImage(contentCanvas, borderIndex, borderOption, "bottom", width, boundary);
                canvas.putImageData(imageData, grid.col[colIndex] - BORDER_OFFSET, grid.row[rowIndex + 1] - BORDER_OFFSET);
            }
            if (borderOption.left !== NONE) {
                imageData = getBorderImage(contentCanvas, borderIndex, borderOption, "left", height, boundary);
                canvas.putImageData(imageData, grid.col[colIndex] - BORDER_OFFSET, grid.row[rowIndex] - BORDER_OFFSET);
            }
        }
        // --------- 边框生成器
        function getBorderImage(canvas, index, borderStyle, type, size, boundary) {
            var imageData = CACHE[index];
            if (!imageData) {
                updateCache(canvas, index, borderStyle, boundary);
                imageData = CACHE[index];
            }
            var current;
            if (type === "left" || type === "right") {
                if (size === boundary.height) {
                    return imageData[type];
                }
                current = canvas.createImageData(1, size);
            } else {
                if (size === boundary.width) {
                    return imageData[type];
                }
                current = canvas.createImageData(size, 1);
            }
            current.data.set(imageData[type].data.subarray(0, size * 4));
            return current;
        }
        function updateCache(canvas, index, borderStyle, boundary) {
            CACHE[index] = {
                top: __drawHBorder(canvas, borderStyle.top, boundary.width),
                bottom: __drawHBorder(canvas, borderStyle.bottom, boundary.width),
                left: __drawVBorder(canvas, borderStyle.left, boundary.height),
                right: __drawVBorder(canvas, borderStyle.right, boundary.height)
            };
        }
        function __drawHBorder(canvas, borderStyle, w) {
            if (borderStyle === NONE) {
                return;
            }
            canvas.strokeStyle(borderStyle.color);
            canvas.beginPath();
            canvas.moveTo(0, .5);
            canvas.lineTo(w, .5);
            canvas.stroke();
            return canvas.getImageData(0, 0, w, 1);
        }
        function __drawVBorder(canvas, borderStyle, h) {
            if (borderStyle === NONE) {
                return;
            }
            canvas.strokeStyle(borderStyle.color);
            canvas.beginPath();
            canvas.moveTo(.5, 0);
            canvas.lineTo(.5, h);
            canvas.stroke();
            return canvas.getImageData(0, 0, 1, h);
        }
    }
};

//src/system/screen/body/line-painters/box.js
/**
 * @file 整个内容空间框线绘制
 * @author hancong03@baiud.com
 */
_p[161] = {
    value: function(require) {
        var BORDER_CONFIG = _p.r(12).border;
        return {
            draw: function(canvas, struct) {
                var offset = BORDER_CONFIG.offset;
                var boundary = struct.getBoundary();
                var space = struct.getSpace();
                canvas.save();
                canvas.strokeStyle(BORDER_CONFIG.color);
                canvas.lineWidth(BORDER_CONFIG.width);
                canvas.beginPath();
                // left
                canvas.moveTo(offset, 0);
                canvas.lineTo(offset, boundary.height);
                // top
                canvas.moveTo(0, offset);
                canvas.lineTo(boundary.width, offset);
                // bottom
                canvas.moveTo(0, space.height - offset);
                canvas.lineTo(space.width, space.height - offset);
                // right
                canvas.moveTo(space.width - offset, 0);
                canvas.lineTo(space.width - offset, space.height);
                canvas.stroke();
                canvas.restore();
            }
        };
    }
};

//src/system/screen/body/line-painters/grid.js
/**
 * @file 网格绘制
 * @author hancong03@baiud.com
 */
_p[162] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var CANVAS_FILL_COLOR = SYS_CONFIG.canvas.background;
        return {
            draw: function(canvas, struct) {
                canvas.save();
                canvas.globalCompositeOperation("destination-over");
                var grid = struct.getGrid();
                var colPoints = grid.col;
                var rowPoints = grid.row;
                var boundary = struct.getBoundary();
                canvas.lineWidth(1);
                canvas.strokeStyle(SYS_CONFIG.border.color);
                canvas.beginPath();
                for (var i = 0, len = colPoints.length; i < len; i++) {
                    canvas.moveTo(colPoints[i], 0);
                    canvas.lineTo(colPoints[i], boundary.height);
                }
                for (var i = 0, len = rowPoints.length; i < len; i++) {
                    canvas.moveTo(0, rowPoints[i]);
                    canvas.lineTo(boundary.width, rowPoints[i]);
                }
                canvas.stroke();
                canvas.fillStyle(CANVAS_FILL_COLOR);
                canvas.fillRect(0, 0, boundary.width, boundary.height);
                canvas.restore();
            }
        };
    }
};

//src/system/screen/body/painter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[163] = {
    value: function(require) {
        var Canvas = _p.r(168);
        var ContentFillPainter = _p.r(165);
        var ContentPainter = _p.r(166);
        var MergeFillPainter = _p.r(167);
        var CellFillPainter = _p.r(164);
        var GridPainter = _p.r(162);
        var BorderPainter = _p.r(160);
        var BoxPainter = _p.r(161);
        return _p.r(0).create("Painter", {
            shadowCanvas: null,
            constructor: function(doc, width, height) {
                this.shadowCanvas = new Canvas(doc, width, height);
            },
            draw: function(canvas, contentCanvas, struct) {
                var contentLayout = ContentPainter.draw(contentCanvas, struct);
                ContentFillPainter.draw(canvas, struct, contentLayout);
                CellFillPainter.draw(canvas, struct);
                BorderPainter.draw(canvas, contentCanvas, struct);
                GridPainter.draw(canvas, struct);
                MergeFillPainter.draw(canvas, struct);
                canvas.drawImage(contentCanvas.getImage(), 0, 0);
                BoxPainter.draw(canvas, struct);
            }
        });
    }
};

//src/system/screen/body/painters/cell-fill.js
/**
 * @file¬
 * @author hancong03@baiud.com
 */
_p[164] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var BORDER_OFFSET = SYS_CONFIG.border.offset;
        var BORDER_WIDTH = SYS_CONFIG.border.width;
        var DOUBLE_BORDER_WIDTH = 2 * BORDER_WIDTH;
        var LINE_WIDTH = SYS_CONFIG.border.width;
        var CommonCellService = _p.r(6);
        var NONE = _p.r(74);
        return {
            draw: function(canvas, struct) {
                canvas.save();
                fillMergeCell(canvas, struct);
                var fillLayout = getFillLayout(struct);
                var rowLayout;
                for (var i = 0, len = fillLayout.length; i < len; i++) {
                    rowLayout = fillLayout[i];
                    for (var j = 0, jlen = rowLayout.length; j < jlen; j++) {
                        fillCell(canvas, struct, rowLayout[j]);
                    }
                }
                canvas.restore();
            }
        };
        function fillMergeCell(canvas, struct) {
            var mergeInfo = getMergeCellInfo(struct);
            var currentInfo;
            for (var i = 0, len = mergeInfo.length; i < len; i++) {
                currentInfo = mergeInfo[i];
                canvas.fillStyle(currentInfo.fillColor);
                canvas.fillRect(currentInfo.x, currentInfo.y, currentInfo.w, currentInfo.h);
            }
        }
        function getMergeCellInfo(struct) {
            var viewStart = struct.getViewStart();
            var viewEnd = struct.getViewEnd();
            var startRow = viewStart.row;
            var startCol = viewStart.col;
            var endRow = viewEnd.row;
            var endCol = viewEnd.col;
            var result = [];
            var colIndex;
            var mergeInfo;
            var mergeRecord = {};
            var mergeKey;
            var fillStyle;
            var mergeStart;
            var mergeEnd;
            for (var i = startRow; i <= endRow; i++) {
                colIndex = 0;
                for (var j = startCol; j <= endCol; j++) {
                    mergeInfo = struct.getMergeCell(i, j);
                    if (!mergeInfo) {
                        continue;
                    }
                    mergeStart = mergeInfo.start;
                    mergeEnd = mergeInfo.end;
                    mergeKey = mergeStart.row + "," + mergeStart.col;
                    if (mergeRecord[mergeKey]) {
                        continue;
                    }
                    mergeRecord[mergeKey] = true;
                    var startCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeStart.row, mergeStart.col);
                    var endCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeEnd.row + 1, mergeEnd.col + 1);
                    fillStyle = struct.getComputedStyle("fills", mergeStart.row, mergeStart.col);
                    if (!fillStyle || fillStyle.fill === NONE) {
                        continue;
                    } else {
                        result.push({
                            x: startCoordinate.x - BORDER_OFFSET,
                            y: startCoordinate.y - BORDER_OFFSET,
                            w: endCoordinate.x - startCoordinate.x + LINE_WIDTH,
                            h: endCoordinate.y - startCoordinate.y + LINE_WIDTH,
                            fillColor: fillStyle.fill
                        });
                    }
                }
            }
            return result;
        }
        function fillCell(canvas, struct, current) {
            var fillColor = struct.getStyleById("fills", current.fillId).fill;
            if (fillColor === NONE) {
                return;
            }
            canvas.fillStyle(fillColor);
            canvas.fillRect(current.x, current.y, current.w, current.h);
        }
        function getFillLayout(struct) {
            var viewStart = struct.getViewStart();
            var viewEnd = struct.getViewEnd();
            var startRow = viewStart.row;
            var startCol = viewStart.col;
            var endRow = viewEnd.row;
            var endCol = viewEnd.col;
            var grid = struct.getGrid();
            var rows = grid.row;
            var cols = grid.col;
            var widthList = grid.width;
            var heightList = grid.height;
            var fills = [];
            var rowFills;
            var nextIndex;
            var currentIndex;
            var prevInfo;
            var rowIndex = 0;
            var colIndex;
            var fillIds = struct.getStyleIds("fills", viewStart, viewEnd);
            for (var i = startRow; i <= endRow; i++, rowIndex++) {
                rowFills = [];
                nextIndex = -1;
                colIndex = 0;
                for (var j = startCol; j <= endCol; j++, colIndex++) {
                    currentIndex = fillIds[rowIndex][colIndex];
                    if (!currentIndex) {
                        nextIndex = -1;
                        continue;
                    }
                    if (nextIndex === currentIndex) {
                        prevInfo = rowFills[rowFills.length - 1];
                        prevInfo.w += widthList[colIndex] + BORDER_WIDTH;
                    } else {
                        rowFills.push({
                            x: cols[colIndex] - BORDER_OFFSET,
                            y: rows[rowIndex] - BORDER_OFFSET,
                            w: widthList[colIndex] + DOUBLE_BORDER_WIDTH,
                            h: heightList[rowIndex] + DOUBLE_BORDER_WIDTH,
                            fillId: currentIndex
                        });
                    }
                    nextIndex = currentIndex;
                }
                fills.push(rowFills);
            }
            return fills;
        }
    }
};

//src/system/screen/body/painters/content-fill.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[165] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var BORDER_OFFSET = SYS_CONFIG.border.offset;
        var CANVAS_COLOR = SYS_CONFIG.canvas.background;
        return {
            draw: function(canvas, struct, contentLayout) {
                var grid = struct.getGrid();
                var rowPoints = grid.row;
                var heights = grid.height;
                var rowLayout;
                var layout;
                var x;
                var y;
                var w;
                var h;
                var leftOverflow;
                var rightOverflow;
                var startX;
                var endX;
                canvas.save();
                canvas.fillStyle(CANVAS_COLOR);
                for (var i = 0, len = contentLayout.length; i < len; i++) {
                    rowLayout = contentLayout[i];
                    for (var j = 0, jlen = rowLayout.length; j < jlen; j++) {
                        layout = rowLayout[j];
                        if (!layout) {
                            continue;
                        }
                        leftOverflow = layout.leftOverflow;
                        rightOverflow = layout.rightOverflow;
                        if (!leftOverflow && !rightOverflow) {
                            continue;
                        }
                        if (leftOverflow) {
                            startX = leftOverflow[leftOverflow.length - 1] - BORDER_OFFSET;
                        } else {
                            startX = rightOverflow[0] - BORDER_OFFSET;
                        }
                        if (rightOverflow) {
                            endX = rightOverflow[rightOverflow.length - 1] + BORDER_OFFSET;
                        } else {
                            endX = leftOverflow[0] + BORDER_OFFSET;
                        }
                        x = startX;
                        y = rowPoints[i] + BORDER_OFFSET;
                        w = endX - startX;
                        h = heights[i];
                        canvas.fillRect(x, y, w, h);
                    }
                }
                canvas.restore();
            }
        };
    }
};

//src/system/screen/body/painters/content.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[166] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var LINE_OFFSET = SYS_CONFIG.border.offset;
        var LINE_WIDTH = SYS_CONFIG.border.width;
        var CONTENT_PADDING = SYS_CONFIG.CONTENT_PADDING;
        var DOUBLE_CONTENT_PADDING = 2 * CONTENT_PADDING;
        var LINE_HEIHGT = SYS_CONFIG.LINE_HEIGHT;
        var CommonCellService = _p.r(6);
        return {
            draw: function(canvas, struct) {
                var cellInfo = getCellInfo(struct);
                var layout = getLayout(canvas, struct, cellInfo);
                var layoutGroup;
                var currentLayout;
                var fontStyle;
                for (var key in layout) {
                    if (!layout.hasOwnProperty(key)) {
                        continue;
                    }
                    layoutGroup = layout[key];
                    fontStyle = layoutGroup[0].font;
                    canvas.fillStyle(fontStyle.color);
                    canvas.strokeStyle(fontStyle.color);
                    canvas.setFontStyle(fontStyle);
                    for (var i = 0, len = layoutGroup.length; i < len; i++) {
                        currentLayout = layoutGroup[i];
                        canvas.save();
                        canvas.beginPath();
                        canvas.rect(currentLayout.regionX, currentLayout.regionY, currentLayout.regionWidth, currentLayout.regionHeight);
                        canvas.clip();
                        drawContent(canvas, currentLayout);
                        canvas.restore();
                    }
                }
                // cellInfo ===  contentLayout
                return cellInfo;
            }
        };
        function drawContent(canvas, layout) {
            var contents = layout.content.split("\n");
            var fontStyle = layout.font;
            var fontSize = fontStyle.size;
            var lineHeight = LINE_HEIHGT;
            var height = Math.floor(lineHeight * fontSize);
            canvas.textBaseline("bottom");
            canvas.textAlign(layout.alignment.horizontal);
            var contentHeight = height * contents.length;
            var y = getYPoint(layout.alignment.vertical, layout.regionHeight, contentHeight);
            var contentWidth;
            var hasUnderline = fontStyle.underline;
            var hasThroughline = fontStyle.throughline;
            //y = 0;
            y += layout.regionY;
            for (var i = 0, len = contents.length; i < len; i++) {
                y += height;
                canvas.fillText(contents[i], layout.textX, y);
                if (hasUnderline || hasThroughline) {
                    contentWidth = Math.ceil(canvas.measureText(contents[i]).width);
                    if (fontStyle.underline) {
                        drawTextDecoration(canvas, contentWidth, layout.textX, y, layout.alignment.horizontal, 0);
                    }
                    if (hasThroughline) {
                        drawTextDecoration(canvas, contentWidth, layout.textX, y, layout.alignment.horizontal, -height / 2);
                    }
                }
            }
        }
        function drawTextDecoration(shadowCanvas, width, x, y, textAlign, offset) {
            x = Math.floor(x);
            y = Math.floor(y + offset) - LINE_OFFSET;
            shadowCanvas.beginPath();
            switch (textAlign) {
              case "left":
                shadowCanvas.moveTo(x, y);
                shadowCanvas.lineTo(x + width, y);
                break;

              case "right":
                shadowCanvas.moveTo(x, y);
                shadowCanvas.lineTo(x - width, y);
                break;

              case "center":
                width = Math.ceil(width / 2);
                shadowCanvas.moveTo(x - width, y);
                shadowCanvas.lineTo(x + width, y);
                break;
            }
            shadowCanvas.stroke();
        }
        function getYPoint(verticalType, regionHeight, contentHeight) {
            switch (verticalType) {
              case "top":
                return 0;

              case "middle":
                return (regionHeight - contentHeight) / 2;

              case "bottom":
                return regionHeight - contentHeight;
            }
        }
        function getCellInfo(struct) {
            var viewStart = struct.getViewStart();
            var viewEnd = struct.getViewEnd();
            var startRow = viewStart.row;
            var startCol = viewStart.col;
            var endRow = viewEnd.row;
            var endCol = viewEnd.col;
            var infoList = [];
            var rowInfo;
            var rowIndex = 0;
            var colIndex;
            var text;
            var mergeInfo;
            var mergeRecord = {};
            var mergeKey;
            var row;
            var col;
            for (var i = startRow; i <= endRow; i++, rowIndex++) {
                rowInfo = [];
                colIndex = 0;
                for (var j = startCol; j <= endCol; j++, colIndex++) {
                    mergeInfo = struct.getMergeCell(i, j);
                    row = i;
                    col = j;
                    if (mergeInfo) {
                        row = mergeInfo.start.row;
                        col = mergeInfo.start.col;
                        mergeKey = row + "," + col;
                        if (!mergeRecord[mergeKey]) {
                            mergeRecord[mergeKey] = true;
                        } else {
                            continue;
                        }
                    }
                    text = struct.getDisplayValue(row, col);
                    if (text) {
                        rowInfo[colIndex] = {
                            content: text,
                            font: struct.getComputedStyle("fonts", row, col),
                            alignment: struct.getComputedStyle("alignments", row, col),
                            mergeInfo: mergeInfo,
                            row: rowIndex,
                            col: colIndex
                        };
                    }
                }
                infoList.push(rowInfo);
            }
            return infoList;
        }
        function getLayout(canvas, struct, infoList) {
            var rowInfo;
            var currentInfo;
            var rowLayout;
            var fontStyleKey;
            var sameFontInfo = {};
            for (var i = 0, len = infoList.length; i < len; i++) {
                rowInfo = infoList[i];
                rowLayout = [];
                for (var j = 0, jlen = rowInfo.length; j < jlen; j++) {
                    currentInfo = rowInfo[j];
                    if (!currentInfo) {
                        continue;
                    }
                    fontStyleKey = JSON.stringify(currentInfo.font);
                    if (!sameFontInfo[fontStyleKey]) {
                        sameFontInfo[fontStyleKey] = [ currentInfo ];
                    } else {
                        sameFontInfo[fontStyleKey].push(currentInfo);
                    }
                }
            }
            // get content width
            for (var key in sameFontInfo) {
                if (!sameFontInfo.hasOwnProperty(key)) {
                    continue;
                }
                calculateContentWidth(canvas, sameFontInfo[key]);
            }
            // to layout
            intoToLayout(struct, infoList);
            return sameFontInfo;
        }
        function calculateContentWidth(canvas, infoList) {
            var contents;
            var fontStyle = infoList[0].font;
            var widths;
            canvas.setFontStyle(fontStyle);
            for (var i = 0, len = infoList.length; i < len; i++) {
                widths = [];
                contents = infoList[i].content.split("\n");
                for (var j = 0, jlen = contents.length; j < jlen; j++) {
                    widths[j] = canvas.measureText(contents[j]).width;
                }
                infoList[i].contentWidth = Math.max.apply(null, widths);
            }
        }
        // 增加布局信息
        function intoToLayout(struct, infoList) {
            var rowInfo;
            var info;
            for (var i = 0, len = infoList.length; i < len; i++) {
                rowInfo = infoList[i];
                for (var j = 0, jlen = rowInfo.length; j < jlen; j++) {
                    info = rowInfo[j];
                    if (!info) {
                        continue;
                    }
                    if (!info.mergeInfo) {
                        calculateContentLayout(struct, rowInfo, j);
                    } else {
                        calculateMergeCellContentLayout(struct, info);
                    }
                }
            }
            return infoList;
        }
        function calculateContentLayout(struct, rowInfo, cellIndex) {
            var currentInfo = rowInfo[cellIndex];
            switch (currentInfo.alignment.horizontal) {
              case "left":
                calculateLeftAlignOverflow(struct, rowInfo, cellIndex);
                break;

              case "right":
                calculateRightAlignOverflow(struct, rowInfo, cellIndex);
                break;

              case "center":
                calculateCenterAlignOverflow(struct, rowInfo, cellIndex);
                break;
            }
        }
        /**
     * 计算合并单元格的layout信息
     */
        function calculateMergeCellContentLayout(struct, currentInfo) {
            var mergeStart = currentInfo.mergeInfo.start;
            var mergeEnd = currentInfo.mergeInfo.end;
            var startCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeStart.row, mergeStart.col);
            var endCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeEnd.row + 1, mergeEnd.col + 1);
            currentInfo.leftOverflow = null;
            currentInfo.rightOverflow = null;
            currentInfo.regionX = startCoordinate.x + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionY = startCoordinate.y + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionWidth = endCoordinate.x - startCoordinate.x - LINE_WIDTH - DOUBLE_CONTENT_PADDING;
            currentInfo.regionHeight = endCoordinate.y - startCoordinate.y - LINE_WIDTH - DOUBLE_CONTENT_PADDING;
            switch (currentInfo.alignment.horizontal) {
              case "left":
                currentInfo.textX = currentInfo.regionX;
                break;

              case "right":
                currentInfo.textX = currentInfo.regionX + currentInfo.regionWidth;
                break;

              case "center":
                currentInfo.textX = currentInfo.regionX + currentInfo.regionWidth / 2;
                break;
            }
        }
        function calculateLeftAlignOverflow(struct, rowInfo, cellIndex) {
            var grid = struct.getGrid();
            var colWidths = grid.width;
            var colPoints = grid.col;
            var currentInfo = rowInfo[cellIndex];
            var width = colWidths[cellIndex];
            var contentWidth = currentInfo.contentWidth + DOUBLE_CONTENT_PADDING;
            var rightOverflow = [];
            // 从下一个单元格开始
            for (var i = cellIndex + 1, len = colWidths.length; i < len; i++) {
                // 下一个单元格存在内容， 则结束
                if (rowInfo[i]) {
                    break;
                }
                // 宽度足够存放内容，则结束
                if (width >= contentWidth) {
                    break;
                }
                // 否则，记录下一个单元格的起始位置
                rightOverflow.push(colPoints[i]);
                // 同时，更新宽度
                width += colWidths[i] + LINE_WIDTH;
            }
            currentInfo.textX = colPoints[cellIndex] + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionX = colPoints[cellIndex] + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionY = grid.row[currentInfo.row] + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionWidth = width - DOUBLE_CONTENT_PADDING;
            currentInfo.regionHeight = grid.height[currentInfo.row] - DOUBLE_CONTENT_PADDING;
            currentInfo.leftOverflow = null;
            currentInfo.rightOverflow = rightOverflow.length ? rightOverflow : null;
        }
        function calculateCenterAlignOverflow(struct, rowInfo, cellIndex) {
            var grid = struct.getGrid();
            var colWidths = grid.width;
            var colPoints = grid.col;
            var currentInfo = rowInfo[cellIndex];
            var width = colWidths[cellIndex];
            var contentWidth = (width + currentInfo.contentWidth) / 2 + CONTENT_PADDING;
            currentInfo.regionWidth = 0;
            // 右溢出计算
            var rightOverflow = [];
            for (var i = cellIndex + 1, len = colPoints.length; i < len; i++) {
                // 下一个单元格存在内容， 则结束
                if (rowInfo[i]) {
                    break;
                }
                // 宽度足够存放内容，则结束
                if (width >= contentWidth) {
                    break;
                }
                // 否则，记录下一个单元格的起始位置
                rightOverflow.push(colPoints[i]);
                width += colWidths[i] + LINE_WIDTH;
            }
            currentInfo.rightOverflow = rightOverflow.length ? rightOverflow : null;
            currentInfo.regionWidth += width;
            // 左溢出计算
            width = colWidths[cellIndex];
            var leftOverflow = [];
            for (var i = cellIndex - 1; i >= 0; i--) {
                // 下一个单元格存在内容， 则结束
                if (rowInfo[i]) {
                    break;
                }
                // 宽度足够存放内容，则结束
                if (width >= contentWidth) {
                    break;
                }
                // 否则，记录当前单元格的起始位置
                leftOverflow.push(colPoints[i + 1]);
                width += colWidths[i] + LINE_WIDTH;
            }
            currentInfo.leftOverflow = leftOverflow.length ? leftOverflow : null;
            currentInfo.textX = colPoints[cellIndex] + LINE_OFFSET + colWidths[cellIndex] / 2;
            currentInfo.regionWidth += width - colWidths[cellIndex] - DOUBLE_CONTENT_PADDING;
            currentInfo.regionHeight = grid.height[currentInfo.row] - DOUBLE_CONTENT_PADDING;
            currentInfo.regionX = colPoints[cellIndex - leftOverflow.length] + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionY = grid.row[currentInfo.row] + LINE_OFFSET + CONTENT_PADDING;
        }
        function calculateRightAlignOverflow(struct, rowInfo, cellIndex) {
            var grid = struct.getGrid();
            var colWidths = grid.width;
            var colPoints = grid.col;
            var currentInfo = rowInfo[cellIndex];
            var width = colWidths[cellIndex];
            var contentWidth = rowInfo.contentWidth + DOUBLE_CONTENT_PADDING;
            var leftOverflow = [];
            // 相对位置向左计算
            // 从下一个单元格开始
            for (var i = cellIndex - 1; i >= 0; i--) {
                // 下一个单元格存在内容， 则结束
                if (rowInfo[i]) {
                    break;
                }
                // 宽度足够存放内容，则结束
                if (width >= contentWidth) {
                    break;
                }
                // 否则，记录当前单元格的起始位置
                leftOverflow.push(colPoints[i + 1]);
                width += colWidths[i] + LINE_WIDTH;
            }
            currentInfo.textX = colPoints[cellIndex + 1] - LINE_OFFSET - CONTENT_PADDING;
            currentInfo.regionWidth = width - DOUBLE_CONTENT_PADDING;
            currentInfo.regionHeight = grid.height[currentInfo.row] - DOUBLE_CONTENT_PADDING;
            currentInfo.regionX = colPoints[cellIndex - leftOverflow.length] - LINE_OFFSET + CONTENT_PADDING;
            currentInfo.regionY = grid.row[currentInfo.row] + LINE_OFFSET + CONTENT_PADDING;
            currentInfo.leftOverflow = leftOverflow.length ? leftOverflow : null;
            currentInfo.rightOverflow = null;
        }
    }
};

//src/system/screen/body/painters/merge-fill-painter.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[167] = {
    value: function(require) {
        var SYS_CONFIG = _p.r(12);
        var BORDER_OFFSET = SYS_CONFIG.border.offset;
        var CANVAS_COLOR = SYS_CONFIG.canvas.background;
        var LINE_WIDTH = SYS_CONFIG.border.width;
        var CommonCellService = _p.r(6);
        var NONE = _p.r(74);
        return {
            draw: function(canvas, struct) {
                var mergeInfo = getMergeCellInfo(struct);
                var currentInfo;
                for (var i = 0, len = mergeInfo.length; i < len; i++) {
                    currentInfo = mergeInfo[i];
                    canvas.fillStyle(currentInfo.fillColor);
                    canvas.fillRect(currentInfo.x, currentInfo.y, currentInfo.w, currentInfo.h);
                }
            }
        };
        function getMergeCellInfo(struct) {
            var viewStart = struct.getViewStart();
            var viewEnd = struct.getViewEnd();
            var startRow = viewStart.row;
            var startCol = viewStart.col;
            var endRow = viewEnd.row;
            var endCol = viewEnd.col;
            var result = [];
            var colIndex;
            var mergeInfo;
            var mergeRecord = {};
            var mergeKey;
            var fillStyle;
            var mergeStart;
            var mergeEnd;
            var fillColor;
            for (var i = startRow; i <= endRow; i++) {
                colIndex = 0;
                for (var j = startCol; j <= endCol; j++) {
                    mergeInfo = struct.getMergeCell(i, j);
                    if (!mergeInfo) {
                        continue;
                    }
                    mergeStart = mergeInfo.start;
                    mergeEnd = mergeInfo.end;
                    mergeKey = mergeStart.row + "," + mergeStart.col;
                    if (mergeRecord[mergeKey]) {
                        continue;
                    }
                    mergeRecord[mergeKey] = true;
                    var startCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeStart.row, mergeStart.col);
                    var endCoordinate = CommonCellService.getGlobalCoordinate(struct, mergeEnd.row + 1, mergeEnd.col + 1);
                    fillStyle = struct.getComputedStyle("fills", mergeStart.row, mergeStart.col);
                    if (!fillStyle || fillStyle.fill === NONE) {
                        fillColor = CANVAS_COLOR;
                    } else {
                        fillColor = fillStyle.fill;
                    }
                    result.push({
                        x: startCoordinate.x + BORDER_OFFSET,
                        y: startCoordinate.y + BORDER_OFFSET,
                        w: endCoordinate.x - startCoordinate.x - LINE_WIDTH,
                        h: endCoordinate.y - startCoordinate.y - LINE_WIDTH,
                        fillColor: fillColor
                    });
                }
            }
            return result;
        }
    }
};

//src/system/screen/canvas.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[168] = {
    value: function(require) {
        var CANDIDATE_FONT = _p.r(12).CANDIDATE_FONT;
        return _p.r(0).create("Canvas", {
            width: 0,
            height: 0,
            node: null,
            context: null,
            zoom: 1,
            constructor: function(doc, width, height) {
                this.node = doc.createElement("canvas");
                this.context = this.node.getContext("2d");
                this.resize(width, height);
                this.clear();
            },
            getNode: function() {
                return this.node;
            },
            appendTo: function(container) {
                container.appendChild(this.node);
            },
            remove: function() {
                var parentNode = this.node.parentNode;
                if (parentNode) {
                    this.node.parentNode.removeChild(this.node);
                }
            },
            resize: function(width, height, zoom) {
                this.width = width;
                this.height = height;
                if (zoom == undefined) {
                    zoom = this.zoom;
                } else {
                    this.zoom = zoom;
                }
                this.node.width = Math.ceil(width * zoom);
                this.node.height = Math.ceil(height * zoom);
                this.node.style.width = width + "px";
                this.node.style.height = height + "px";
                this.context.scale(zoom, zoom);
            },
            clear: function() {
                this.resize(this.width, this.height);
            },
            clearRect: function(x, y, width, height) {
                this.context.clearRect(x, y, width, height);
            },
            font: function(val) {
                return this.__set("font", val);
            },
            setFontStyle: function(style) {
                this.context.font = [ style.italic ? "italic" : "normal", style.bold ? "bold" : "normal", style.size + "px", style.name + "," + CANDIDATE_FONT ].join(" ");
            },
            setLineDash: function(args) {
                this.context.setLineDash(args);
            },
            textAlign: function(val) {
                return this.__set("textAlign", val);
            },
            textBaseline: function(val) {
                return this.__set("textBaseline", val);
            },
            fillStyle: function(val) {
                return this.__set("fillStyle", val);
            },
            strokeStyle: function(val) {
                return this.__set("strokeStyle", val);
            },
            lineWidth: function(val) {
                return this.__set("lineWidth", val);
            },
            createImageData: function(w, h) {
                return this.context.createImageData(w, h);
            },
            putImageData: function(image, x, y) {
                this.context.putImageData(image, x, y);
            },
            getImageData: function(x, y, w, h) {
                return this.context.getImageData(x, y, w, h);
            },
            dumpImageData: function() {
                return this.context.getImageData(0, 0, this.width, this.height);
            },
            drawImage: function(image, x, y) {
                return this.context.drawImage.apply(this.context, arguments);
            },
            globalCompositeOperation: function(val) {
                this.context.globalCompositeOperation = val;
            },
            translate: function(x, y) {
                this.context.translate(x, y);
            },
            getImage: function() {
                return this.node;
            },
            fillRect: function(x, y, w, h) {
                x = x || 0;
                y = y || 0;
                w = w || this.width;
                h = h || this.height;
                this.context.fillRect(x, y, w, h);
                return this;
            },
            strokeRect: function(x, y, w, h) {
                x = x || 0;
                y = y || 0;
                w = w || this.width;
                h = h || this.height;
                this.context.strokeRect(x, y, w, h);
                return this;
            },
            rect: function(x, y, w, h) {
                this.context.rect(x, y, w, h);
                return this;
            },
            clip: function() {
                this.context.clip();
                return this;
            },
            beginPath: function() {
                this.context.beginPath();
                return this;
            },
            closePath: function() {
                this.context.closePath();
                return this;
            },
            moveTo: function(x, y) {
                this.context.moveTo(x, y);
                return this;
            },
            lineTo: function(x, y) {
                this.context.lineTo(x, y);
                return this;
            },
            stroke: function() {
                this.context.stroke();
                return this;
            },
            fill: function() {
                this.context.fill();
                return this;
            },
            save: function() {
                this.context.save();
                return this;
            },
            restore: function() {
                this.context.restore();
                return this;
            },
            fillText: function(text, x, y, maxWidth) {
                if (maxWidth === undefined) {
                    this.context.fillText(text, x, y);
                } else {
                    this.context.fillText(text, x, y, maxWidth);
                }
                return this;
            },
            strokeText: function() {
                this.context.strokeText();
                return this;
            },
            measureText: function(content) {
                return this.context.measureText(content);
            },
            __set: function(name, val) {
                if (val === undefined) {
                    return this.context[name];
                }
                this.context[name] = val;
                return this;
            }
        });
    }
};

//src/system/screen/left-screen.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[169] = {
    value: function(require) {
        var Canvas = _p.r(168);
        return _p.r(0).create("LeftScreen", {
            width: 0,
            height: 0,
            canvas: null,
            base: _p.r(91),
            init: function() {
                this.canvas = new Canvas(this.getDocument(), this.width, this.height);
                this.onMessage({
                    "c.range.change": this.rerender,
                    "c.refresh": this.rerender,
                    "c.range.disabled": this.rerender
                });
                this.registerService({
                    "s.left.selection.patch": this.drawSelectionPatch
                });
            },
            appendTo: function(contianer) {
                contianer.appendChild(this.canvas.getNode());
            },
            resize: function(width, height) {
                this.width = width;
                this.height = height;
                this.canvas.resize(width, height, this.getConfig("ZOOM"));
                this.canvas.font(this.getConfig("head").font);
            },
            rerender: function() {
                this.clear();
                this.render();
            },
            clear: function() {
                this.canvas.clear();
            },
            render: function() {
                this.drawStableSelection();
                this.drawGrid();
            },
            drawSelectionPatch: function(start, end) {
                this.clear();
                this.drawSelection($._clone(start), $._clone(end));
                this.drawGrid();
            },
            drawStableSelection: function() {
                var range = this.rs("c.range");
                if (!range.isValid()) {
                    return;
                }
                var selection = range.getAllSelection()[0];
                this.drawSelection(selection.start, selection.end);
            },
            drawSelection: function(start, end) {
                var struct = this.rs("c.struct");
                var headConfig = this.getConfig("head");
                var viewStart = struct.getViewStart();
                var canvas = this.canvas;
                start.col = viewStart.col;
                end.col = viewStart.col;
                var rect = this.cs("c.cell.viewrect", struct, start, end);
                if (!rect) {
                    return;
                }
                canvas.fillStyle(headConfig.focusColor);
                canvas.fillRect(0, rect.y, headConfig.width, rect.height);
            },
            drawGrid: function() {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var viewStart = struct.getViewStart();
                var config = this.getConfig();
                var count = struct.getVisibleCount();
                var offset = struct.getOffset();
                var rowPoints = grid.row;
                var colPoints = grid.col;
                var canvas = this.canvas;
                var width = this.width;
                var height = this.height;
                var borderWidth = struct.getBorderWidth();
                var point = null;
                var headWidth = config.head.width;
                var rowStart = viewStart.row;
                canvas.strokeStyle(config.border.color);
                canvas.lineWidth(borderWidth);
                canvas.textAlign("center");
                canvas.textBaseline("middle");
                canvas.fillStyle(config.head.color);
                canvas.beginPath();
                canvas.strokeRect(-borderWidth, colPoints[0], width + 3 * borderWidth, height - borderWidth);
                for (var i = 0, index = viewStart.row, len = count.row; i < len; i++, index++) {
                    point = rowPoints[i + 1];
                    canvas.moveTo(0, point);
                    canvas.lineTo(width, point);
                    canvas.fillText(rowStart + i + 1, headWidth / 2, point - offset - grid.height[index - rowStart] / 2 + 1);
                }
                canvas.closePath();
                canvas.stroke();
            }
        });
    }
};

//src/system/screen/screen.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[170] = {
    value: function(require) {
        var BodyScreen = _p.r(158);
        var TopScreen = _p.r(171);
        var LeftScreen = _p.r(169);
        return _p.r(0).create("Screen", {
            bodyScreen: null,
            gridScreen: null,
            panel: null,
            base: _p.r(94),
            init: function() {
                this.bodyScreen = this.createComponent(BodyScreen);
                this.topScreen = this.createComponent(TopScreen);
                this.leftScreen = this.createComponent(LeftScreen);
                this.resize();
                this.onMessage("c.refresh", this.render);
                this.onMessage("c.container.resize", this.resize);
            },
            run: function() {
                this.bodyScreen.appendTo(this.getContentContainer());
                this.topScreen.appendTo(this.getTopContainer());
                this.leftScreen.appendTo(this.getLeftContainer());
            },
            render: function() {
                this.bodyScreen.clear();
                this.bodyScreen.render();
                this.topScreen.clear();
                this.topScreen.render();
                this.leftScreen.clear();
                this.leftScreen.render();
            },
            resize: function() {
                this.__resize(this.getContentSize(), this.getTopSize(), this.getLeftSize());
            },
            __resize: function(contentSize, topSize, leftSize) {
                this.bodyScreen.resize(contentSize.width, contentSize.height);
                this.topScreen.resize(topSize.width, topSize.height);
                this.leftScreen.resize(leftSize.width, leftSize.height);
            }
        });
    }
};

//src/system/screen/top-screen.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[171] = {
    value: function(require) {
        var Canvas = _p.r(168);
        return _p.r(0).create("TopScreen", {
            width: 0,
            height: 0,
            canvas: null,
            base: _p.r(91),
            init: function() {
                this.canvas = new Canvas(this.getDocument(), this.width, this.height);
                this.onMessage({
                    "c.range.change": this.rerender,
                    "c.refresh": this.rerender,
                    "c.range.disabled": this.rerender
                });
                this.registerService({
                    "s.top.selection.patch": this.drawSelectionPatch
                });
            },
            appendTo: function(contianer) {
                contianer.appendChild(this.canvas.getNode());
            },
            resize: function(width, height) {
                this.width = width;
                this.height = height;
                this.canvas.resize(width, height, this.getConfig("ZOOM"));
                this.canvas.font(this.getConfig("head").font);
            },
            rerender: function() {
                this.clear();
                this.render();
            },
            clear: function() {
                this.canvas.clear();
            },
            render: function() {
                this.drawStableSelection();
                this.drawGrid();
            },
            drawSelectionPatch: function(start, end) {
                this.clear();
                this.drawSelection($._clone(start), $._clone(end));
                this.drawGrid();
            },
            drawStableSelection: function() {
                var range = this.rs("c.range");
                if (!range.isValid()) {
                    return;
                }
                var selection = range.getAllSelection()[0];
                this.drawSelection(selection.start, selection.end);
            },
            drawSelection: function(start, end) {
                var struct = this.rs("c.struct");
                var headConfig = this.getConfig("head");
                var viewStart = struct.getViewStart();
                var canvas = this.canvas;
                start.row = viewStart.row;
                end.row = viewStart.row;
                var rect = this.cs("c.cell.viewrect", struct, start, end);
                if (!rect) {
                    return;
                }
                canvas.fillStyle(headConfig.focusColor);
                canvas.fillRect(rect.x, 0, rect.width, headConfig.height);
            },
            drawGrid: function() {
                var struct = this.rs("c.struct");
                var grid = struct.getGrid();
                var viewStart = struct.getViewStart();
                var count = struct.getVisibleCount();
                var offset = struct.getOffset();
                var config = this.getConfig();
                var colPoints = grid.col;
                var canvas = this.canvas;
                var width = this.width;
                var height = this.height;
                var borderWidth = struct.getBorderWidth();
                var point = null;
                var headHeight = config.head.height;
                var colStart = struct.getViewStart().col;
                canvas.strokeStyle(config.border.color);
                canvas.lineWidth(borderWidth);
                canvas.textAlign("center");
                canvas.textBaseline("middle");
                canvas.fillStyle(config.head.color);
                canvas.beginPath();
                canvas.strokeRect(colPoints[0], -borderWidth, width - borderWidth, height + 3 * borderWidth);
                for (var i = 0, index = viewStart.col, len = count.col; i < len; i++, index++) {
                    point = colPoints[i + 1];
                    canvas.moveTo(point, 0);
                    canvas.lineTo(point, height);
                    canvas.fillText(this.cs("c.title.index2char", colStart + i), point - offset - grid.width[i] / 2, headHeight / 2);
                }
                canvas.closePath();
                canvas.stroke();
            }
        });
    }
};

//src/system/scrollbar/scroll-event-manager.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[172] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("ScrollEventManager", {
            base: _p.r(91),
            x: 0,
            y: 0,
            lastTimeStamp: 0,
            init: function() {
                this.initEvent();
            },
            initEvent: function() {
                var _self = this;
                $(this.getMainContainer()).on("mousewheel DOMMouseScroll", function(e) {
                    _self.update(e);
                });
            },
            update: function(evt) {
                evt.preventDefault();
                var e = evt.originalEvent;
                this.x = e.deltaX;
                this.y = e.deltaY;
                if (e.timeStamp - this.lastTimeStamp < 20) {
                    return;
                }
                var yDirection = this.y >= 0 ? 1 : -1;
                var xDirection = this.x >= 0 ? 1 : -1;
                this.rs("c.row.scroll", yDirection * Math.ceil(Math.abs(this.y) / 10));
                this.rs("c.col.scroll", xDirection * Math.ceil(Math.abs(this.x) / 10));
                this.x = 0;
                this.y = 0;
                this.lastTimeStamp = e.timeStamp;
            }
        });
    }
};

//src/system/scrollbar/scrollbar.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[173] = {
    value: function(require) {
        var $ = _p.r(2);
        var BAR_MIN_LENGTH = 50;
        var ScrollEventManager = _p.r(172);
        return _p.r(0).create("Scrollbar", {
            hSlider: null,
            vSlider: null,
            hSlidway: null,
            vSlidway: null,
            endIndex: null,
            // 滑道长度
            hWayLength: 0,
            vWayLength: 0,
            // 滑道单位长度
            hUnitLength: 0,
            vUnitLength: 0,
            hBarSize: 0,
            vBarSize: 0,
            hOffset: 0,
            hold: false,
            vOffset: 0,
            base: _p.r(94),
            init: function() {
                var size = this.getScrollSize();
                this.hWayLength = size.h.width - 2;
                this.vWayLength = size.v.height - 2;
                this.createHorizontalBar(size.h);
                this.createVerticalBar(size.v);
                if (this.getConfig("enableScroll")) {
                    this.createComponent(ScrollEventManager);
                }
                this.initMessageHook();
            },
            run: function() {
                var container = this.getScrollContainer();
                container.h.appendChild(this.hSlidway);
                container.v.appendChild(this.vSlidway);
                this.initEvent();
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.refresh": this.update
                });
            },
            update: function() {
                if (this.isLock()) {
                    return;
                }
                this.refresh();
            },
            /**
         * 刷新滚动条的各项数据
         */
            refresh: function() {
                var struct = this.rs("c.struct");
                var total = struct.getTotal();
                var visibleCount = struct.getVisibleCount();
                var viewStart = struct.getViewStart();
                this.endIndex = total;
                this.vBarSize = Math.max(Math.floor(this.vWayLength * (visibleCount.row - 1) / total.row), BAR_MIN_LENGTH);
                this.hBarSize = Math.max(Math.floor(this.hWayLength * (visibleCount.col - 1) / total.col), BAR_MIN_LENGTH);
                this.hSlider.style.width = this.hBarSize + "px";
                this.vSlider.style.height = this.vBarSize + "px";
                // 减去首尾两端的单元格
                this.hUnitLength = (this.hWayLength - this.hBarSize) / (total.col - visibleCount.col);
                this.vUnitLength = (this.vWayLength - this.vBarSize) / (total.row - visibleCount.row);
                this.hOffset = Math.floor(viewStart.col * this.hUnitLength);
                this.vOffset = Math.floor(viewStart.row * this.vUnitLength);
                this.hSlider.style.left = this.hOffset + "px";
                this.vSlider.style.top = this.vOffset + "px";
            },
            initEvent: function() {
                var _self = this;
                $(this.hSlider).on("mousedown", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    _self.lock();
                    _self.hMoveStart(evt);
                });
                $(this.vSlider).on("mousedown", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    _self.lock();
                    _self.vMoveStart(evt);
                });
            },
            hMoveStart: function(evt) {
                var x = evt.clientX;
                var distance = 0;
                var _self = this;
                var maxLength = _self.hWayLength - this.hBarSize;
                var $sliderWay = $(this.hSlidway);
                $sliderWay.addClass("btb-active");
                $(this.getDocument()).on("mousemove.scroll", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    distance = evt.clientX - x + _self.hOffset;
                    if (distance > maxLength) {
                        distance = maxLength;
                    } else if (distance < 0) {
                        distance = 0;
                    }
                    _self.hSlider.style.left = distance + "px";
                    var count = 0;
                    if (distance === 0) {
                        count = 0;
                    } else if (distance === maxLength) {
                        count = _self.endIndex.col;
                    } else {
                        count = Math.floor(distance / _self.hUnitLength);
                    }
                    _self.rs("c.col.scrollto", count);
                }).one("mouseup", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $sliderWay.removeClass("btb-active");
                    $(this).off("mousemove.scroll");
                    _self.hOffset = distance;
                    _self.unlock();
                });
            },
            lock: function() {
                this.hold = true;
            },
            unlock: function() {
                this.hold = false;
            },
            isLock: function() {
                return this.hold;
            },
            vMoveStart: function(evt) {
                var y = evt.clientY;
                var distance = 0;
                var _self = this;
                var maxLength = _self.vWayLength - this.vBarSize;
                var $sliderWay = $(this.vSlidway);
                $sliderWay.addClass("btb-active");
                $(this.getDocument()).on("mousemove.scroll", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    distance = evt.clientY - y + _self.vOffset;
                    if (distance > maxLength) {
                        distance = maxLength;
                    } else if (distance < 0) {
                        distance = 0;
                    }
                    _self.vSlider.style.top = distance + "px";
                    var count = 0;
                    if (distance === 0) {
                        count = 0;
                    } else if (distance === maxLength) {
                        count = _self.endIndex.row;
                    } else {
                        count = Math.floor(distance / _self.vUnitLength);
                    }
                    _self.rs("c.row.scrollto", count);
                }).one("mouseup", function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $sliderWay.removeClass("btb-active");
                    $(this).off("mousemove.scroll");
                    _self.vOffset = distance;
                    _self.unlock();
                });
            },
            createHorizontalBar: function(size) {
                var width = size.width;
                var height = size.height;
                this.hSlidway = this.createElement("div", {
                    attr: {
                        "class": "btb-slidway"
                    },
                    style: {
                        width: width - 2,
                        height: height - 2,
                        top: 1,
                        left: 1
                    }
                });
                this.hSlider = this.createElement("div", {
                    attr: {
                        "class": "btb-slider"
                    },
                    style: {
                        width: BAR_MIN_LENGTH,
                        height: "100%",
                        left: this.hOffset
                    }
                });
                this.hSlidway.appendChild(this.hSlider);
            },
            createVerticalBar: function(size) {
                var width = size.width;
                var height = size.height;
                this.vSlidway = this.createElement("div", {
                    attr: {
                        "class": "btb-slidway"
                    },
                    style: {
                        width: width - 2,
                        height: height - 2,
                        top: 1,
                        left: 1
                    }
                });
                this.vSlider = this.createElement("div", {
                    attr: {
                        "class": "btb-slider"
                    },
                    style: {
                        width: "100%",
                        height: BAR_MIN_LENGTH,
                        top: this.vOffset
                    }
                });
                this.vSlidway.appendChild(this.vSlider);
            }
        });
    }
};

//src/system/selectall.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[174] = {
    value: function(require) {
        return _p.r(0).create("Position", {
            panel: null,
            base: _p.r(94),
            init: function() {
                this.panel = this.createElement("div", "btb-selectall-panel");
                this.panel.appendChild(this.createElement("div", "btb-selectall-btn"));
                var topSize = this.getTopSize();
                var leftSize = this.getLeftSize();
                this.panel.style.cssText = "width: " + leftSize.width + "px; height: " + topSize.height + "px;";
                this.initEvent();
            },
            initEvent: function() {
                var _self = this;
                $(this.panel).on("mousedown", function(e) {
                    e.preventDefault();
                    _self.execCommand("focus", 0, 0);
                    _self.execCommand("selectall");
                });
            },
            run: function() {
                this.getMainContainer().appendChild(this.panel);
            }
        });
    }
};

//src/system/selection/selection.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[175] = {
    value: function(require) {
        var $ = _p.r(2);
        var Selection = _p.r(0).create("Selection", {
            cover: null,
            position: null,
            selectionNode: null,
            $selectionNode: null,
            $borderNode: null,
            selectionControl: null,
            state: {},
            workState: true,
            base: _p.r(94),
            init: function(cover, position) {
                this.cover = cover;
                this.position = position;
                this.resetState();
                this.selectionNode = this.createSelectionNode();
                this.$selectionNode = $(this.selectionNode);
                this.$borderNode = $(this.selectionNode).find(".btb-selection-border");
                this.selectionControl = this.createSelectionControl();
                this.initEvent();
                this.initMessageHook();
            },
            run: function() {
                this.selectionNode.appendChild(this.selectionControl);
                this.getContentContainer().appendChild(this.selectionNode);
            },
            initEvent: function() {
                this.cover.onmousedown(this, this.onmousedown);
                this.cover.onmousemove(this, this.onmousemove);
                this.cover.onmouseup(this, this.listenEnd);
            },
            initMessageHook: function() {
                this.onMessage({
                    "c.range.change": this.refreshSelection,
                    "c.refresh": this.refreshSelection,
                    "c.range.disabled": this.disable,
                    "s.input.statechange": this.toggleController,
                    "s.formula.model.open": this.offline,
                    "s.formula.model.close": this.online
                });
            },
            refreshSelection: function() {
                if (!this.workState) {
                    return;
                }
                if (this.state.hold) {
                    return;
                }
                var range = this.rs("c.range");
                if (!range.isValid()) {
                    this.disable();
                    return;
                }
                var viewRect = this.cs("c.cell.viewrect", this.rs("c.struct"), range.getStart(), range.getEnd());
                if (!viewRect) {
                    this.disable();
                    return;
                }
                this.$selectionNode.addClass("btb-selection btb-selection-stable");
                if (range.isMultiple()) {
                    this.$selectionNode.addClass("btb-multi-selection");
                } else {
                    this.$selectionNode.removeClass("btb-multi-selection");
                }
                this.$selectionNode.css({
                    width: viewRect.width,
                    height: viewRect.height,
                    top: viewRect.y,
                    left: viewRect.x
                });
                this.$borderNode[0].style.cssText = "";
                // 'undefined' 表示 给定一个无效值
                this.$borderNode.css({
                    borderLeftColor: viewRect.overflow.left ? "transparent" : "undefined",
                    borderRightColor: viewRect.overflow.right ? "transparent" : "undefined",
                    borderBottomColor: viewRect.overflow.bottom ? "transparent" : "undefined",
                    borderTopColor: viewRect.overflow.top ? "transparent" : "undefined"
                });
                this.enable();
            },
            offline: function() {
                this.workState = false;
                this.disable();
            },
            online: function() {
                this.workState = true;
            },
            toggleController: function(state) {
                if (state) {
                    this.$selectionNode.addClass("btb-no-control");
                } else {
                    this.$selectionNode.removeClass("btb-no-control");
                }
            },
            resetState: function() {
                this.state = {
                    listen: false,
                    start: {
                        row: 0,
                        col: 0
                    },
                    end: {
                        row: 0,
                        col: 0
                    },
                    hold: false
                };
            },
            onmousedown: function(row, col) {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                this.resetState();
                this.state.listen = true;
                this.state.start = {
                    row: row + viewStart.row,
                    col: col + viewStart.col
                };
                this.state.end = {
                    row: row + viewStart.row,
                    col: col + viewStart.col
                };
                this.$selectionNode.removeClass("btb-selection-stable btb-multi-selection");
                this.listenStart();
            },
            toStable: function() {
                this.state.listen = false;
                this.$selectionNode.addClass("btb-selection-stable");
                this.rs("c.range.selection", this.state.start, this.state.end);
            },
            onmousemove: function(row, col) {
                if (!this.state.listen) {
                    return;
                }
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var end = this.state.end;
                row += viewStart.row;
                col += viewStart.col;
                if (end.row === row && end.col == col) {
                    return;
                }
                end.row = row;
                end.col = col;
                this.update();
            },
            listenStart: function() {
                var _self = this;
                var container = this.getContentContainer();
                var $container = $(container);
                var location = container.getBoundingClientRect();
                var struct = this.rs("c.struct");
                var mouseLocation = {
                    x: 0,
                    y: 0
                };
                $container.on("mouseleave.selection", function() {
                    _self.state.hold = true;
                    overflowUpdate();
                }).on("mouseenter.selection", function() {
                    _self.state.hold = false;
                });
                $(this.getDocument()).on("mousemove.selection", function(evt) {
                    mouseLocation.x = evt.clientX;
                    mouseLocation.y = evt.clientY;
                }).one("mouseup.selection", function() {
                    _self.listenEnd();
                });
                function overflowUpdate() {
                    setTimeout(function() {
                        if (!_self.state.hold) {
                            return;
                        }
                        var x = mouseLocation.x;
                        var y = mouseLocation.y;
                        switch (true) {
                          case y < location.top:
                            _self.execCommand("scrollrow", -1);
                            _self.refreshUnstableSelectionRow(-1);
                            break;

                          case y > location.bottom:
                            _self.execCommand("scrollrow", 1);
                            _self.refreshUnstableSelectionRow(1);
                            break;

                          case x > location.right:
                            _self.execCommand("scrollcolumn", 1);
                            _self.refreshUnstableSelectionCol(1);
                            break;

                          case x < location.left:
                            _self.execCommand("scrollcolumn", -1);
                            _self.refreshUnstableSelectionCol(-1);
                            break;
                        }
                        var index = _self.position.toIndex(x, y);
                        var viewStart = struct.getViewStart();
                        _self.state.end = {
                            row: index.row + viewStart.row,
                            col: index.col + viewStart.col
                        };
                        _self.update();
                        overflowUpdate();
                    }, 50);
                }
            },
            listenEnd: function() {
                this.state.hold = false;
                $(this.getContentContainer()).off("mouseleave.selection mouseenter.selection");
                $(this.getDocument()).off("mousemove.selection mouseup.selection");
                this.toStable();
            },
            refreshUnstableSelectionRow: function(count) {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var end;
                if (count > 0) {
                    end = {
                        row: viewEnd.row,
                        col: this.state.end.col
                    };
                } else {
                    end = {
                        row: viewStart.row,
                        col: this.state.end.col
                    };
                }
                this.state.end = end;
                var rect = this.cs("c.cell.viewrect", struct, this.state.start, end);
                this.$selectionNode.css({
                    width: rect.width,
                    height: rect.height,
                    top: rect.y,
                    left: rect.x
                });
            },
            refreshUnstableSelectionCol: function(count) {
                var struct = this.rs("c.struct");
                var viewStart = struct.getViewStart();
                var viewEnd = struct.getViewEnd();
                var end;
                if (count > 0) {
                    end = {
                        row: this.state.end.row,
                        col: viewEnd.col
                    };
                } else {
                    end = {
                        row: this.state.end.row,
                        col: viewStart.col
                    };
                }
                this.state.end = end;
                var rect = this.cs("c.cell.viewrect", struct, this.state.start, end);
                if (!rect) {
                    return;
                }
                this.$selectionNode.css({
                    width: rect.width,
                    height: rect.height,
                    top: rect.y,
                    left: rect.x
                });
            },
            enable: function() {
                this.$selectionNode.show();
            },
            disable: function() {
                this.disabled = true;
                this.$selectionNode.hide();
            },
            update: function() {
                var tmp = this.cs("c.cell.compare", this.state.start, this.state.end);
                var standardSelection = this.rs("c.standard.cell.range", tmp.min, tmp.max);
                var start = standardSelection.start;
                var end = standardSelection.end;
                if (start.row !== end.row || start.col !== end.col) {
                    this.$selectionNode.addClass("btb-multi-selection");
                } else {
                    this.$selectionNode.removeClass("btb-multi-selection");
                }
                var viewRect = this.cs("c.cell.viewrect", this.rs("c.struct"), start, end);
                this.rs("s.top.selection.patch", start, end);
                this.rs("s.left.selection.patch", start, end);
                this.$selectionNode.css({
                    width: viewRect.width,
                    height: viewRect.height,
                    top: viewRect.y,
                    left: viewRect.x
                });
                this.$borderNode[0].style.cssText = "";
                this.$borderNode.css({
                    borderLeftColor: viewRect.overflow.left ? "transparent" : "undefined",
                    borderRightColor: viewRect.overflow.right ? "transparent" : "undefined",
                    borderBottomColor: viewRect.overflow.bottom ? "transparent" : "undefined",
                    borderTopColor: viewRect.overflow.top ? "transparent" : "undefined"
                });
            },
            createSelectionNode: function() {
                return this.createElement("div", {
                    attr: {
                        "class": "btb-selection"
                    },
                    inner: '<div class="btb-selection-bg"></div><div class="btb-selection-border"></div>'
                });
            },
            createSelectionControl: function() {
                return this.createElement("div", "btb-selection-control");
            }
        });
        Selection.deps = [ "cover", "position" ];
        return Selection;
    }
};

//src/system/sort/sort.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[176] = {
    value: function(require) {
        var $ = _p.r(2);
        var CELL_VALUE_TYPE = _p.r(70);
        var BOOLEAN_VALUE = _p.r(73);
        return _p.r(0).create("Cell", {
            base: _p.r(94),
            init: function() {
                this.initService();
            },
            initService: function() {
                this.registerService({
                    "c.sort.column.asc": this.sortColumnByAsc,
                    "c.sort.column.desc": this.sortColumnByDesc,
                    "c.sort.row.asc": this.sortRowAsc,
                    "c.sort.row.desc": this.sortRowDesc
                });
            },
            sortColumnByAsc: function(sortIndex, range) {
                var index = this.__getSortColumnIndex(sortIndex, range);
                this.rs("c.exchange.row", index, range);
                this.coreRefresh(true);
            },
            sortColumnByDesc: function(sortIndex, range) {
                var index = this.__getSortColumnIndex(sortIndex, range);
                index = index.reverse();
                this.rs("c.exchange.row", index, range);
                this.coreRefresh(true);
            },
            sortRowAsc: function(sortIndex, range) {
                var index = this.__getSortRowIndex(sortIndex, range);
                this.rs("c.exchange.column", index, range);
                this.coreRefresh(true);
            },
            sortRowDesc: function(sortIndex, range) {
                var index = this.__getSortRowIndex(sortIndex, range);
                index = index.reverse();
                this.rs("c.exchange.column", index, range);
                this.coreRefresh(true);
            },
            __getSortColumnIndex: function(sortIndex, range) {
                var start = range.start;
                var end = range.end;
                var struct = this.rs("c.struct");
                var values = [];
                var numeric = [];
                var text = [];
                var error = [];
                var booleans = [];
                var numericMap = {};
                var textMap = {};
                var errorMap = {};
                var booleanMap = {};
                var valueInfo;
                var valueType;
                var value;
                if (sortIndex < start.col || sortIndex > end.col) {
                    return;
                }
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    valueInfo = struct.getComputedValueInfo(i, sortIndex);
                    valueType = valueInfo.type;
                    value = valueInfo.value;
                    if (valueType === CELL_VALUE_TYPE.UNDEFINED) {
                        continue;
                    }
                    if (valueType === CELL_VALUE_TYPE.TEXT) {
                        value = value.toLowerCase();
                        text.push(value);
                        if (!textMap[value]) {
                            textMap[value] = [];
                        }
                        textMap[value].push(i);
                    } else if (valueType === CELL_VALUE_TYPE.ERROR) {
                        error.push(value);
                        if (!errorMap[value]) {
                            errorMap[value] = [];
                        }
                        errorMap[value].push(i);
                    } else if (valueType === CELL_VALUE_TYPE.BOOLEAN) {
                        value = value === BOOLEAN_VALUE.TRUE ? 1 : 0;
                        if (!booleanMap[value]) {
                            booleanMap[value] = [];
                        }
                        booleans.push(value);
                        booleanMap[value].push(i);
                    } else {
                        switch (valueType) {
                          case CELL_VALUE_TYPE.NUMERIC:
                            value = +value;
                            break;

                          // 时间日期取原始值
                            case CELL_VALUE_TYPE.DATE:
                          case CELL_VALUE_TYPE.TIME:
                            // 未处理日期
                            debugger;
                            value = +struct.getRawValue(i, sortIndex);
                            break;
                        }
                        numeric.push(value);
                        if (!numericMap[value]) {
                            numericMap[value] = [];
                        }
                        numericMap[value].push(i);
                    }
                }
                // 数字类型排序
                var index = [];
                var sorted = {};
                numeric.sort(function(a, b) {
                    return a - b;
                });
                // 排序数字类型的数据
                for (var i = 0, len = numeric.length; i < len; i++) {
                    value = numeric[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = numericMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                text.sort();
                sorted = {};
                // 排序文本类型的数据
                for (var i = 0, len = text.length; i < len; i++) {
                    value = text[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = textMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                // 排序boolean类型数据
                booleans.sort();
                sorted = {};
                for (var i = 0, len = booleans.length; i < len; i++) {
                    value = booleans[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = booleanMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                // 排序错误类型数据
                error.sort();
                sorted = {};
                // 排序文本类型的数据
                for (var i = 0, len = error.length; i < len; i++) {
                    value = error[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = errorMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                return index;
            },
            __getSortRowIndex: function(sortIndex, range) {
                var start = range.start;
                var end = range.end;
                var struct = this.rs("c.struct");
                var values = [];
                var rawValues = [];
                var numeric = [];
                var text = [];
                var error = [];
                var booleans = [];
                var numericMap = {};
                var textMap = {};
                var errorMap = {};
                var booleanMap = {};
                var cell;
                var value;
                if (sortIndex < start.col || sortIndex > end.col) {
                    return;
                }
                for (var i = start.row, limit = end.row; i <= limit; i++) {
                    cell = struct.getComputedCell(i, sortIndex);
                    if (cell.type === CELL_VALUE_TYPE.UNDEFINED) {
                        continue;
                    }
                    rawValues[i] = struct.getRawValue(i, sortIndex);
                    if (cell.type === CELL_VALUE_TYPE.TEXT) {
                        value = cell.value;
                        text.push(value);
                        if (!textMap[value]) {
                            textMap[value] = [];
                        }
                        textMap[value].push(i);
                    } else if (cell.type === CELL_VALUE_TYPE.ERROR) {
                        value = cell.value;
                        error.push(value);
                        if (!errorMap[value]) {
                            errorMap[value] = [];
                        }
                        errorMap[value].push(i);
                    } else if (cell.type === CELL_VALUE_TYPE.BOOLEAN) {
                        value = cell.value === BOOLEAN_VALUE.TRUE ? 1 : 0;
                        if (!booleanMap[value]) {
                            booleanMap[value] = [];
                        }
                        booleans.push(value);
                        booleanMap[value].push(i);
                    } else {
                        switch (cell.type) {
                          case CELL_VALUE_TYPE.NUMERIC:
                            value = +cell.value;
                            break;

                          // 时间日期取原始值
                            case CELL_VALUE_TYPE.DATE:
                          case CELL_VALUE_TYPE.TIME:
                            value = +rawValues[i];
                            break;
                        }
                        numeric.push(value);
                        if (!numericMap[value]) {
                            numericMap[value] = [];
                        }
                        numericMap[value].push(i);
                    }
                }
                // 排序
                var index = [];
                var sorted = {};
                numeric.sort(function(a, b) {
                    return a - b;
                });
                // 排序数字类型的数据
                for (var i = 0, len = numeric.length; i < len; i++) {
                    value = numeric[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = numericMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                text.sort();
                sorted = {};
                // 排序文本类型的数据
                for (var i = 0, len = text.length; i < len; i++) {
                    value = text[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = textMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                // 排序boolean类型数据
                booleans.sort();
                sorted = {};
                for (var i = 0, len = booleans.length; i < len; i++) {
                    value = booleans[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = booleanMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                // 排序错误类型数据
                error.sort();
                sorted = {};
                // 排序文本类型的数据
                for (var i = 0, len = error.length; i < len; i++) {
                    value = error[i];
                    if (sorted[value]) {
                        continue;
                    }
                    sorted[value] = true;
                    value = errorMap[value];
                    for (var j = 0, jlen = value.length; j < jlen; j++) {
                        index.push(value[j]);
                    }
                }
                return index;
            }
        });
    }
};

//src/system/viewport.js
/**
 * @file
 * @author hancong03@baiud.com
 */
_p[177] = {
    value: function(require) {
        var $ = _p.r(2);
        return _p.r(0).create("Viewport", {
            base: _p.r(94),
            init: function() {
                this.initEvent();
            },
            initEvent: function() {
                var _self = this;
                $(this.getDocument().defaultView).on("resize", function() {
                    _self.updateViewport();
                });
            },
            updateViewport: function() {
                this.rs("c.zoom.refresh");
                this.rs("c.update.viewport");
            }
        });
    }
};

//dev-lib/exports.js
/*!
 * 模块暴露
 */
_p[178] = {
    value: function(require) {
        var BTable = _p.r(4);
        BTable.command(_p.r(5));
        BTable.module(_p.r(134));
        BTable.mapEvent(_p.r(89));
        BTable.Interpreter = _p.r(116);
        BTable.ExcelAdapter = _p.r(98);
        window.BTable = BTable;
    }
};

var moduleMapping = {
    "kf.start": 178
};

function use(name) {
    return _p.r([ moduleMapping[name] ]);
}
/**
 * 模块暴露
 */

( function ( global ) {

    // build环境中才含有use
    try {
        use( 'kf.start' );
    } catch ( e ) {
    }

} )( this );
})();