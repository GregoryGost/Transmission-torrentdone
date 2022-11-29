'use strict';

import gulp from 'gulp';
import ts from 'gulp-typescript';
import uglify from 'gulp-uglify';
import pump from 'pump';

const tsProject = ts.createProject('./tsconfig.json');

const handleError = done => {
  return function (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return done(err);
  };
};

function tsCompile(done) {
  pump([tsProject.src(), tsProject(), uglify(), gulp.dest('dist')], handleError(done));
}

const build = gulp.series(tsCompile);

export { build as default };
