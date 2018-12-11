'use strict';

const gulp = require('gulp'),
    sass = require('gulp-sass'),
    twig = require('gulp-twig'),
    scss_lint = require('gulp-sass-lint'),
    esLint = require('gulp-eslint'),
    source_maps = require('gulp-sourcemaps'),
    auto_prefix = require('gulp-autoprefixer'),
    inline_base64 = require('gulp-inline-base64'),
    cleanHTML = require('gulp-htmlclean'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    del = require('del');

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
    srcTwig: ['src/**/*.twig', '!src/**/_**/*', '!src/**/_*'], //exclude all .twig files and folders starting with "_"
    srcSCSS: 'src/scss/**/*.scss',
    srcJS: 'src/js/**/*.js',
    dist: 'dist',
    distHTML: 'dist/templates',
    distCSS: 'dist/css',
    distJS: 'dist/js'
};

/**
 *   DEVELOPMENT MODE
 */

/* SCSS to CSS compiler with source maps */
gulp.task('sass', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(source_maps.init())
        // .pipe(sass.sync().on('error', sass.logError))
        .pipe(sass()).on('error', sass.logError)
        .pipe(inline_base64({
            baseDir: 'src',
            //maxSize: 14 * 1024, // small files (<14 Kb) avoids DNS requests and makes the page loading faster
            debug: true
        }))
        .pipe(auto_prefix("last 2 version", "> 1%", {
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
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.reload({
            stream: true
        }))
});

/* SCSS linter */
gulp.task('scss-lint', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(scss_lint())
        .pipe(scss_lint.format())
        .pipe(scss_lint.failOnError())

});

/* ES linter */
gulp.task('js-lint', function () {
    return gulp.src(paths.srcJS)
        .pipe(esLint(esLintConfig))
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
});

gulp.task('js', function () {
    return gulp.src(paths.srcJS)
        .pipe(gulp.dest(paths.distJS))
        .pipe(browserSync.reload({
            stream: true
        }))
});

/* Real time run local server in browser  */
gulp.task('serve', ['sass', 'twig', 'js', 'scss-lint', 'js-lint'], function () {

    browserSync.init({
        server: {
            baseDir: paths.dist
        }
    });

    gulp.watch(paths.srcSCSS, ['sass', 'scss-lint']);
    gulp.watch(paths.srcTwig, ['twig']);
    gulp.watch(paths.srcJS, ['js', 'js-lint']);

});

/* Run dev server tasks */
gulp.task('default', ['serve']);


/**
 *   PRODUCTION BUILD
 */

gulp.task('html:dist', function () {
    return gulp.src(paths.srcTwig)
        .pipe(twig()).on('error', (error) => console.log(error))
        .pipe(cleanHTML())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(sass({ outputStyle: 'compressed' })).on('error', sass.logError)
        .pipe(inline_base64({ baseDir: 'src', debug: true }))
        .pipe(auto_prefix("last 2 version", "> 1%", { cascade: true }))
        .pipe(concat('styles.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.distCSS));
});

gulp.task('js:dist', function () {
    return gulp.src(paths.srcJS)
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.distJS));
});

gulp.task('prod', ['html:dist', 'css:dist', 'js:dist']);

gulp.task('build', ['prod']);

/**
 *  CLEAN GENERATED CODE
 */

gulp.task('clean', function () {
    del([paths.dist]);
});
