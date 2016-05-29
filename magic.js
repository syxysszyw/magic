$(function(){

    /* 读文件 */
    var $file = $("#file");
    var $bgContainer = $("#bg-container");
    var $prop = $('.prop');

    $file.on('change', function(){
        readAsDataURL();
    })

    function readAsDataURL(){  
        //检验是否为图像文件  
        var file = $file[0].files[0];  
        if(!/image\/\w+/.test(file.type)){  
            alert("看清楚，这个需要图片！");  
            return false;  
        }  
        var reader = new FileReader();  
        //将文件以Data URL形式读入页面  
        reader.readAsDataURL(file);  
        reader.onload=function(e){  

            // var $bgContainer =document.getElementById("bg-container");  
            /* 用img */
            $bgContainer.html('<img src="' + this.result +'" alt="" />');  
            /* 用background-image */

            $('.weui_uploader_input_wrp').hide();
        }  
    } 

    /* 摇一摇 */
    /* http://www.360doc.com/content/13/0222/23/11625720_267350198.shtml */
    var last_update = 0;
    var x = y = z = last_x = last_y = last_z = 0;

    // 一开始$prop隐藏，此时无法获取 $prop 的宽和高，所以应该在 $prop show()的时候获取宽高值。
    var propW;
    var propH;
    var propHalfW;
    var propHalfH;

    function init() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
            alert('not support mobile event');
        }
    }
    function deviceMotionHandler(eventData) {
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime - last_update) > 100) {
            var diffTime = curTime - last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
 
            if (speed > 2000) {
                // alert("摇动了");
                $prop.show();
                propW = $prop.width();
			    propH = $prop.height();
			    propHalfW = $prop.width()/2;
			    propHalfH = $prop.height()/2;
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    }
    init();
    /* 拖动 */
    var propL = $prop.css('left');
    var propT = $prop.css('top');
    var screenW = window.screen.availWidth;
    var screenH = window.screen.availHeight;

    $prop.on('touchmove', function(event) {
        event.preventDefault();//阻止其他事件

        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];  // 把元素放在手指所在的位置
            $prop.css({
                'left': touch.pageX - propHalfW + 'px',
                'top': touch.pageY - propHalfH + 'px'
            })
       }

    }).on('touchend', function(event) {
        // 边界判断
        var currentL = parseInt($prop.css('left'), 10);
        var currentT = parseInt($prop.css('top'), 10);
        console.log(currentL + ' ' + currentT);

        // if(currentL < 0 - propHalfW || currentL > screenW - propHalfW || currentT < 0 - propHalfH || currentT > screenH - propHalfH) {
        if(currentL < 0 || currentL + propW > screenW || currentT < 0 || currentT + propH > screenH ) {
            $prop.hide('slow');
        }

    });


    /* 全屏 */
    function launchFullscreen(element) {
	  if(element.requestFullscreen) {
	    element.requestFullscreen();
	  } else if(element.mozRequestFullScreen) {
	    element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullscreen) {
	    element.webkitRequestFullscreen();
	  } else if(element.msRequestFullscreen) {
	    element.msRequestFullscreen();
	  }
	}
	// 启动全屏!
	launchFullscreen(document.documentElement); // 整个网页
	launchFullscreen(document.getElementById('bg-container')); // 某个页面元素
	/* Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture. */
})