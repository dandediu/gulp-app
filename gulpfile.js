'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const twig = require('gulp-twig');
const scssLint = require('gulp-sass-lint');
const esLint = require('gulp-eslint');
const minify = require('gulp-minify');

const browserSync = require('browser-sync').create();


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

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    })
});


gulp.task('sass', function () {
    return gulp.src('app/scss/styles.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('twig', function () {
    return gulp.src('app/templates/index.twig')
        .pipe(twig())
        .pipe(gulp.dest('app'))
});

gulp.task('twig-pages', function () {
    return gulp.src('app/templates/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('app/html'))
});

gulp.task('scss-lint', function () {
    return gulp.src('app/scss/*.scss')
        .pipe(scssLint())
        .pipe(scssLint.format())
        .pipe(scssLint.failOnError())

});

gulp.task('js-lint', function () {
    return gulp.src('app/js/*.js')
        .pipe(esLint(esLintConfig))
        // eslint.format() outputs the lint results to the console.
        .pipe(esLint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(esLint.failAfterError())
});

gulp.task('compress', function () {
    return gulp.src('app/js/*.js')
        .pipe(minify())
        .pipe(gulp.dest('app/min'))
});



gulp.task('watch', ['browserSync','sass'], function (){
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/templates/**/*.templates', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('default', [ 'twig','sass', 'scss-lint', 'js-lint','compress','watch']);