var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('gulp-autoprefixer');
var rigger = require('gulp-rigger');
var browserSync = require('browser-sync');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
//var pump = require('pump');
var reload = browserSync.reload;

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: './src/build/',
    js: './src/build/js/',
    css: './src/build/css/',
    img: './src/dev/img/',
    fonts: './src/dev/fonts/'
  },
  src: { //Пути откуда брать исходники
    html: './src/dev/pages/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: './src/dev/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
    style: './src/dev/scss/main.scss',
    img: './src/dev/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: './src/dev/fonts/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: './src/dev/pages/*.html',
    js: './src/dev/js/**/*.js',
    style: './src/dev/scss/main.scss',
    img: './src/dev/img/**/*.*',
    fonts: './src/dev/fonts/**/*.*'
  },
  dev:{
    html:'./src/dev/',
    css:'./src/dev/css/',
    js:'./src/dev/js/core',
    img:'',
    fonts:'',

  },
  clean: './src/build'
};
 var config = {
  server: {
    baseDir: "./src/build"
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_Devil"
};

//HTML
gulp.task('html:build', function () {
 return gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir:'./src/dev',
      index:'index.html'
    },
    port: 8080,
    open: true,
    notify: false
  });
});


gulp.task('browserSyncBuild', function() {
  browserSync({
    server: {
      baseDir: config.server.baseDir
    },
    port: 8080,
    open: true,
    notify: false
  });
});


gulp.task('css:build',function(){
	return gulp.src(path.src.style)
		.pipe(sass().on('error',sass.logError))
		.pipe(cssnano())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
		.pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build',function (cb){
	return  gulp.src(path.src.js) //Найдем наш main файл
    .pipe(rigger())
    .pipe(uglify())
		.pipe(gulp.dest(path.build.js));
});

gulp.task('image:build', function () {
  gulp.src(path.src.img) //Выберем наши картинки
    .pipe(imagemin({ //Сожмем их
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(reload({stream: true}));
});

gulp.task('watcher',function(){
	gulp.watch(path.watch.style, ['css:build:dev'])
  gulp.watch(path.watch.html, ['html:build:dev']);
  gulp.watch(path.watch.js, ['js:build:dev']);
})

gulp.task('html:build:dev', function () {
  return gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.dev.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('css:build:dev',function(){
  return gulp.src(path.src.style)
    .pipe(sass().on('error',sass.logError))
    .pipe(cssnano())
    .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest(path.dev.css))
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
gulp.task('js:build:dev',function (cb){
	return  gulp.src(path.src.js) //Найдем наш main файл
    .pipe(rigger())
    .pipe(uglify())
		.pipe(gulp.dest(path.dev.js));
});

gulp.task('build:dev', [
  'html:build:dev',
  'css:build:dev',
  'js:build:dev',
]);

gulp.task('build:project', [
  'html:build',
  'js:build',
  'css:build',
  'image:build'
]);
//DEFAULT
gulp.task('default',['watcher','browserSync']);
//BUILD
gulp.task('build',['build:project','browserSyncBuild']);