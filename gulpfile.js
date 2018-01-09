"use strict";

const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const minCSS = require("gulp-clean-css");
const maps = require("gulp-sourcemaps");
const imagemin = require('gulp-imagemin');
const del = require("del");
const connect = require('gulp-connect');
const livereload = require("gulp-livereload");

// this task concatinates the 2 JS files together for better performance to a file called "glodal.js" in the js folder.

gulp.task("concatScripts", function(){
return gulp.src(["js/circle/autogrow.js","js/circle/circle.js"])
.pipe(maps.init())
.pipe(concat("global.js"))
.pipe(maps.write("./"))
.pipe(gulp.dest("js"));
});

/*This task minifies the JS global.js file into another renamed file called all.min.js using the rename method then
it is stored in the dist directory under a sub-directory called scripts.
I simply called the task "scripts" instead of minify scripts because it uses concatScripts as a dependancy anyway in
its second argument and therfore does not really need another task that merges both the minify scripts and concat scripts as
this already does that.
*/
gulp.task("scripts", ["concatScripts"], function(){
return gulp.src("js/global.js")
.pipe(uglify())
.pipe(rename("all.min.js"))
.pipe(gulp.dest("dist/scripts"));
});

//compiles the SASS files into CSS. Only need to use one file - "sass/global.scss" - as this exports all other SASS files.

gulp.task("compileSass", function(){
return gulp.src("sass/global.scss")
.pipe(maps.init())
.pipe(sass())
.pipe(maps.write("./"))
.pipe(gulp.dest("css"));
})

/*Much like the "scripts" task, this task also minifies the CSS created from the "compileSass" task and uses it as a dependancy.
Also use liverreload on this task which works with the watch task, if any changes are made, the page reloads
*/
gulp.task("styles", ["compileSass"], function(){
return gulp.src("css/global.css")
.pipe(minCSS())
.pipe(rename("all.min.css"))
.pipe(gulp.dest("dist/styles"))
.pipe(livereload())
livereload.listen()

});

// used globbing pattern to get all the jpg and png files in the images directory and optimise them and put in dist/content
gulp.task("images", function() {
return gulp.src(["images/*.jpg", "images/*.png"])
.pipe(imagemin())
.pipe(gulp.dest('dist/content'));
});

//deletes the folders and files listed that would be old and need refreshing

gulp.task("clean", function() {
del(["dist", "css","js/global.js","js/global.js.map"]);
});

/*the build task runs the clean task first and then runs scripts,styles and images task
to put the appropriate files into the dist folder, ready for deployment.
*/
gulp.task("build", ["clean"], function(){
gulp.start(["scripts","styles","images"]);
});

/*the watch task runs when any changes are made the the source sass files and then is compiled and minified with the styles task.
The watch task also listens for any changes in regards to reloading the page.
*/
gulp.task("watchSass", function(){
gulp.watch(["sass/circle/**/*sass", "sass/_variables.scss", "global.scss"], ["styles"])
livereload.listen()
});

//Boots up a server on port 8080 and uses the watchSass task as a dependancy

gulp.task('connect',["watchSass"], function() {
  connect.server({
    root: '.'
  });
  console.log("This is on port 8080!");
});

/*the default task runs by typing "gulp" which will firstly run the "build" task and then start the server.
 */
gulp.task("default", ["build"], function(){
  gulp.start("connect");
});
