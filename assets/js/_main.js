/* ==========================================================================
   jQuery plugin settings and other scripts - Optimized Version
   ========================================================================== */

// 使用更高效的DOM ready
(function($) {
    'use strict';
    
    // 防抖函数
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    // 节流函数
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    $(document).ready(function(){
        // 优化的Sticky footer
        var bumpIt = function() {
            var footerHeight = $(".page__footer").outerHeight(true);
            $("body").css("margin-bottom", footerHeight);
        };
        
        bumpIt();
        
        // 使用防抖优化resize事件
        $(window).on('resize', debounce(bumpIt, 250));
        
        // FitVids init - 延迟加载
        if (typeof $.fn.fitVids !== 'undefined') {
            $("#main").fitVids();
        }
        
        // 优化的sticky sidebar
        if (typeof Stickyfill !== 'undefined') {
            $(".sticky").each(function() {
                Stickyfill.add(this);
            });
        }
        
        var stickySideBar = function(){
            var $button = $(".author__urls-wrapper button");
            var show = $button.length === 0 ? $(window).width() > 925 : !$button.is(":visible");
            
            if (show) {
                if (typeof Stickyfill !== 'undefined') {
                    Stickyfill.rebuild();
                    Stickyfill.init();
                }
                $(".author__urls").show();
            } else {
                if (typeof Stickyfill !== 'undefined') {
                    Stickyfill.stop();
                }
                $(".author__urls").hide();
            }
        };
        
        stickySideBar();
        
        // 使用节流优化resize事件
        $(window).on('resize', throttle(stickySideBar, 100));
        
        // 图片懒加载
        function lazyLoadImages() {
            var images = document.querySelectorAll('img[data-src]');
            var imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
        
        // 检查浏览器支持
        if ('IntersectionObserver' in window) {
            lazyLoadImages();
        } else {
            // 降级处理
            $('img[data-src]').each(function() {
                $(this).attr('src', $(this).data('src')).addClass('loaded');
            });
        }
        
        // Google Scholar统计异步加载
        function loadScholarStats() {
            $('.show_paper_citations').each(function() {
                var $this = $(this);
                var paperId = $this.data('paperId') || $this.attr('data');
                if (paperId) {
                    // 异步加载引用数据
                    // 这里可以添加具体的API调用逻辑
                }
            });
        }
        
        // 延迟加载非关键功能
        setTimeout(loadScholarStats, 1000);
    });
    
})(jQuery);
