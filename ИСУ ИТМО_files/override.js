var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
$(document).ready(function() {
    if (isMobile.any()) {
        $('#t_upper_header_wrap').css({
            'position': 'static',
            'z-index': 'auto'
        });
        $('#t_head_u_body_wrap,#t_head_u_body_wrap_small').css({
            'margin-top': '0'
        });
    } else {}
    setTimeout(function() {
        $('.t_success,.success').fadeOut(500);
    }, 5000);
    setTimeout(function() {
        $('.t_notification,.notification').fadeOut(500);
    }, 120000);
});

(function () { //Array Extends
	Object.defineProperty(Array.prototype,'max', {
		value: function() {
			return Math.max.apply(null, this);
		},
		writable: true,
		enumerable: false,
		configurable: true
	});
	
	Object.defineProperty(Array.prototype,'min', {
		value: function() {
			return Math.min.apply(null, this);
		},
		writable: true,
		enumerable: false,
		configurable: true
	});
	
	Object.defineProperty(Array.prototype,'removeElementByValue', {
		value: function(val) {
			var last = -1;
			for (var i = 0; i < this.length; i++) {
				if (this[i] === val) {
					this.splice(i, 1);
					this.removeElementByValue(val);
					break;
				}
			}
			return last;
		},
		writable: true,
		enumerable: false,
		configurable: true
	});
})();

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

(function(e) { //matches polifil
    e.matches || (e.matches = e.matchesSelector || function(selector) {
        var matches = document.querySelectorAll(selector),
            th = this;
        return Array.prototype.some.call(matches, function(e) {
            return e === th;
        });
    });
})(Element.prototype);

(function(e) { //closest polifil
    e.closest = e.closest || function(css) {
        var node = this;
        while (node) {
            if (node.matches(css)) return node;
            else node = node.parentElement;
        }
        return null;
    }
})(Element.prototype);

(function() { //Array.isArray polifil
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
})();

(function (arr) { // replaceWith polifil
  arr.forEach(function (item) {
    if (item.hasOwnProperty('replaceWith')) {
      return;
    }
    Object.defineProperty(item, 'replaceWith', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function replaceWith() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();
        
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.parentNode.replaceChild(docFrag, this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

(function () { // findIndex polifil
	if (!Array.prototype.findIndex) {
	  Array.prototype.findIndex = function(predicate) {
		if (this == null) {
		  throw new TypeError('Array.prototype.findIndex called on null or undefined');
		}
		if (typeof predicate !== 'function') {
		  throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
		  value = list[i];
		  if (predicate.call(thisArg, value, i, list)) {
			return i;
		  }
		}
		return -1;
	  };
	}
})();

function Override() {}

Override.submit = apex.submit;
Override.confirm = apex.confirm;

Override.object = function(obj) {
    if ((obj.attr('onclick') == undefined) || (!obj.attr('onclick').match(/apex.submit/i)) || (obj.attr('onclick') == '')) {
        obj = obj.parent()
            // Override.object (obj); // stack overflow take place here in IE
    }
    return obj
}

Override.zero = function() {
    $('#wwvFlowForm').remove();
    Common.notify('Перенаправление...', true, true, true, true, function() {
        history.back(-1);
    });
    return
}

apex.extQueue = new Array();
apex.extPrepared = false;
apex.extBlock = true;
apex.extLoader, apex.extDeloader, apex.extProgress, apex.extDeprogress;

apex.submit = function(a, event) {
    var evt = window.event,
        block = true,
        shifter;
    try {
        if (apex.extPrepared == true) {
            if (apex.extQueue.length > 0) {
                while (apex.extQueue.length > 0) {
                    shifter = apex.extQueue.shift();
                    shifter(a);
                }
                return
            } else {
                apex.extBlock = false;
            }

        } else {
            throw exception;
        }
    } catch (exception) {}

    if (typeof a == 'string') {
        var obj;
        if (!evt) {
            obj = $('button,input,a');
        } else {
            obj = Override.object($((typeof evt.target != 'undefined') ? evt.target : evt.srcElement));
        }
        obj.attr('onclick', '');
        obj.off();

        try {
            if (apex.extPrepared == true) {} else {
                throw exception;
            }
        } catch (exception) {
            var div = $(document.createElement('div'))
            div.addClass('modal-submit-panel');
            $('body').append(div);
            div.css('display', 'block');
            Override.submit(a);
            return
        }
    }
    try {
        if (!apex.extBlock == true) {
            Override.submit(a);
        } else {
            throw exception;
        }
    } catch (exception) {
        Override.submit(a);
    }
    return
}

apex.confirm = function(b, a, event) {
    if (!confirm(b)) {
        return
    }
    apex.submit(a, event);
    return
}

function Match() {}

Match.email = function(val, req) {
    var val2 = $.trim(val);
    if (val2.length == 0) {
        if (req == true) {
            return false;
        } else {
            return true;
        }
    }
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(val2)) {
        return false;
    }
    return true;
}

Match.phone = function(val, req) {
    var val2 = $.trim(val);
    if (val2.length == 0) {
        if (req == true) {
            return false;
        } else {
            return true;
        }
    }
    val2 = val2.replace(/\s/g, '');
    var filter = /^\+[0-9]+(\()?[0-9]+(\))?[0-9]{6,}$/;
    if (!filter.test(val2)) {
        return false;
    }
    return true;
}

function Nav() {}

Nav.fix = function() {
    if ($('#navbar,.navbar').length) {
        $('#navbar .navbar-entry,.navbar .navbar-entry').each(function() {
            var params = $(this).children('a').html().split('|');
            $(this).children('a').html(params[0]);
            if (params[1] != undefined) {
                $(this).children('a').attr('href', params[1].replace('&amp;', '&'));
            }
            $(this).children('a').addClass(params[2]);
            if (params[3] != undefined) {
                // изображение fa
            }
            if (params[4] != undefined) {
                // изображение img
            }
            return
        });
        $('#navbar,.navbar').css('visibility', 'visible');
    }
    return
}

$(document).ready(function() {
    Nav.fix();
    return
});