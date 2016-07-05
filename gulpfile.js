var gulp = require('gulp');
var gutil = require('gulp-util');
var ftp = require('gulp-ftp');
var copy = require('gulp-contrib-copy');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();


var pathConf = {
    app     : '.',
    dist    : 'dist',
    package : 'package'
}

var config = {
    // 需要复制的静态文件
    staticFiles       : [
        pathConf.app + '/css/**/*',
        pathConf.app + '/js/**/*',
        pathConf.app + '/images/**/*',
        pathConf.app + '/*.html',
    ],
}

// Static server
gulp.task('bsy', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("css/*.css").on('change', browserSync.reload);
    gulp.watch("js/*.js").on('change', browserSync.reload);
    gulp.watch("*.html").on('change', browserSync.reload);
});

gulp.task('copy',['clean'], function() {
    return gulp.src(config.staticFiles, {base:"."})
        .pipe(copy())
        .pipe(gulp.dest(pathConf.dist));
});

gulp.task('clean', function() {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
})

gulp.task('deploy', ['copy'], function() {
    return gulp.src('dist/**/*')
        .pipe(ftp({
            host: 'demo.cdc.im',
            user: 'mode',
            pass: '',
            remotePath: '/domains/demo.cdc.im/public_html/emma/magicdeploy'
        }))
        // you need to have some kind of stream after gulp-ftp to make sure it's flushed 
        // this can be a gulp plugin, gulp.dest, or any kind of stream 
        // here we use a passthrough stream 
        .pipe(gutil.noop());
})