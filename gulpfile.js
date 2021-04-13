'use strict';

const { src, dest } = require('gulp');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const panini = require('panini');
const del = require('del');
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default;
const autoPrefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();

// PATHS
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html:   distPath,
        js:     distPath + "js/",
        css:    distPath + "css/",
        images: distPath + "images/",
        fonts:  distPath + "fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        js:     srcPath + "js/*.js",
        css:    srcPath + "scss/*.scss",
        images: srcPath + "images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "js/**/*.js",
        css:    srcPath + "scss/**/*.scss",
        images: srcPath + "images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath + "**/*"
}


// browser
const browser = () => {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        },
        notify: false
    });
};

// HTML
const html = () => {
    panini.refresh();
    return src(path.src.html)
        .pipe(panini({
            root:       srcPath,
            layouts:    srcPath + 'layouts/',
            partials:   srcPath + 'partials/',
        }))
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
};

// CSS
const styles = () => {
    return src('src/scss/main.scss')
        .pipe(sass())
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], cascade: false }))
        .pipe(cleancss(({ level: { 1: { specialComments: 0}}})))
        .pipe(rename({
            basename: 'style',
            suffix: '.min'
        }))
        // .pipe(dest('src/css/'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
};

// JS
const scripts = () => {
    return src(path.src.js, {base: srcPath + 'js/'})
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
}

// Images minify
const images = () => {
    return src(path.src.images)
        .pipe(newer(path.build.images))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
}

// Fonts
const fonts = () => {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));
} 

// clean Dist folder
function clean() {
    return del(path.clean, { force: true});
}

// Watch
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], styles);
    gulp.watch([path.watch.js, '!src/js/script.min.js'], scripts);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images, fonts));
const watch = gulp.parallel(build, watchFiles, browser);

/* Exports Tasks */
exports.browser = browser;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.default = watch;
