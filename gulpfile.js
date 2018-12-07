'use strict';

const gulp = require('gulp'),
    sass = require('gulp-sass'),
    twig = require('gulp-twig'),
    scssLint = require('gulp-sass-lint'),
    esLint = require('gulp-eslint'),
    minify = require('gulp-minify'),
    source_maps = require('gulp-sourcemaps'),
    autoPrefixer = require('gulp-autoprefixer'),
    inline_base64 = require('gulp-inline-base64');


const browserSync = require('browser-sync').create();

/* Config for ES Lint */
const esLintConfig = {
    rules: {
        'quotes': [1, 'single'],
        'strict': 2,
        'camelcase': 1,
        "comma-dangle": 2
    },
    globals: [
        'jQuery',
        '$'
    ],
    envs: [
        'browser'
    ]
};

/* Application paths references */
const paths = {
    src: 'src/**/*',
    srcTwig: ['src/**/*.twig','!src/**/_*/*'],
    srcSCSS: 'src/scss/**/*.scss',
    srcJS: 'src/js/**/*.js',
    dist: 'dist',
    distHTML: 'dist/templates',
    distCSS: 'dist/css',
    distJS: 'dist/js'
};

/* Real time browser synchronization */
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: paths.dist
        },
    })
});

/* SCSS to CSS compiler with source maps */
gulp.task('sass', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(source_maps.init())
        .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sass())
        .pipe(inline_base64({
            baseDir: 'src',
            //maxSize: 14 * 1024, // small files (<14 Kb) avoids DNS requests and makes the page loading faster
            debug: true
        }))
        .pipe(autoPrefixer("last 2 version", "> 1%", {
            cascade: true
        }))
        .pipe(source_maps.write())
        .pipe(gulp.dest(paths.distCSS))
        .pipe(browserSync.reload({
            stream: true
        }))
});

/* TWIG to HTML compiler */
gulp.task('twig', function () {
    return gulp.src(paths.srcTwig)
        .pipe(twig()).on('error', (error) => console.log(error)) //  log error handler
        .pipe(gulp.dest(paths.dist));
});

/* SCSS linter */
gulp.task('scss-lint', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(scssLint())
        .pipe(scssLint.format())
        .pipe(scssLint.failOnError())

});

/* ES linter */
gulp.task('js-lint', function () {
    return gulp.src(paths.srcJS)
        .pipe(esLint(esLintConfig))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
});

/* Minify JS */
gulp.task('compress', function () {
    return gulp.src(paths.srcJS)
        .pipe(minify())
        .pipe(gulp.dest(paths.distJS))
});


/* Watch all files from app */
gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch(paths.srcSCSS, ['sass']);
    gulp.watch(paths.srcTwig, browserSync.reload);
    gulp.watch(paths.srcJS, browserSync.reload);
});

gulp.task('default', ['twig', 'sass', 'scss-lint', 'js-lint', 'compress', 'watch']);