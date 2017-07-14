var os = require('os'),
    gulp = require('gulp'), 
    gutil = require('gulp-util'),
    concatCss = require('gulp-concat-css'),
    gulpif = require('gulp-if'),
    jsConcat = require('gulp-concat'),
    minifyJs = require('gulp-minify'),
    minifyHtml = require('gulp-minify-html'),
    minifyCss = require('gulp-cssmin'),
    minifyJson = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    connect = require('gulp-connect'),
    open = require('gulp-open');

var env, outputDir;

/*************************
        SETUP
*************************/

/**** Env ****/
env = process.env.NODE_ENV || 'dev';
if(env==='dev'){
  outputDir = 'builds/dev/';
} else {
  outputDir = 'builds/prod/';
}

/**** Set Browser for Open Task ****/
var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));

/**** Files ****/

// All Sources
var cssSources = 'builds/dev/css/**/*.css';
var jsSources = [ 'builds/dev/js/jquery.localScroll.min.js',
  'builds/dev/js/jquery.nav.js',
  'builds/dev/js/jquery.scrollTo.min.js',
  'builds/dev/js/simple-expand.min.js',
  'builds/dev/js/smoothscroll.js',
  'builds/dev/js/jquery.fitvids.js',
  'builds/dev/js/matchMedia.js',
  'builds/dev/js/nivo-lightbox.min.js',
  'builds/dev/js/owl.carousel.min.js',
  'builds/dev/js/retina-1.1.0.min.js',
  'builds/dev/js/custom.js'];
var jsonSources = 'builds/dev/js/**/*.json';
var htmlSources = 'builds/dev/**/*.html'
var imageSources = 'builds/dev/images/**/*.*'

// Bundle Files to Minify
var cssBundle = 'builds/dev/css/bundle-styles.css';
var jsBundle = 'builds/dev/js/bundle-scripts.js';
var htmlBundle = 'builds/dev/**/*.html';

/*************************
      SEPARATE TASKS
*************************/

/**** Core ****/

/* Concat Files */
gulp.task('bundleCss', function(){
  gulp.src(cssSources)
    .pipe(concatCss('bundle-styles.css'))
    .pipe(gulp.dest(outputDir + 'css'))
    
});

gulp.task('bundleJs', function(){
  gulp.src(jsSources)
    .pipe(jsConcat('bundle-scripts.js'))
    .pipe(gulp.dest(outputDir + 'js'))
    
});


/* if env === prod, Minify Files */

gulp.task('minJs', function(){
  gulp.src(jsBundle)
    .pipe(gulpif(env === 'prod', minifyJs({
      ext: {
        min: '.js'
      },
      ignoreFiles: ['bootstrap.min.js', 'jquery.min.js'],
      noSource: true
    })))
    .pipe(gulpif(env === 'prod', gulp.dest(outputDir + 'js')))
});

gulp.task('minCss', function(){
  gulp.src(cssBundle)
    .pipe(gulpif(env === 'prod', minifyCss()))
    .pipe(gulpif(env === 'prod', gulp.dest(outputDir + 'css'))) 
});

gulp.task('minHtml', function(){
  gulp.src(htmlBundle)
    .pipe(gulpif(env === 'prod', minifyHtml()))
    .pipe(gulpif(env === 'prod', gulp.dest(outputDir)))
});

gulp.task('minJson', function(){
  gulp.src(jsonSources)
    .pipe(gulpif(env === 'prod', minifyJson()))
    .pipe(gulpif(env === 'prod', gulp.dest(outputDir + 'js/json')))
});

gulp.task('images', function(){
  gulp.src(imageSources)
    .pipe(gulpif(env === 'prod', imagemin([
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({ plugins: [{ removeViewBox: true }]})
    ], { verbose: true })))
    .pipe(gulpif(env === 'prod', gulp.dest(outputDir + 'images')))
});


/*************************
      AUTOMATED TASKS
*************************/

// Watch
gulp.task('watch', function(){
  gulp.watch(jsSources, ['bundleJs']);
  gulp.watch(jsBundle, ['minJs']);
  gulp.watch(cssSources, ['bundleCss']);
  gulp.watch(cssBundle, ['minCss']);
  gulp.watch(imageSources, ['images']);
});

// Setup a local server to auto reload whenever changes are made to tasks that end with connect.reload()
gulp.task('connect', function(){
  connect.server({
    root: outputDir,
    livereload: true
  });
});

// Auto Open Site
gulp.task('open', ['connect'], function(){
  var options = {
    uri : 'localhost:8080',
    app : browser
  };
  gulp.src(__filename)
  .pipe(open({uri : 'http://localhost:8080'}));
});


gulp.task('default', ['bundleJs', 'bundleCss', 'minHtml', 'minCss', 'minJs', 'minJson', 'images', 'connect'])