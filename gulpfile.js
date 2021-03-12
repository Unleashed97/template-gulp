'use strict';

const { src, dest } = require('gulp');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const panini = require('panini');
const del = require('del');
const concat = require('gulp-concat')
const uglify = require('gulp-uglify');
const autoPrefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
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
    clean: "./" + distPath
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
    return src(path.src.html, {base: srcPath})
        .pipe(panini({
            root:       srcPath,
            layouts:    srcPath + 'layouts/',
            partials:   srcPath + 'partials/',
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
};

// CSS
const css = () => {
    return src(path.src.css, {base: srcPath + "scss/"})
        // .pipe(autoPrefixer("last 2 version", "> 1%", "ie 8", "ie 7"))
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions', '> 0.5%'],
            cascade: true
        }))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
};

// JS
const js = () => {
    return src(path.src.js, {base: srcPath + 'js/'})
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
}

// Copy images and fonts
// const copy = () =>{
//     return src([
//         path.src.images,
//         path.src.fonts
//         ])
//         .pipe(dest(path.build))
//         .pipe(browserSync.reload({stream: true}));
// }

const images = () => {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
}

const fonts = () => {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));
} 
// clean Dist folder
function clean() {
    return del(path.clean);
}

// Watch
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    // gulp.watch([path.watch.images, path.watch.fonts], copy);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browser);

/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
// exports.copy = copy;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
