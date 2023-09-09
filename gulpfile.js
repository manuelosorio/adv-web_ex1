const gulp = require("gulp");
const clean = require("gulp-clean");
const { publish } = require('gh-pages');
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const plumber = require('gulp-plumber');
const autoPrefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const browserify = require('browserify');
const file = require('gulp-file');
const glob = require('glob');
const packer = require("css-mqpacker");
const purgeCSS = require('@fullhuman/postcss-purgecss');

let config = {
  cname: ''
}
let paths ={
  styles: {
    src: "src/assets/sass/**/*.{sass,scss}",
    dest: "_dist/css"
  },
  html: {
    src: "src/**/*.html",
    dest: "_dist/"
  },
  images: {
    src: "src/assets/images/**/*.{jpg,jpeg,png,svg}",
    dest: "_dist/images"
  },
}

function style() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded"
    }).on('error', sass.logError))
    .pipe(
      postcss(
        [
          autoPrefixer(),
          packer({
            sort: true
          }),
          purgeCSS({
            content: [
              paths.html.dest + '**/*.html'
            ]
          })
        ]
    ))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}
function html() {
  return gulp
    .src([
      paths.html.src
    ])
    // .pipe(plumber({
    //   errorHandler: function(err) {
    //     console.log(err);
    //     this.emit('end');
    //   }
    // }))
    .pipe(gulp.dest(paths.html.dest))
}
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest))
}

function cleanDist() {
  return gulp.src('./_dist', {allowEmpty:true})
    .pipe(clean())
}
function watch() {
  browserSync.init({
    server: {
      baseDir: "./_dist"
    },
    open: false
  });
  gulp.watch(paths.styles.src, style).on('change', browserSync.reload);
  gulp.watch(paths.html.src, html).on('change', browserSync.reload);
}

function ghPages() {
  gulp.src("./_dist/**/*")
    .pipe(file('CNAME', config.cname))
    .pipe(gulp.dest('./.publish'));

  return publish(
    ".publish",
    {
      remoteUrl: "git@github.com:manuelosorio/adv-web_ex1.git",
      branch: 'gh-pages',
      // cacheDir: '.publish',
      message: 'Update ' + new Date().toISOString()
    },
    (err) => {
      if (err) {
        console.log(err)
      }
    }
  );
}

exports.cleanDist = cleanDist
exports.watch = watch
exports.style = style
exports.html = html
exports.ghPages = ghPages

let build = gulp.parallel([html, images], style);
let buildWatch = gulp.series(gulp.parallel([html, images]), style, watch);
let staticBuild = gulp.series(cleanDist, build)

gulp.task('default', gulp.series(cleanDist, buildWatch))
gulp.task('static', gulp.series(staticBuild))
// scriptsMinify
gulp.task('deploy', gulp.series(staticBuild, ghPages));
