// ////////////////////////////////////////////////
//
// EDIT CONFIG OBJECT BELOW !!!
// 
// jsConcatFiles => list of javascript files (in order) to concatenate
// buildFilesFoldersRemove => list of files to remove when running final build
// // //////////////////////////////////////////////

var config = {
	jsConcatFiles: [
		'./app/js/main.js'
	], 
	buildFilesFoldersRemove:[
		'build/scss/', 
		'build/js/!(*.min.js)',
		'build/maps/'
	]
};


// ////////////////////////////////////////////////
// Required taskes
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////

var gulp 				 = require('gulp'),
	sass 				 = require('gulp-sass'),
	sourcemaps 			 = require('gulp-sourcemaps'),
	autoprefixer 		 = require('gulp-autoprefixer'),
	browserSync 		 = require('browser-sync'),
	reload 				 = browserSync.reload,
	plumber 			 = require('gulp-plumber');
	filter 				 = require('gulp-filter');
	concat 				 = require('gulp-concat'),
	uglify 				 = require('gulp-uglify'),
	rename 				 = require('gulp-rename'),
	del 				 = require('del');
	mediaQueriesSplitter = require('gulp-media-queries-splitter');

// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////

function errorlog(err){
	console.error(err.message);
	this.emit('end');
}


// ////////////////////////////////////////////////
// Scripts Tasks
// ///////////////////////////////////////////////

gulp.task('scripts', gulp.series(function() {
  return gulp.src(config.jsConcatFiles)
	.pipe(sourcemaps.init())
		.pipe(concat('functions.js'))
		.pipe(uglify())
		.on('error', errorlog)
		.pipe(rename('app.min.js'))		
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./app/js/'))

    .pipe(reload({stream:true}));
}));


// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////

gulp.task('sass', gulp.series( function () {
	// Sass plugins
	var sass_plugins = [
		// autoprefixer({ browsers: ['last 3 version'] })
	];

	// Sass task error handler
	var errorHandler = function(errorObj) {
		// Notify the user
		browserSync.notify('Error: ' + beautifyMessage(errorObj.message));

		// Post the message in the console
		console.log(errorObj.message);

		// End this task
		this.emit('end');
	};

	var pipeErrorHandler = plumber(errorHandler);

	var task = gulp.src('app/scss/style.scss')
		.pipe(pipeErrorHandler) 							// Prevent pipe breaking caused by errors from gulp plugins
		.pipe(sourcemaps.init())							// source map init
		.pipe(sass( {
			plugins: sass_plugins
		}).on('error', errorHandler))						// Sass
		.pipe(sourcemaps.write( '.' ))						// sourcemap write
		.pipe(gulp.dest( 'app/css' )) 							// save css file
		.pipe(filter('**/*.css')) 							// filter only css files (remove the map file)
		.pipe(reload({stream: true})); 						// inject the changed css


	return task;
}));

gulp.task('split-css', gulp.series(function (done) {
	gulp.src('app/css/style.css')
        .pipe(mediaQueriesSplitter([						// media Queries Splitter start from here
            // Include all CSS rules
            {media: 'all', filename: 'all.css'},

            // Include only CSS rules without screen size based media queries
            {media: 'none', filename: 'base.css'},

            // Include CSS rules for small screen sizes and CSS rules without screen size based media queries
            {media: ['none', {minUntil: '576px'}, {max: '9999999px'}], filename: 'main.css'},

            // Include CSS rules for medium screen sizes (mostly used on tablet)
			{media: [{min: '576px', minUntil: '768px'}, {min: '576px', max: '768px'}], filename: 'tablet-portrait.css'},
			
			// Include CSS rules for medium screen sizes (mostly used on tablet-landscape)
			{media: [{min: '768px', minUntil: '1024px'}, {min: '768px', max: '1024px'}], filename: 'tablet-landscape.css'},
			
			// Include CSS rules for medium screen sizes (mostly used on tablet-landscape)
            {media: [{min: '1024px', minUntil: '1280px'}, {min: '1024px', max: '1280px'}], filename: 'desktop-small.css'},

            // Include CSS rules for bigger screen sizes (mostly used on desktop)
            {media: {min: '1280px'}, filename: 'desktop-large.css'},
        ]))
		.pipe(gulp.dest('./app/css'));
		done();
}));

// ////////////////////////////////////////////////
// HTML Tasks
// // /////////////////////////////////////////////

gulp.task('html', gulp.series(function(done){
    gulp.src('app/**/*.html')
	.pipe(reload({stream:true}));
	done();
}));


// ////////////////////////////////////////////////
// Browser-Sync Tasks
// // /////////////////////////////////////////////

gulp.task('browser-sync', gulp.series(function() {
    browserSync({
        server: {
            baseDir: "./app/"
        }
    });
}));

// task to run build server for testing final app
gulp.task('build:serve', gulp.series(function() {
    browserSync({
        server: {
            baseDir: "./build/"
        }
    });
}));


// ////////////////////////////////////////////////
// Build Tasks
// // /////////////////////////////////////////////

// clean out all files and folders from build folder
gulp.task('build:cleanfolder', gulp.series(function (cb) {
	del([
		'build/**'
	], cb);
}));

// task to create build directory of all files
gulp.task('build:copy', gulp.series('build:cleanfolder', function(){
    return gulp.src('app/**/*/')
    .pipe(gulp.dest('build/'));
}));

// task to removed unwanted build files
// list all files and directories here that you don't want included
gulp.task('build:remove', gulp.series('build:copy', function (cb) {
	del(config.buildFilesFoldersRemove, cb);
}));

gulp.task('build', gulp.series('build:copy', 'build:remove'));


// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task('watch', gulp.series(function(){
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/css/*.css', ['split-css']);
	gulp.watch('app/js/**/*.js', ['scripts']);
  	gulp.watch('app/**/*.html', ['html']);
}));

gulp.task('default', gulp.series('scripts', 'sass', 'split-css', 'html', 'browser-sync', 'watch'));

// Helpers

/**
 * Prepare message for browser notify.
 * @param  {string} message raw message
 * @return {string}         parsed message - new lines replaced by html elements.
 */
function beautifyMessage(message) {
	return '<p style="text-align: left">' + message.replace(/\n/g, '<br>') + '</p>';
};