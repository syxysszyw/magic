$(function(){

    var $bgContainer = $("#bg-container");
    var $file = $("#file");
    var $prop = $('.prop');
    var $btn = $('.weui_uploader_input_wrp');

    function setBg(container, result) {
        /* 用img */
        // $bgContainer.html('<img src="' + result +'" alt="" />');  

        /* 用background-image */
        container.css({
            'background-image': 'url(' + result + ')'
        })
    }

    if (localStorage.defaultBg) {
        $btn.hide();
        setBg($bgContainer, localStorage.defaultBg)
    } 

    /* 读文件 */
    var isPropUndefined = true;

    $file.on('change', function(){
        readAsDataURL();
        // readAsBinaryString();
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
        reader.onload = function(e){  

        	// console.log(this.result)
        	// console.log(convertImgDataToBlob(this.result))
   
            setBg($bgContainer, this.result);


            // localStorage.defaultBg = this.result;
            localStorage.setItem('defaultBg', this.result);

            $btn.hide();
        }  
    } 

    function readAsBinaryString(){
    	var file = $file[0].files[0];
    	if(!/image\/\w+/.test(file.type)){  
            alert("只能选择图片当背影哦");  
            return false;  
        }  
        var reader = new FileReader();  

        reader.readAsBinaryString(file);  

        reader.onload = function(e) {
        	// console.log(this.result)
        }
    }


var convertImgDataToBlob = function (base64Data) {
    var format = "image/jpeg";
    var base64 = base64Data;
    var code = window.atob(base64.split(",")[1]);
    var aBuffer = new window.ArrayBuffer(code.length);
    var uBuffer = new window.Uint8Array(aBuffer);
    for(var i = 0; i < code.length; i++){
        uBuffer[i] = code.charCodeAt(i) & 0xff ;
    }
    console.info([aBuffer]);
    console.info(uBuffer);
    console.info(uBuffer.buffer);
    console.info(uBuffer.buffer==aBuffer); //true

    var blob=null;
    try{
        blob = new Blob([uBuffer], {type : format});
    }
    catch(e){
        window.BlobBuilder = window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;
        if(e.name == 'TypeError' && window.BlobBuilder){
            var bb = new window.BlobBuilder();
            bb.append(uBuffer.buffer);
            blob = bb.getBlob("image/jpeg");

        }
        else if(e.name == "InvalidStateError"){
            blob = new Blob([aBuffer], {type : format});
        }
        else{

        }
    }
    alert(blob.size);
    return blob;
   
};

    /* 摇一摇 */
    /* http://www.360doc.com/content/13/0222/23/11625720_267350198.shtml */
    var last_update = 0;
    var x = y = z = last_x = last_y = last_z = 0;

    // 一开始$prop隐藏，此时无法获取 $prop 的宽和高，所以应该在 $prop show()的时候获取宽高值。
    var propW = 250;
    var propH = 222;
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
 
            if (speed > 2000 && $prop.css('display') !== 'block') {
                // alert("摇动了");
                $prop.show().css({
                	'top': '0px',
                	'left': '0px'
                });

                $(window).on('deviceorientation', handleOrientation);
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    }
    init();

    /* 拖动 */
    var propL = parseInt($prop.css('left'));
    var propT = parseInt($prop.css('top'));

    var windowW = $(window).width();
    var windowH = $(window).height();

    var maxOffsetL , maxOffsetT;

    var propOffsetL, propOffsetT;

    $prop.on('touchstart', function(event) {
         //    console.log(event);
         //    console.log('event.target.x' + event.target.x);
    	// console.log('event.target.y' + event.target.y);

        $(window).off('deviceorientation', handleOrientation);

    	if (isPropUndefined) {
    		// propW = $prop.width();
		    // propH = $prop.height();
		    propHalfW = $prop.width()/2;
		    propHalfH = $prop.height()/2;

            maxOffsetL = windowW - propW;
            maxOffsetT = windowH - propH;

		    isPropUndefined = !isPropUndefined;
    	}

        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];

            propOffsetL = touch.pageX - $prop.offset().left;
            propOffsetT = touch.pageY - $prop.offset().top;
        }

        // console.log('propOffsetL', propOffsetL);
        // console.log('propOffsetT', propOffsetT);
        
    }).on('touchmove', function(event) {
    	// console.log('touches', event.touches);
    	// console.log('targetTouches', event.targetTouches);
    	// console.log('changeTouches', event.changeTouches);


        // console.log('propOffsetL', propOffsetL);
        // console.log('propOffsetT', propOffsetT);

        event.preventDefault();//阻止其他事件

        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];  // 把元素放在手指所在的位置

            propL = touch.pageX - propOffsetL;
            propT = touch.pageY - propOffsetT;
            
            $prop.css({
                // 'left': touch.pageX - propOffsetL + 'px',
                // 'top': touch.pageY - propOffsetT + 'px'
                'left': propL + 'px',
                'top': propT + 'px'
                
            })
       }

    }).on('touchend', function(event) {

        // 这个时候已经没有 event.targetTouches了

        $(window).on('deviceorientation', handleOrientation);
        // alert('propL:' + propL);
        // alert('propT:' + propT);

        var leaveTouchPageX = propOffsetL + $prop.offset().left;
        var leaveTouchPageY = propOffsetT + $prop.offset().top;        

        // 边界判断

        // 1. 当 touchend 的时候手指已经到达屏幕边缘，再让图片消失
        if(leaveTouchPageX <= 10 || leaveTouchPageX >= windowW - 10 || leaveTouchPageY <= 20 || leaveTouchPageY >= windowH - 20) {
            $prop.hide('slow');
        }

        // var currentL = parseInt($prop.css('left'), 10);
        // var currentT = parseInt($prop.css('top'), 10);

        // if(currentL < 0 || currentL + propW > windowW || currentT < 0 || currentT + propH > windowH ) {

        //     $prop.hide('slow');
        // }


    });



    /* orientation */

    // $(window).on('deviceorientation', handleOrientation);
    var pvx = 0;
    var pvy = 0;
    
    var to ;
    function handleOrientation(evt) {

        var beta = evt.beta;   // [-180, 180]
        var gamma = evt.gamma;   // [-90, 90]

        // beta   0- 90   往下掉; -90-0  往上掉
        // gamma  0-90   往右掉; -90-0  往左掉

        to = setTimeout(function() {
            render();
            update(beta, gamma);
        }, 50);
    }
    function render() {

        $prop.css({
            'left': propL + 'px',
            'top': propT + 'px'
        })
    }

    function update(beta, gamma) {
        pvx = gamma / 90 * 10;
        pvy = beta / 90 * 10;

        propL += pvx;
        propT += pvy;

        if(propL < 0 ){
            propL = 0;
        }else if(propL > maxOffsetL) {
            propL = maxOffsetL;
        }

        if(propT < 0 ){
            propT = 0;
        }else if(propT > maxOffsetT) {
            propT = maxOffsetT;
        }

    }



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

    /* 三击 */
    var count = 0, timer;

    // $bgContainer.on('touchend',function() {
    // $bgContainer.on('touchstart',function() {
    //     if(count < 2){
    //         if(timer){
    //             clearTimeout(timer);
    //         }
    //         count ++;
    //         timer = setTimeout(function(){
    //             count = 0;
    //         }, 500);
    //     }else if(count === 2){
    //         count = 0;
    //         clearTimeout(timer);
    //         threeClick();
    //     }
    // });

    function threeClick() {
        $file.trigger('click');
    }
    $bgContainer.tap(function() {
        if(count < 2){
            if(timer){
                clearTimeout(timer);
            }
            count ++;
            timer = setTimeout(function(){
                count = 0;
            }, 500);
        }else if(count === 2){
            count = 0;
            clearTimeout(timer);
            threeClick();
        }
    })

})