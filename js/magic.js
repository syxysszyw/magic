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


            localStorage.defaultBg = this.result;

            $btn.hide();
        }  
    } 

    function readAsBinaryString(){
    	var file = $file[0].files[0];
    	if(!/image\/\w+/.test(file.type)){  
            alert("看清楚，这个需要图片！");  
            return false;  
        }  
        var reader = new FileReader();  

        reader.readAsBinaryString(file);  

        reader.onload = function(e) {
        	console.log(this.result)
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
                $prop.show().css({
                	'top': '0px',
                	'left': '0px'
                });
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
    var screenW = $(window).width();
    var screenH = $(window).height();
    var propOffsetL, propOffsetT;
    var limitL, limitT, limitR, limitB;


    $prop.on('touchstart', function(event) {

    	if (isPropUndefined) {
    		propW = $prop.width();
		    propH = $prop.height();
		    propHalfW = $prop.width()/2;
		    propHalfH = $prop.height()/2;

            // limit
            limitL = 0 - propHalfW;
            limitT = 0 - propHalfH;
            limitR = screenW - propHalfW;
            limitB = screenH - propHalfH;

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
        event.preventDefault();//阻止其他事件

        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];  // 把元素放在手指所在的位置

            $prop.css({
                'left': touch.pageX - propOffsetL + 'px',
                'top': touch.pageY - propOffsetT + 'px'
                
            })
       }

    }).on('touchend', function(event) {
    	console.log('touchend');
        // 边界判断
        var currentL = parseInt($prop.css('left'), 10);
        var currentT = parseInt($prop.css('top'), 10);

        if(currentL < limitL || currentL > limitR || currentT < limitT || currentT > limitB) {
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